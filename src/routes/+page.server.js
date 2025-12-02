import db from "$lib/server/db.js";

export async function load() {
  return {
    players: await db.getPlayers(),
  }
}