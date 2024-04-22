const Booleans = require("../Schemas/PlayerBooleans");
const Inventory = require("../Schemas/PlayerInventory");
const PlayerStats = require("../Schemas/PlayerStats");

async function initialize(schema, playerId, guildId) {
  switch (schema) {
    case "inventory":
      return await Inventory.create({
        Guild: guildId,
        User: playerId,
        StandArrow: 2,
        StandDisc: 0,
        RocacacaFruit: 0,
        PJCooking: 0,
        TheWorldShard: 0,
      });
    case "playerStats":
      return await PlayerStats.create({
        Guild: guildId,
        User: playerId,
        AdventureWins: 0,
        AdventurePlays: 0,
        DuelWins: 0,
        DuelPlays: 0,
      });
    case "booleans":
      return await Booleans.create({
        Guild: guildId,
        User: playerId,
        IsDueling: false,
        IsInvitingToDuel: false,
        IsTrading: false,
        IsAdventuring: false,
      });
  }
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = { initialize, randomRange };
