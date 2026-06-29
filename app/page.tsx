import { Hero } from "@/components/site/hero";
import { CredibilityStrip } from "@/components/site/credibility-strip";
import { About } from "@/components/site/about";
import { Journey } from "@/components/site/journey";
import { MediaBand } from "@/components/site/media-band";
import { Projects } from "@/components/site/projects";
import { Capabilities } from "@/components/site/capabilities";
import { Principles } from "@/components/site/principles";
import { Writing } from "@/components/site/writing";
import { Beyond } from "@/components/site/beyond";
import { Testimonials } from "@/components/site/testimonials";
import { Contact } from "@/components/site/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <CredibilityStrip />
      <About />
      <Journey />
      <MediaBand
        video="/media/band-flow.mp4"
        image="/media/hero-still.png"
        kicker="Operating ethos"
        statement="Treat every backtest as guilty until proven innocent."
      />
      <Projects />
      <Capabilities />
      <MediaBand
        video="/media/v-contour.mp4"
        image="/media/hero-still.png"
        kicker="On method"
        statement="A good system is not merely fast — it is inspectable, resilient, and honest about its limits."
      />
      <Principles />
      <Writing />
      <Beyond />
      <Testimonials />
      <Contact />
    </>
  );
}
