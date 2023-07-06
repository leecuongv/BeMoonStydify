const Test = require("../models/Test")
const mongoose = require("mongoose");
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
            const { name, description, pin, numberofQuestions, viewPoint, viewAnswer,
                attemptsAllowed, maxPoints, typeofPoint, maxTimes, tracking, shuffle, status, startTime, endTime } = req.body

            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })

            if (!user) return res.status(400).json({ message: "Không có người dùng" })




            if (startTime === null || endTime === null
                || new Date(startTime).toLocaleString() === "Invalid Date"
                || new Date(endTime).toLocaleString() === "Invalid Date") {
                return res.status(400).json({ message: "Thời gian của bài thi không hợp lệ" })

            }



            const newTest = await new Test({

                name,
                description,
                pin,
                creatorId: user.id,
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



            return res.status(200).json({
                message: "Tạo bài thi mới thành công",
                slug: test._doc.slug
            })

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi tạo bài thi" })
        }
    },

    GetTestBySlugTeacher: async (req, res) => {
        try {
            const username = req.user?.sub
            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })
            if (!user) return res.status(400).json({ message: "Không có người dùng" })
            const { slug } = req.query

            const test = await Test.findOne({ slug, creatorId: user.id })
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
    GetTestBySlugByStudent: async (req, res) => {
        try {
            const username = req.user?.sub
            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })
            if (!user) return res.status(400).json({ message: "Không có người dùng" })
            const { slug } = req.query

            const test = await Test.findOne({ slug })
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
            const { id, name, description, pin, numberofQuestions, viewPoint, viewAnswer,
                attemptsAllowed, maxPoints, typeofPoint, maxTimes, tracking, shuffle, status, startTime, endTime } = req.body

            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })

            if (!user) return res.status(400).json({ message: "Không có người dùng" })


            if (startTime === null || endTime === null
                || new Date(startTime).toLocaleString() === "Invalid Date"
                || new Date(endTime).toLocaleString() === "Invalid Date") {
                return res.status(400).json({ message: "Thời gian của bài thi không hợp lệ" })

            }


            let data = {
                name,
                description,
                pin,
                creatorId: user.id,
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

            exitTest = await Test.findByIdAndUpdate(id, data, { new: true })
            return res.status(200).json({
                message: "Tạo bài thi mới thành công",
                slug: exitTest._doc.slug
            })

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi tạo bài thi" })
        }
    },
    CreateQuestionWithQuestionBank: async (req, res) => {
        try {
            const { testId, questionBankId, numberofQuestions, random } = req.body;
            const username = req.user?.sub;

            if (!username)
                return res.status(400).json({ message: "Không tồn tại người dùng!" });
            const user = await User.findOne({ username });

            if (!user)
                return res.status(400).json({ message: "Không tồn tại người dùng!" });

            const test = await Test.findOne({ _id: mongoose.Types.ObjectId(testId), creatorId: user._id })
            if (!test)
                return res.status(400).json({ message: "Không tồn tại bài thi!" })

            const questionBank = await QuestionBank.findOne({ _id: mongoose.Types.ObjectId(questionBankId), creatorId: user.id })
            if (!questionBank)
                return res.status(400).json({ message: "Không tồn tại ngân hàng câu hỏi!" })


            return res.status(200).json({
                message: "Lấy danh câu hỏi thành công!",
                questions: questions
            })
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ message: "Lỗi lấy danh sách câu hỏi" });
        }

    },

    AddQuestionWithQuestionBank: async (req, res) => {
        try {
            //Lấy cái parameter
            const username = req.user?.sub
            const { testId, questionBankSlug, questionIds, numberofNeedQuestions, random } = req.body

            const user = await User.findOne({ username })
            if (!user) {
                return res.status(400).json({ message: "Tài khoản không tồn tại" })
            }

            const test = await Test.findOne({ _id: new mongoose.Types.ObjectId(testId), creatorId: user.id })
            if (!test)
                return res.status(400).json({ message: "Bài kiểm tra không tồn tại!" })

            let questionBank = await QuestionBank.findOne({ slug: questionBankSlug, creatorId: user.id })
                .populate({
                    path: 'questions',
                    populate: {
                        path: 'answers'
                    }
                })
            if (!questionBank)
                return res.status(400).json({
                    message: "Không tìm thấy ngân hàng câu hỏi!",
                })
            if (questionBank.questions.length === 0) {
                return res.status(400).json({
                    message: "Ngân hàng câu hỏi trống!",
                })
            }
            let soCauHoiCanLay = 0
            let questionIdsTaken = []
            if (random === true) {
                if (questionBank.questions.length <= numberofNeedQuestions)
                    return res.status(400).json({
                        message: "Số lượng câu hỏi vượt quá số lượng câu hỏi cần lấy phải nhỏ hơn số lượng câu hỏi trong ngân hàng câu hỏi!",
                    })
                let noneExistQuestion = []
                questionBank.questions.forEach(questionInQB => {
                    if (!test.questions.find(item => item.question.toString() === questionInQB.id.toString())) {
                        noneExistQuestion.push(questionInQB.id)
                    }
                });

                if (noneExistQuestion.length === 0) {
                    return res.status(400).json({ message: "Tất cả các câu hỏi đã tồn tại trong hệ thống" })
                }
                soCauHoiCanLay = noneExistQuestion.length <= numberofNeedQuestions ? noneExistQuestion.length : numberofNeedQuestions;

                noneExistQuestion = await Question.find({ _id: { $in: noneExistQuestion } })

                noneExistQuestion = noneExistQuestion.sort(() => Math.random() - 0.5);
                for (let i = 0; i < soCauHoiCanLay; i++) {
                    let newQuestion = noneExistQuestion.pop()
                    questionIdsTaken.push(newQuestion)
                    test.questions.push({ question: newQuestion.id })
                    test.maxPoints += Number(newQuestion.maxPoints) || 0
                    test.numberofQuestions += 1
                }
            }

            else {
                let noneExistQuestion = []
                questionIds.forEach(questionInBody => {
                    if (!test.questions.find(item => item.question.toString() === questionInBody.toString())) {
                        if (mongoose.Types.ObjectId.isValid(questionInBody))
                            noneExistQuestion.push(mongoose.Types.ObjectId(questionInBody))
                    }
                })
                if (noneExistQuestion.length === 0) {
                    return res.status(400).json({ message: "Tất cả các câu hỏi trong danh sách đã tồn tại trong hệ thống" })
                }

                noneExistQuestion = await Question.find({ _id: { $in: noneExistQuestion } })

                for (let i = 0; i < noneExistQuestion.length; i++) {
                    let newQuestion = noneExistQuestion.pop()
                    questionIdsTaken.push(newQuestion)
                    test.questions.push({ question: newQuestion.id })
                    test.maxPoints += Number(newQuestion.maxPoints) || 0
                    test.numberofQuestions += 1
                }
            }
            test.questions = test.questions.map((item, index) => ({ ...item._doc, index: index + 1 }))//cập nhật lại index câu hỏi
            await test.save()
            return res.status(200).json({
                message: "Lấy danh sách câu hỏi thành công",
                questions: questionIdsTaken,
                soCauHoiCanLay
            })

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi tạo!" })
        }
    },


    PublicTest: async (req, res) => {
        try {
            const username = req.user?.sub
            const { id } = req.body

            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })

            if (!user) return res.status(400).json({ message: "Không có người dùng" })
            let exitsTest = await Test.findById(id)

            const status = "public"
            exitsTest = await Test.findByIdAndUpdate(id, {
                status
            }, { new: true })
            return res.status(200).json({
                message: "Xuất bản bài thi thành công",

                slug: exitsTest._doc.slug
            })

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi xuất bản bài thi" })
        }
    },
    CloseTest: async (req, res) => {
        try {
            const username = req.user?.sub
            const { id } = req.body

            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })

            if (!user) return res.status(400).json({ message: "Không có người dùng" })
            let exitsTest = await Test.findById(id)

            exitsTest = await Test.findByIdAndUpdate(id, {
                status: STATUS.CLOSE
            }, { new: true })
            return res.status(200).json({
                message: "Đóng bài thi thành công",

                slug: exitsTest._doc.slug
            })

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi đóng bài thi" })
        }
    },

    DeleteTest: async (req, res) => {
        try {
            const username = req.user?.sub
            const { id } = req.body

            if (!username) return res.status(400).json({ message: "Không có người dùng" })
            const user = await User.findOne({ username })

            if (!user) return res.status(400).json({ message: "Không có người dùng" })
            let exitsTest = await Test.findById(id)

            exitsTest = await Test.deleteOne(id)
            await TakeTest.deleteMany({ testId: id })
            return res.status(200).json({
                message: "Xóa bài thi thành công",

                slug: exitsTest._doc.slug
            })

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi xuất bản bài thi" })
        }
    },

};

module.exports = { TestController }
