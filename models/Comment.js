const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { COLLECTION } = require('../utils/enum');

const CommentSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: COLLECTION.USER,
        required: true
    },
    content: {
        type: String
    },
},
    {
        timestamps: true,
        toObject: {
            transform: function (doc, ret) {
                ret.id = ret._id
                //delete ret._id;
            }
        }
    });

module.exports = mongoose.model(COLLECTION.COMMENT, CommentSchema);
