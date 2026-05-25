const router = require("express").Router();
const controller = require("../controllers/employee.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, controller.createEmployee);
router.get("/", auth, controller.getAllEmployees);
router.get("/:id", auth, controller.getEmployeeById);
router.put("/:id", auth, controller.updateEmployee);
router.delete("/:id", auth, controller.deleteEmployee);

module.exports = router;