const mongoose = require("mongoose");
const autoinc = require("mongoose-plugin-autoinc");
const { COLLECTION } = require("../utils/enum");

const testLogSchema = mongoose.Schema({
    logId: {
        type: Number,
        require: true,
    },
    takeTestId: {
        type: mongoose.SchemaTypes.ObjectId,
        require: true,
        default: null,
        ref: COLLECTION.TAKETEST,
    },

    logs: [
        {
            time: {
                type: Date,
                default: new Date()//formatTimeUTC,
            },
            action: {
                type: String,
                default: ''
            }
        }
    ],
},
    {
        timestamps: true,
        toObject: {
            transform: function (doc, ret) {
                ret.id = ret._id

            }
        }
    }
);


testLogSchema.method("toJSON", function () {
    const { __v, ...object } = this.toObject();
    const { _id: id, ...result } = object;
    return { ...result, id };
});

module.exports = mongoose.model(COLLECTION.TESTLOG, testLogSchema);
