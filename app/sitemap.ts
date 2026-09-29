import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { anchors, sectionById } from "@/lib/sections";

/** One-page site: the home URL, plus one fragment URL per enabled section
 *  anchor from the page manifest (lib/sections.ts); the hero IS the home URL.
 *  Crawlers fold fragments into the home URL, so these are low-priority
 *  wayfinding hints only. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${site.domainNote}`;
  const lastModified = new Date();
  return [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...anchors
      .filter((id) => sectionById(id)?.type !== "hero")
      .map((id) => ({
        url: `${base}/#${id}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
  ];
}
