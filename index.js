const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://6644ee033bda8d4dd374a833--melodic-fudge-eaf185.netlify.app",
    "https://sakunest.netlify.app",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDb Connected

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lggjuua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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

   
    const roomsCollection = client.db("sakuNest").collection("rooms");
    const reviewsCollection = client.db("sakuNest").collection("reviews");
    const bookingCollection = client.db('sakuNest').collection('bookings')

    
    // Get The All Rooms Data From DB
    app.get("/rooms", async (req, res) => {
      const sort = req.query.sort;
      console.log(sort)
      // const options = {};
      // if (sort) options = { sort: { pricePerNight: sort === 'asc' ? 1 : -1 } }
      const result = await roomsCollection.find().toArray();
      res.send(result);
    });



    
      app.get('/bookings', async(req, res) => {
        const result = await bookingCollection.find().toArray()
        res.send(result)
      })

      app.get('/booking/:id', async(req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id)};
        const result = await bookingCollection.findOne(query);
        res.send(result)
      })


    // Get Single Room Data Using Id
    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });


    app.get('/bookings/:email', async (req, res) => {
      const email = req.params.email
      const query = { email }
      const result = await bookingCollection.find(query).toArray();
      res.send(result)
    })

    app.get("/review", async (req, res) => {
      const query = { time: -1 };
      const result = await reviewsCollection.find().sort(query).toArray();
      res.send(result);
    });


    app.post('/reviews', async (req, res) => {
      const review = req.body;
      
      const result =  await reviewsCollection.insertOne(review);
      const reviewRoomName = review.roomName
      const reviewCount = await reviewsCollection.countDocuments( { roomName: reviewRoomName})
      await roomsCollection.updateOne(
        { roomName: reviewRoomName},
        { $set: { reviewCount : reviewCount}}
      )

     res.send(result)
    });


    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      
      const result =  await bookingCollection.insertOne(booking);

      await roomsCollection.updateOne(
        { _id: new ObjectId(booking.roomId)},
        { $set: { availability : false}}
      )

     res.send(result)
    });



    // Update Booking Status
    app.patch('/bookinges/:id', async (req, res) => {
      const id = req.params.id;
      const booking = req.body
      console.log(id, booking.bookingDate)
      const query = { _id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          bookingDate: booking.bookingDate
        }
      }
      const result = await bookingCollection.updateOne(query, updateDoc);

      res.send(result)
      
    })


    // Update Booking Status
    app.patch('/bookRoom/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.body
      const query = { _id: new ObjectId(id)}
      const updateDoc = {
        $set: status
      }
      const result = await bookingCollection.updateOne(query, updateDoc);

      const cancelledBooking = await bookingCollection.findOne(query);
      const roomId = cancelledBooking.roomId;


      // Update Room Collection Availability
      await roomsCollection.updateOne(
        { _id: new ObjectId(roomId)},
        { $set: { availability: true }}
      )

      res.send(result)
      
    })
    


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
  res.send("Room Booking Server Is Running");
});

app.listen(port, () => {
  console.log("Server Running On Port No: ", port);
});
