import { LoggedSet, SetSummary } from "../types";

/**
 * Determines whether a logged set represents a new personal best in terms of weight,
 * one-repetition maximum (1RM), and volume.
 *
 * @param {LoggedSet} loggedSet - The set that has been logged.
 * @param {SetSummary | null} summary - The current set summary, or null if no summary is available.
 *
 * @returns {Object} An object containing boolean values indicating whether the logged set is a new personal best for weight, 1RM, and volume.
 */
export default function isPersonalBest(
  loggedSet: LoggedSet,
  summary: SetSummary | null,
): { isWeightPersonalBest: boolean; isOneRepMaxPersonalBest: boolean; isVolumePersonalBest: boolean } {

  // Determine if the logged set's weight is a personal best.
  const isWeightPersonalBest =
    summary !== null &&
    summary.isWeightPersonalBest &&
    summary.bestSet === loggedSet.weightLbs;

  // Calculate the logged set's 1RM and check if it's a personal best.
  const calculatedOneRepMax = loggedSet.weightLbs * (1 + 0.0333 * loggedSet.reps);
  const isOneRepMaxPersonalBest =
    summary !== null &&
    summary.isOneRepMaxPersonalBest &&
    summary.oneRepMaxBest === calculatedOneRepMax;

  // Calculate the logged set's volume and check if it's a personal best.
  const calculatedVolume = loggedSet.weightLbs * loggedSet.reps;
  const isVolumePersonalBest =
    summary !== null &&
    summary.isVolumePersonalBest &&
    summary.volumeBest === calculatedVolume;

  return { isWeightPersonalBest, isOneRepMaxPersonalBest, isVolumePersonalBest };
}
