import { SectionSeam } from "@/components/ui/section-seam";
import { ContactFinaleMedia } from "@/components/site/contact-finale-media";
import { ContactFinale } from "@/components/site/contact-finale";
import { site } from "@/lib/content";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative isolate flex min-h-[92svh] scroll-mt-24 items-center overflow-hidden border-t border-line py-28 lg:min-h-[100svh]"
    >
      <SectionSeam variant="signature" />
      {/* Full-bleed vol-surface finale — Ken-Burns settle on scroll (spec §4). */}
      <ContactFinaleMedia />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 55%, rgba(11,15,18,0.6), transparent 80%)",
        }}
      />

      <div className="container-edge relative z-10">
        <ContactFinale email={site.email} github={site.github} />
      </div>
    </section>
  );
}
