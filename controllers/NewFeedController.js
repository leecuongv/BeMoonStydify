const { default: mongoose } = require('mongoose');
const NewFeed = require('../models/NewFeed');

// GET ALL NEW FEEDS
const NewFeedController = {
    GetAllNewFeeds: async (req, res) => {
        try {
            const username = req.user?.sub
            const loginUser = await User.findOne({ username })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })
            const { newFeedId } = req.query

            const newNewFeed = await NewFeed.find()
            return res.status(200).json({
                newNewFeed
            })
        } catch (error) {
            return res.status(400).json({ message: "Lỗi lấy thông tin bài đăng!" })
        }
    },

    // GET NEW FEED BY ID
    GetNewFeedById: async (req, res) => {
        try {
            const username = req.user?.sub
            const loginUser = await User.findOne({ username })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })
            const { newFeedId } = req.query

            const newNewFeed = await NewFeed.findById(newFeedId)
            return res.status(200).json({
                newNewFeed
            })
        } catch (error) {
            return res.status(400).json({ message: "Lỗi lấy thông tin bài đăng!" })
        }
    },

    // ADD NEW FEED
    AddNewFeed: async (req, res) => {
        try {
            const username = req.user?.sub
            const loginUser = await User.findOne({ username })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })
            const {
                content,
                attachmentLink,
                newFeedUrl } = req.body

            const newNewFeed = await new NewFeed({
                content,
                attachmentLink,
                newFeedUrl,
                creator: loginUser.id
            });
            let error = newNewFeed.validateSync();
            if (error) {
                return res.status(400).json({
                    message: error.message
                });
            }
            await newNewFeed.save()
            return res.status(200).json({
                newNewFeed
            })
        } catch (error) {
            return res.status(400).json({ message: "Lỗi tạo bài đăng!" })
        }

    },

    // UPDATE NEW FEED BY ID
    UpdateNewFeed: async (req, res) => {
        try {
            const username = req.user?.sub
            const loginUser = await User.findOne({ username })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })
            const {
                content,
                attachmentLink,
                newFeedUrl,
                newFeedId
            } = req.body

            const data = {
                content,
                attachmentLink,
                newFeedUrl,
                newFeedId
            }
            const existNewFeed = await NewFeed.findOne({ _id: mongoose.Types.ObjectId(newFeedId), creator: loginUser.id })
            if (!existNewFeed)
                return res.status(400).json({ message: "Không tìm thấy bài đăng!" })
            const updateNewFeed = await NewFeed.findByIdAndUpdate(newFeedId, data, { new: true })
            return res.status(200).json({
                updateNewFeed
            })
        } catch (error) {
            return res.status(400).json({ message: "Lỗi tạo bài đăng!" })
        }
    },

    // DELETE NEW FEED BY ID
    DeleteNewFeedById: async (req, res) => {
        try {
            const username = req.user?.sub
            const { newFeedId } = req.body
            const teacher = await User.findOne({ username })

            if (!teacher) {
                return res.status(400).json({ message: "Tài khoản không tồn tại" })
            }

            let newFeed = await NewFeed.findOne({ _id: new mongoose.Types.ObjectId(newFeedId), creator: teacher.id })
            if (!newFeed)
                return res.status(400).json({
                    message: "Không tìm thấy khoá học",
                })

            if (course.newFeeds.find(item => item.toString() === newFeed.id.toString())) {//nếu chưa có sinh viên trên
                course.newFeeds = course.newFeeds.filter(item => item.toString() !== newFeed.id.toString())
            }
            else {
                return res.status(400).json({ message: "Bài đăng không thuộc lớp học." })
            }
            await course.save()
            await NewFeed.findByIdAndDelete(newFeedId)
            return res.status(200).json({
                message: "Xoá bài đăng thành công",
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Lỗi thêm bài đăng" })
        }
    },
    RemoveNewFeedByTeacher: async (req, res) => {
        try {
            const username = req.user?.sub
            const { newFeedId } = req.body
            const teacher = await User.findOne({ username })

            if (!teacher) {
                return res.status(400).json({ message: "Tài khoản không tồn tại" })
            }

            let newFeed = await NewFeed.findOne({ _id: new mongoose.Types.ObjectId(newFeedId) })
            if (!newFeed)
                return res.status(400).json({
                    message: "Không tìm thấy bài đăng",
                })

            let course = await Class.findOne({ newFeeds: { $in: [new mongoose.Types.ObjectId(newFeedId)] } })
            if (!course)
                return res.status(400).json({ message: "Không tìm thấy lớp học" })

            if (course.newFeeds.find(item => item.toString() === newFeed.id.toString())) {//nếu chưa có sinh viên trên
                course.newFeeds = course.newFeeds.filter(item => item.toString() !== newFeed.id.toString())
            }
            else {
                return res.status(400).json({ message: "Bài đăng không thuộc lớp học." })
            }
            await course.save()
            await NewFeed.findByIdAndDelete(newFeedId)
            return res.status(200).json({
                message: "Xoá bài đăng thành công",
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Lỗi thêm bài đăng" })
        }

    },
    RemoveCommentByTeacher: async (req, res) => {
        try {
            const username = req.user?.sub
            const { commentId } = req.body
            const teacher = await User.findOne({ username })

            if (!teacher) {
                return res.status(400).json({ message: "Tài khoản không tồn tại" })
            }

            let comment = await Comment.findOne({ _id: new mongoose.Types.ObjectId(commentId) })
            if (!comment)
                return res.status(400).json({
                    message: "Không tìm thấy bài đăng",
                })

            let newFeed = await NewFeed.findOne({ comments: { $in: [new mongoose.Types.ObjectId(commentId)] } })
            if (!newFeed)
                return res.status(400).json({ message: "Không tìm thấy lớp học" })

            if (newFeed.comments.find(item => item.toString() === comment.id.toString())) {//nếu chưa có sinh viên trên
                newFeed.comments = newFeed.comments.filter(item => item.toString() !== comment.id.toString())
            }
            else {
                return res.status(400).json({ message: "Bài đăng không thuộc lớp học." })
            }
            await newFeed.save()
            await Comment.findByIdAndDelete(commentId)
            return res.status(200).json({
                message: "Xoá bình luận thành công",
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Lỗi xoá bình luận" })
        }
    }

}
module.exports = {
    NewFeedController
}