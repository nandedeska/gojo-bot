const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reload the bot's commands/events.")
    .addSubcommand((options) =>
      options.setName("events").setDescription("Reload the bot's events.")
    )
    .addSubcommand((options) =>
      options.setName("commands").setDescription("Reload the bot's commands.")
    ),
};
