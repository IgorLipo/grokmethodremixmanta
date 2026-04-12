/**
 * Median native app bridge utilities.
 * @see https://median.co/docs
 */

/** True when the page is running inside a Median native wrapper. */
export const isMedianApp = (): boolean =>
  typeof navigator !== "undefined" && navigator.userAgent.indexOf("median") > -1;
