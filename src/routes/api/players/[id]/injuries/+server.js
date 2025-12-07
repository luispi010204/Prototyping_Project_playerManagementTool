import { json } from "@sveltejs/kit";
import { appendInjury, findPlayer } from "$lib/server/db.js";

function badRequest(message) {
  return json({ error: message }, { status: 400 });
}

function notFound() {
  return json({ error: "Player not found" }, { status: 404 });
}

export async function POST({ params, request }) {
  const body = await request.json();
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const expectedRecovery = typeof body.expectedRecovery === "string" ? body.expectedRecovery.trim() : "";

  if (!date || !description || !expectedRecovery) {
    return badRequest("date, description and expectedRecovery are required");
  }

  const existing = await findPlayer(params.id);
  if (!existing) {
    return notFound();
  }

  const updated = await appendInjury(params.id, { date, description, expectedRecovery });
  if (!updated) {
    return notFound();
  }
  return json(updated, { status: 201 });
}
