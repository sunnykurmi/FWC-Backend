let express = require("express");
const { allow_matchmaking  } = require("../controllers/matchMaking.controllers.js");
const { isAuthenticated } = require("../middlewares/auth.js");
const { isAdmin } = require("../middlewares/isAdmin.js");
let router = express.Router();

// create rout of allow_matchmaking
router.route("/allow_matchmaking/:id").post(allow_matchmaking);


module.exports = router;