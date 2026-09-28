import { MediaBand } from "@/components/site/media-band";
import { mediaSrc, resolveMedia } from "@/lib/media";
import type { SectionProps } from "@/components/sections/types";

/** Manifest adapter: resolves the band's MediaIds to paths, then renders the
 *  existing MediaBand unchanged. A planned video may resolve to a still via
 *  its fallback chain; the band then gets no `video` (never <video src=.webp>). */
export function MediaBandSection({ entry }: SectionProps<"mediaBand">) {
  const { image, video, kicker, statement, attribution, converge } = entry.props;
  const clip = video ? resolveMedia(video) : null;
  return (
    <MediaBand
      image={mediaSrc(image)}
      video={clip?.kind === "video" ? clip.src : undefined}
      kicker={kicker}
      statement={statement}
      attribution={attribution}
      converge={converge}
    />
  );
}
