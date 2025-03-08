let express = require("express");
const { approve_admin , remove_admin } = require("../controllers/admin.controllers");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
let router = express.Router();

// approve admin role to user
router.route("/approve_admin/:id").get(isAuthenticated, isAdmin, approve_admin);

// remove admin role to user
router.route("/remove_admin/:id").get(isAuthenticated, isAdmin, remove_admin);

// meetups routes
router.route("").get(isAuthenticated, isAdmin, remove_admin);




module.exports = router;