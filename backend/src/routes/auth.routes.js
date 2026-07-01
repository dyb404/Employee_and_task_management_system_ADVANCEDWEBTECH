const router = require("express").Router();
const authController = require("../controllers/auth.controller");

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

router.post("/register", auth, authorize("admin"), authController.register);
router.post("/login", authController.login);

module.exports = router;