import { json } from "@sveltejs/kit";
import {
  insertPlayer,
  listPlayers,
  normalizePlayerPayload,
  findPlayer,
} from "$lib/server/db.js";

function badRequest(message) {
  return json({ error: message }, { status: 400 });
}

export async function GET() {
  const players = await listPlayers();
  return json(players);
}

export async function POST({ request }) {
  const body = await request.json();
  const { error, payload } = normalizePlayerPayload(body, { partial: false });
  if (error) {
    return badRequest(error);
  }

  const newId = await insertPlayer(payload);
  const created = await findPlayer(newId);
  return json(created, { status: 201 });
}
