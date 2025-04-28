const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./database/config.js');
const authRoute = require('./routes/authRoute.js');
const categoryRoute = require('./routes/categoryRoute.js');
const productRoute = require('./routes/productRoute.js');
const esewaRoutes = require('./routes/esewaRoutes.js');
const cartRoute = require('./routes/cartRoute.js');
const orderRoute = require('./routes/orderRoute.js');
const cors = require('cors');

//configuring environment
dotenv.config();

connectDB()
    .then(() => {
        console.log('MongoDB Connected successfully.');
        const app = express();

        app.use(cors());
        app.use(express.json());
        app.use(morgan('dev'));

        // Use required routes
        app.use('/api/v1/auth', authRoute);
        app.use('/api/v1/category', categoryRoute);
        app.use('/api/v1/product', productRoute);
        app.use('/api/v1/esewa', esewaRoutes);
        app.use('/api/v1/cart', cartRoute);
        app.use('/api/v1/order', orderRoute);

        app.get('/', (req, res) => {
            res.send(`<h1>Welcome to Omkara</h1>`);
        });

        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    })
    .catch((error) => {
        // Changed log message back slightly
        console.error('Database connection failed:', error);
        process.exit(1);
    });
