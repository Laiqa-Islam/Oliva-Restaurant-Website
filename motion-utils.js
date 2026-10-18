export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
export const mix=(a,b,p)=>a+(b-a)*p;
export const ease=p=>1-Math.pow(1-clamp(p),3);
export const range=(p,a,b)=>clamp((p-a)/(b-a));
