const { model, Schema } = require("mongoose");

module.exports = model(
  "TradeInfo",
  new Schema({
    Guild: String,
    Trader: String,
    /**
     * Indices in order: Disc Number, Stand Arrow, Stand Disc, Rocacaca Fruit, Pearl Jam's Cooking
     */
    TradeOffer: Array,
    SecondTradeOffer: Array,
  })
);
