const express = require('express');
const { NewFeedController } = require('../controllers/NewFeedController');
const { verifyToken } = require("../controllers/middlewareController")

const router = express.Router();
// ADD NEWFEED
router.post('/add', verifyToken, NewFeedController.AddNewFeed);

// GET ALL NEWFEEDS
router.get('/', verifyToken, NewFeedController.GetAllNewFeeds);

// GET NEWFEED BY ID
router.get('/', verifyToken, NewFeedController.GetNewFeedById);

// UPDATE NEWFEED BY ID
router.put('/', verifyToken, NewFeedController.UpdateNewFeed);

// DELETE NEWFEED BY ID
router.delete('/', verifyToken, NewFeedController.DeleteNewFeedById);

router.delete("/remove-comment-by-teacher", verifyToken, NewFeedController.RemoveCommentByTeacher)

router.delete("/remove-newfeed-by-teacher", verifyToken, NewFeedController.RemoveNewFeedByTeacher)

module.exports = router;
