const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const version = "1.0";
const patchNotes = {
  "1.0": {
    name: "The DIO Update",
    notes:
      "Added DIO to adventure mode\n" +
      'Added "The World Shards"\n' +
      "Added infuse ability\n" +
      "Players can now have more than one ability\n" +
      "Bug fixes",
  },
};

module.exports = {
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

    console.log(options.getString("version"));

    if (!(options.getString("version") in patchNotes))
      return interaction.reply({
        content: "Version not found.",
        ephemeral: true,
      });

    update = patchNotes[version];

    const patchNotesEmbed = new EmbedBuilder()
      .setAuthor({ name: `v${version} PATCH NOTES` })
      .setTitle(update.name)
      .setDescription(update.notes)
      .setColor("#FFFFFF");

    interaction.reply({ embeds: [patchNotesEmbed] });
  },
};
