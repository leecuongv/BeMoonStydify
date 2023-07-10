const Test = require("../models/Test")
const mongoose = require("mongoose");
const Class = require("../models/Class")
const User = require("../models/User")
const QuestionBank = require("../models/QuestionBank");
const Question = require("../models/Question")
const { STATUS } = require("../utils/enum");
const TakeTest = require("../models/TakeTest");
const lodash = require('lodash');
const { CompareDate, IsClose, IsOpen } = require("./handler/DateTimeHandler")

const TestController = {
    CreateTest: async (req, res) => {
        try {
            const username = req.user?.sub
            const { name, description, pin, classId, numberofQuestions, viewPoint, viewAnswer,
                attemptsAllowed, maxPoints, typeofPoint, maxTimes, tracking, shuffle, status, startTime, endTime } = req.body

            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })

            if (!user) return res.status(400).json({ message: "Không có người dùng" })

            const course = await Class.findOne({ _id: mongoose.Types.ObjectId(classId), teacher: user.id })
            if (!course) return res.status(400).json({ message: "Thông tin không hợp lệ(không tìm thấy thông tin khóa học hoặc người tạo khóa học" })



            if (startTime === null || endTime === null
                || new Date(startTime).toLocaleString() === "Invalid Date"
                || new Date(endTime).toLocaleString() === "Invalid Date") {
                return res.status(400).json({ message: "Thời gian của bài thi không hợp lệ" })

            }

            const newTest = await new Test({

                name,
                description,
                pin,
                creator: user.id,
                numberofQuestions: 0,
                viewPoint,
                viewAnswer,
                attemptsAllowed,
                maxPoints: 0,
                typeofPoint,
                maxTimes,
                tracking,
                shuffle,
                status: STATUS.PRIVATE,
                startTime: new Date(startTime),
                endTime: new Date(endTime)
            })
            let error = newTest.validateSync()
            if (error) {
                console.log(error)
                return res.status(400).json({
                    message: "Tạo bài thi thất bại!"
                })
            }
            const test = await newTest.save();

            course.tests.push(test.id);
            await course.save()

            return res.status(200).json(
                test
            )

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi tạo bài thi" })
        }
    },

    GetTestByIdFromTeacher: async (req, res) => {
        try {
            const username = req.user?.sub
            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })
            if (!user) return res.status(400).json({ message: "Không có người dùng" })
            const { id } = req.query

            const test = await Test.findOne({ _id: mongoose.Types.ObjectId(id), teacher: user.id })
                .populate({
                    path: 'questions.question',
                    populate: {
                        path: 'answers'
                    }
                })
            if (test) {
                return res.status(200).json(test._doc)
            }

            return res.status(400).json({
                message: "Không tìm thấy bài thi",
            })

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi tạo bài thi" })
        }
    },
    GetTestByIdFromStudent: async (req, res) => {
        try {
            const username = req.user?.sub
            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })
            if (!user) return res.status(400).json({ message: "Không có người dùng" })
            const { id } = req.query

            const test = await Test.findById(id)
                .populate({
                    path: 'questions.question',
                    populate: {
                        path: 'answers'
                    }
                })
            if (!test) {
                return res.status(400).json({
                    message: "Không tìm thấy bài thi",
                })
            }
            if (test.shuffle === true) {


                let randomArray = [...test.questions].sort(() => Math.random() - 0.5)
                test.questions = await randomArray
            }
            return res.status(200).json(test)

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi tạo bài thi" })
        }
    },
    UpdateTest: async (req, res) => {
        try {
            const username = req.user?.sub
            const { testId, name, description, pin, classId, numberofQuestions, viewPoint, viewAnswer,
                attemptsAllowed, maxPoints, typeofPoint, maxTimes, tracking, shuffle, status, startTime, endTime } = req.body

            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })

            if (!user) return res.status(400).json({ message: "Không có người dùng" })

            const test = await Test.findOne({ _id: mongoose.Types.ObjectId(testId), teacher: user.id })

            if (!test) return res.status(400).json({ message: "Thông tin không hợp lệ(không tìm thấy thông tin bài thi hoặc người tạo bài thi" })

            const course = await Class.findOne({ _id: mongoose.Types.ObjectId(classId), teacher: user.id })
            if (!course) return res.status(400).json({ message: "Thông tin không hợp lệ(không tìm thấy thông tin khóa học hoặc người tạo khóa học" })

            if (startTime === null || endTime === null
                || new Date(startTime).toLocaleString() === "Invalid Date"
                || new Date(endTime).toLocaleString() === "Invalid Date") {
                return res.status(400).json({ message: "Thời gian của bài thi không hợp lệ" })

            }

            let data = {
                name,
                description,
                pin,
                numberofQuestions,
                viewPoint,
                viewAnswer,
                attemptsAllowed,
                maxPoints,
                typeofPoint,
                maxTimes,
                tracking,
                shuffle,
                status,
                startTime: new Date(startTime),
                endTime: new Date(endTime)
            }
            //const test = await newTest.save();

            //course.tests.push(test.id);
            //await course.save()

            let exitTest = await Test.findByIdAndUpdate(testId, data, { new: true })
            return res.status(200).json(exitTest)

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi tạo bài thi" })
        }
    },

    DeleteTest: async (req, res) => {
        try {
            const username = req.user?.sub
            const { id } = req.query

            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })

            if (!user) return res.status(400).json({ message: "Không có người dùng" })
            let exitsTest = await Test.findById(id)

            await Test.findByIdAndDelete(id)
            await TakeTest.deleteMany({ testId: id })
            return res.status(200).json({ message: "Xóa bài thi thành công" })

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi xuất bản bài thi" })
        }
    },
    //GET ALL TEST
    GetAllTests: async (req, res) => {
        try {
            const username = req.user?.sub
            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })
            if (!user) return res.status(400).json({ message: "Không có người dùng" })

            let tests = await Test.find({ teacher: user.id })
                .populate({
                    path: 'questions.question',
                    populate: {
                        path: 'answers'
                    }
                })
            return res.status(200).json(tests)

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi tạo bài thi" })
        }
    }

};

module.exports = { TestController }
