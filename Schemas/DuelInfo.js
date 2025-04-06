const { model, Schema } = require("mongoose");

module.exports = new model(
  "DuelInfo",
  new Schema({
    Guild: String,
    Challenger: String,
    Challenged: String,
    CurrentPlayer: String,
    OtherPlayer: String,
    ChallengerHP: Number,
    ChallengedHP: Number,
    AttackRollHeight: Number,
    ChallengerAbilityCount: Array,
    ChallengedAbilityCount: Array,
    DefenseModifier: Number,
    TimeStopTurns: Number,
  })
);
