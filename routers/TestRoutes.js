const express = require('express')
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const { TestController } = require('../controllers/TestController')
const router = express.Router();

router.post('/', verifyToken, TestController.CreateTest);

router.put('/', verifyToken, TestController.UpdateTest);
router.delete('/', verifyToken, TestController.DeleteTest);

router.get('/all', verifyToken, TestController.GetAllTests);

router.get('/by-teacher', verifyToken, TestController.GetTestByIdFromTeacher);

router.get('/by-student', verifyToken, TestController.GetTestByIdFromStudent);



module.exports = router;
