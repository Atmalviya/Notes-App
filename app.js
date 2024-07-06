require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require("./server/config/db");
const session = require("express-session");
const passport = require('passport');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    })
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static("public")); 
// Templates
app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

// Routes
app.use("/", require("./server/routes/index"));
app.use("/", require("./server/routes/dashboard"));
app.use("/", require("./server/routes/auth"));

// Routes 404 Not Found
app.get("/*", (req, res) => {
  res.status(404).render("404");
});
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  connectDB();
});
