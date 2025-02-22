const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion , ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3wt8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const usersCollection = client.db("taskDB").collection("users");
    const tasksCollection = client.db("taskDB").collection("tasks");
  

      
      // POST - Add a new task
      app.post("/tasks", async (req, res) => {
        const task = req.body;
        const result = await tasksCollection.insertOne(task);
        res.send(result);
      });
  
      // GET - Get all tasks
      app.get("/tasks", async (req, res) => {
        const tasks = await tasksCollection.find().toArray();
        res.send(tasks);
      });

      app.delete("/tasks/:id",async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await tasksCollection.deleteOne(query);
        res.send(result);
      });

      // PUT - Update a task by ID
app.put("/tasks/:id", async (req, res) => {
    const id = req.params.id; // Get the task ID from the URL parameter
    const updatedTask = req.body; // Get the updated task data from the request body
    
    // Construct the filter and update objects
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: updatedTask, // Set the new task data
    };
  
    try {
      // Perform the update operation
      const result = await tasksCollection.updateOne(filter, updateDoc);
  
      // Check if a task was updated
      if (result.modifiedCount === 0) {
        return res.status(404).send({ message: "Task not found or no changes made." });
      }
  
      res.send({ message: "Task updated successfully" });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).send({ message: "Failed to update task" });
    }
  });
  

    // users related api
    app.post("/users", async (req, res) => {
      const user = req.body;

      const query = {email: user.email}
      const existingUser = await usersCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'user already exits',insertedId: null })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("task management is running on port");
});

app.listen(port, () => {
  console.log(`task management is running on port ${port}`);
});
