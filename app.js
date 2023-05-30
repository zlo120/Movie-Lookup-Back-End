var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const swaggerDocument = require('./docs/swagger.json');
const swaggerUI = require('swagger-ui-express');


const options = require("./knexfile.js");
const knex = require("knex")(options);
const cors = require('cors');

const { attachPaginate } = require('knex-paginate');
attachPaginate();

var usersRouter = require("./routes/users");
var peopleRouter = require("./routes/people");
var movieRouter = require("./routes/movies");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  req.db = knex;
  next();
});

app.use('/', swaggerUI.serve)
app.get('/', swaggerUI.setup(swaggerDocument))
app.use("/user", usersRouter);
app.use("/people", peopleRouter);
app.use("/movies", movieRouter);

app.use((req, res, next) => {
  res.status(404).json({ status: "error", message: "Page not found!" })
})

module.exports = app;