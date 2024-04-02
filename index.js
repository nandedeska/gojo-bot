const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages],
  partials: [User, Message, GuildMember, ThreadMember],
});

const { loadEvents } = require("./Handlers/eventHandler");
const PlayerBooleans = require("./Schemas/PlayerBooleans");
const PlayerInventory = require("./Schemas/PlayerInventory");
const DuelInfo = require("./Schemas/DuelInfo");
const AdventureInfo = require("./Schemas/AdventureInfo");
const TradeInfo = require("./Schemas/TradeInfo");
const StandStats = require("./Schemas/StandStats");
const StandAbilities = require("./Local Storage/standAbilities");
const DiscCollection = require("./Schemas/PlayerDiscCollection");
const PlayerStats = require("./Schemas/PlayerStats");

client.config = require("./config.json");
client.events = new Collection();
client.commands = new Collection();
client.subCommands = new Collection();

const { connect } = require("mongoose");
connect(client.config.DatabaseURL, {}).then(async () => {
  console.log("The client is now connected to the database!");
  await PlayerBooleans.updateMany(
    {},
    {
      $set: {
        IsDueling: false,
        IsInvitingToDuel: false,
        IsTrading: false,
        IsAdventuring: false,
      },
    }
  );
  await DuelInfo.deleteMany({});
  await AdventureInfo.deleteMany({});
  await TradeInfo.deleteMany({});

  // Update stands that don't have abilities
  // const ability = StandAbilities.abilityPool[Math.round(Math.random() * StandAbilities.abilityPool.length)];
  /*await StandStats.find({ Ability: { $exists: false } }).then((stats) => {
    //console.log(stats);
    stats.forEach(async function (doc) {
      await StandStats.updateOne(
        { Guild: doc.Guild, User: doc.User },
        {
          $set: {
            Ability: [
              StandAbilities.abilityPool[
                Math.floor(Math.random() * StandAbilities.abilityPool.length)
              ],
            ],
          },
        }
      );
    });
  });*/
  /*await DiscCollection.find().then((docs) => {
    docs.forEach(async function (doc) {
      doc.Discs.forEach(async function (disc) {
        if (!disc.Ability) {
          disc.Ability = [
            StandAbilities.abilityPool[
              Math.floor(Math.random() * StandAbilities.abilityPool.length)
            ],
          ];
        }
      });
      //console.log(doc);
      await doc.markModified("Discs");
      await doc.save();
    });
  });*/
});

loadEvents(client);

client.login(client.config.token);
