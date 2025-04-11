let express = require("express");
const { all_spotlight, create_spotlight } = require("../controllers/spotlightBoost.controllers");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
let router = express.Router();

// create rout of events
router.route("/all_spotlight").post(isAuthenticated, isAdmin, all_spotlight);

// create rout of events
router.route("/create_spotlight").post(isAuthenticated, create_spotlight);

module.exports = router;