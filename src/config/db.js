const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://iconejodb_user:oK7RwTs4FvPPNq02@faunalink.evepktf.mongodb.net/?appName=FaunaLink";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

const connectDB = async () => {
  try {
    if (!db) {
      await client.connect();
      db = client.db("FaunaLink"); 

       await db.collection('usuarios').createIndex(
      { email: 1 },
      { unique: true }
    );

      console.log("✅ Conectado a MongoDB Atlas");
    }
    return db;
  } catch (error) {
    console.error("❌ Error conectando:", error);
    throw error;
  }
};

module.exports = connectDB;