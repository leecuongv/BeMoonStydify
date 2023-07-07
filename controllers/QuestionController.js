/// Tạo câu hỏi 
// - Tạo 1 câu
// - Tạo bằng file
// - Sửa câu hỏi (có đáp án mới thì thêm vào, có gửi kèm id)

const Question = require("../models/Question")
const mongoose = require("mongoose")
const User = require("../models/User")
const Test = require("../models/Test")
const Answer = require("../models/Answer")
const QuestionBank = require("../models/QuestionBank")
const TakeTest = require("../models/TakeTest")
const { STATUS, ANSWERTYPE, QUESTIONTYPE } = require("../utils/enum")

const QuestionController = {
    CreateQuestion: async (req, res) => {
        try {
            let start = new Date()
            const username = req.user?.sub
            const { testId, type, content, maxPoints, answers, image } = req.body
            if (!username) return res.status(400).json({ message: "Không có người dùng!" })
            const user = await User.findOne({ username })
            const test = await Test.findOne({ _id: mongoose.Types.ObjectId(testId), creatorId: user._id })
            if (!test) return res.status(400).json({ message: "Không tồn tại!" })
            if (!user) return res.status(400).json({ message: "Không có người dùng!" })

            const newQuestion = new Question({

                type,
                content,
                maxPoints,
                answers: [],
                image
            })
            let error = newQuestion.validateSync()
            if (error) {
                console.log(error)
                return res.status(400).json({
                    message: "Tạo câu hỏi thất bại!"
                })
            }

            await Promise.all(answers.map(async (element) => {
                const answer = new Answer({
                    content: element.content || "",
                    isCorrect: element.isCorrect || false,
                    type: element.type
                })
                await answer.save()
                newQuestion.answers.push(answer.id)
            }))

            await (await newQuestion.save()).populate('answers')
            test.questions.push({ question: newQuestion.id })
            test.questions = test.questions.map((item, index) => ({ ...item._doc, index: index + 1 }))//cập nhật lại index câu hỏi
            test.maxPoints = Number(test.maxPoints) + Number(newQuestion.maxPoints)
            test.numberofQuestions += 1
            await test.save()
            return res.status(200).json(
                newQuestion
            )

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi tạo câu hỏi!" })
        }
    },

    DeleteQuestion: async (req, res) => {
        try {
            let start = new Date()
            const username = req.user?.sub
            const { testId, questionId } = req.body
            //if (!username) return res.status(400).json({ message: "Không có người dùng!" })
            const user = await User.findOne({ username })
            if (!user) return res.status(400).json({ message: "Không có người dùng!" })
            const test = await Test.findOne({ _id: mongoose.Types.ObjectId(testId), creatorId: user._id })
            if (!test) return res.status(400).json({ message: "Không tồn tại!" })
            if (test.status === STATUS.PUBLIC) return res.status(400).json({ message: "Không thể xóa câu hỏi trong bài thi đã được phát hành!" })
            const question = await Question.findOne({ _id: mongoose.Types.ObjectId(questionId) })
            if (!question) return res.status(400).json({ message: 'Không tồn tại câu hỏi' })

            test.questions = test.questions.filter(item => item.question.toString() !== question.id.toString())

            test.questions = test.questions.map((item, index) => ({ ...item._doc, index }))

            test.maxPoints = Number(test.maxPoints) - Number(question.maxPoints)

            test.numberofQuestions = Number(test.numberofQuestions) - 1

            let listQuestionBank = await QuestionBank.find({
                questions: { $in: [mongoose.Types.ObjectId(questionId)] }
            })

            let listTest = await Test.find({
                '$and': [
                    { 'questions.question': { '$in': [question.id] } },
                    { '_id': { '$ne': test.id } }
                ]
            })
            await test.save()

            if (listTest.length === 0 && listQuestionBank.length === 0) {
                //nếu không thuộc QB và Test khác thì xoá câu hỏi trên db
                await question.deleteOne()
            }

            // if (questionBank) {
            //     questionBank.questions = questionBank.questions.filter(item => item.question.toString() !== questionId)
            // }

            return res.status(200).json({
                message: "Xoá câu hỏi thành công!"
            })

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi xóa câu hỏi!" })
        }
    },

    UpdateQuestion: async (req, res) => {
        try {
            let start = new Date()
            const username = req.user?.sub
            const { testId, questionId, type, content, maxPoints, answers } = req.body
            //if (!username) return res.status(400).json({ message: "Không có người dùng!" })
            const user = await User.findOne({ username })
            if (!user) return res.status(400).json({ message: "Không có người dùng!" })

            const question = await Question.findOne({ _id: mongoose.Types.ObjectId(questionId) })
            if (!question) return res.status(400).json({ message: 'Không tồn tại câu hỏi' })

            let newAnswers = []

            await Promise.all(answers.map(async (element) => {
                if (mongoose.Types.ObjectId.isValid(element.id)) {
                    newAnswers.push(element.id)
                    return Answer.findByIdAndUpdate(element.id, {
                        content: element.content || "",
                        isCorrect: element.isCorrect || false,
                        type: element.type
                    }, { upsert: true })

                }
                else {
                    let newAnswer = new Answer({ content: element.content, isCorrect: element.isCorrect })

                    newAnswers.push(newAnswer.id)
                    return newAnswer.save()
                }
            }))
            let newData = {
                type,
                content,
                maxPoints,
                answers: newAnswers
            }

            let tests = await Test.find({
                "questions.question": { $in: mongoose.Types.ObjectId(questionId) }
            })

            let newTest = tests.map(test => {
                let maxPoints = Number(test.maxPoints) - Number(question.maxPoints) + Number(newData.maxPoints)

                return {
                    updateOne:
                    {
                        "filter": { _id: test.id },
                        "update": {
                            maxPoints: maxPoints
                        },

                    }
                }
            })
            //

            let takeTests = await TakeTest.find({
                "result.question": { $in: mongoose.Types.ObjectId(questionId) }
            })
            let points = 0
            let newTakeTests = takeTests.map(takeTest => {
                let result = takeTest.result
                let cauHoiNguoiDungDaChon = result.find(item => item.question.toString() === question.id.toString())

                let pointOfQuestion = 0
                let noAnswerCorrect = answers.filter(e => e.isCorrect).length //số đáp án đúng
                //thay bằng Question result, answer
                if (!result) {
                    if (noAnswerCorrect === 0)
                        pointOfQuestion = maxPoints
                }
                else {
                    if (newData.type === QUESTIONTYPE.FILLIN) {
                        let isCorrect = answers.some(answer => {
                            if (cauHoiNguoiDungDaChon.answers.length !== 0) {
                                if (answer.type === ANSWERTYPE.EQUAL) {
                                    return cauHoiNguoiDungDaChon.answers[0] === answer.content
                                }
                                else {
                                    return answer.content.includes(cauHoiNguoiDungDaChon.answers[0])
                                }
                            }
                            return false
                        })
                        pointOfQuestion = isCorrect ? maxPoints : 0
                    }
                    else {
                        if (noAnswerCorrect === 0) {
                            if (cauHoiNguoiDungDaChon.answers.length === 0)
                                pointOfQuestion = maxPoints
                        }
                        else {
                            let pointEachAnswer = maxPoints / noAnswerCorrect

                            answers.forEach(answer => {
                                if (cauHoiNguoiDungDaChon.answers.includes(answer.id.toString()))
                                    if (answer.isCorrect) {//
                                        pointOfQuestion += pointEachAnswer
                                    }
                                    else {
                                        pointOfQuestion -= pointEachAnswer
                                    }
                            })
                        }
                    }

                }
                pointOfQuestion = pointOfQuestion > 0 ? pointOfQuestion : 0
                takeTest.points = takeTest.points - cauHoiNguoiDungDaChon.point + pointOfQuestion
                cauHoiNguoiDungDaChon.point = pointOfQuestion
                return {
                    updateOne:
                    {
                        "filter": { _id: takeTest.id },
                        "update": {
                            points: takeTest.points,
                            result: takeTest.result
                        },

                    }
                }
            })
            await TakeTest.bulkWrite(newTakeTests)
            await Test.bulkWrite(newTest)

            let updatedQuestion = await Question.findByIdAndUpdate({ '_id': new mongoose.Types.ObjectId(question.id) }, newData, { new: true }).populate('answers')
            return res.status(200).json(
                updatedQuestion
                //question: exitsQuestion
            )
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi tạo câu hỏi!" })
        }
    }

}

module.exports = { QuestionController }