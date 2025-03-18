let express = require("express");
const { all_investment_circle, create_investment_circle } = require("../controllers/investmentCircle.controllers");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
let router = express.Router();

// create rout of events
router.route("/all_investment_circle").post(isAuthenticated, isAdmin, all_investment_circle);


// create rout of events
router.route("/create_investment_circle").post(isAuthenticated,create_investment_circle);


module.exports = router;