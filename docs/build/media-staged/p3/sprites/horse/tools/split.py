# Split the 1536x952 Commons card into its 12 panels (panelNN.png, 3 px inset from the black borders).
import cv2
im=cv2.imread('The_Horse_in_Motion.jpg',0)
X=[(26,384),(400,758),(772,1131),(1146,1506)]   # measured: dark border runs at x 13-25, 385-399, 759-771, 1132-1145, 1507-1519
Y=[(31,261),(273,504),(516,747)]                 # measured: y 18-30, 262-272, 505-515, 748-763
k=0
for y0,y1 in Y:
    for x0,x1 in X:
        k+=1; cv2.imwrite(f'panel{k:02d}.png',im[y0+3:y1-3,x0+3:x1-3])
# then: python3 run_all.py && python3 trace.py   (frames 1,2,4,5,6,7,9,10)
