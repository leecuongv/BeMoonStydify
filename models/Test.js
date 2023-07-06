const mongoose = require("mongoose");
const autoinc = require("mongoose-plugin-autoinc");
const { COLLECTION, VIEWPOINT, TYPEOFPOINT, VIEWANSWER, STATUS } = require("../utils/enum");

const testSchema = mongoose.Schema(
  {
    slug: {
      type: Number,
      require: true,
    },
    name: {
      type: String,
      require: true,
      default: "Đề thi",
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    description: {
      type: String,
      require: true,
      default: '',
    },
    pin: {
      type: String,
      require: true,
      default: '',
    },
    questions: [{
      index: {
        type: Number,
        require: true,
        default: 0
      },
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: COLLECTION.QUESTION,
        default: null,
      }
    }],
    startTime: {
      type: Date,
      default: new Date()//formatTimeUTC,
    },
    endTime: {
      type: Date,
      default: new Date()//formatTimeUTC,
    },
    numberofQuestions: {
      type: Number,
      require: true,
      default: 0,
    },
    viewPoint: {
      type: String,
      require: true,
      default: VIEWPOINT.NO,
    },
    viewAnswer: {
      type: String,
      require: true,
      default: VIEWANSWER.NO,
    },
    attemptsAllowed: {
      type: Number,
      default: 0,
    },
    maxPoints: {
      type: Number,
      default: 0,
    },
    typeofPoint: {
      type: String,
      default: TYPEOFPOINT.MAX,
    },
    maxTimes: {
      type: Number,
      require: true,
      default: 1
    },
    tracking: {
      type: Boolean,
      default: true
    },
    shuffle: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: STATUS.PUBLIC,
    },

    toPass: {
      type: Number,
      default: 50
    }
  },
  {
    timestamps: true,
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id
        delete ret._id;
      }
    }
  },

);

testSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  return object;
});
testSchema.plugin(
  autoinc.autoIncrement,
  {
    model: COLLECTION.TEST,
    field: "slug"
  }
);
const Test = mongoose.model(COLLECTION.TEST, testSchema);
module.exports = Test
