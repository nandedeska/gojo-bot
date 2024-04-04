const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const PlayerInventory = require("../../Schemas/PlayerInventory");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Command to buy from the shop.")
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("item")
        .setDescription("The item to buy.")
        .setRequired(true)
        .addChoices(
          { name: "Stand Arrow", value: "arrow" },
          { name: "Stand Disc", value: "disc" },
          { name: "Pearl Jam's Cooking", value: "pjcooking" }
        )
    )
    .addIntegerOption((options) =>
      options
        .setName("amount")
        .setDescription("The amount to buy.")
        .setRequired(true)
        .setMinValue(1)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member, options } = interaction;

    const booleans = await PlayerBooleans.findOne({
      Guild: guild.id,
      User: member.id,
    });

    const isTrading = booleans.IsTrading;

    if (isTrading)
      return interaction.reply({
        content: "You can't buy while trading!",
        ephemeral: true,
      });

    let inventory = await PlayerInventory.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!inventory) {
      inventory = await PlayerInventory.create({
        Guild: guild.id,
        User: member.id,
        StandArrow: 2,
        StandDisc: 0,
        RocacacaFruit: 0,
        PJCooking: 0,
      });
    }

    const item = options.getString("item");
    const amount = options.getInteger("amount");
    let itemName;
    let arrowAmount = 0;
    let discAmount = 0;
    let pjcookingAmount = 0;

    let cost;

    switch (item) {
      case "arrow":
        arrowAmount += amount;
        cost = 150 * amount;
        itemName = "Stand Arrow";
        break;
      case "disc":
        discAmount += amount;
        cost = 5 * amount;
        itemName = "Stand Disc";
        break;
      case "pjcooking":
        pjcookingAmount += amount;
        cost = 60 * amount;
        itemName = "Pearl Jam's Cooking";
        break;
      default:
        return interaction.reply({
          content: "Item not detected! Contact the developer.",
          ephemeral: true,
        });
    }

    await interaction.reply({ content: "Purchasing item..." });

    if (inventory.RocacacaFruit < cost) {
      return await interaction.editReply({
        content: `You don't have enough Rocacaca Fruits! You need ${cost}.`,
        ephemeral: true,
      });
    }

    await PlayerInventory.updateOne(
      { Guild: guild.id, User: member.id },
      {
        $set: {
          StandArrow: inventory.StandArrow + arrowAmount,
          StandDisc: inventory.StandDisc + discAmount,
          RocacacaFruit: inventory.RocacacaFruit - cost,
          PJCooking: inventory.PJCooking + pjcookingAmount,
        },
      }
    );

    await interaction.editReply({
      content: `Successfully purchased ${amount} ${itemName}!`,
    });
  },
};
