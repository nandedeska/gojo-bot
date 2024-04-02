const { model, Schema } = require("mongoose");

module.exports = model(
  "PlayerInventory",
  new Schema({
    Guild: String,
    User: String,
    StandArrow: Number,
    StandDisc: Number,
    RocacacaFruit: Number,
    PJCooking: Number,
  })
);
