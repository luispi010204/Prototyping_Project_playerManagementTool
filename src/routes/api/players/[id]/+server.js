import { json } from "@sveltejs/kit";
import {
  findPlayer,
  normalizePlayerPayload,
  updatePlayer,
  removePlayer,
} from "$lib/server/db.js";

function badRequest(message) {
  return json({ error: message }, { status: 400 });
}

function notFound() {
  return json({ error: "Player not found" }, { status: 404 });
}

export async function GET({ params }) {
  const player = await findPlayer(params.id);
  if (!player) {
    return notFound();
  }
  return json(player);
}

export async function PATCH({ params, request }) {
  const existing = await findPlayer(params.id);
  if (!existing) {
    return notFound();
  }
  const body = await request.json();
  const { error, payload } = normalizePlayerPayload(body, {
    partial: true,
    existing,
  });
  if (error) {
    return badRequest(error);
  }
  const updated = await updatePlayer(params.id, payload);
  if (!updated) {
    return notFound();
  }
  return json(updated);
}

export async function DELETE({ params }) {
  const deleted = await removePlayer(params.id);
  if (!deleted) {
    return notFound();
  }
  return json({ deleted: true });
}
