const { model, Schema } = require("mongoose");

module.exports = new model(
  "PlayerStats",
  new Schema({
    Guild: String,
    User: String,
    DuelWins: Number,
    DuelPlays: Number,
    AdventureWins: Number,
    AdventurePlays: Number,
  })
);
