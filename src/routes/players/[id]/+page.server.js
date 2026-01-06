import { error } from "@sveltejs/kit";
import { findPlayer, getEvents } from "$lib/server/db.js";

export async function load({ params }) {
  const player = await findPlayer(params.id);
  if (!player) {
    throw error(404, "Player not found");
  }
  const events = await getEvents();
  return { player, events };
}
