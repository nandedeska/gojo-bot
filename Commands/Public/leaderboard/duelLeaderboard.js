const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const PlayerStats = require("../../../Schemas/PlayerStats");

module.exports = {
  subCommand: "leaderboard.duel",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { member } = interaction;

    const leaderboardEmbed = new EmbedBuilder()
      .setAuthor({
        name: "DUEL LEADERBOARD",
      })
      .setDescription("No players found.")
      .setColor("#99CCED")
      .setFooter({ text: "You are not yet in the leaderboard." });

    const players = await PlayerStats.find({ Guild: member.guild.id })
      .sort({ DuelWins: -1 })
      .catch((err) => console.log(err));

    const memberIndex = players.findIndex((player) => player.User == member.id);

    //console.log(memberIndex);
    //console.log(players);

    if (memberIndex >= 0) {
      leaderboardEmbed.setFooter({
        text: `${member.user.username}, you are ranked #${
          memberIndex + 1
        } with ${players[memberIndex].DuelWins} wins!`,
      });
    }

    let description = "";

    let topTen = players.slice(0, 10);

    for (let i = 0; i < topTen.length; i++) {
      let { user } = await interaction.guild.members.fetch(topTen[i].User);
      if (!user) break;
      let playerWins = topTen[i].DuelWins;
      description += `**#${i + 1} ${user.username}:** ${playerWins} Wins\n`;
    }

    if (description !== "") leaderboardEmbed.setDescription(description);

    await interaction.reply({ embeds: [leaderboardEmbed] });
  },
};
