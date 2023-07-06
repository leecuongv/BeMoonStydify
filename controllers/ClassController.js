const Class = require('../models/Class');
const User = require("../models/User")

// GET ALL CLASSES
const ClassController = {
    GetAllClasses: async (req, res) => {
        try {
            const username = req.user?.sub
            const loginUser = await User.findOne({ username })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })
            let loginUserId = loginUser.id

            let joinedClass = await Class.find({}).populate("teacher").populate(
                {
                    path: 'newFeeds.newFeed',
                    populate: {
                        path: 'comments.comment',
                        populate: "createdUser"
                    }
                }
            )

            /*
            - tên lớp
- mô tả
- mã lớp
- tất cả các newfeed của lớp học
   + avt người tạo
   + tên người tạo
   + thời gian tạo bài đăng
   + nội dung bài đăng
   + tất cả các comment của bài đăng
       * avt người bình luận
       * tên người bình luận
       * nội dung bình luận
       * thời gian bình luận

            */


            return res.status(200).json(
                joinedClass
            )
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "Lấy thông tin khóa học thất bại!"
            })
        }
    },

    GetClassByUserId: async (req, res) => {
        try {
            const username = req.user?.sub
            const loginUser = await User.findOne({ username })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })
            let loginUserId = loginUser.id

            let joinedClass = await Class.find({
                $or:
                    [
                        {
                            students: { $in: loginUserId }
                        },
                        {
                            teacher: loginUserId
                        }
                    ]
            }).populate("teacher")
            joinedClass = joinedClass.map(item => {
                return {
                    className: item.name,
                    createdUser: item.teacher?.fullname,
                    createdUserAVT: item.teacher?.avatar
                }
            })

            return res.status(200).json({
                joinedClass
            })
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "Lấy thông tin khóa học thất bại!"
            })
        }
    },
    JoinClass: async (req, res) => {
        try {
            const username = req.user?.sub
            const loginUser = await User.findOne({ username })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })
            let loginUserId = loginUser.id
            const { classId } = req.body
            let existClass = await Class.findById(classId)
            if (!existClass)
                return res.status(400).json({ message: "Không có lớp học!" })
            if (!existClass.students.find(item => item.toString() === loginUser.id.toString())) {//nếu chưa có sinh viên trên
                existClass.students.push(loginUser.id)
            }
            else {
                return res.status(400).json({ message: "Học viên đã thuộc lớp học." })
            }
            await existClass.save()
            return res.status(200).json({
                message: "Thêm học viên thành công",
            })
        }
        catch (err) {
            console.log(err)
            res.status(500).json({ message: "Lỗi thêm học viên" })
        }

    },
    // GET CLASS BY ID
    GetClassById: async (req, res) => {
        try {

        } catch (error) {

        }
    },

    // GET CLASS BY TEACHER ID
    GetClassByTeacherId: async (req, res) => {
        Class.find({ teacherId: req.params.id })
            .then((data) => res.json({
                success: true,
                data: data,
            }))
            .catch((err) => res.status(500).json({
                success: false,
                message: err,
            }));
    },

    // ADD CLASS
    AddClass: async (req, res) => {
        try {
            const username = req.user?.sub
            const loginUser = await User.findOne({ username })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })
            let loginUserId = loginUser.id
            const {
                classCode,
                description,
                name,
                bannerUrl,
            } = req.body
            const newClass = await new Class({
                classCode,
                description,
                name,
                teacher: loginUserId,
                bannerUrl,
            })
            let err = newClass.validateSync()
            if (err) {
                return res.status(400).json({
                    message: "Tạo lớp học không thành công"
                })
            }
            const class1 = await newClass.save();
            return res.status(200).json(
                class1
            )

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Lỗi tạo lớp học" })
        }
    },

    // UPDATE CLASS BY ID
    UpdateClassById: async (req, res) => {
        Class.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updateAt: new Date().toISOString() },
            { new: true })
            .then((data) => res.json({
                success: true,
                data: data,
            }))
            .catch((err) => res.status(500).json({
                success: false,
                message: err,
            }));
    },

    // DELETE CLASS BY ID
    DeleteClassById: async (req, res) => {
        Class.findByIdAndDelete(req.params.id)
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
    ClassController
}