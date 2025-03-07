let express = require("express");
const { all_event, create_event, update_event, delete_event } = require("../controllers/events.controllers");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
let router = express.Router();

// create rout of events
router.route("/all_event").post(isAuthenticated, isAdmin, all_event);


// create rout of events
router.route("/create_event").post(isAuthenticated, isAdmin, create_event);


// create rout of events
router.route("/update_event").post(isAuthenticated, isAdmin, update_event);


// create rout of events
router.route("/delete_event").post(isAuthenticated, isAdmin, delete_event);


module.exports = router;