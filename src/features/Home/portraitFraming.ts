/**
 * How much of a full-body portrait the home surface used to show.
 *
 * Still the contract the artwork studio previews against for uploaded full-body
 * art. The home hero itself now stands the animated characters on the card edge
 * instead of sinking a body behind it, so it frames with the ratio below.
 */
export const HOME_PORTRAIT_VISIBLE_RATIO = 0.65;

/** Shared with the greeting layout so text never enters the artwork's box. */
export const HOME_PORTRAIT_WIDTH = 210;
export const HOME_PORTRAIT_INSET = 12;

/** The tighter tier, as a fraction of the lane above. */
export const COMPACT_PORTRAIT_SHRINK = 0.75;

/**
 * The animated characters' intrinsic box. Their offsets are authored against
 * these numbers and fitted by scaling, so they live next to the framing math
 * rather than inside the component.
 */
export const CHARACTERS_WIDTH = 550;
export const CHARACTERS_HEIGHT = 400;

/**
 * How much of the artwork box passes behind the card, as a fraction of its
 * height.
 *
 * The characters are flat-bottomed shapes standing on the box's baseline, not a
 * full body whose legs want hiding — so this only has to sink the baseline far
 * enough that they read as standing on the card rather than floating above it.
 * The full-body ratio's 35% would reach 140px up the box and swallow the orange
 * dome's pupils, which sit 98px from the bottom; that is what made the group sit
 * too low.
 */
const CHARACTERS_SUBMERGED_RATIO = 0.1;

/** Space between the hero row and the card that masks the portrait. */
export const HOME_PORTRAIT_CARD_GAP = 24;

/**
 * Fit the animated characters into a portrait lane of the given width.
 *
 * The artwork is authored in a fixed 550×400 box and scaled as a whole, so the
 * lane's width is what binds (the box is wider than it is tall, and the lane is
 * the reverse). Overlap is measured from the scaled height, since that is the
 * artwork's real extent — measuring from a nominal lane height would put the cut
 * in empty space.
 */
export const getHomePortraitFrame = (laneWidth: number) => {
  const scale = laneWidth / CHARACTERS_WIDTH;
  const height = CHARACTERS_HEIGHT * scale;

  return {
    height,
    overlap: height * CHARACTERS_SUBMERGED_RATIO + HOME_PORTRAIT_CARD_GAP,
    scale,
  };
};
