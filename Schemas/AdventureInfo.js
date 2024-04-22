const { model, Schema } = require("mongoose");

module.exports = new model(
  "AdventureInfo",
  new Schema({
    Guild: String,
    User: String,
    Opponent: Object,
    PlayerHP: Number,
    OpponentHP: Number,
    AttackRollHeight: Number,
    PlayerAbilityCount: Array,
    OpponentAbilityCount: Array,
    DefenseModifier: Number,
    IsConfused: Boolean,
    TimeStopTurns: Number,
  })
);
