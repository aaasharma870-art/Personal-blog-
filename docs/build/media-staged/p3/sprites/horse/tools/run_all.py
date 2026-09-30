import cv2,numpy as np, json
from dejockey import dejockey
from seg import UP
sel=[1,2,4,5,6,7,9,10]
R={}
PW,PH=1440,920
for k in sel:
    p,gt,big,out,info=dejockey(k)
    pad=np.zeros((PH,PW),np.uint8); pad[:out.shape[0],:out.shape[1]]=out
    R[k]=(pad,info); cv2.imwrite(f'hj{k:02d}.png',pad)
def band(out,info):
    y0=int(info['back']); return out[y0:y0+int(32*UP)]>0
ref=band(*R[1]); res={}
for k in sel:
    out,info=R[k]; b=band(out,info); best=None
    for dx in range(-60*UP,60*UP+1,2):
        bs=np.roll(b,dx,axis=1); iou=(bs&ref).sum()/max(1,(bs|ref).sum())
        if best is None or iou>best[0]: best=(iou,dx)
    res[k]=dict(dx=int(best[1]),iou=round(float(best[0]),3),gt=int(info['gt']),xn=int(info['xn']),back=float(info['back']),cut=[int(info['xr']),int(info['yr']),int(info['xn']),int(info['yn'])])
json.dump(res,open('align.json','w'))
