const router = require("express").Router();
const controller = require("../controllers/attendance.controller");
const auth = require("../middleware/auth.middleware");

router.post("/checkin", auth, controller.checkIn);
router.patch("/checkout", auth, controller.checkOut);
router.get("/", auth, controller.getAttendance);

module.exports = router;