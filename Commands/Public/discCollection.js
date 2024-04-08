const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const DiscCollection = require("../../Schemas/PlayerDiscCollection");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("disccollection")
    .setDescription("Shows your stand disc collection.")
    .setDMPermission(false),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member } = interaction;

    await interaction.reply({ content: "Fetching discs... sit tight." });

    const collection = await DiscCollection.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!collection || collection.Discs.length <= 0)
      return interaction.editReply({
        content: "You don't have any stands stored as discs!",
        ephemeral: true,
      });

    let selectedDisc = collection.Discs[0];

    let abilityText = "";

    for (let i = 0; i < selectedDisc.Ability.length; i++) {
      let ability = selectedDisc.Ability[i];
      if (i > 1) abilityText += "\n";
      abilityText += `*${ability.name}*\n${ability.description}\n`;

      if (ability.damage) abilityText += `\nPower: ${ability.damage}`;
      if (ability.power) abilityText += `\nPower: ${ability.power}`;
      if (ability.turns) ability += `\nTurns: ${ability.turns}`;
      abilityText += `\nCooldown: ${ability.cooldown}`;
    }

    const discEmbed = new EmbedBuilder()
      .setTitle(selectedDisc.Name)
      .setColor("#202020")
      .setAuthor({
        name: `${member.user.username}'s Disc #1`,
        iconURL: member.displayAvatarURL(),
      })
      .setImage(
        "https://static.wikia.nocookie.net/jjba/images/2/24/Stand_Discs.png/revision/latest?cb=20191103214745"
      )
      .addFields(
        {
          name: "Healthpoints",
          value: `${selectedDisc.Healthpoints}`,
        },
        {
          name: "Attack",
          value: `${selectedDisc.Attack}`,
        },
        {
          name: "Defense",
          value: `${selectedDisc.Defense}`,
        },
        {
          name: "Speed",
          value: `${selectedDisc.Speed}`,
        },
        { name: "Ability", value: abilityText }
      );

    await interaction.editReply({
      embeds: [discEmbed],
      fetchReply: true,
    });

    const arrowButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("⬅️")
        .setCustomId(
          `Discs-Left-${guild.id}-${member.id}-${member.user.username}`
        )
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setLabel("➡️")
        .setCustomId(
          `Discs-Right-${guild.id}-${member.id}-${member.user.username}`
        )
        .setStyle(ButtonStyle.Secondary)
    );

    if (collection.Discs.length == 1)
      arrowButtons.components.forEach((button) => button.setDisabled(true));

    await interaction.editReply({ content: null, components: [arrowButtons] });
  },
};
