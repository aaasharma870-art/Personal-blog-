import type { ReactNode } from "react";

/** /lab (noindex workbench): the root layout no longer renders <main> (the
 *  home page owns it so the credits footer can sit after it), so the lab
 *  routes bring their own — the skip link targets #main everywhere. */
export default function LabLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      {children}
    </main>
  );
}
