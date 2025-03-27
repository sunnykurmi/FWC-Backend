let express = require("express");
const { all_yuvaShakti, create_yuvaShakti } = require("../controllers/yuvaShakti.controllers");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
let router = express.Router();

// create rout of yuvaShaktis
router.route("/all_yuvaShakti").post(isAuthenticated, isAdmin, all_yuvaShakti);


// create rout of yuvaShaktis
router.route("/create_yuvaShakti").post(isAuthenticated, create_yuvaShakti);


module.exports = router;