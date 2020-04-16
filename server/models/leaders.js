const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leaderSchema = new Schema({
    name: {type:String, required:true},
    image: String,
    designation: String,
    abbr: String,
    description: String,
    featured: false
})

module.exports = mongoose.model("Leader", leaderSchema);