const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const PlayerInventory = require("../../Schemas/PlayerInventory");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("give")
    .setDescription("Inserts items into a player's inventory.")
    .addUserOption((options) =>
      options
        .setName("membername")
        .setDescription("The member to give to.")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("item")
        .setDescription("The item to give.")
        .setRequired(true)
        .addChoices(
          { name: "Stand Arrow", value: "arrow" },
          { name: "Stand Disc", value: "disc" },
          { name: "Rocacaca Fruit", value: "fruit" },
          { name: "Pearl Jam's Cooking", value: "pjcooking" }
        )
    )
    .addIntegerOption((options) =>
      options
        .setName("amount")
        .setDescription("The amount to give.")
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member, options } = interaction;

    const targetMember = options.getUser("membername");
    const item = options.getString("item");
    const amount = options.getInteger("amount");

    let inventory = await PlayerInventory.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!inventory) {
      return interaction.reply({
        content: `${targetMember.username} doesn't have an inventory!`,
        ephemeral: true,
      });
    }

    let arrowAmount = 0;
    let discAmount = 0;
    let fruitAmount = 0;
    let pjcookingAmount = 0;

    switch (item) {
      case "arrow":
        arrowAmount = amount;
        itemName = "Stand Arrow";
        break;
      case "disc":
        discAmount = amount;
        itemName = "Stand Disc";
        break;
      case "fruit":
        fruitAmount = amount;
        itemName = "Rocacaca Fruit";
        break;
      case "pjcooking":
        pjcookingAmount = amount;
        itemName = "Pearl Jam's Cooking";
        break;
      default:
        return interaction.reply({
          content: "This item doesn't exist!",
          ephemeral: true,
        });
    }

    await PlayerInventory.updateOne(
      { Guild: guild.id, User: targetMember.id },
      {
        $set: {
          StandArrow: inventory.StandArrow + arrowAmount,
          StandDisc: inventory.StandDisc + discAmount,
          RocacacaFruit: inventory.RocacacaFruit + fruitAmount,
          PJCooking: inventory.PJCooking + pjcookingAmount,
        },
      }
    );

    interaction.reply({
      content: `Gave ${amount} ${itemName} to ${targetMember.username}!`,
      ephemeral: true,
    });
  },
};
