import cv2, numpy as np, json
from seg import UP
sel=[1,2,4,5,6,7,9,10]
al=json.load(open('align.json'))
GROUND=205
masks={}
for k in sel:
    m=cv2.imread(f'hj{k:02d}.png',0)
    m=cv2.GaussianBlur(m,(0,0),1.1*UP)
    m=((m>127)*255).astype(np.uint8)
    n_,lab_,st_,_=cv2.connectedComponentsWithStats(m,8)
    m=((lab_==1+np.argmax(st_[1:,cv2.CC_STAT_AREA]))*255).astype(np.uint8)
    a=al[str(k)]
    dy=(GROUND-a['gt'])*UP
    M=np.float32([[1,0,a['dx']],[0,1,dy]])
    masks[k]=cv2.warpAffine(m,M,(m.shape[1],m.shape[0]+40*UP),flags=cv2.INTER_NEAREST)
# union bbox
U=np.zeros_like(next(iter(masks.values())))
for m in masks.values(): U|=m
ys,xs=np.nonzero(U)
x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max()
groundY=GROUND*UP  # in canvas px (hooves cut at gt -> after shift ground at GROUND*UP)
print('union bbox',x0,x1,y0,y1,'ground',groundY)
pad=int(0.02*(x1-x0))
X0=x0-pad; Y0=y0-pad
Hpx=groundY-Y0          # ground at the bottom of the viewBox
Wpx=(x1+pad)-X0
S=100.0/Hpx             # viewBox height = 100 units
VBW=round(Wpx*S,1)
print('viewBox 0 0',VBW,100)
def fmt(v): 
    s=f'{v:.1f}'; 
    return s[:-2] if s.endswith('.0') else s
def smooth_path(pts):
    # quadratic Bezier through midpoints
    n=len(pts)
    mids=[((pts[i][0]+pts[(i+1)%n][0])/2,(pts[i][1]+pts[(i+1)%n][1])/2) for i in range(n)]
    d=f'M{fmt(mids[-1][0])} {fmt(mids[-1][1])}'
    for i in range(n):
        d+=f'Q{fmt(pts[i][0])} {fmt(pts[i][1])} {fmt(mids[i][0])} {fmt(mids[i][1])}'
    return d+'Z'
frames=[]
for idx,k in enumerate(sel):
    m=masks[k]
    cs,hier=cv2.findContours(m,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
    parts=[]; npts=0; holes=0
    for ci,c in enumerate(cs):
        area=cv2.contourArea(c)
        if area<(3*UP)**2: continue
        isHole=hier[0][ci][3]!=-1
        ap=cv2.approxPolyDP(c,0.55*UP,True)[:,0,:].astype(float)
        pts=[((x-X0)*S,(y-Y0)*S) for x,y in ap]
        parts.append(smooth_path(pts)); npts+=len(pts); holes+=int(isHole)
    d=''.join(parts)
    ys,xs=np.nonzero(m)
    bb=[round((xs.min()-X0)*S,1),round((ys.min()-Y0)*S,1),round((xs.max()-X0)*S,1),round((ys.max()-Y0)*S,1)]
    frames.append(dict(i=idx,sourcePanel=k,d=d,points=npts,holes=holes,bbox=bb,dx_src=round(al[str(k)]['dx']/UP,2),dy_src=GROUND-al[str(k)]['gt']))
    print(k,'points',npts,'holes',holes,'len(d)',len(d),'bbox',bb)
json.dump(dict(X0=int(X0),Y0=int(Y0),S=S,UP=UP,GROUND=GROUND,viewBox=[0,0,VBW,100],scale_units_per_src_px=round(S*UP,5),frames=frames),open('trace.json','w'))
