const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { COLLECTION } = require('../utils/enum');

const NewFeedSchema = new Schema({
    comments: [{
        type: Schema.Types.ObjectId,
        ref: COLLECTION.COMMENT
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
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: COLLECTION.USER,
        required: true,
    },
});

module.exports = mongoose.model(COLLECTION.NEWFEED, NewFeedSchema);
