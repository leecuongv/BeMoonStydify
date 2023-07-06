const Comment = require('../models/Comment');

// GET ALL COMMENTS
const CommentController = {
    GetAllComments: async (req, res) => {
        Comment.find()
            .then((data) => res.json({
                success: true,
                data: data,
            }))
            .catch((err) => res.status(500).json({
                success: false,
                message: err,
            }));
    },

    // GET COMMENT BY ID
    GetCommentById: async (req, res) => {
        Comment.findById(req.params.id)
            .then((data) => res.json({
                success: true,
                data: data,
            }))
            .catch((err) => res.status(500).json({
                success: false,
                message: err,
            }));
    },

    // ADD COMMENT
    AddComment: async (req, res) => {
        const newComment = new Comment({
            commentId: req.body.commentId,
            newFeedId: req.body.newFeedId,
            content: req.body.content,
            dateCreate: req.body.dateCreate,
        });

        newComment
            .save()
            .then((data) => res.json({
                success: true,
                data: data,
            }))
            .catch((err) => res.status(500).json({
                success: false,
                message: err,
            }));
    },

    // UPDATE COMMENT BY ID
    UpdateCommentById: async (req, res) => {
        Comment.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .then((data) => res.json({
                success: true,
                data: data,
            }))
            .catch((err) => res.status(500).json({
                success: false,
                message: err,
            }));
    },

    // DELETE COMMENT BY ID
    DeleteCommentById: async (req, res) => {
        Comment.findByIdAndDelete(req.params.id)
            .then((data) => res.json({
                success: true,
                data: data,
            }))
            .catch((err) => res.status(500).json({
                success: false,
                message: err,
            }));
    }
}
module.exports = {
    CommentController
}