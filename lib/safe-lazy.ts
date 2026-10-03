import { lazy, type ComponentType } from "react";

/* React.lazy for desktop extras whose chunk may fail to load (deploy skew after a redeploy, a flaky
   network): a failed import renders nothing instead of throwing to the root ("Application error").
   Never wrap content a visitor needs; only toys, games, egg hosts and other progressive extras. */
const Nothing = () => null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors React.lazy's own constraint
export function safeLazy<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(() => load().catch(() => ({ default: Nothing as unknown as T })));
}
