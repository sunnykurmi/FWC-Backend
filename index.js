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

const allowedOrigins = ["http://localhost:5173", "https://fwc-india.org" , "https://firstworldcommunity.org","https://www.firstworldcommunity.org"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400, // Cache preflight responses for 24 hours
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
    cookie: {
      sameSite: "None", // Allow cross-site requests
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true, // Prevents JavaScript access to cookies
    },
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
app.use("/admin", require("./src/routes/admin.routes.js"));
app.use("/meetups", require("./src/routes/meetups.routes.js"));
app.use("/events", require("./src/routes/events.routes.js"));
app.use("/investment_circle", require("./src/routes/investmentCircle.routes.js"));
app.use("/masterClass", require("./src/routes/masterClass.routes.js"));
app.use("/yuvaShakti", require("./src/routes/yuvaShakti.routes.js"));
app.use("/spotlightBoost", require("./src/routes/spotlightBoost.routes.js"));
app.use("/zoomPremium", require("./src/routes/zoomPremium.routes.js"));


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
