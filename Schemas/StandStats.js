const { model, Schema } = require("mongoose");

module.exports = model(
  "StandStats",
  new Schema({
    Guild: String,
    User: String,
    Name: String,
    Healthpoints: Number,
    Attack: Number,
    Defense: Number,
    Speed: Number,
    Ability: Object,
  })
);
