const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
let version = "1.1.0";
const patchNotes = {
  "1.1.0": {
    notes: "Updated /patchnotes: version selection and cycling\n",
  },
  "1.0.1": {
    notes:
      "Nerfed DIO (ATK 100 >> 50 SPD 100 >> 50)\n" +
      "Fixed /adventure syncing bug\n" +
      "Fixed dodge code in /adventure\n" +
      "Bug fixes",
  },
  "1.0.0": {
    notes:
      "**THE DIO UPDATE**\n" +
      "Added DIO to adventure mode\n" +
      'Added "The World Shards"\n' +
      "Added /infuseability\n" +
      "Players can now have more than one ability\n" +
      "Bug fixes",
  },
};

module.exports = {
  patchNotes,
  data: new SlashCommandBuilder()
    .setName("patchnotes")
    .setDescription("Shows the latest patch notes.")
    .setDMPermission(false)
    .addStringOption((options) =>
      options.setName("version").setDescription("Select version to view.")
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member, options } = interaction;

    if (options.getString("version") != null)
      version = options.getString("version");

    if (!(version in patchNotes))
      return interaction.reply({
        content: "Version not found.",
        ephemeral: true,
      });

    update = patchNotes[version];

    const patchNotesEmbed = new EmbedBuilder()
      .setAuthor({ name: `PATCH NOTES` })
      .setTitle(`v${version}`)
      .setDescription(update.notes)
      .setColor("#FFFFFF");

    await interaction.reply({ embeds: [patchNotesEmbed], fetchReply: true });

    const arrowButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("⬅️")
        .setCustomId(`Patch-Left`)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setLabel("➡️")
        .setCustomId(`Patch-Right`)
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.editReply({ components: [arrowButtons] });
  },
};
