/* ============================================================================
   FAR — out of paint while far (P3-11 r1, J8 #2: "finished or not-yet-
   started card stages must cost nothing; zero opacity is not enough").
   OWNER: F2 (cards + stage). Desktop chunks only (card-p3, the stage).

   A sticky layer far from the reader (a finished card's stage stuck at the
   bottom of its pin, the next card's waiting at the top of its own, a split
   window outside its section) was repainted on every scroll frame. While the
   element is more than `margin` viewport heights from the viewport it gets
   an inline `visibility: hidden`: nothing in it is painted or rastered, yet
   it keeps its box (no layout change, CLS 0) and every IntersectionObserver
   and rect read inside it still works (they ignore visibility). It is shown
   again a viewport before it can come into view.

   Only for aria-hidden ART (the card frame, the stage window): visibility
   also removes content from the accessibility tree, so text (the act h2,
   the captions, the summary) is never hidden this way.
   ========================================================================== */

/** Hide `el` while it is farther than `margin` viewports away. Returns the
 *  cleanup (which shows it again). */
export function hideWhenFar(el: HTMLElement, margin = 1): () => void {
  if (typeof IntersectionObserver === "undefined") return () => {};
  const pct = `${Math.round(margin * 100)}%`;
  const io = new IntersectionObserver(
    ([e]) => {
      if (e) el.style.visibility = e.isIntersecting ? "" : "hidden";
    },
    { rootMargin: `${pct} 0px ${pct} 0px` },
  );
  io.observe(el);
  return () => {
    io.disconnect();
    el.style.visibility = "";
  };
}
