import { MongoClient, ObjectId } from "mongodb";
import { MONGODB_URI } from "$env/static/private";

const DB_NAME = "PlayerManagementTool";
const PLAYER_COLLECTION = "players";
const POSITIONS = ["PG", "SG", "SF", "PF", "C"];
const HEIGHT_MIN = 185;
const HEIGHT_MAX = 216;
const BMI_MIN = 21.5;
const BMI_MAX = 24.5;

let cachedClient = null;
let clientPromise = null;

async function getClient() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }
  if (!clientPromise) {
    cachedClient = new MongoClient(MONGODB_URI);
    clientPromise = cachedClient.connect();
  }
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    clientPromise = cachedClient.connect();
  }
  await clientPromise;
  return cachedClient;
}

export async function getDb() {
  const client = await getClient();
  return client.db(DB_NAME);
}

export function weightRangeForHeight(heightCm) {
  const heightM = heightCm / 100;
  const minWeight = BMI_MIN * heightM * heightM;
  const maxWeight = BMI_MAX * heightM * heightM;
  return { minWeight, maxWeight };
}

export function normalizeHeightWeight(heightInput, weightInput, existingWeight) {
  const height = Number(heightInput);
  if (!Number.isFinite(height) || height < HEIGHT_MIN || height > HEIGHT_MAX) {
    const msg = "Height must be between 185 and 216 cm";
    return { error: msg };
  }

  const { minWeight, maxWeight } = weightRangeForHeight(height);
  let weight = weightInput === undefined ? undefined : Number(weightInput);

  if (weightInput === undefined || weightInput === null || weightInput === "") {
    const randomWeight =
      minWeight + Math.random() * (maxWeight - minWeight);
    weight = Math.round(randomWeight);
  } else if (!Number.isFinite(weight) || weight < minWeight || weight > maxWeight) {
    const msg = `Weight must keep BMI between 21.5 and 24.5 for height ${height}cm`;
    return { error: msg };
  }

  if (weight === undefined && existingWeight !== undefined) {
    weight = existingWeight;
  }

  return { height, weight };
}

export function normalizePlayerPayload(data, { partial = false, existing = null } = {}) {
  const trimmedName = typeof data.name === "string" ? data.name.trim() : data.name;
  const payload = {};

  if (!partial || data.name !== undefined) {
    if (!trimmedName) return { error: "Name is required" };
    payload.name = trimmedName;
  }

  if (!partial || data.age !== undefined) {
    const age = Number(data.age);
    if (!Number.isFinite(age) || age <= 0) return { error: "Age must be a positive number" };
    payload.age = age;
  }

  if (!partial || data.position !== undefined) {
    if (!POSITIONS.includes(data.position)) return { error: "Position must be one of PG, SG, SF, PF, C" };
    payload.position = data.position;
  }

  if (!partial || data.joinedYear !== undefined) {
    const year = Number(data.joinedYear);
    if (!Number.isFinite(year)) return { error: "Member Since (joinedYear) is required" };
    payload.joinedYear = year;
  }

  if (data.photoUrl !== undefined || !partial) {
    payload.photoUrl = data.photoUrl || "";
  }

  if (data.isInjured !== undefined || !partial) {
    payload.isInjured = data.isInjured === true || data.isInjured === "true";
  }

  if (!partial || data.height !== undefined || data.weight !== undefined) {
    const currentWeight = existing ? existing.weight : undefined;
    const { error, height, weight } = normalizeHeightWeight(
      data.height !== undefined ? data.height : existing ? existing.height : undefined,
      data.weight !== undefined ? data.weight : undefined,
      currentWeight
    );
    if (error) return { error };
    payload.height = height;
    payload.weight = weight;
  }

  if (!partial) {
    payload.injuries = [];
    if (payload.isInjured === undefined) {
      payload.isInjured = false;
    }
  }

  return { payload };
}

export function serializePlayer(player) {
  if (!player) return null;
  const serialized = { ...player, _id: player._id?.toString() };
  if (!serialized.injuries) serialized.injuries = [];
  serialized.injuries = serialized.injuries.map((injury) => ({
    ...injury,
    _id: injury._id?.toString()
  }));
  return serialized;
}

export async function listPlayers() {
  const db = await getDb();
  const collection = db.collection(PLAYER_COLLECTION);
  const players = await collection.find({}).sort({ name: 1 }).toArray();
  return players.map(serializePlayer);
}

export async function findPlayer(id) {
  const db = await getDb();
  const collection = db.collection(PLAYER_COLLECTION);
  let queryId;
  try {
    queryId = new ObjectId(id);
  } catch (err) {
    return null;
  }
  const player = await collection.findOne({ _id: queryId });
  return serializePlayer(player);
}

export async function insertPlayer(data) {
  const db = await getDb();
  const collection = db.collection(PLAYER_COLLECTION);
  const result = await collection.insertOne(data);
  return result.insertedId.toString();
}

export async function updatePlayer(id, updates) {
  const db = await getDb();
  const collection = db.collection(PLAYER_COLLECTION);
  let queryId;
  try {
    queryId = new ObjectId(id);
  } catch (err) {
    return null;
  }
  await collection.updateOne({ _id: queryId }, { $set: updates });
  const updated = await collection.findOne({ _id: queryId });
  return serializePlayer(updated);
}

export async function removePlayer(id) {
  const db = await getDb();
  const collection = db.collection(PLAYER_COLLECTION);
  let queryId;
  try {
    queryId = new ObjectId(id);
  } catch (err) {
    return false;
  }
  const res = await collection.deleteOne({ _id: queryId });
  return res.deletedCount > 0;
}

export async function appendInjury(id, injury) {
  const db = await getDb();
  const collection = db.collection(PLAYER_COLLECTION);
  const injuryId = new ObjectId().toString();
  const injuryEntry = { ...injury, _id: injuryId };
  let queryId;
  try {
    queryId = new ObjectId(id);
  } catch (err) {
    return null;
  }
  await collection.updateOne(
    { _id: queryId },
    { $set: { isInjured: true }, $push: { injuries: injuryEntry } }
  );
  const updated = await collection.findOne({ _id: queryId });
  return serializePlayer(updated);
}

export async function healPlayer(id) {
  const db = await getDb();
  const collection = db.collection(PLAYER_COLLECTION);
  let queryId;
  try {
    queryId = new ObjectId(id);
  } catch (err) {
    return null;
  }
  await collection.updateOne(
    { _id: queryId },
    { $set: { isInjured: false } }
  );
  const updated = await collection.findOne({ _id: queryId });
  return serializePlayer(updated);
}
