const router = require("express").Router();
const controller = require("../controllers/task.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, controller.createTask);
router.get("/", auth, controller.getTasks);
router.patch("/:id/status", auth, controller.updateStatus);
router.delete("/:id", auth, controller.deleteTask);

module.exports = router;