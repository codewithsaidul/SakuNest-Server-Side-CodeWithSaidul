const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://solosphere.web.app',
    ],
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json());


// MongoDb Connected


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lggjuua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const roomsCollection = client.db('sakuNest').collection('rooms')


    // Get The All Rooms Data From DB
    app.get('/rooms', async(req, res) => {
        const result = await roomsCollection.find().toArray();
        res.send(result)
    })

    // Get Single Room Data Using Id 
    app.get('/rooms/:id', async(req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id)};
        const result = await roomsCollection.findOne(query);
       
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Room Booking Server Is Running")
})

app.listen(port, () => {
    console.log("Server Running On Port No: ", port)
})