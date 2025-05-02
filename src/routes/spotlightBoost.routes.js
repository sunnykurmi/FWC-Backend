let express = require("express");
const {
  all_spotlight,
  create_spotlight,
  show_on_homepage,
  remove_from_homepage,
} = require("../controllers/spotlightBoost.controllers");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
let router = express.Router();

// create rout of events
router.route("/all_spotlight").post(isAuthenticated, all_spotlight);

// create rout of events
router.route("/create_spotlight").post(isAuthenticated, create_spotlight);

router
  .route("/show_on_homepage/:id")
  .post(isAuthenticated, isAdmin, show_on_homepage);

router
  .route("/remove_from_homepage/:id")
  .post(isAuthenticated, isAdmin, remove_from_homepage);

module.exports = router;
