"use client";
import { useEffect, useRef } from "react";
const V = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const F = `precision mediump float;uniform vec2 r;uniform float t;uniform vec3 c[4];
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 u=gl_FragCoord.xy/r;vec3 a=vec3(0.);float s=0.;
for(int i=0;i<4;i++){float k=float(i)*1.7;vec2 q=vec2(.5+.45*sin(t*.15+k*2.1),.5+.45*cos(t*.12+k*1.3));float d=distance(u,q);float w=1./(d*d+.04);a+=c[i]*w;s+=w;}
vec3 o=a/s;o+=(h(gl_FragCoord.xy+fract(t))-.5)*.1;gl_FragColor=vec4(o,1.);}`;
const rgb = (x) => [1, 3, 5].flatMap((i) => parseInt(x.slice(i, i + 2), 16) / 255);
// Animated grain-mesh gradient (WebGL). Half-resolution, pauses offscreen, one still frame if reduced motion.
export default function Shader({ colors, className = "" }) {
  const cv = useRef(null), col = useRef(colors);
  col.current = colors;
  useEffect(() => {
    const el = cv.current, gl = el.getContext("webgl", { antialias: false });
    if (!gl) return;
    const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, V)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, F)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const lp = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    const lr = gl.getUniformLocation(pr, "r"), lt = gl.getUniformLocation(pr, "t"), lc = gl.getUniformLocation(pr, "c[0]");
    const rm = matchMedia("(prefers-reduced-motion: reduce)").matches, t0 = performance.now(); let raf, vis = true;
    const draw = (n) => {
      el.width = el.clientWidth / 2; el.height = el.clientHeight / 2; gl.viewport(0, 0, el.width, el.height);
      gl.uniform2f(lr, el.width, el.height); gl.uniform1f(lt, rm ? 4 : (n - t0) / 1000); gl.uniform3fv(lc, col.current.flatMap(rgb)); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (vis && !rm) raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; cancelAnimationFrame(raf); if (vis) raf = requestAnimationFrame(draw); });
    io.observe(el); raf = requestAnimationFrame(draw);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={cv} className={"shader " + className} aria-hidden="true" />;
}
