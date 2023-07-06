const express = require('express');

const { ClassController } = require('../controllers/ClassController');
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const router = express.Router();

// ADD CLASS
router.post('/add', verifyToken, ClassController.AddClass);

// GET ALL CLASSES
router.get('/', verifyToken, ClassController.GetAllClasses);
router.get('/by-user-id', verifyToken, ClassController.GetClassByUserId);
// GET CLASS BY ID
router.get('/:id', verifyToken, ClassController.GetClassById);

// GET CLASS BY TEACHER ID
router.get('/teacher/:id', verifyToken, ClassController.GetClassByTeacherId);

// UPDATE CLASS BY ID
router.put('/:id', verifyToken, ClassController.UpdateClassById);

// DELETE CLASS BY ID
router.delete('/:id', verifyToken, ClassController.DeleteClassById);



module.exports = router;
