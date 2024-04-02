const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("junkshop")
    .setDescription("Opens the junk shop menu.")
    .setDMPermission(false),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const shopEmbed = new EmbedBuilder()
      .setAuthor({ name: "A BIZZARE JUNK SHOP" })
      .setColor("#ACD487")
      .setImage(
        "https://static.jojowiki.com/images/1/17/latest/20210205175426/Akira_room.png"
      )
      .addFields([
        { name: "Stand Arrow", value: "1 Arrow for 50 Rocacaca Fruits" },
        { name: "Stand Disc", value: "5 Discs for 2 Rocacaca Fruits" },
      ]);

    shopEmbed.setFooter({
      text: "Use /sell to salvage items.",
    });

    interaction.reply({ embeds: [shopEmbed] });
  },
};
