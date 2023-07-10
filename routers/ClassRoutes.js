const express = require('express');

const { ClassController } = require('../controllers/ClassController');
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const router = express.Router();

// ADD CLASS
router.post('/', verifyToken, ClassController.AddClass);

// GET ALL CLASSES
router.get('/', verifyToken, ClassController.GetAllClasses);
router.get('/all-member', verifyToken, ClassController.GetAllMember);
router.get('/by-user-id', verifyToken, ClassController.GetClassByUserId);
router.post("/join", verifyToken, ClassController.JoinClass)
router.post("/leave", verifyToken, ClassController.LeaveClass)
router.get("/by-id", verifyToken, ClassController.GetClassById)

router.get('/teacher', verifyToken, ClassController.GetClassByTeacherId);

router.put('/', verifyToken, ClassController.UpdateClassById);

router.delete("/remove-student", verifyToken, ClassController.RemoveStudent)
router.delete("/", verifyToken, ClassController.DeleteClassById)

module.exports = router;
