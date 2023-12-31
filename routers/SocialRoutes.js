const express = require('express')
const { verifyToken, verifyTokenAdmin } = require("../controllers/middlewareController")
const { SocialController } = require('../controllers/SocialController')
const router = express.Router();
router.post('/login-google', SocialController.LoginGoogle);

module.exports = router;