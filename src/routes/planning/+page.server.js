import { getEvents, listPlayers } from "$lib/server/db.js";

export async function load() {
  const [players, events] = await Promise.all([listPlayers(), getEvents()]);
  return { players, events };
}
