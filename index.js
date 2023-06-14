const express = require('express');
const http = require('http');
const { MongoClient } = require('mongodb');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());

const uri = 'mongodb+srv://civil-wala-coder:1234@cluster0.jzpsadb.mongodb.net/';
const client = new MongoClient(uri);

async function connect() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

const collection = client.db('demo-crud').collection('notificationtesting');

async function createChangeStream() {
  try {
    const pipeline = [
      {
        $match: {
          operationType: 'update',
          'updateDescription.updatedFields.age': { $exists: true },
        },
      },
    ];

    const changeStream = collection.watch(pipeline);

    changeStream.on('change', (change) => {
      console.log('Change:', change.documentKey._id);

      // Emit the change event to connected clients in the 'notifications-room' room
      io.to('notifications-room').emit('notification', change);
    });

    console.log('Change stream created');
  } catch (error) {
    console.error('Error creating change stream:', error);
  }
}

connect().then(() => {
  createChangeStream();

  // Start the server
  const PORT = 5000;
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join the 'notifications-room' room
  socket.join('notifications-room');

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
