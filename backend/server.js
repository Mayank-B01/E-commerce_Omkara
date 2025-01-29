const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./database/config');
const authRoute = require('./routes/authRoute');

//configuring environment
dotenv.config();

connectDB().then(() => console.log('DB Connected'))
    .catch(err => console.log(err));

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/auth', authRoute);

app.get('/', (req, res) => {
    res.send(`<h1>Welcome to Omkara</h1>`);
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
