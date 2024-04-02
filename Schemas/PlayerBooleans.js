const { model, Schema } = require("mongoose");

module.exports = new model(
  "PlayerBooleans",
  new Schema({
    Guild: String,
    User: String,
    IsDueling: Boolean,
    IsInvitingToDuel: Boolean,
    IsTrading: Boolean,
    IsAdventuring: Boolean,
  })
);
