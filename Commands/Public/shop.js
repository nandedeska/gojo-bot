const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const PlayerInventory = require("../../Schemas/PlayerInventory");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Opens the shop menu.")
    .setDMPermission(false),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member } = interaction;
    const inventory = await PlayerInventory.findOne({
      Guild: guild.id,
      User: member.id,
    });

    const shopEmbed = new EmbedBuilder()
      .setAuthor({ name: "KAMEYU DEPARTMENT STORE" })
      .setColor("#ACD487")
      .setImage(
        "https://static.jojowiki.com/images/9/98/latest/20210205135424/Kameyu_department_store_manga.png"
      )
      .addFields([
        { name: "Stand Arrow", value: "150 Rocacaca Fruit", inline: true },
        { name: "Stand Disc", value: "5 Rocacaca Fruit", inline: true },
        {
          name: "Pearl Jam's Cooking",
          value: "60 Rocacaca Fruit",
        },
      ]);

    if (!inventory) {
      shopEmbed.setFooter({
        text: "Use /buy to purchase items.\nYou have 0 Rocacaca Fruits.",
      });
    } else {
      shopEmbed.setFooter({
        text: `Use /buy to purchase items.\nYou have ${inventory.RocacacaFruit} Rocacaca Fruits.`,
      });
    }

    interaction.reply({ embeds: [shopEmbed] });
  },
};
