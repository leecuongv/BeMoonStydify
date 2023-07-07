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
});

module.exports = mongoose.model(COLLECTION.COMMENT, CommentSchema);
