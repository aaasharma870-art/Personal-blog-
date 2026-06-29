import { Mail } from "lucide-react";
import { GithubMark } from "@/components/ui/icons";
import { footerLine, site } from "@/lib/content";

export function Footer() {
  const year = 2026; // build-stamped; update on rebuild

  return (
    <footer className="border-t border-line py-12">
      <div className="container-edge">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <a href="#top" className="flex items-center gap-3" aria-label={`${site.name} — back to top`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-line-strong font-mono text-xs tracking-wide text-gold">
              {site.initials}
            </span>
            <span className="text-sm font-medium tracking-tight text-ink">
              {site.name}
            </span>
          </a>

          <div className="flex items-center gap-3">
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub profile"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-stone transition-colors hover:border-gold/40 hover:text-ink"
            >
              <GithubMark className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${site.email}`}
              aria-label="Email"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-stone transition-colors hover:border-gold/40 hover:text-ink"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <p className="editorial italic">{footerLine}</p>
          <p className="font-mono">
            © {year} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
