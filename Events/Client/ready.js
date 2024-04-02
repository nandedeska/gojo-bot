const { loadCommands } = require("../../Handlers/commandHandler");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log("The client is now ready!");
    client.user.setActivity(`with ${client.guilds.cache.size} servers!`);
    loadCommands(client);
  },
};
