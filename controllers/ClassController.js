const { default: mongoose } = require('mongoose');
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
                        populate: "creator"
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
    LeaveClass: async (req, res) => {
        try {
            const username = req.user?.sub
            const { classId } = req.body

            const user = await User.findOne({ username })
            if (!user) {
                return res.status(400).json({ message: "Tài khoản không tồn tại!" })
            }
            const course = await Class.findById(classId)
            if (!course)
                return res.status(400).json({ message: "Không tồn tại lớp học!" })

            course.students = course.students.filter(item => item.toString() !== user.id.toString())

            await course.save()
            return res.status(200).json({
                message: "Rời khóa học thành công!",
            })
        }
        catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi rời khoá học!" })
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
                classId
            } = req.body

            const existClass = await Class.findOne({ _id: mongoose.Types.ObjectId(classId), teacher: loginUser.id })
            if (!existClass)
                return res.status(400).json({ message: "Không tìm thấy lớp học!" })
            const data = {
                classCode,
                description,
                name,
                bannerUrl,
            }

            let updatedClass = await Class.findByIdAndUpdate(existClass.id, data, { new: true })


            return res.status(200).json(
                updatedClass
            )

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Lỗi tạo lớp học" })
        }
    },

    // DELETE CLASS BY ID
    DeleteClassById: async (req, res) => {
        try {
            const username = req.user?.sub
            const loginUser = await User.findOne({ username })
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })
            let loginUserId = loginUser.id
            const {
                classId
            } = req.body

            const existClass = await Class.findOne({ _id: mongoose.Types.ObjectId(classId), teacher: loginUser.id })
            if (!existClass)
                return res.status(400).json({ message: "Không tìm thấy lớp học!" })


            let updatedClass = await Class.findByIdAndDelete(existClass.id)


            return res.status(200).json(
                updatedClass
            )

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Lỗi tạo lớp học" })
        }
    },
    GetAllMember: async (req, res) => {
        try {
            const username = req.user?.sub
            const loginUser = await User.findOne({ username })
            const { classId } = req.body
            if (!loginUser)
                return res.status(400).json({ message: "Không có người dùng!" })
            let loginUserId = loginUser.id

            let joinedClass = await Class.findById(classId)
                .populate("teacher")
                .populate('students')

            let teacher = {
                fullname: joinedClass.teacher.fullname,
                avatar: joinedClass.teacher.avatar
            }
            let students = joinedClass.students

            students = students.map(item => {
                return {
                    fullname: item.fullname,
                    avatar: item.avatar
                }
            })
            return res.status(200).json({
                teacher, students
            })
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "Lấy thông tin khóa học thất bại!"
            })
        }
    },
    RemoveStudent: async (req, res) => {
        try {
            const username = req.user?.sub
            const { studentId, classId } = req.body
            const teacher = await User.findOne({ username })
            const student = await User.findById(studentId)

            if (!teacher || !student) {
                return res.status(400).json({ message: "Tài khoản không tồn tại" })
            }

            let course = await Class.findOne({ _id: new mongoose.Types.ObjectId(classId), teacher: teacher.id })
            if (!course)
                return res.status(400).json({
                    message: "Không tìm thấy khoá học",
                })
            if (course.students.find(item => item.toString() === student.id.toString())) {//nếu chưa có sinh viên trên
                course.students = course.students.filter(item => item.toString() !== student.id.toString())
            }
            else {
                return res.status(400).json({ message: "Học viên không thuộc lớp học." })
            }
            await course.save()
            return res.status(200).json({
                message: "Xoá học viên thành công",
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Lỗi thêm học viên" })
        }
    },
}
module.exports = {
    ClassController
}