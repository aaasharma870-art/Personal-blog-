import type { ReactNode } from "react";
import type { MotionValue } from "motion/react";

/* ============================================================================
   VIRTUAL CAMERA (spec §6.1, P3-5; plan §3.4) — OWNER: W2-PLATES.
   <CameraGroup spec progress?> moves its children (a plate and its
   registered overlays) by one CameraSpec: transform only, driven by the
   page flow, a sticky range or a host's progress MotionValue.
   W1.0 stub: a static wrapper (no motion).
   ========================================================================== */

export type CameraSpec = {
  kind: "drift" | "push" | "pan-l" | "pan-r" | "hold" | "settle";
  scale: readonly [number, number];
  x?: readonly [number, number];
  y?: readonly [number, number];
  focal?: readonly [number, number];
  driver: "flow" | "sticky" | "progress";
};

export type CameraGroupProps = {
  spec: CameraSpec;
  progress?: MotionValue<number>;
  className?: string;
  children?: ReactNode;
};

export function CameraGroup({ spec, className, children }: CameraGroupProps) {
  return (
    <div className={className} data-camera={spec.kind}>
      {children}
    </div>
  );
}
