import { json } from "@sveltejs/kit";
import { updateEvent, deleteEvent, findEvent } from "$lib/server/db.js";

function badRequest(message) {
  return json({ error: message }, { status: 400 });
}

function notFound() {
  return json({ error: "Event not found" }, { status: 404 });
}

export async function PUT({ params, request }) {
  const body = await request.json();
  const type = typeof body?.type === "string" ? body.type.toLowerCase() : "";
  const participants = Array.isArray(body?.participants) ? body.participants : [];
  const date = body?.date;

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

  const updated = await updateEvent(params.id, {
    date,
    type,
    participants: cleanedParticipants
  });
  if (!updated) return notFound();
  return json(updated);
}

export async function DELETE({ params }) {
  const existing = await findEvent(params.id);
  if (!existing) return notFound();
  const ok = await deleteEvent(params.id);
  if (!ok) return notFound();
  return json({ ok: true });
}
