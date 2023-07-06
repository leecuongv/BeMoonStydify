const express = require('express');
const { NewFeedController } = require('../controllers/NewFeedController');
const { verifyToken } = require("../controllers/middlewareController")

const router = express.Router();
// ADD NEWFEED
router.post('/add', verifyToken, NewFeedController.AddNewFeed);

// GET ALL NEWFEEDS
router.get('/', verifyToken, NewFeedController.GetAllNewFeeds);

// GET NEWFEED BY ID
router.get('/:id', verifyToken, NewFeedController.GetNewFeedById);

// UPDATE NEWFEED BY ID
router.put('/:id', verifyToken, NewFeedController.UpdateNewFeedById);

// DELETE NEWFEED BY ID
router.delete('/:id', verifyToken, NewFeedController.DeleteNewFeedById);

module.exports = router;
