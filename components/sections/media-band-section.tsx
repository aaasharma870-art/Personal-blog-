import { MediaBand } from "@/components/site/media-band";
import { mediaSrc } from "@/lib/media";
import type { SectionProps } from "@/components/sections/types";

/** Manifest adapter: resolves the band's MediaIds to paths, then renders the
 *  existing MediaBand unchanged. */
export function MediaBandSection({ entry }: SectionProps<"mediaBand">) {
  const { image, video, kicker, statement, attribution, converge } = entry.props;
  return (
    <MediaBand
      image={mediaSrc(image)}
      video={video ? mediaSrc(video) : undefined}
      kicker={kicker}
      statement={statement}
      attribution={attribution}
      converge={converge}
    />
  );
}
