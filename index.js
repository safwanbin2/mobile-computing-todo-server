require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mogpxeu.mongodb.net/?retryWrites=true&w=majority`;

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("server is running fine");
});

function run() {
  try {
    client.connect();
    console.log("mongodb connected successfully");

    const todoCollection = client.db("WorkingTitle").collection("todos-list");

    // creating todo
    app.post("/todos", async (req, res) => {
      const { title, isCompleted } = req.body;
      try {
        const lastTodo = await todoCollection
          .find()
          .sort({ id: -1 })
          .limit(1)
          .toArray();
        const nextId = lastTodo.length > 0 ? lastTodo[0].id + 1 : 1;

        const newTodo = {
          id: nextId,
          title,
          isCompleted: isCompleted || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await todoCollection.insertOne(newTodo);

        if (!result.acknowledged) {
          return res.status(400).json({
            success: false,
            message: "Could not create todo",
            data: result,
          });
        }

        return res.status(201).json({
          success: true,
          message: "Todo created successfully",
          data: newTodo,
        });
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Something went wrong",
          data: err,
        });
      }
    });


    // search
    app.get("/find", async (req, res) => {
      const searchTerm = req.query.searchTerm?.trim();
    
      try {
        const query = searchTerm
          ? { title: { $regex: searchTerm, $options: "i" } } // case-insensitive search
          : {};
    
        const result = await todoCollection
          .find(query)
          .sort({ createdAt: -1 }) // latest first
          .toArray();
    
        return res.status(200).json({
          success: true,
          message: "Todos fetched successfully",
          data: result,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Something went wrong",
          error,
        });
      }
    });

    // delete todo
    app.delete("/todo", async (req, res) => {
      const id = parseInt(req.query.id); // Convert query param to number
    
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing ID",
        });
      }
    
      try {
        const result = await todoCollection.deleteOne({ id });
    
        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Todo not found",
          });
        }
    
        return res.status(200).json({
          success: true,
          message: "Todo deleted successfully",
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Something went wrong",
          error,
        });
      }
    });

    // marking completed
    app.patch("/mark-completed", async (req, res) => {
      const id = parseInt(req.query.id);
    
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing ID",
        });
      }
    
      try {
        const result = await todoCollection.updateOne(
          { id },
          {
            $set: {
              isCompleted: true,
              updatedAt: new Date(),
            },
          }
        );
    
        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Todo not found",
          });
        }
    
        return res.status(200).json({
          success: true,
          message: "Todo marked as completed",
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Something went wrong",
          error,
        });
      }
    });

    // getting single todo by id
    app.get("/todo", async (req, res) => {
      const id = parseInt(req.query.id);
    
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing ID",
        });
      }
    
      try {
        const result = await todoCollection.findOne({ id });
    
        if (!result) {
          return res.status(404).json({
            success: false,
            message: "Todo not found",
          });
        }
    
        return res.status(200).json({
          success: true,
          message: "Todo fetched successfully",
          data: result,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Something went wrong",
          error,
        });
      }
    });

    // updating todo
    app.patch("/todo", async (req, res) => {
      const id = parseInt(req.query.id);
      const { title } = req.body;
    
      if (isNaN(id) || !title) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID or missing title",
        });
      }
    
      try {
        const result = await todoCollection.updateOne(
          { id },
          {
            $set: {
              title,
              updatedAt: new Date(),
            },
          }
        );
    
        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Todo not found",
          });
        }
    
        return res.status(200).json({
          success: true,
          message: "Todo updated successfully",
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Something went wrong",
          error,
        });
      }
    });
    
    

  } catch (error) {
    console.log(error);
  }
}

run();

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
