/* ============================================================================
   GL SHADERS — one shared header + the ten flavours (PHASE3-SPEC §3.3, §7.1,
   §7.3, §8.1). WebGL2 / GLSL ES 3.00, a full-frame triangle, no attributes.
   OWNER: W2-GL.

   HEADER CONTRACT (every flavour sees the same uniforms; the runtime sets
   only what the program uses):
     uFrom, uTo     the two plates (RGBA8), sampled through their cover box
     uNoise         256² value noise (JS-generated, REPEAT)
     uTitle         the act title's SDF (R8, 0.5 = the edge, > .5 inside)
     uP             the pass-local progress 0–1 (lib/gl/plan.ts)
     uRes           the drawing buffer in px
     uCoverFrom/To  vec4(box w, box h, left, top) in frame fractions
     uRow           MATCH_ROW (frame fraction, y down)
     uCenter        the pass's focus (frame fractions); uRadius [start, end]
                    in frame-height units
     uShapeFrom/To  carried-shape ids (-1 none, 0 ring32, 1 gear12, 2
                    wheel12, 3 snitch); uMorph the SDF fold; uShape (centre
                    xy, size, alpha); uSpin the roll angle (match.shape ALT)
     uGradeFrom/To  vec4(rgb gain, EV): the current grade and the END grade
                    (T() applies their ratio, so a ramp ends at identity)
     uFlash         vec2(white amount, bloom EV): the impact pulse
     uKraken        0 → 1 → 0 (`wave` only)
     uDeep          the world's deep (the card's --bg)
     uTitleXf       frame uv → title SDF uv (scale xy, offset zw)
     uInset, uInsetR the plate's inset window [x0, y0, x1, y1] (frame
                    fractions) and its corner radius (frame heights); full
                    frame + 0 when the card has none (`PL()` = its SDF)
   Each flavour defines `vec4 fl()` (straight rgb + alpha); main() adds the
   carried shape, the flash, and writes premultiplied alpha.
   Frame uv: origin top-left, y down; textures are uploaded top row first,
   so plate uv and frame uv share the orientation.
   ========================================================================== */

import type { GlFlavour } from "./types";

export const VERT = `#version 300 es
void main(){vec2 p=vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.;gl_Position=vec4(p,0,1);}`;

const HEAD = `#version 300 es
precision highp float;
uniform sampler2D uFrom,uTo,uNoise,uTitle;
uniform vec2 uRes,uCenter,uRadius,uFlash;
uniform vec4 uCoverFrom,uCoverTo,uGradeFrom,uGradeTo,uShape,uTitleXf,uInset;
uniform float uP,uRow,uMorph,uSpin,uKraken,uInsetR;
uniform int uShapeFrom,uShapeTo;
uniform vec3 uDeep;
out vec4 o;
vec2 uv;float A;
#define PI 3.14159265
float S(float a,float b,float x){return smoothstep(a,b,x);}
float N(vec2 q){vec2 i=floor(q),f=fract(q);return texture(uNoise,(i+f*f*(3.-2.*f)+.5)/256.).r;}
float fbm(vec2 q){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*N(q);q=mat2(1.6,1.2,-1.2,1.6)*q+.31;a*=.5;}return s/.9375;}
vec2 G2(){return uv*vec2(A,1.);}
float D(vec2 a,vec2 b){return length((a-b)*vec2(A,1.));}
vec3 F(vec2 q){return texture(uFrom,(q-uCoverFrom.zw)/uCoverFrom.xy).rgb;}
vec3 T(vec2 q){return texture(uTo,(q-uCoverTo.zw)/uCoverTo.xy).rgb*uGradeFrom.rgb/uGradeTo.rgb*exp2(uGradeFrom.a-uGradeTo.a);}
float L(vec3 c){return dot(c,vec3(.299,.587,.114));}
float PL(){vec2 q=abs((uv-(uInset.xy+uInset.zw)*.5)*vec2(A,1.))-(uInset.zw-uInset.xy)*.5*vec2(A,1.)+uInsetR;
return length(max(q,0.))+min(max(q.x,q.y),0.)-uInsetR;}
float HI(){return step(1e-4,uInset.x+uInset.y+2.-uInset.z-uInset.w);}
vec4 inset(vec3 c,float k){float d=PL(),h=.5/uRes.y,bw=mix(.05,HI()>0.?h:-.01,k);
c=mix(c,vec3(.9,.85,.74),S(-bw-2.*h,-bw,d));return vec4(mix(c,uDeep,HI()*S(h,3.*h,d)),1.);}
vec3 veil(vec2 q,float k){float n=fbm(q*vec2(A,1.)*vec2(4.,10.)+vec2(uP*3.,0.));float s=N(q*vec2(A,1.)*220.);
return mix(mix(vec3(.5,.7,.72),vec3(.93,.97,.96),n),vec3(.88,.89,.86)*(.8+.3*s),k);}
`;

