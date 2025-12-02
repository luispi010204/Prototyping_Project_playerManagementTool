import { json } from "@sveltejs/kit";
import { getDb } from "$lib/server/db";

export async function GET() {
    try {
        const db = await getDb();
        const players = await db.collection("players").find({}).toArray();

        return json({
            ok: true,
            count: players.length,
            players
        });
    } catch (err) {
        console.error("DB Error:", err);
        return json({ ok: false, error: "Failed to fetch players" }, { status: 500 });
    }
}
