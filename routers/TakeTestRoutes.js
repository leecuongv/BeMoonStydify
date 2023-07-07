const express = require("express");
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const { TakeTestController } = require('../controllers/TakeTestController');
const TakeTest = require("../models/TakeTest");
const router = express.Router();

router.post('/', verifyToken, TakeTestController.CreateTakeTest);

router.post('/check-test', verifyToken, TakeTestController.CheckTest);

router.post('/submit-test', verifyToken, TakeTestController.SubmitAnswerSheet);//

router.get('/preview-test', verifyToken, TakeTestController.GetPreviewTest);

router.get('/result-take-test', verifyToken, TakeTestController.GetResultTakeTest)
router.post("/create-log", verifyToken, TakeTestController.CreateLogs)//
router.get("/get-logs", verifyToken, TakeTestController.GetLogs)
router.get("/all-take-test", verifyToken, TakeTestController.GetAllTakeTest)
router.get("/view-accuracy-rate-of-test-questions", verifyToken, TakeTestController.ViewAccuracyRateOfTestQuestions)
router.get("/view-test-score-distribution", verifyToken, TakeTestController.ViewTestScoreDistribution)
module.exports = router;
//đã sửa
