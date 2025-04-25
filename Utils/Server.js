const express = require("express");
const cors = require("cors");
require("dotenv").config();

class Server {
  constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
    this.port = process.env.PORT || 3000;
    this.mongoClient = null;
    this.db = null;
  }

  async connectToDB() {
    try {
      const { MongoClient, ServerApiVersion } = require("mongodb");
      const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mogpxeu.mongodb.net/?retryWrites=true&w=majority`;

      this.mongoClient = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });

      await this.mongoClient.connect();
      console.log("✅ Connected to MongoDB");

      this.db = this.mongoClient.db("WorkingTitle");
    } catch (err) {
      console.error("Failed to connect to MongoDB", err.message);
      process.exit(1);
    }
  }

  getApp() {
    return this.app;
  }

  getDB() {
    return this.db;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

module.exports = { Server };
