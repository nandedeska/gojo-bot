const { ChatInputCommandInteraction, Client } = require("discord.js");
const { loadCommands } = require("../../../Handlers/commandHandler");
const config = require("../../../config.json");

module.exports = {
  subCommand: "reload.commands",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    loadCommands(client);
    interaction.reply({ content: "Reloaded commands.", ephemeral: true });
  },
};
