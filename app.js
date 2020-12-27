const express = require('express');
const app = express();
const bodyParse = require('body-parser');
const cors = require('cors');
require('./db');
const NodeRoute = require('./Routes/node');


app.use(cors());

app.use(bodyParse.json({ limit: '50mb', extended: true }));
app.use(bodyParse.urlencoded({ limit: '50mb', extended: true }));


app.use('/node', NodeRoute);


app.listen(4444);

