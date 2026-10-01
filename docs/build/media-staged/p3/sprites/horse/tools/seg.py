import cv2, numpy as np
UP=4
def ground_top(p, th=105):
    d=(p<th).astype(np.float32)
    h=p.shape[0]
    rows=[y for y in range(int(h*0.72),h) if d[y].mean()>0.22]
    return min(rows) if rows else None
def seg(k, th=105, up=UP, small_hole=0.0002):
    p=cv2.imread(f'panel{k:02d}.png',0)
    gt=ground_top(p,th)
    pu=cv2.resize(p,None,fx=up,fy=up,interpolation=cv2.INTER_CUBIC)
    pu=cv2.GaussianBlur(pu,(0,0),up*0.6)
    m=(pu<th).astype(np.uint8)*255
    if gt is not None: m[int((gt-0.5)*up):]=0
    ker=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(int(up*2.2)|1,int(up*2.2)|1))
    mo=cv2.morphologyEx(m,cv2.MORPH_OPEN,ker)
    n,lab,st,_=cv2.connectedComponentsWithStats(mo,8)
    i=1+np.argmax(st[1:,cv2.CC_STAT_AREA])
    big=(lab==i).astype(np.uint8)*255
    # fill only small holes
    inv=cv2.bitwise_not(big)
    n2,lab2,st2,_=cv2.connectedComponentsWithStats(inv,4)
    A=big.shape[0]*big.shape[1]
    for j in range(1,n2):
        x,y,w,h,a=st2[j]
        touches=x==0 or y==0 or x+w==big.shape[1] or y+h==big.shape[0]
        if not touches and a<small_hole*A: big[lab2==j]=255
    return p,gt,big
