/* ============================================================================
   TRANSITION GL — the framework-free WebGL2 core (PHASE3-SPEC §3.3): one
   context on the page's one canvas, async program links
   (KHR_parallel_shader_compile), textures, one full-frame draw. The runtime
   (lib/gl/gl-lock.ts) decides WHEN each call runs (idle slices, p ends).
   OWNER: W2-GL.
   ========================================================================== */

import { VERT } from "./shaders";
import type { Uniforms } from "./plan";

export type Sampler = "uFrom" | "uTo" | "uNoise" | "uTitle";
const UNITS: Record<Sampler, number> = { uFrom: 0, uTo: 1, uNoise: 2, uTitle: 3 };

type Prog = {
  prog: WebGLProgram;
  shaders: WebGLShader[];
  /** null while linking; then the active uniforms, or false (failed) */
  u: Map<string, { loc: WebGLUniformLocation; type: number }> | null | false;
};

export type RawTex = { w: number; h: number; data: Uint8Array; r8?: boolean; repeat?: boolean };

export type TransitionGL = {
  gl: WebGL2RenderingContext;
  maxTex: number;
  /** Start compiling + linking `name` (returns at once with the KHR extension). */
  compile(name: string, frag: string): void;
  /** true = linked, false = failed, null = still compiling (read once ready). */
  poll(name: string): boolean | null;
  ready(name: string): boolean;
  /** Upload one texture (an ImageBitmap / video frame, or raw bytes). */
  texture(src: TexImageSource | RawTex): WebGLTexture | null;
  drop(t: WebGLTexture | null | undefined): void;
  size(w: number, h: number): void;
  draw(name: string, u: Uniforms, tex: Partial<Record<Sampler, WebGLTexture | null>>): boolean;
  clear(): void;
  /** Forget every program/texture handle (after a context loss). */
  reset(): void;
};

/** Create the ONE context. `force` (capture runs) drops the performance-
 *  caveat flag so SwiftShader renders. null = no WebGL2 here. */
export function createTransitionGL(canvas: HTMLCanvasElement, force: boolean): TransitionGL | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
    failIfMajorPerformanceCaveat: !force,
  });
  if (!gl) return null;
  const khr = gl.getExtension("KHR_parallel_shader_compile") as { COMPLETION_STATUS_KHR: number } | null;
  const progs = new Map<string, Prog>();
  let vao: WebGLVertexArrayObject | null = null;
  let blank: WebGLTexture | null = null;

  const init = () => {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    blank = api.texture({ w: 1, h: 1, data: new Uint8Array([0, 0, 0, 255]) });
  };

  const shader = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };

  const api: TransitionGL = {
    gl,
    maxTex: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,

    compile(name, frag) {
      if (progs.has(name)) return;
      const prog = gl.createProgram();
      const vs = shader(gl.VERTEX_SHADER, VERT);
      const fs = shader(gl.FRAGMENT_SHADER, frag);
      if (!prog || !vs || !fs) return;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      progs.set(name, { prog, shaders: [vs, fs], u: null });
    },

    poll(name) {
      const p = progs.get(name);
      if (!p) return false;
      if (p.u !== null) return p.u !== false;
      if (khr && !gl.getProgramParameter(p.prog, khr.COMPLETION_STATUS_KHR)) return null;
      if (!gl.getProgramParameter(p.prog, gl.LINK_STATUS)) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[gl] ${name}:`, gl.getProgramInfoLog(p.prog), p.shaders.map((s) => gl.getShaderInfoLog(s)).join(" "));
        }
        p.u = false;
        return false;
      }
      const u = new Map<string, { loc: WebGLUniformLocation; type: number }>();
      gl.useProgram(p.prog);
      const n = gl.getProgramParameter(p.prog, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p.prog, i);
        const loc = info && gl.getUniformLocation(p.prog, info.name);
        if (!info || !loc) continue;
        if (info.type === gl.SAMPLER_2D) gl.uniform1i(loc, UNITS[info.name as Sampler] ?? 0);
        else u.set(info.name, { loc, type: info.type });
      }
      p.shaders.forEach((s) => gl.deleteShader(s));
      p.u = u;
      return true;
    },

    ready(name) {
      const u = progs.get(name)?.u;
      return !!u;
    },

    texture(src) {
      const t = gl.createTexture();
      if (!t) return null;
      gl.bindTexture(gl.TEXTURE_2D, t);
      const raw = "data" in src ? (src as RawTex) : null;
      const wrap = raw?.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (raw) {
        const f = raw.r8 ? gl.R8 : gl.RGBA8;
        const fmt = raw.r8 ? gl.RED : gl.RGBA;
        gl.texImage2D(gl.TEXTURE_2D, 0, f, raw.w, raw.h, 0, fmt, gl.UNSIGNED_BYTE, raw.data);
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, src as TexImageSource);
      }
      return t;
    },

    drop(t) {
      if (t) gl.deleteTexture(t);
    },

    size(w, h) {
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
    },

    draw(name, u, tex) {
      const p = progs.get(name);
      if (!p || !p.u) return false;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(p.prog);
      for (const [k, unit] of Object.entries(UNITS) as [Sampler, number][]) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex[k] ?? blank);
      }
      for (const [k, { loc, type }] of p.u) {
        const v = u[k];
        if (v == null) continue;
        if (typeof v === "number") {
          if (type === gl.INT) gl.uniform1i(loc, v);
          else gl.uniform1f(loc, v);
        } else if (type === gl.FLOAT_VEC2) gl.uniform2f(loc, v[0], v[1]);
        else if (type === gl.FLOAT_VEC3) gl.uniform3f(loc, v[0], v[1], v[2]);
        else if (type === gl.FLOAT_VEC4) gl.uniform4f(loc, v[0], v[1], v[2], v[3]);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return true;
    },

    clear() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },

    reset() {
      progs.clear();
      init();
    },
  };
  init();
  return api;
}
