import { json } from "@sveltejs/kit";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  findPlayer,
  normalizePlayerPayload,
  updatePlayer,
  removePlayer,
} from "$lib/server/db.js";

const UPLOAD_DIR = path.resolve("static/uploads");
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

  const contentType = request.headers.get("content-type") || "";
  let bodyData;

  if (contentType.startsWith("multipart/form-data")) {
    const form = await request.formData();
    const payload = formToPayload(form);
    const photoFile = form.get("photo");

    if (photoFile && typeof photoFile === "object" && "arrayBuffer" in photoFile) {
      const saved = await saveUploadedImage(photoFile);
      if (!saved.ok) {
        return badRequest(saved.error);
      }
      payload.photoUrl = saved.url;
    }

    bodyData = payload;
  } else {
    bodyData = await request.json();
  }

  const { error, payload } = normalizePlayerPayload(bodyData, {
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

function formToPayload(form) {
  const weight = form.get("weight");
  return {
    name: form.get("name"),
    position: form.get("position"),
    age: form.get("age"),
    height: form.get("height"),
    weight: weight === null || weight === "" ? undefined : weight,
    joinedYear: form.get("joinedYear"),
    photoUrl: undefined,
  };
}

function extFromMime(type) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "";
}

async function saveUploadedImage(file) {
  const type = file.type || "";
  const size = file.size || 0;

  if (!ALLOWED_TYPES.includes(type)) {
    return { ok: false, error: "Only JPG, PNG or WEBP images are allowed" };
  }
  if (size > MAX_IMAGE_SIZE) {
    return { ok: false, error: "Image must be <= 2MB" };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const ext = extFromMime(type) || path.extname(file.name || "").replace(".", "") || "img";
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "img";
  const filename = `${Date.now()}-${crypto.randomUUID()}.${safeExt}`;
  const diskPath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(diskPath, buffer);
  return { ok: true, url: `/uploads/${filename}` };
}
