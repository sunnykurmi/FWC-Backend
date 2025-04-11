let express = require("express");
const { all_zoom, create_zoom } = require("../controllers/zoomPremium.controllers");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
let router = express.Router();

// create rout of events
router.route("/all_zoom").post(isAuthenticated, isAdmin, all_zoom);

// create rout of events
router.route("/create_zoom").post(isAuthenticated, create_zoom);

module.exports = router;