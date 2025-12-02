import { MongoClient, ObjectId } from "mongodb";
import { DB_URI } from "$env/static/private";


const client = new MongoClient(DB_URI);

await client.connect();
const db = client.db("PlayerManagementTool");


async function getPlayers() {
  let players = [];
  try {
    const collection = db.collection("players");

    // You can specify a query/filter here
    // See https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/query-document/
    const query = {};

    // Get all objects that match the query
    players = await collection.find(query).toArray();
    players.forEach((player) => {
      player._id = player._id.toString(); // convert ObjectId to String
    });
  } catch (error) {
    console.log(error);
    // TODO: errorhandling
  }
  return players;
}


// Get pla<er by id
async function getPlayer(id) {
  let player = null;
  try {
    const collection = db.collection("players");
    const query = { _id: new ObjectId(id) }; // filter by id
    player = await collection.findOne(query);

    if (!player) {
      console.log("No player with id " + id);
      // TODO: errorhandling
    } else {
      player._id = player._id.toString(); // convert ObjectId to String
    }
  } catch (error) {
    // TODO: errorhandling
    console.log(error.message);
  }
  return player;
}

// create player
 
async function createPlayer(player) {
  player.poster = "/images/placeholder.jpg"; // default poster
  player.actors = [];
  player.watchlist = false;
  try {
    const collection = db.collection("players");
    const result = await collection.insertOne(player);
    return result.insertedId.toString(); // convert ObjectId to String
  } catch (error) {
    // TODO: errorhandling
    console.log(error.message);
  }
  return null;
}


// returns: id of the updated player or null, if player could not be updated
async function updatePlayer(player) {
  try {
    let id = player._id;
    delete player._id; // delete the _id from the object, because the _id cannot be updated
    const collection = db.collection("players");
    const query = { _id: new ObjectId(id) }; // filter by id
    const result = await collection.updateOne(query, { $set: player });

    if (result.matchedCount === 0) {
      console.log("No player with id " + id);
      // TODO: errorhandling
    } else {
      console.log("Player with id " + id + " has been updated.");
      return id;
    }
  } catch (error) {
    // TODO: errorhandling
    console.log(error.message);
  }
  return null;
}

// delete player by id
// returns: id of the deleted player or null, if player could not be deleted
async function deletePlayer(id) {
  try {
    const collection = db.collection("players");
    const query = { _id: new ObjectId(id) }; // filter by id
    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      console.log("No player with id " + id);
    } else {
      console.log("Player with id " + id + " has been successfully deleted.");
      return id;
    }
  } catch (error) {
    // TODO: errorhandling
    console.log(error.message);
  }
  return null;
}

// export all functions so that they can be used in other files
export default {
  getPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
