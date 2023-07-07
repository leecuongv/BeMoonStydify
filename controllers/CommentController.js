const { default: mongoose } = require('mongoose');
const Comment = require('../models/Comment');
const NewFeed = require('../models/NewFeed');
const User = require("../models/User")

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
        try {
            const username = req.user?.sub
            const { content, newFeedId } = req.body

            const user = await User.findOne({ username })
            if (!user) {
                return res.status(400).json({ message: "Tài khoản không tồn tại!" })
            }
            const newFeed = await NewFeed.findById(newFeedId)
            if (!newFeed)
                return res.status(400).json({ message: "Bài viết không tồn tại!" })
            const comment = await new Comment({
                content,
                creator
            })
            let error = comment.validateSync()
            if (error)
                return res.status(400).json({ message: "Lỗi tạo bình luận!" })
            newFeed.comments.push(comment.id)
            await newFeed.save()
            let newComment = await Comment.findById(comment.id).populate("creator")
            newComment = newComment.modifiedPaths(item => {
                return {
                    creator: item.creator.fullname,
                    creatorAVT: item.creator.avatar,

                    createAt: item.createdAt,
                    content: item.content

                }
            })
            return res.status(200).json(newComment)

        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "Lỗi tạo bình luận!"
            })
        }

    },

    // UPDATE COMMENT BY ID
    UpdateCommentById: async (req, res) => {
        try {
            const username = req.user?.sub
            const { content, newFeedId, commentId } = req.body

            const user = await User.findOne({ username })
            if (!user) {
                return res.status(400).json({ message: "Tài khoản không tồn tại!" })
            }
            const newFeed = await NewFeed.findById(newFeedId)
            if (!newFeed)
                return res.status(400).json({ message: "Bài viết không tồn tại!" })
            const existComment = await Comment.findById(commentId)
            if (!existComment)
                return res.status(400).json({ message: "Bình luận không tồn tại!" })


            let newComment = await Comment.findByIdAndUpdate(existComment.id, { content }, { new: true }).populate("creator")
            newComment = newComment.modifiedPaths(item => {
                return {
                    creator: item.creator.fullname,
                    creatorAVT: item.creator.avatar,

                    createAt: item.createdAt,
                    content: item.content

                }
            })
            return res.status(200).json(newComment)

        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "Lỗi sửa bình luận!"
            })
        }
    },

    // DELETE COMMENT BY ID
    DeleteCommentById: async (req, res) => {
        try {

            const username = req.user?.sub
            const { commentId } = req.body

            const user = await User.findOne({ username })
            if (!user) {
                return res.status(400).json({ message: "Tài khoản không tồn tại!" })
            }
            const existComment = Comment.findOne({ _id: mongoose.Types.ObjectId(commentId), creator: user.id })
            if (!existComment)
                return res.status(400).json({ message: "Bình luận không tồn tại!" })
            const newFeed = await NewFeed.findOne({ comments: { $in: [existComment.id] } })
            if (!newFeed)
                return res.status(400).json({ message: "Bài viết không tồn tại!" })
            newFeed.comments = newFeed.comments.filter(item => item.toString() !== existComment.id.toString())
            await newFeed.save()
            await Comment.findOneAndDelete({ _id: mongoose.Types.ObjectId(commentId), creator: user.id })
            return res.status(200).json({ message: "Xoá bình luận thành công" })
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "Lỗi xoá bình luận!"
            })
        }
    },
    TeacherDeleteCommentById: async (req, res) => {
        try {
            const username = req.user?.sub
            const { commentId } = req.body
            const user = await User.findOne({ username })
            if (!user) {
                return res.status(400).json({ message: "Tài khoản không tồn tại!" })
            }
            const existComment = Comment.findOne({ _id: mongoose.Types.ObjectId(commentId) })
            if (!existComment)
                return res.status(400).json({ message: "Bình luận không tồn tại!" })
            const newFeed = await NewFeed.findOne({ comments: { $in: [existComment.id] } })
            if (!newFeed)
                return res.status(400).json({ message: "Bài viết không tồn tại!" })
            newFeed.comments = newFeed.comments.filter(item => item.toString() !== existComment.id.toString())
            const existClass = await Class.findOne({ newFeeds: { $in: [newFeed.id] }, teacher: user.id })
            if (!existClass)
                return res.status(400).json({ message: "Không tìm thấy lớp học" })
            await newFeed.save()
            await Comment.findOneAndDelete({ _id: mongoose.Types.ObjectId(commentId) })
            return res.status(200).json({ message: "Xoá bình luận thành công" })
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "Lỗi xoá bình luận!"
            })
        }
    }
}
module.exports = {
    CommentController
}