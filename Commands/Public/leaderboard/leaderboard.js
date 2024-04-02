const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Shows the server's leaderboards.")
    .setDMPermission(false)
    .addSubcommand((options) =>
      options.setName("duel").setDescription("Displays the duel leaderboards.")
    )
    .addSubcommand((options) =>
      options
        .setName("adventure")
        .setDescription("Displays the adventure leaderboards.")
    ),
};
