/**
 * Minimal class-name joiner. Filters falsy values and joins with a space.
 * Kept dependency-free on purpose — we avoid clsx/tailwind-merge bloat and
 * simply never pass conflicting Tailwind utilities to the same element.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
