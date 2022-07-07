/**
 * The base type of a message sent to or from an iframe containing a Starboard Notebook.
 */
export type ScoreResult<Name extends string, Score, ScoreType> = {
  type: Name;
  scoreValue: Score;
  payload: ScoreType;
};
