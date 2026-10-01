import cv2, numpy as np
from seg import seg, UP
def top_profile(m):
    h,w=m.shape
    has=m.max(0)>0
    top=np.where(has, np.argmax(m>0,axis=0), h)
    return top,has
def dejockey(k, rear_jump=12):
    p,gt,big=seg(k)
    m=big.copy()
    h,w=m.shape
    top,has=top_profile(m)
    xs=np.nonzero(has)[0]; xl,xrr=xs[0],xs[-1]; span=xrr-xl
    mid=np.arange(xl+int(.2*span), xl+int(.8*span))
    xjh=mid[np.argmin(top[mid])]
    back_x=np.arange(xl+int(.15*span), xjh-int(.10*span))
    back=np.median(top[back_x])
    thr=back-rear_jump*UP/2
    x=back_x[-1]
    while x<xjh and top[x]>thr: x+=1
    xr=x
    while xr>back_x[0] and top[xr]<back-2*UP: xr-=1
    xr=xr-4*UP
    yr=int(np.median(top[xr-3*UP:xr+1]))
    xn=None; ymax=-1
    for x in range(xjh, xrr):
        if top[x]>ymax: ymax=top[x]; xn=x
        if ymax-top[x]>10*UP and top[x]<back: break
    yn=int(top[xn])
    # straight provisional line
    def yline(x): return yr+(yn-yr)*(x-xr)/max(1,(xn-xr))
    # withers evidence: bottoms of background gaps just below the line (under the rider's arms)
    px=[xr,xn]; py=[yr,yn]; pw=[8.0,8.0]
    for x in range(xr, xn+1, UP):
        y0=int(round(yline(x))); col=m[y0:y0+22*UP, x]
        bg=np.nonzero(col==0)[0]
        if len(bg):
            px.append(x); py.append(y0+bg[-1]+1); pw.append(1.0)
    px=np.array(px,float); py=np.array(py,float); pw=np.array(pw)
    deg=2 if len(px)>=5 else 1
    coef=np.polyfit(px,py,deg,w=pw)
    curve=lambda x: np.polyval(coef,x)
    cut=m.copy()
    for x in range(xr, xn+1):
        yl=max(curve(x), min(yr,yn)-2*UP)  # never above the higher end point
        cut[:int(round(yl)),x]=0
    # fill background pockets left inside the cut zone below the curve (rider-limb gaps)
    zone=np.zeros_like(cut); 
    for x in range(xr, xn+1):
        yl=int(round(curve(x))); zone[yl:yl+22*UP, x]=255
    inv=cv2.bitwise_not(cut)
    n2,lab2,st2,_=cv2.connectedComponentsWithStats(inv,4)
    for j in range(1,n2):
        comp=(lab2==j)
        x,y,ww,hh,a=st2[j]
        touches=x==0 or y==0 or x+ww==cut.shape[1] or y+hh==cut.shape[0]
        if touches: continue
        inside=(comp & (zone>0)).sum()/max(1,a)
        if inside>0.6: cut[comp]=255
    # pockets open to the top inside the zone (gap now exposed): fill below curve
    for x in range(xr, xn+1):
        yl=int(round(curve(x)))
        col=cut[yl:yl+22*UP, x]
        fg=np.nonzero(col>0)[0]
        if len(fg): cut[yl:yl+fg[0], x]=255 if fg[0]<3*UP else cut[yl:yl+fg[0], x]
    ker=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(UP*3|1,UP*3|1))
    cut2=cv2.morphologyEx(cut,cv2.MORPH_OPEN,ker)
    n,lab,st,_=cv2.connectedComponentsWithStats(cut2,8)
    i=1+np.argmax(st[1:,cv2.CC_STAT_AREA])
    out=(lab==i).astype(np.uint8)*255
    out=cut & cv2.dilate(out,ker)
    n,lab,st,_=cv2.connectedComponentsWithStats(out,8)
    i=1+np.argmax(st[1:,cv2.CC_STAT_AREA]); out=(lab==i).astype(np.uint8)*255
    ys0,ys1=max(0,yn-10*UP),yr+6*UP; xs0,xs1=max(0,xr-40*UP),xn
    kc=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(UP*5|1,UP*5|1))
    out[ys0:ys1,xs0:xs1]=cv2.morphologyEx(out[ys0:ys1,xs0:xs1],cv2.MORPH_CLOSE,kc)
    info=dict(k=k,gt=gt,xl=int(xl),xr_end=int(xrr),xjh=int(xjh),back=float(back),xr=int(xr),yr=int(yr),xn=int(xn),yn=int(yn),withers_pts=int(len(px)-2),fit=[float(c) for c in coef])
    return p,gt,big,out,info
