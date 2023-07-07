const express = require('express');

const { ClassController } = require('../controllers/ClassController');
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const router = express.Router();

// ADD CLASS
router.post('/add', verifyToken, ClassController.AddClass);

// GET ALL CLASSES
router.get('/', verifyToken, ClassController.GetAllClasses);
router.get('/all-member', verifyToken, ClassController.GetAllMember);
router.get('/by-user-id', verifyToken, ClassController.GetClassByUserId);
router.post("/join", verifyToken, ClassController.JoinClass)
router.post("/leave", verifyToken, ClassController.LeaveClass)
// GET CLASS BY ID
router.get('/', verifyToken, ClassController.GetClassById);

// GET CLASS BY TEACHER ID
router.get('/teacher', verifyToken, ClassController.GetClassByTeacherId);

// UPDATE CLASS BY ID
router.put('/', verifyToken, ClassController.UpdateClassById);

// DELETE CLASS BY ID
//router.delete('/:id', verifyToken, ClassController.DeleteClassById);

router.delete("/remove-student", verifyToken, ClassController.RemoveStudent)



module.exports = router;
