const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const userSchema = new Schema({
    phone:String,
   
});

module.exports = mongoose.model('User', userSchema);