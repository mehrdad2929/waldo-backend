require('@dotenvx/dotenvx').config();
const express = require('express');
const appRouter = require('./routes/appRoutes');
const prisma = require('./db/prisma');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', appRouter);
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).send(err.message);
});
module.exports = app;