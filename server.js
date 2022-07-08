const { MongoClient } = require('mongodb')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
require('dotenv').config();
const uri = process.env.URI;
const PORT = process.env.PORT;
const database = process.env.database,
    collection = process.env.collection;
const client = new MongoClient(uri);


http.listen(PORT, async() => {
    console.log(`Listening to ${PORT}`);
    try {
        await client.connect();
        console.log(`Listening on port: ${http.address().port}`);
    } catch (e) { console.error(e); }
})


//Routes
app.use(express.static(__dirname + '/public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})


//Socket.IO 
const io = require('socket.io')(http, { maxHttpBufferSize: 3e7 })
io.on('connection', (socket) => {
    console.log(`${io.of("/").sockets.size} user(s) connected [Last Updated: ${new Date(new Date()
        .getTime()).toLocaleTimeString() }]`);
    socket.on('disconnect', () => {
        console.log(`${io.of("/").sockets.size} user(s) connected [Last Updated: ${new Date(new Date()
            .getTime()).toLocaleTimeString() }]`);
    });
    socket.on('img', (msg) => {
        socket.broadcast.emit('url', msg);
    })
    socket.on('dbUpdate', async(load) => {
        deploy = {
            UserID: socket.id,
            uploadedFrom: "socket",
            value: load,
            type: "image"
        }
        await createList(client, deploy);
    })
    socket.on('requestDB', async() => {
        let cursor = await client.db(database).collection(collection).find({ uploadedFrom: "socket" }).sort({ _id: -1 }) // -1: sort by latest
            //Returns array of objects (documents)
        let dbArray = await cursor.toArray();
        await socket.emit('requestedDB', { array: dbArray })
    })

    socket.on('clearDB', async() => {
        await client.db(database).collection(collection).deleteMany({ uploadedFrom: "socket" })
    })
})


async function createList(client, docs) {
    const result = await client.db(database).collection(collection).insertOne(docs);
    console.log(result.insertedId);
}