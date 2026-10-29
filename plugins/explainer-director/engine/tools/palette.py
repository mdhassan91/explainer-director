# k-means palette per frame: sky (top 1/5), middle band (5 colours), ground (bottom 1/5). Usage: python -I palette.py <dir-of-pngs>
import sys, glob, os, numpy as np
from PIL import Image
from sklearn.cluster import KMeans
out=[]
for p in sorted(glob.glob(sys.argv[1]+'/*.png')):
    im=np.asarray(Image.open(p).convert('RGB')).astype(float)
    h=im.shape[0]
    def km(a,k):
        a=a.reshape(-1,3); a=a[::7]
        m=KMeans(k,n_init=3,random_state=0).fit(a)
        c=m.cluster_centers_; n=np.bincount(m.labels_,minlength=k)
        o=np.argsort([-x for x in n]); return ['#%02x%02x%02x'%tuple(int(v) for v in c[i]) for i in o]
    sky=km(im[:h//5],2)[0]; mid=km(im[h//3:2*h//3],5); fg=km(im[4*h//5:],3)
    out.append(f"{os.path.basename(p)[:-4]:8s} sky {sky}  mid {' '.join(mid)}  ground {' '.join(fg)}")
print('\n'.join(out))
