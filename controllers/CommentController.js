const { default: mongoose } = require('mongoose');
const Comment = require('../models/Comment');
const NewFeed = require('../models/NewFeed');
const User = require("../models/User")

// GET ALL COMMENTS
const CommentController = {
    GetAllComments: async (req, res) => {
        try {
            const username = req.user?.sub

            const user = await User.findOne({ username })
            if (!user) {
                return res.status(400).json({ message: "Tài khoản không tồn tại!" })
            }
            const comment = await Comment.find()
            if (!comment)
                return res.status(400).json({ message: "Không tồn tại bình luận!" })

            return res.status(200).json(comment)

        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "Lỗi bình luận!"
            })
        }
    },

    // GET COMMENT BY ID
    GetCommentById: async (req, res) => {
        try {
            const username = req.user?.sub
            const { id } = req.query
            const user = await User.findOne({ username })
            if (!user) {
                return res.status(400).json({ message: "Tài khoản không tồn tại!" })
            }
            const comment = await Comment.findOne({ _id: mongoose.Types.ObjectId(id), creator: user.id })
            if (!comment)
                return res.status(400).json({ message: "Không tồn tại bình luận!" })

            return res.status(200).json(comment)

        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "Lỗi bình luận!"
            })
        }
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
                creator: user.id
            })
            let error = comment.validateSync()
            if (error)
                return res.status(400).json({ message: "Lỗi tạo bình luận!" })
            comment.save()
            newFeed.comments.push(comment.id)
            await newFeed.save()
            const newComment = await Comment.findById(comment.id).populate("creator")
            console.log(comment)
            let data = {
                creator: newComment.creator.fullname,
                avatar: newComment.creator.avatar,

                createdAt: newComment.createdAt,
                content: newComment.content

            }
            return res.status(200).json(data)

        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "Lỗi tạo bình luận!"
            })
        }

    },

    // UPDATE COMMENT BY ID
    UpdateComment: async (req, res) => {
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

            data = {
                creator: newComment.creator.fullname,
                avatar: newComment.creator.avatar,

                createAt: newComment.createdAt,
                content: newComment.content

            }

            return res.status(200).json(data)

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
            const { id } = req.query

            const user = await User.findOne({ username })
            if (!user) {
                return res.status(400).json({ message: "Tài khoản không tồn tại!" })
            }
            const existComment = await Comment.findOne({ _id: mongoose.Types.ObjectId(id), creator: user.id })
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
            const existComment = await Comment.findOne({ _id: mongoose.Types.ObjectId(commentId) })
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