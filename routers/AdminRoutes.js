const express = require('express')
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const { AdminController } = require('../controllers/AdminController')
const router = express.Router();

router.put("/update-user-role", verifyTokenAdmin, AdminController.updateUserRole)
router.delete("/delete-user-by-id", verifyTokenAdmin, AdminController.deleteUserById)
router.get("/list-user", verifyTokenAdmin, AdminController.GetListUser)
router.put("/update-user-status", verifyTokenAdmin, AdminController.updateStatus)
module.exports = router