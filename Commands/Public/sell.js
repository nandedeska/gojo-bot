const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const PlayerInventory = require("../../Schemas/PlayerInventory");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");
const { initialize } = require("../../Utility/Utility");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Command to sell to the junk shops.")
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("item")
        .setDescription("The item to sells.")
        .setRequired(true)
        .addChoices(
          { name: "Stand Disc", value: "disc" },
          { name: "Stand Arrow", value: "arrow" }
        )
    )
    .addIntegerOption((options) =>
      options
        .setName("amount")
        .setDescription("The amount to salvage.")
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

    await interaction.reply({ content: "Selling item..." });

    if (isTrading)
      return await interaction.editReply({
        content: "You can't buy while trading!",
        ephemeral: true,
      });

    let inventory = await PlayerInventory.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!inventory)
      inventory = await initialize("inventory", member.id, guild.id);

    const item = options.getString("item");
    const amount = options.getInteger("amount");
    let itemName;
    let arrowAmount = 0;
    let discAmount = 0;
    let fruitAmount;

    switch (item) {
      case "arrow":
        arrowAmount += amount;
        fruitAmount = amount * 50;
        itemName = "Stand Arrow";

        if (inventory.StandArrow < amount)
          return await interaction.editReply({
            content: "You don't have enough Stand Arrows!",
            ephemeral: true,
          });
        break;
      case "disc":
        discAmount += amount;
        fruitAmount = (amount / 5) * 2;
        itemName = "Stand Disc";

        if (amount % 5 != 0)
          return await interaction.editReply({
            content: "Disc amount must be a multiple of 5.",
            ephemeral: true,
          });

        if (inventory.StandDisc < amount)
          return await interaction.editReply({
            content: "You don't have enough Stand Discs!",
            ephemeral: true,
          });
        break;
      default:
        return await interaction.editReply({
          content: "Item not detected! Contact the developer.",
          ephemeral: true,
        });
    }

    await PlayerInventory.updateOne(
      { Guild: guild.id, User: member.id },
      {
        $set: {
          StandArrow: inventory.StandArrow - arrowAmount,
          StandDisc: inventory.StandDisc - discAmount,
          RocacacaFruit: inventory.RocacacaFruit + fruitAmount,
        },
      }
    );

    await await interaction.editReply({
      content: `Successfully salvaged ${amount} ${itemName} for ${fruitAmount} Rocacaca Fruits!`,
    });
  },
};