const SHAPES = `
float rep(vec2 q,float n,out vec2 p){float r=length(q),s=2.*PI/n,a=mod(atan(q.y,q.x)+s*.5,s)-s*.5;p=r*vec2(cos(a),sin(a));return r;}
float box(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float sd(int i,vec2 q){vec2 p;
if(i==0){float r=rep(q,32.,p);return min(abs(r-.8)-.05,box(p-vec2(.93,0.),vec2(.07,.018)));}
if(i==1){float r=rep(q,12.,p);return max(min(r-.7,box(p-vec2(.8,0.),vec2(.13,.09))),.28-r);}
if(i==2){float r=rep(q,12.,p);return min(min(abs(r-.86)-.07,r-.15),box(p-vec2(.5,0.),vec2(.36,.03)));}
vec2 w=vec2(abs(q.x)-.7,q.y-.1);w=mat2(.94,.34,-.34,.94)*w;
return min(length(q)-.3,(length(w/vec2(.48,.15))-1.)*.15);}
vec3 shape(vec3 c){if(uShape.w<=0.||uShapeFrom<0)return c;
vec2 q=(uv-uShape.xy)*vec2(A,1.)/uShape.z;q=mat2(cos(uSpin),sin(uSpin),-sin(uSpin),cos(uSpin))*q;
float d=mix(sd(uShapeFrom,q),sd(uShapeTo,q),uMorph)*uShape.z,e=1./uRes.y;
vec3 ink=mix(vec3(.62,.45,.2),vec3(.98,.82,.45),S(.6,-.4,q.y)+.25*N(q*8.));
return mix(c,ink,(1.-S(-e,e,d))*uShape.w);}
`;

const MAIN = `
void main(){uv=vec2(gl_FragCoord.x/uRes.x,1.-gl_FragCoord.y/uRes.y);A=uRes.x/uRes.y;
vec4 c=fl();c.rgb=mix(shape(c.rgb)*exp2(uFlash.y),vec3(1.),uFlash.x);o=vec4(clamp(c.rgb,0.,1.)*c.a,c.a);}`;

