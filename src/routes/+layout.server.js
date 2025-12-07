import { listPlayers } from "$lib/server/db.js";

export async function load() {
  const players = await listPlayers();
  return { players };
}
