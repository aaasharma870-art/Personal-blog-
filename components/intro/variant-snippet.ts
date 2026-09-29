/* ============================================================================
   PRE-PAINT VARIANT RESOLVER — the inline-script twin of lib/variants.ts
   `effectiveVariant()` (M1.5), for the two scripts that must choose a
   variant BEFORE the first paint and before React exists:
     components/intro/intro-head-script.tsx   (intro.play / flight /
                                               codeflight / landing)
     components/sections/hero/hero-boot.ts    (hero.aperture)
   Both decide something the reader sees at first paint (the intro's bracket
   draw, the hero's pre-paint slit or film gate), so they cannot wait for
   useVariant(), whose URL override applies only after hydration. Nothing
   they change is React-owned markup (a class on <html>, a data attribute
   the hero already suppresses, a <style> in <head>), so reading the URL
   here is hydration-safe.

   This file holds ONLY the script source and its data type (no imports):
   hero-boot.ts is also imported by the client HeroStage, so the server-side
   computation of the data lives in ./prepaint-variants.ts.

   `c` = { "<host>.<piece>": [manifestVariant, altBuilt] } (prepaintVariants)
   `k` = the piece key. Grammar = lib/variants.ts parseVariantOverrides:
     ?variant=alt | default                  every piece
     ?variant=intro:alt | intro.flight:alt   one host / one piece
     comma-separated; the longest matching prefix wins, then the bare value,
     then the manifest; an "alt" for a piece without a built ALT → "default".
   ES5 on purpose (it runs inline in <head> on every browser).
   ========================================================================== */

/** Per piece key: [the manifest's variant (already clamped), 1 when the
 *  piece has a built ALT (or is unregistered, so it is never clamped)]. */
export type PrepaintVariants = Record<string, readonly ["default" | "alt", 0 | 1]>;

/** `function (c, k) → "default" | "alt"`: inline it as an expression. */
export const VARIANT_JS =
  'function(c,k){var m=c[k],b=null,r=null,L=-1;if(!m)return"default";try{var q=new URLSearchParams(location.search).getAll("variant").join(",").toLowerCase().split(","),i,t,j,p,v;for(i=0;i<q.length;i++){t=q[i].trim();if(!t)continue;j=t.lastIndexOf(":");if(j<0){if(t==="alt"||t==="default")b=t;continue}p=t.slice(0,j);v=t.slice(j+1);if(p&&(v==="alt"||v==="default")&&(k===p||k.indexOf(p+".")===0)&&p.length>=L){L=p.length;r=v}}}catch(e){}var x=r||b||m[0];return x==="alt"&&!m[1]?"default":x}';
