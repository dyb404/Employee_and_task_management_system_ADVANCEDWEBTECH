const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const userController = require("../controllers/user.controller");

router.get("/", auth, authorize("admin"), userController.getAllUsers);
router.post("/", auth, authorize("admin"), userController.createUser);

module.exports = router;
