const express = require('express')
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const { TestController } = require('../controllers/TestController')
const router = express.Router();

router.post('/create-test', verifyToken, TestController.CreateTest);

router.put('/update-test', verifyToken, TestController.UpdateTest);

router.get('/get-testbyslug', verifyToken, TestController.GetTestBySlugTeacher);

router.get('/test-by-student', verifyToken, TestController.GetTestBySlugByStudent);

router.post("/add-question-with-questionbank", verifyToken, TestController.AddQuestionWithQuestionBank)

router.put('/public-test', verifyToken, TestController.PublicTest)

router.put('/close-test', verifyToken, TestController.CloseTest)

router.post("/create-question-with-questionbank", verifyToken, TestController.CreateQuestionWithQuestionBank)



module.exports = router;
