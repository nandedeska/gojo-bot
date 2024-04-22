const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const PlayerStats = require("../../Schemas/PlayerStats");
const PlayerStand = require("../../Schemas/StandStats");
const { initialize } = require("../../Utility/Utility");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Shows your profile.")
    .setDMPermission(false),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member } = interaction;

    let userStats = await PlayerStats.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!userStats)
      userStats = await initialize("playerStats", member.id, guild.id);

    let userStand = await PlayerStand.findOne({
      Guild: guild.id,
      User: member.id,
    });

    let standText;

    if (!userStand) standText = "No Active Stand";
    else standText = `${userStand.Name}`;

    const profileEmbed = new EmbedBuilder()
      .setColor("#202020")
      .setAuthor({
        name: `${member.user.username}'s Profile`,
        iconURL: member.displayAvatarURL(),
      })
      .addFields(
        {
          name: "Stand",
          value: standText,
        },
        {
          name: "Duel Wins",
          value: `${userStats.DuelWins} / ${userStats.DuelPlays}`,
          inline: true,
        },
        {
          name: "Duel Win Rate",
          value: `${Math.floor(
            (userStats.DuelWins / Math.max(userStats.DuelPlays, 1)) * 100
          )}%`,
          inline: true,
        },
        {
          name: "------------------------------------------------",
          value: "\u200b",
        },
        {
          name: "Adventure Wins",
          value: `${userStats.AdventureWins} / ${userStats.AdventurePlays}`,
          inline: true,
        },
        {
          name: "Adventure Win Rate",
          value: `${Math.floor(
            (userStats.AdventureWins / Math.max(userStats.AdventurePlays, 1)) *
              100
          )}%`,
          inline: true,
        }
      );
    interaction.reply({ embeds: [profileEmbed] });
  },
};
