import { json } from "@sveltejs/kit";
import { healPlayer, findPlayer } from "$lib/server/db.js";

function notFound() {
  return json({ error: "Player not found" }, { status: 404 });
}

export async function POST({ params }) {
  const existing = await findPlayer(params.id);
  if (!existing) {
    return notFound();
  }

  const updated = await healPlayer(params.id);
  if (!updated) {
    return notFound();
  }
  return json(updated);
}
