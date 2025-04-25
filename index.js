const { Response } = require("./Utils/Response");
const { Server } = require("./Utils/Server");

const server = new Server();

async function run() {
  try {
    const app = server.getApp();
    await server.connectToDB();
    const db = server.getDB();
    const todoCollection = db.collection("todos-list");

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
          return Response.success(res, "Could not create todo", result, 400);
        }

        return Response.success(res, "Todo created successfully", newTodo, 201);
      } catch (err) {
        return Response.success(res, "Something went wrong", err, 400);
      }
    });

    app.get("/find", async (req, res) => {
      const searchTerm = req.query.searchTerm?.trim();

      try {
        const query = searchTerm
          ? { title: { $regex: searchTerm, $options: "i" } } // case-insensitive search
          : {};

        const result = await todoCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        return Response.success(res, "Todos fetched successfully", result);
      } catch (error) {
        return Response.error(res, "Something went wrong", error, 500);
      }
    });

    app.delete("/todo", async (req, res) => {
      const id = parseInt(req.query.id);

      if (isNaN(id)) {
        return Response.error(res, "Invalid or missing ID", null, 400);
      }

      try {
        const result = await todoCollection.deleteOne({ id });

        if (result.deletedCount === 0) {
          return Response.error(res, "Todo not found", null, 404);
        }

        return Response.success(res, "Todo deleted successfully");
      } catch (error) {
        return Response.error(res, "Something went wrong", error, 500);
      }
    });

    app.patch("/mark-completed", async (req, res) => {
      const id = parseInt(req.query.id);

      if (isNaN(id)) {
        return Response.error(res, "Invalid or missing ID", null, 400);
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
          return Response.error(res, "Todo not found", null, 404);
        }

        return Response.success(res, "Todo marked as completed");
      } catch (error) {
        return Response.error(res, "Something went wrong", error, 500);
      }
    });

    app.get("/todo", async (req, res) => {
      const id = parseInt(req.query.id);

      if (isNaN(id)) {
        return Response.error(res, "Invalid or missing ID", null, 400);
      }

      try {
        const result = await todoCollection.findOne({ id });

        if (!result) {
          return Response.error(res, "Todo not found", null, 404);
        }

        return Response.success(res, "Todo fetched successfully", result);
      } catch (error) {
        return Response.error(res, "Something went wrong", error, 500);
      }
    });

    app.patch("/todo", async (req, res) => {
      const id = parseInt(req.query.id);
      const { title } = req.body;

      if (isNaN(id) || !title) {
        return Response.error(res, "Invalid ID or missing title", null, 400);
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
          return Response.error(res, "Todo not found", null, 404);
        }

        return Response.success(res, "Todo updated successfully");
      } catch (error) {
        return Response.error(res, "Something went wrong", error, 500);
      }
    });

    server.start();

  } catch (error) {
    console.log(error);
  }
}

run();
