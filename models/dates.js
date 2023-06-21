const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const dateSchema = new Schema({
    names: String,
    nam: String,
    email: String,
    date: String,
    year: String,
    ip:String
});

module.exports = mongoose.model('Date', dateSchema);