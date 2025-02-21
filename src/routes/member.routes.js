let express = require("express");
const {  create_member ,all_members } = require("../controllers/member.controllers");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");  
let router = express.Router();

// all members  route
router.route("/all_members").get(isAuthenticated, isAdmin, all_members);

// member create post route
router.route("/create_member").post(create_member);

module.exports = router;