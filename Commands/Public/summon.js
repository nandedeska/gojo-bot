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
      await interaction.reply({ content: "Fetching stand... sit tight." });

      let abilityText = "";

      for (let i = 0; i < userData.Ability.length; i++) {
        let ability = userData.Ability[0];
        if (i > 1) abilityText += "\n";
        abilityText += `*${ability.name}*\n${ability.description}\n`;

        if (ability.damage) abilityText += `\nPower: ${ability.damage}`;
        if (ability.power) abilityText += `\nPower: ${ability.power}`;
        if (ability.turns) ability += `\nTurns: ${ability.turns}`;
        abilityText += `\nCooldown: ${ability.cooldown}`;
      }

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
      await interaction.editReply({ content: null, embeds: [standEmbed] });
    }
  },
};
