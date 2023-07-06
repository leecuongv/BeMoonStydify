const mongoose = require("mongoose");
const autoinc = require("mongoose-plugin-autoinc");
const { formatTimeUTC } = require("../utils/Timezone");
const { COLLECTION, STATUS } = require("../utils/enum");

const takeTestSchema = mongoose.Schema({
  testId: {
    type: mongoose.SchemaTypes.ObjectId,
    require: true,
    default: null,
    ref: COLLECTION.TEST,
  },
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    require: true,
    default: null,
    ref: COLLECTION.USER,
  },
  startTime: {
    type: Date,
    default: new Date()// formatTimeUTC,
  },
  submitTime: {
    type: Date,
    default: new Date()// formatTimeUTC,
  },
  points: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: STATUS.NOT_SUBMITTED
  },
  countOutTab: {
    type: Number,
    default: 0

  },
  countOutFace: {
    type: Number,
    default: 0
  },
  isPass: {
    type: Boolean,
    default: false
  },
  result: [
    {
      question: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: COLLECTION.QUESTION
      },
      // answers: [
      //     {
      //         type: mongoose.SchemaTypes.ObjectId,
      //         ref: COLLECTION.ANSWER
      //     }
      // ],
      answers: [
        {
          type: mongoose.SchemaTypes.String,
          default: ''
        }
      ],
      point: {
        type: Number,
        default: 0
      }
    }
  ],

},
  { timestamps: true });


takeTestSchema.method("toJSON", function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

module.exports = mongoose.model(COLLECTION.TAKETEST, takeTestSchema);
