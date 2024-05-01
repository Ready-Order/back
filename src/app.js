const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

app.listen(process.env.PORT);

const indexRouter = require("./routes/indexRoute");

app.use("", indexRouter);
