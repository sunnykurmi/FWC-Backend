let express = require("express");
const {  create_member ,all_members ,createpayment ,verifypayment ,paymentsuccess } = require("../controllers/member.controllers");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");  
let router = express.Router();

// all members  route
router.route("/all_members").get(isAuthenticated, isAdmin, all_members);

// member create post route
router.route("/create_member").post(create_member);

// route for create payment
router.route("/create-order").post(createpayment)

// route for verify payment
router.route("/verify-payment").post(verifypayment)

// route for verify payment
router.route("/paymentsuccess/:id").post( paymentsuccess)



module.exports = router;