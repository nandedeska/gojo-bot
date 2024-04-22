const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const itemInfo = {
  theworldshard: {
    name: "The World Shard",
    description:
      "Obtained from successfully defeating DIO. If 25 shards are infused into a stand, it learns the Time Stop ability.",
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Shows information about ingame items.")
    .addStringOption((options) =>
      options
        .setName("item")
        .setDescription("item")
        .setRequired(true)
        .addChoices({ name: "The World Shard", value: "theworldshard" })
    )
    .setDMPermission(false),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member } = interaction;

    let item = options.getString("item");

    const infoEmbed = new EmbedBuilder()
      .setAuthor({ name: `INFO` })
      .setTitle(itemInfo[item].name)
      .setDescription(itemInfo[item].description)
      .setColor("#FFFFFF");

    interaction.reply({ embeds: [infoEmbed] });
  },
};
