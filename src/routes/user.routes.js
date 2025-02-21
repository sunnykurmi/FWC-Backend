let express = require("express");
const { homepage, create_user, login_user, logout_user, current_user } = require("../controllers/user.controllers");
const { isAuthenticated } = require("../middlewares/auth");
let router = express.Router();

// current user route
router.route("/current_user").get(isAuthenticated, current_user);

// user create post rout 
router.route("/create_user").post(create_user);

// user login post rout 
router.route("/login_user").post(login_user);

// user logout get rout 
router.route("/logout_user").get(logout_user);


module.exports = router;