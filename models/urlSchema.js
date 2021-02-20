const mongoose = require('mongoose');
const shortId = require('shortid');

const url_shortner_schema = new mongoose.Schema({
    original_url: {
        type: String,
        required: true
    },

    short_url: {
        type: String,
        default: shortId.generate
    }
});

module.exports = mongoose.model('shortURLSchema', url_shortner_schema);