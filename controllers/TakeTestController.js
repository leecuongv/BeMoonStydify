// - Tạo 1 phiên kiểm tra (kiểm tra lại duration với startTime )
const Test = require("../models/Test");
const mongoose = require("mongoose");
const User = require("../models/User");
const TakeTest = require("../models/TakeTest");
const { STATUS, VIEWPOINT, QUESTIONTYPE, ANSWERTYPE, VIEWANSWER } = require("../utils/enum");
const moment = require("moment/moment");
const TestLog = require("../models/TestLog");
const TakeTestController = {
  GetTest: async (takeTest) => {
    let test = await Test.findById(takeTest.testId)
      .populate({
        path: "questions.question",
        populate: {
          path: "answers",
          select: "id content",
        },
      })
      .select({ slug: 1, name: 1, questions: 1, maxTimes: 1, tracking: 1 });
    let { questions, startTime, maxTimes, ...data } = test._doc;
    let endTime = moment(takeTest.startTime).add(maxTimes, "minutes").toDate();
    questions = questions.map((item) => item.question);
    return { ...data, endTime, questions };
  },

  CheckTest: async (req, res) => {//
    try {
      const username = req.user?.sub;
      const { testId } = req.body;

      const user = await User.findOne({ username });
      if (!user)
        return res.status(400).json({ message: "Không có người dùng" });

      let test = await Test.findById(testId)
        .populate({
          path: "questions.question",
          populate: {
            path: "answers",
            select: "id content",
          },
        })
        .select({
          startTime: 1,
          endTime: 1,
          slug: 1,
          name: 1,
          questions: 1,
          maxTimes: 1,
          tracking: 1,
          attemptsAllowed: 1,
          shuffle: 1
        });
      if (test.shuffle === true) {
        let randomArray = [...test.questions].sort(() => Math.random() - 0.5)
        test.questions = await randomArray
      }
      let { questions, startTime, maxTimes, ...data } = test._doc;
      questions = questions.map((item) => ({ ...item.question._doc, id: item.question._id, index: item.index }));

      if (!test) res.status(200).json({ message: "invalid" });
      const takeTest = await TakeTest.find({ userId: user.id, testId: test.id });
      ///kiểm tra hợp lệ
      if (takeTest.length === 0)
        return res.status(200).json({ message: "checkpin" });


      const toDay = new Date()

      const lastTakeTest = takeTest[takeTest.length - 1];
      const remainTime = moment(lastTakeTest.startTime)
        .add(test.maxTimes, "minutes")
        .diff(new Date(), "minutes");

      if ((new Date(toDay)) < (new Date(test.startTime)) ||
        (new Date(toDay)) > (new Date(test.endTime))) {
        return res.status(400).json({
          message: "Thời gian thực hiện bài thi không hợp lệ!",
        })
      }

      if (test.attemptsAllowed === 0) {
        if (lastTakeTest.status === STATUS.SUBMITTED)
          return res.status(200).json({ message: "checkpin" });
      } else {
        if (takeTest.length === test.attemptsAllowed) {
          if (lastTakeTest.status === STATUS.SUBMITTED)
            return res.status(400).json({ message: "Bài thi đã được nộp, không thể làm lại" }); //take test cuối cùng đã hết thời gian
          if (remainTime < 0)
            return res.status(400).json({ message: "Hết thời gian làm bài thi làm bài thi" }); //take test cuối cùng đã hết thời gian
        } else if (takeTest.length > test.attemptsAllowed)
          return res.status(400).json({ message: "Hết số lần làm bài thi" }); //take test cuối cùng đã hết thời gian
      }
      if (lastTakeTest.status === STATUS.SUBMITTED)
        return res.status(200).json({ message: "checkpin" }); //take test cuối cùng đã hết thời gian
      if (remainTime < 0) return res.status(200).json({ message: "checkpin" }); //take test cuối cùng đã hết thời gian

      let endTime = moment(lastTakeTest.startTime)
        .add(maxTimes, "minutes")
        .toDate();
      return res.status(200).json({
        message: "valid",
        test: {
          ...data,
          questions,
          endTime,
        },
        takeTestId: lastTakeTest.id,
        countOutTab: lastTakeTest.countOutTab,
        countOutFace: lastTakeTest.countOutFace
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Lỗi làm bài thi" });
    }
  },

  CreateTakeTest: async (req, res) => {
    try {
      const username = req.user?.sub;

      const { testId } = req.body;

      const toDay = new Date()
      if (!username)
        return res.status(400).json({ message: "Không có người dùng" });
      const user = await User.findOne({ username });
      if (!user)
        return res.status(400).json({ message: "Không có người dùng" });
      const test = await Test.findById(testId)
        .populate({
          path: "questions.question",
          populate: {
            path: "answers",
            select: "id content",
          },
        })
        .select({
          slug: 1,
          name: 1,
          questions: 1,
          maxTimes: 1,
          tracking: 1,
          pin: 1,
          shuffle: 1,
        });

      if (test.shuffle === true) {
        let randomArray = [...test.questions].sort(() => Math.random() - 0.5)
        test.questions = await randomArray
      }
      let { questions, startTime, maxTimes, ...data } = test._doc;
      let endTime = moment(new Date()).add(maxTimes, "minutes").toDate();
      questions = questions.map((item) => ({ ...item.question._doc, id: item.question._id, index: item.index }));

      if (!test) return res.status(400).json({ message: "Không có bài thi!" });

      const newTakeTest = new TakeTest({
        testId: test.id,
        userId: user.id,
        startTime: new Date(),
        submitTime: new Date()
      });
      let error = newTakeTest.validateSync();
      if (error) {
        console.log(error);
        return res.status(400).json({
          message: "Làm bài thi thất bại!"
        });
      }
      const takeTest = await newTakeTest.save();
      const newTestLog = new TestLog({ takeTestId: takeTest.id });
      await newTestLog.save();
      return res.status(200).json({
        message: "Làm bài thi thành công!",
        takeTestId: takeTest.id,
        test: {
          ...data,
          questions,
          endTime,
        },
        countOutTab: takeTest.countOutTab,
        countOutFace: takeTest.countOutFace
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Lỗi làm bài thi" });
    }
  },

  SubmitAnswerSheet: async (req, res) => {
    try {
      const username = req.user?.sub
      const { answerSheet, takeTestId } = req.body

      const user = await User.findOne({ username })
      if (!user) return res.status(400).json({ message: "Không có người dùng" })

      const takeTest = await TakeTest.findById(takeTestId)
      // viết bổ sung thêm kiểm tra thời gian nộp hợp lệ (trễ không quá 2 phút), kiểm tra người làm bài


      const test = await Test.findById(takeTest.testId).populate({
        path: "questions.question",
        populate: {
          path: 'answers',
          select: 'id type isCorrect content'
        }
      })

      if (!test) return res.status(400).json({ message: "Không có bài thi!" })
      let questions = test.questions.map(element => element.question)//câu hỏi và đáp án từ test

      let points = 0 //điểm đạt được của bài làm
      questions.forEach(question => {
        let pointOfQuestion = 0
        let questionClient = answerSheet.find(e => e.question === question.id.toString())
        console.log(questionClient)
        if (question.type === QUESTIONTYPE.FILLIN) {
          //thay bằng Question result, answer
          if (questionClient)
            if (questionClient.answers.length > 0) {
              let isCorrect = question.answers.some(e => {
                if (e.type === ANSWERTYPE.EQUAL) {
                  return (e.content === questionClient.answers[0])
                }
                return (e.content.includes(questionClient.answers[0]))
              })
              if (isCorrect)
                pointOfQuestion = question.maxPoints
            }
        }
        else {

          let noAnswerCorrect = question.answers.filter(e => e.isCorrect).length //số đáp án đúng
          if (!questionClient) {
            if (noAnswerCorrect === 0)
              pointOfQuestion = question.maxPoints
          }

          else {
            if (noAnswerCorrect === 0) {
              if (questionClient.answers.length === 0)
                pointOfQuestion = question.maxPoints
            }
            else {

              let pointEachAnswer = question.maxPoints / noAnswerCorrect
              question.answers.forEach(answer => {
                if (questionClient.answers.includes(answer.id.toString()))
                  if (answer.isCorrect)
                    pointOfQuestion += pointEachAnswer
                  else
                    pointOfQuestion -= pointEachAnswer
              })
            }
          }
        }
        pointOfQuestion = pointOfQuestion > 0 ? pointOfQuestion : 0
        questionClient.point = pointOfQuestion

        points += pointOfQuestion
      })

      takeTest.points = points
      takeTest.status = STATUS.SUBMITTED
      takeTest.submitTime = new Date()
      // let result = answerSheet.map(item => {
      //   try {
      //     let answers = item.answers.map(e => {
      //       try {
      //         return mongoose.Types.ObjectId(e)
      //       }
      //       catch {
      //         return null
      //       }
      //     })
      //     answers = answers.filter(e => e !== null)
      //     return {
      //       point: item.point,
      //       question: mongoose.Types.ObjectId(item.question),
      //       answers
      //     }
      //   }
      //   catch {
      //     return null
      //   }
      // })
      let result = answerSheet.map(item => {
        try {
          let answers = []
          if (Array.isArray(item.answers)) {
            answers = item.answers
          }

          return {
            point: item.point,
            question: mongoose.Types.ObjectId(item.question),
            answers
          }
        }
        catch {
          return null
        }
      })
      result = result.filter(e => e !== null)
      takeTest.result = result
      if ((points / test.maxPoints) >= (test.toPass / 100)) {
        takeTest.isPass = true
      }
      await takeTest.save()

      return res.status(200).json({
        message: "Nộp bài thi thành công!"
      })

    } catch (error) {
      console.log(error)
      res.status(400).json({ message: "Lỗi làm bài thi" })
    }
  },

  GetResultTakeTest: async (req, res) => {

    try {
      const { id } = req.query;
      const username = req.user?.sub;

      const user = await User.findOne({ username });
      if (!user) return res.status(400).json({ message: "Không có người dùng" });

      const takeTest = await TakeTest.findById(id).populate('testId')
      const takeTests = await TakeTest.find({ testId: takeTest.testId.id, userId: user.id })

      const index = takeTests.findIndex(item => item.id.toString() === id)
      if (!takeTest) return res.status(400).json({ message: "Không có lịch sử làm bài!" })
      if (takeTest.testId.viewPoint === 'no')
        return res.status(200).json({
          name: takeTest.testId.name,
          lanThi: index + 1,
          viewAnswer: takeTest.testId.viewAnswer,
          slug: takeTest.testId.slug,
        })
      return res.status(200).json({
        name: takeTest.testId.name,
        slug: takeTest.testId.slug,
        lanThi: index + 1,
        points: takeTest.points,
        maxPoints: takeTest.testId.maxPoints,
        viewAnswer: takeTest.testId.viewAnswer,

      })
    }
    catch (error) {
      console.log(error);
      res.status(400).json({ message: "Lỗi hiện điểm" });
    }
  },


  GetPreviewTest: async (req, res) => {
    try {
      const { id } = req.query;
      const username = req.user?.sub;
      const user = await User.findOne({ username });
      if (!user) return res.status(400).json({ message: "Không có người dùng!" });

      const takeTest = await TakeTest.findById(id)

      const test = await Test.findById(takeTest.testId)
        .populate({
          path: "questions.question",
          populate: {
            path: "answers",
            select: "id content isCorrect type",
          },
        }).lean()
      let { questions, startTime, maxTimes, _id, ...data } = test;
      questions = questions.map((item) => item.question);

      const result = takeTest.result

      questions = questions.map(item => {
        let { answers, ...questionData } = item
        let resultAnswer = result.find(e => e.question?.toString() === item._id.toString())
        let choose = []
        let point = 0
        if (resultAnswer) {
          choose = resultAnswer.answers
          point = resultAnswer.point
        }
        let toDay = new Date()
        if (test.viewAnswer === 'no' || (test.viewAnswer === 'alldone' && moment().diff(test.endTime, 'minutes') > 0)) {
          answers = answers.map(item => {
            delete item.isCorrect
            return item
          })
        }
        if (test.viewPoint === 'no' || (test.viewPoint === 'alldone' && moment().diff(test.endTime, 'minutes') > 0)) {
          return { ...questionData, answers, choose }
        }
        return { ...questionData, answers, choose, point }
      })

      return res.status(200).json(
        {
          name: test.name,
          startTime: takeTest.startTime,
          submitTime: takeTest.submitTime,
          questions: questions,
          viewPoint: test.viewPoint,
          viewAnswer: test.viewAnswer,
          maxPoints: test.maxPoints,
          points: (test.viewPoint === 'no' ||
            (test.viewPoint === 'alldone' && moment().diff(test.endTime, 'minutes') > 0)) ? undefined : takeTest.points,

        })

    }
    catch (error) {
      console.log(error);
      res.status(400).json({ message: "Lỗi hiện điểm" });
    }

  },

  CreateLogs: async (req, res) => {
    try {
      const { action, takeTestId, countOutFace, countOutTab } = req.body;
      const username = req.user?.sub;

      const user = await User.findOne({ username });
      if (!user) return res.status(400).json({ message: "Không có người dùng" });

      const takeTest = await TakeTest.findById(takeTestId)
      if (!takeTest) return res.status(400).json({ message: "Không có lịch sử làm bài!" })

      let testLog = await TestLog.findOne({ takeTestId: takeTest.id })

      if (!testLog) {
        testLog = new TestLog({ takeTestId: takeTest.id, logs: [] })

      }
      testLog.logs.push({
        time: new Date(),
        action
      })
      await TakeTest.findByIdAndUpdate(mongoose.Types.ObjectId(takeTestId), { countOutFace, countOutTab }, { new: true })
      await testLog.save()
      return res.status(200).json({
        message: 'Tạo thành công'
      })
    }
    catch (error) {
      console.log(error);
      res.status(400).json({ message: "Lỗi tạo lịch sử" });
    }
  },

  GetLogs: async (req, res) => {
    try {
      const { id } = req.query;
      const username = req.user?.sub;

      const user = await User.findOne({ username });
      if (!user) return res.status(400).json({ message: "Không có người dùng" });

      const testLogs = await TestLog.findOne({ takeTestId: mongoose.Types.ObjectId(id) })
      if (!testLogs) return res.status(400).json({ message: "Không có lịch sử làm bài!" })

      return res.status(200).json(testLogs)
    }
    catch (error) {
      console.log(error);
      res.status(400).json({ message: "Lỗi tạo lịch sử" });
    }
  },
  GetAllTakeTest: async (req, res) => {
    try {

      const username = req.user?.sub
      const user = await User.findOne({ username })
      if (!user) {
        return res.status(400).json({ message: "Tài khoản không tồn tại" })
      }

      const listTakeTest = await TakeTest.find({ userId: user.id })

      return res.status(200).json({ listTakeTest })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Không xác định" })
    }
  },
  ViewAccuracyRateOfTestQuestions: async (req, res) => {
    try {
      const username = req.user?.sub
      const { id } = req.query

      if (!username) return res.status(400).json({ message: "Không có người dùng" })
      const user = await User.findOne({ username })

      if (!user) return res.status(400).json({ message: "Không có người dùng" })
      let creator = user.id
      const existTest = await Test.findOne({
        id: mongoose.Types.ObjectId(id),
        creator
      })

      if (!existTest) {
        return res.status(400).json({ message: "Không tồn tại bài thi!" })

      }

      let testResult = await TakeTest.find({ testId: mongoose.Types.ObjectId(existTest.id) }).populate({
        path: "result.question",
        populate: {
          path: "answers",
          select: "id content",
        },
        select: "id content answers",

      })


      let listQuestion = []
      testResult.forEach(item => {
        item.result.forEach(question => {
          listQuestion.push(question)
        })
      })
      let jsonArray = listQuestion
      let test = new Array(jsonArray.length).fill(0);
      let result = new Array();
      for (let i = 0; i < jsonArray.length; i++) {
        let jo = {};
        let tempStringi = jsonArray[i].question;
        let ja = new Array();

        if (test[i] === 0) {
          jo.question = tempStringi;
          ja.push(jsonArray[i]);
          test[i] = 1;
          for (let j = i + 1; j < jsonArray.length; j++) {
            let tempStringj = jsonArray[j].question
            if ((tempStringi.toString().localeCompare(tempStringj.toString())) === 0 && (test[j] === 0)) {
              // jsonArray.get(j).getAsJsonObject().remove(question); 
              ja.push(jsonArray[j]);
              test[j] = 1;
            }
          }

          //jo.questions = ja;
          jo["tongSoHVDaLamCauHoi"] = ja.length;
          jo["soHVDaLamDung"] = ja.filter(element => element.point > 0).length
          jo["soHVDaLamSai"] = ja.filter(element => element.point === 0).length
          //jo["soHVChuaLam"] =
          result.push(jo);
        }
      }

      return res.status(200).json({
        //listQuestion,
        result,
        //testResult
      })

    } catch (error) {
      console.log(error)
      res.status(400).json({ message: "Lỗi xem kết quả bài thi!" })
    }
  },

  ViewTestScoreDistribution: async (req, res) => {
    try {
      const username = req.user?.sub
      const { id } = req.query

      if (!username) return res.status(400).json({ message: "Không có người dùng" })
      const user = await User.findOne({ username })

      if (!user) return res.status(400).json({ message: "Không có người dùng" })
      let creator = user.id
      const test = await Test.findOne({
        id: mongoose.Types.ObjectId(id),
        creator
      })

      if (!test) {
        return res.status(400).json({ message: "Không tồn tại bài thi!" })
      }

      // let testResult = await TakeTest.aggregate([
      //     {
      //         $match: { testId: { $in: [mongoose.Types.ObjectId(id)] } }
      //     },

      // ])

      let testResult = await TakeTest.find({ testId: mongoose.Types.ObjectId(test.id), status: STATUS.SUBMITTED }).select({ testId: 1, userId: 1, points: 1, id: 1 })
      const dataset = [];
      const labels = [];

      const freq = testResult.reduce(function (prev, cur) {
        prev[cur.points] = (prev[cur.points] || 0) + 1;
        return prev;
      }, {})
      for (const key in freq) {
        if (freq.hasOwnProperty(key)) {
          let obj = { points: key, freq: freq[key] }
          labels.push(obj);
        }
      }
      return res.status(200).json({
        //listQuestion,
        //testResult,
        labels,
        maxPoints: test.maxPoints
        //testResult
      })

    } catch (error) {
      console.log(error)
      res.status(400).json({ message: "Lỗi xem kết quả bài thi!" })
    }
  }
};

module.exports = { TakeTestController };
