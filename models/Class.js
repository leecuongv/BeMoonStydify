const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { COLLECTION, STATUS } = require('../utils/enum')

const ClassSchema = new Schema({
    classCode: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    newFeeds: [{
        type: Schema.Types.ObjectId,
        ref: COLLECTION.NEWFEED
    }],
    name: {
        type: String,
        required: true
    },
    tests: [{
        type: Schema.Types.ObjectId,
        ref: COLLECTION.TEST,
        default: []
    }],
    teacher: {
        type: Schema.Types.ObjectId,
        ref: COLLECTION.USER,
        required: true
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: COLLECTION.USER
    }],
    bannerUrl: {
        type: String
    },
    status: {
        type: String,
        default: STATUS.ACTIVE
    }
});

module.exports = mongoose.model(COLLECTION.CLASS, ClassSchema);

