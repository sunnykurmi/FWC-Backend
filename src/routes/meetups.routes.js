let express = require("express");
const { all_meetup, create_meetup, update_meetup, delete_meetup } = require("../controllers/meetups.controllers");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
let router = express.Router();

// create rout of meetups
router.route("/all_meetup").post(isAuthenticated, isAdmin, all_meetup);


// create rout of meetups
router.route("/create_meetup").post(isAuthenticated, isAdmin, create_meetup);


// create rout of meetups
router.route("/update_meetup").post(isAuthenticated, isAdmin, update_meetup);


// create rout of meetups
router.route("/delete_meetup").post(isAuthenticated, isAdmin, delete_meetup);


module.exports = router;