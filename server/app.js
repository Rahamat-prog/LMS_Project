const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');


// middleware
app.use(express.json());

// give the access from the  the client 
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}))

// cookie parser
app.use(cookieParser());

// show the error in the console if anyone want to sent req from the unknown api ||  morgan is a loger middleware for node.js
app.use(morgan('dev'));

// API define 
app.use('/api/v1/user', userRoutes);


// initial router - server created
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message : "pong"
    })
})

// block unknown request -> Replace app.all('*', ...) with app.use(...):
app.use( (req, res) => {
    res.status(404).json({
        success: false,
        message: 'OOPS! 404 page not found',
        path: req.originalURL
    })
})

// error middleware 
app.use(errorMiddleware);

module.exports = app;