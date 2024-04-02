const { model, Schema } = require("mongoose");

module.exports = new model(
  "Cooldowns",
  new Schema({ Guild: String, User: String, Command: String, Cooldown: Number })
);