/** Each flavour: `vec4 fl()` (≤ ~25 lines). t = uP. */
const FL: Record<GlFlavour, string> = {
  // Pirates spyglass: a brass-rimmed disc on the stern opens to the frame
  iris: `vec4 fl(){float t=uP,e=t*t*(3.-2.*t),r=uRadius.x*pow(uRadius.y/uRadius.x,e),d=D(uv,uCenter),px=1./uRes.y;
float k=d/r;vec3 c=T(uCenter+(uv-uCenter)*(1.-.07*k*k*k*k))*(1.-.45*S(.55,1.,k));
vec3 o2=mix(F(uv)*.4,uDeep,.6);c=mix(c,o2,S(r-px,r+px,d));
float w=.018,m=S(r-px,r,d)*(1.-S(r+w,r+w+px,d)),b=sin(clamp((d-r)/w,0.,1.)*PI);
vec3 brass=vec3(.55,.4,.18)+vec3(.45,.38,.25)*b*(.7+.5*N(vec2(atan(uv.y-uCenter.y,(uv.x-uCenter.x)*A)*40.,d*600.)));
return vec4(mix(c,brass,m),1.);}`,

  // Pirates breaker OUT: a wave front from the left, foam behind it; the
  // kraken swells under the sea at the hook
  wave: `vec4 fl(){float t=uP,y=uv.y,f=mix(.04,1.45,t*t*(3.-2.*t))+.05*sin(y*7.+t*4.)+.1*(fbm(vec2(y*4.,t*3.))-.5);
float j=(fbm(G2()*9.+vec2(t*3.,0.))-.5)*.08,dx=f-uv.x-j,nr=exp(-abs(dx)*14.);vec2 q=uv;q.x+=nr*.03*sign(dx);q.y-=nr*.02;
float b=exp(-pow(D(uv,vec2(.62,uRow+.16))/.24,2.))*uKraken*S(uRow-.02,uRow+.04,uv.y);q.y+=b*.05;
vec3 c=mix(F(q)*(1.-.7*b)*(1.+.25*nr),veil(uv,0.),S(-.015,.03,dx));
return vec4(mix(c,vec3(.95,1.,1.),exp(-dx*dx/3e-4)*.85),1.);}`,

  // 3 Idiots chalk IN: foam turns to chalk speckle; a noisy diagonal edge
  // uncovers the hall
  chalk: `vec4 fl(){float t=uP,s=dot(uv,vec2(.62,.78)),e=mix(-.3,1.7,t)+(fbm(G2()*5.)-.5)*.3;
float r=1.-S(e-.05,e+.05,s),g=exp(-abs(s-e)*28.);
vec3 c=mix(veil(uv,S(0.,.35,t)),T(uv),r)+vec3(.9)*g*.25*(1.-t);return vec4(c,1.);}`,

  // 3 Idiots duster (ALT IN): five anisotropic strokes along 110°
  duster: `vec4 fl(){float t=uP;vec2 g=G2()-vec2(A*.5,.5),d=vec2(-.342,.94),n=vec2(-d.y,d.x);
float b=dot(g,d)/(.5*(A*.342+.94))*.5+.5,a=dot(g,n)/(.5*(A*.94+.342))*.5+.5,i=floor(clamp(a,0.,.999)*5.);
float st=N(vec2(a*120.,b*3.)),s=clamp(t*1.6-i*.15,0.,1.),r=1.-S(-.04,.04,b-s*1.15+st*.1);
vec3 c=mix(veil(uv,1.),T(uv),r)+(st-.5)*.14*r*(1.-t);return vec4(c,1.);}`,

  // RDR2 tintype develop: pow(luma, γ) outward from the horizon row, grain,
  // sepia → golden hour; the bone border settles to the inset plate's 1 px
  // line on the world deep (the DOM's settled tintype), or away full-bleed
  develop: `vec4 fl(){float t=uP;vec3 p=T(uv);float l=L(p),dv=clamp((t*1.25-abs(uv.y-uRow)*1.1+(fbm(G2()*4.)-.5)*.15)/.25,0.,1.);
vec3 c=mix(vec3(.42,.36,.28)*(.55+.45*l),vec3(1.,.86,.66)*pow(l,mix(2.6,1.,dv))*1.05,dv);
c=mix(c,p,S(.55,1.,t))+(N(G2()*300.+t*50.)-.5)*.09*(1.-t);
return inset(c,S(.83,1.,t));}`,

  // RDR2 Dead Eye (ALT): a red-sepia grade ramp + a radial chroma split,
  // inside the inset plate (its bone line draws in at the end)
  deadeye: `vec4 fl(){float t=uP,g=t*t*(3.-2.*t);vec2 d=uv-uCenter;float k=.012*sin(PI*t);
vec3 c=vec3(T(uv-d*k).r,T(uv).g,T(uv+d*k).b);c=mix(vec3(.42,.36,.28)*(.55+.45*L(c)),c,g);
c*=1.-.35*g*S(.35,.9,D(uv,uCenter));float h=.5/uRes.y,d2=PL();
c=mix(c,vec3(.9,.85,.74),HI()*S(.83,1.,t)*S(-3.*h,-h,d2));return vec4(mix(c,uDeep,HI()*S(h,3.*h,d2)),1.);}`,

  // RDR2 film burn OUT from the fire: an orange-white rim eats the frame
  burn: `vec4 fl(){float t=uP,d=D(uv,uCenter)+(fbm(G2()*4.+t*2.)-.5)*.22,r=mix(uRadius.x,uRadius.y,t*t),w=.05;
vec3 s=F(uv)*(1.-.75*S(r+w+.2,r+w,d));float m=S(r,r+w*.3,d)*(1.-S(r+w*.3,r+w,d));
vec3 h=mix(vec3(1.,.42,.08),vec3(1.,.96,.82),S(r+w,r,d));return vec4(mix(mix(uDeep,s,S(r-.002,r+.002,d)),h,m),1.);}`,

  // HP ink bleed IN: domain-warped fbm from the hall's lineStart
  ink: `vec4 fl(){float t=uP;vec2 g=G2(),w=vec2(fbm(g*2.+t),fbm(g*2.+vec2(5.2,1.3)-t))-.5;
float d=D(uv,uCenter)+(fbm(g*4.+w*3.)-.5)*.35,r=mix(uRadius.x,uRadius.y,t),m=1.-S(r-.12,r,d),k=exp(-pow((d-r+.03)/.035,2.));
return vec4(mix(mix(uDeep,T(uv),m),vec3(.03,.03,.08),k*.8*(1.-t*t)),1.);}`,

  // HP Lumos sweep (ALT IN): a reveal radius around the moving light + bloom
  lumos: `vec4 fl(){float t=uP,d=D(uv,uCenter),r=mix(uRadius.x,uRadius.y,t*t),m=1.-S(r*.55,r,d),b=exp(-d*d/(.02+.05*t))*(1.-t);
return vec4(mix(uDeep,T(uv)*(1.+1.4*b),m)+vec3(1.,.92,.75)*b*.55,1.);}`,

  // the act title as a mask: deep outside the letters, transparent inside
  title: `vec4 fl(){float s=texture(uTitle,uv*uTitleXf.xy+uTitleXf.zw).r,a=max(fwidth(s),1e-5)*.7;
return vec4(uDeep,S(0.,.18,uP)*(1.-S(.5-a,.5+a,s)));}`,
};

/** The fragment source of one flavour (header + shapes + flavour + main). */
export function fragment(f: GlFlavour): string {
  return HEAD + SHAPES + FL[f] + MAIN;
}
