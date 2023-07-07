const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { COLLECTION } = require('../utils/enum');

const NewFeedSchema = new Schema({
    comments: [{
        type: Schema.Types.ObjectId,
        ref: COLLECTION.COMMENT,
        default: []
    }],
    content: {
        type: String
    },
    attachmentLink: {
        type: String
    },
    newFeedUrl: {
        type: String,
        default: ''
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: COLLECTION.USER,
        required: true,
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

module.exports = mongoose.model(COLLECTION.NEWFEED, NewFeedSchema);
