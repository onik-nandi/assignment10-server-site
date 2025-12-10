const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@assignment-10.g03zhhb.mongodb.net/?appName=assignment-10`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello Dev");
});

async function run() {
  try {
    await client.connect();
    const database = client.db("art-works");
    const artWorksCollection = database.collection("art-work");

    // post art to DB
    app.post("/artworks", async (req, res) => {
      const data = req.body;
      const date = new Date();
      data.createdAt = date;
      console.log(data);
      const result = await artWorksCollection.insertOne(data);
      res.send(result);
    });

    // get artwork in backend from db
    app.get("/artWorks", async (req, res) => {
      // const visibility = req.query.visibility;
      // const category =req.query.category;
      const { category, visibility } = req.query;
      console.log(visibility);
      const query = {};

      if (visibility) {
        query.Visibility = visibility;
      }
      if (category) {
        query.category = category;
      }

      const result = await artWorksCollection.find(query).toArray();
      res.send(result);
    });

    // only 6 from recent

    app.get("/recentArtworks", async (req, res) => {
      const { visibility } = req.query;
      console.log(visibility);
      const query = {};

      if (visibility) {
        query.Visibility = visibility;
      }
      const result = await artWorksCollection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Server is running in ${port}`);
});
