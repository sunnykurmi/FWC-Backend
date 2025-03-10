let express = require("express");
const { homepage, create_user, login_user, logout_user, current_user, google_auth, all_users } = require("../controllers/user.controllers");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
let router = express.Router();

// all members  route
router.route("/all_users").get(isAuthenticated, isAdmin, all_users);

// route for google auth
router.route("/google_auth").get(google_auth)

// current user route
router.route("/current_user").get(isAuthenticated, current_user);

// user create post rout 
router.route("/create_user").post(create_user);

// user login post rout 
router.route("/login_user").post(login_user);

// user logout get rout 
router.route("/logout_user").get(logout_user);


module.exports = router;