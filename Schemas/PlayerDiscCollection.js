const { model, Schema } = require("mongoose");

module.exports = model(
  "PlayerDiscCollection",
  new Schema({ Guild: String, User: String, Discs: Array })
);
