const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var favoriteSchema = new Schema(
{
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dishId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish'
  }

});
module.exports = mongoose.model("Favorite", favoriteSchema);
