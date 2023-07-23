require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const errorMiddleware = require('./middlewares/error-middleware.js');


const PORT = process.env.PORT || 5000; // Getting PORT from .env file, if no port - use 5000 for default
const app = express(); //  Creating the app object
const router = require('./router/index.js');


app.use(express.json()); // Use express json 
app.use(cookieParser()); // Use cookie parser for saving tokens in cookies
app.use(cors()); // Use cors for interact with server from browser
app.use('/api', router); // Connect router
app.use(errorMiddleware) // Must be last EVERY TIME!

const start = async () => { // Connecting to the DB
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => console.log('SERVER STARTED ON PORT ' + PORT)) // If succeed - display message
    } catch (e) {
        console.log(e); // If not - log errors
    }
}

start()