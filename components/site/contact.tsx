import { ArrowUpRight } from "lucide-react";
import { GithubMark } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { Magnetic } from "@/components/ui/magnetic";
import { CopyEmail } from "@/components/ui/copy-email";
import { SectionSeam } from "@/components/ui/section-seam";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { site } from "@/lib/content";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative isolate flex min-h-[88vh] scroll-mt-24 items-center overflow-hidden border-t border-line py-28"
    >
      <SectionSeam />
      {/* Full-bleed video finale — the media is the spotlight here. */}
      <AmbientBackground
        image="/media/hero-still.png"
        video="/media/v-finale.mp4"
        opacity={0.6}
        overlayClassName="bg-gradient-to-b from-canvas/70 via-canvas/62 to-canvas/85"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 55%, rgba(11,15,18,0.6), transparent 80%)",
        }}
      />

      <div className="container-edge relative z-10">
        <Reveal variant="scale" className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-aqua/80">Contact</p>
          <h2 className="mt-5 font-serif text-4xl font-medium tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Let&rsquo;s talk research, markets, or building systems that are
            honest about their limits.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-stone">
            The most reliable way to reach me is email — I read everything. I&rsquo;m
            a high-school junior open to research conversations, mentorship, and
            serious collaboration.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Magnetic strength={0.3}>
              <CopyEmail email={site.email} />
            </Magnetic>
            <Magnetic strength={0.3}>
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-md border border-line-strong bg-canvas/40 px-5 py-3 text-sm text-ink backdrop-blur-sm transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-gold/40"
              >
                <GithubMark className="h-4 w-4" />
                GitHub
                <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
              </a>
            </Magnetic>
            <span className="inline-flex items-center gap-2 rounded-md border border-dashed border-line bg-canvas/30 px-5 py-3 text-sm text-muted backdrop-blur-sm">
              Résumé · coming soon
            </span>
          </div>

          <p className="mt-5 text-xs text-muted">
            Click the address to copy it, or{" "}
            <a
              href={`mailto:${site.email}`}
              className="underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-gold/60"
            >
              open it in your mail app
            </a>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
