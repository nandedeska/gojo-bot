const { model, Schema } = require("mongoose");

module.exports = model(
  "Stand",
  new Schema({ Guild: String, StandName: String })
);
