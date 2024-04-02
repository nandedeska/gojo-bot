const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const Inventory = require("../../Schemas/PlayerInventory");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Shows your inventory.")
    .setDMPermission(false),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member } = interaction;

    // Check is user has inventory
    let playerInventory = await Inventory.findOne({
      Guild: guild.id,
      User: member.id,
    });

    // Set inventory if not found
    if (!playerInventory) {
      playerInventory = await Inventory.create({
        Guild: guild.id,
        User: member.id,
        StandArrow: 5,
        StandDisc: 0,
        RocacacaFruit: 0,
        PJCooking: 0,
      });
    }

    let inventoryText = "";

    if (playerInventory.StandArrow > 0)
      inventoryText += `${playerInventory.StandArrow}x Stand Arrow\n`;

    if (playerInventory.StandDisc > 0)
      inventoryText += `${playerInventory.StandDisc}x Stand Disc\n`;

    if (playerInventory.RocacacaFruit > 0)
      inventoryText += `${playerInventory.RocacacaFruit}x Rocacaca Fruit\n`;

    if (playerInventory.PJCooking > 0)
      inventoryText += `${playerInventory.PJCooking}x Pearl Jam's Cooking\n`;

    if (inventoryText == "") inventoryText = "Inventory is empty.";

    // Create inventory embed
    const inventoryEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${member.user.username}'s Inventory`,
        iconURL: member.displayAvatarURL(),
      })
      .setColor("#FFFFFF")
      .setDescription(inventoryText);

    interaction.reply({ embeds: [inventoryEmbed] });
  },
};
