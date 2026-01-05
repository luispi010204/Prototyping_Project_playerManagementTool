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
  const startTime = typeof body?.startTime === "string" ? body.startTime : "";
  const endTime = typeof body?.endTime === "string" ? body.endTime : "";

  if (!date || !type || !startTime || !endTime) {
    return badRequest("date, type, startTime and endTime are required");
  }

  if (!["training", "game"].includes(type)) {
    return badRequest("type must be training or game");
  }

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return h * 60 + m;
  };
  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);
  if (startMin === null || endMin === null || endMin <= startMin) {
    return badRequest("Invalid time range");
  }

  const cleanedParticipants = participants
    .filter((p) => typeof p === "string")
    .map((p) => p.trim())
    .filter(Boolean);

  const eventsSameDay = (await getEvents()).filter((ev) => (ev.date || "").startsWith(date));
  const overlaps = eventsSameDay.some((ev) => {
    const evStart = toMinutes(ev.startTime || "");
    const evEnd = toMinutes(ev.endTime || "");
    if (evStart === null || evEnd === null) return false;
    return startMin < evEnd && endMin > evStart;
  });
  if (overlaps) {
    return json({ error: "This time slot is already occupied" }, { status: 409 });
  }

  const payload = {
    date,
    type,
    participants: cleanedParticipants,
    startTime,
    endTime,
  };

  const newId = await insertEvent(payload);
  const created = await findEvent(newId);
  return json(created, { status: 201 });
}

export async function GET() {
  const events = await getEvents();
  return json(events);
}
