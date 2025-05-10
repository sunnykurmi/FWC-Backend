let express = require("express");
const { getAllMatchmakings, allow_matchmaking, create_matchmaking } = require("../controllers/matchMaking.controllers.js");
const { isAuthenticated } = require("../middlewares/auth.js");
const { isAdmin } = require("../middlewares/isAdmin.js");
let router = express.Router();

// create rout of allow_matchmaking
router.route("/getAllMatchmakings").post(isAuthenticated, isAdmin, getAllMatchmakings);


// create rout of allow_matchmaking
router.route("/create_matchmaking/:id").post(isAuthenticated, create_matchmaking);


// create rout of allow_matchmaking
router.route("/allow_matchmaking/:id").post(isAuthenticated, isAdmin, allow_matchmaking);


module.exports = router;