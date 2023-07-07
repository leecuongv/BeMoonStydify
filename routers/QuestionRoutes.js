const express = require('express')
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const { QuestionController } = require('../controllers/QuestionController')
const router = express.Router();

router.post('/', verifyToken, QuestionController.CreateQuestion);
router.delete('/', verifyToken, QuestionController.DeleteQuestion)
router.put('/', verifyToken, QuestionController.UpdateQuestion)

module.exports = router;
