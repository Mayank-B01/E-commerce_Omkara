const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./database/config');
const authRoute = require('./routes/authRoute');
const categoryRoute = require('./routes/categoryRoute');
const cors = require('cors');

//configuring environment
dotenv.config();

connectDB()
    .then(() => {
        const app = express();

        app.use(cors());
        app.use(express.json());
        app.use(morgan('dev'));
        app.use('/api/v1/auth', authRoute);
        app.use('/api/v1/category', categoryRoute);

        app.get('/', (req, res) => {
            res.send(`<h1>Welcome to Omkara</h1>`);
        });

        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
        process.exit(1);
    });
