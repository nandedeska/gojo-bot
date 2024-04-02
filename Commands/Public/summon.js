const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const Database = require("../../Schemas/StandStats");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("summon")
    .setDescription("Shows your stand's stats.")
    .setDMPermission(false),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member } = interaction;

    let userData = await Database.findOne({ Guild: guild.id, User: member.id });

    if (!userData) {
      interaction.reply({
        content:
          "You don't have a stand! Use /unlockstand to unlock your stand.",
        ephemeral: true,
      });
    } else {
      const ability = userData.Ability[0];

      let abilityText = `*${ability.name}*\n${ability.description}\n`;

      if (ability.damage) abilityText += `\nPower: ${ability.damage}`;
      if (ability.power) abilityText += `\nPower: ${ability.power}`;

      abilityText += `\nCooldown: ${ability.cooldown}`;

      const standEmbed = new EmbedBuilder()
        .setTitle(userData.Name)
        .setColor("#202020")
        .setAuthor({
          name: `${member.user.username}'s Stand`,
          iconURL: member.displayAvatarURL(),
        })
        .addFields(
          {
            name: "Healthpoints",
            value: `${userData.Healthpoints}`,
            inline: true,
          },
          {
            name: "Attack",
            value: `${userData.Attack}`,
            inline: true,
          },
          {
            name: "Defense",
            value: `${userData.Defense}`,
            inline: true,
          },
          {
            name: "Speed",
            value: `${userData.Speed}`,
            inline: true,
          },
          { name: "Ability", value: abilityText }
        );
      await interaction.reply({ embeds: [standEmbed] });
    }
  },
};
