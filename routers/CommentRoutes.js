const express = require('express');
const { CommentController } = require('../controllers/CommentController');
const { verifyToken } = require("../controllers/middlewareController")
const router = express.Router();
// ADD COMMENT
router.post('/', verifyToken, CommentController.AddComment);
// GET ALL COMMENTS
router.get('/all', verifyToken, CommentController.GetAllComments);
// GET COMMENT BY ID
router.get('/', verifyToken, CommentController.GetCommentById);
// UPDATE COMMENT BY ID
router.put('/', verifyToken, CommentController.UpdateComment);
// DELETE COMMENT BY ID
router.delete('/', verifyToken, CommentController.DeleteCommentById);
module.exports = router;
