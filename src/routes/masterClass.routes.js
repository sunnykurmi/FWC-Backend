let express = require("express");
const {
  all_master_class,
  create_master_class,
  update_master_class,
  delete_master_class,
} = require("../controllers/masterClass.controllers.js");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
let router = express.Router();

router.route("/all_master_class").post(isAuthenticated, all_master_class);

// for create
router
  .route("/create_master_class")
  .post(isAuthenticated, isAdmin, create_master_class);

// for update
router
  .route("/update_master_class")
  .post(isAuthenticated, isAdmin, update_master_class);

// for delete
router
  .route("/delete_master_class")
  .post(isAuthenticated, isAdmin, delete_master_class);

module.exports = router;
