// .env configuration
require("dotenv").config({ path: "./.env" });
// import express
let express = require("express");
let app = express();

// use database
require("./src/models/database.js").connectDatabase();

// logger
app.use(require("morgan")("tiny"));

// cors integration
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// session and cookie
const session = require("express-session");
const cookieparser = require("cookie-parser");

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET, 
  })
);

app.use(cookieparser());
// express file-upload
const fileupload = require("express-fileupload");
app.use(fileupload());



// routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to FWC API",
  });
});
app.use("/user", require("./src/routes/user.routes.js"));
app.use("/member", require("./src/routes/member.routes.js"));




// Error handling
const ErrorHandler = require("./src/utils/ErrorHandler.js");
const { generatedErrors } = require("./src/middlewares/error.js");
app.use("*", async (req, res, next) => {
  next(new ErrorHandler(`Requested URL Not Found ${req.url}`, 404));
});
app.use(generatedErrors);

// server listen
app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
