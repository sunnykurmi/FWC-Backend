let express = require("express");
const { create_match_making  , all_matchmaking,allow_matchmaking  } = require("../controllers/matchMaking.controllers.js");
const { isAuthenticated } = require("../middlewares/auth.js");
const { isAdmin } = require("../middlewares/isAdmin.js");
let router = express.Router();


// create rout of create_match_making
router.route("/create_match_making").post(create_match_making);

// create rout of all_matchmaking
router.route("/all_matchmaking").post(all_matchmaking);


// create rout of allow_matchmaking
router.route("/allow_matchmaking/:id").post(allow_matchmaking);


module.exports = router;