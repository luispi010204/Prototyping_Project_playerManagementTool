import { json } from "@sveltejs/kit";
import { insertEvent, findEvent, getEvents } from "$lib/server/db.js";

function badRequest(message) {
  return json({ error: message }, { status: 400 });
}

export async function POST({ request }) {
  const body = await request.json();
  const date = body?.date;
  const type = typeof body?.type === "string" ? body.type.toLowerCase() : "";
  const participants = Array.isArray(body?.participants) ? body.participants : [];

  if (!date || !type) {
    return badRequest("date and type are required");
  }

  if (!["training", "game"].includes(type)) {
    return badRequest("type must be training or game");
  }

  const cleanedParticipants = participants
    .filter((p) => typeof p === "string")
    .map((p) => p.trim())
    .filter(Boolean);

  const payload = {
    date,
    type,
    participants: cleanedParticipants,
  };

  const newId = await insertEvent(payload);
  const created = await findEvent(newId);
  return json(created, { status: 201 });
}

export async function GET() {
  const events = await getEvents();
  return json(events);
}
