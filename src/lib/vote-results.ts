export type VoteResults =
  | { visibility: "closed" }
  | { visibility: "anonymous"; counts: Record<string, number> }
  | { visibility: "open"; votes: { playerName: string; choice: string }[] };

/** Shapes raw vote submissions for player-facing display according to the activity's results_visibility. */
export function buildVoteResults(
  visibility: string,
  submissions: { payload: unknown; player_id: string | null }[],
  playerNameById: Map<string, string>,
): VoteResults {
  if (visibility !== "open" && visibility !== "anonymous") return { visibility: "closed" };

  const choices = submissions
    .map((s) => ({
      choice: (s.payload as { choice?: string })?.choice,
      playerId: s.player_id,
    }))
    .filter((v): v is { choice: string; playerId: string | null } => !!v.choice);

  if (visibility === "anonymous") {
    const counts: Record<string, number> = {};
    for (const { choice } of choices) counts[choice] = (counts[choice] ?? 0) + 1;
    return { visibility, counts };
  }

  return {
    visibility,
    votes: choices.map(({ choice, playerId }) => ({
      choice,
      playerName: (playerId && playerNameById.get(playerId)) || "Игрок",
    })),
  };
}
