const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const Database = require("../../Schemas/StandStats");
const Inventory = require("../../Schemas/PlayerInventory");
const DiscCollection = require("../../Schemas/PlayerDiscCollection");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("extractstand")
    .setDescription("Extracts and stores your stand in a disc.")
    .setDMPermission(false),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member } = interaction;

    const booleans = await PlayerBooleans.findOne({
      Guild: guild.id,
      User: member.id,
    });

    let isInDuel;

    if (booleans) isInDuel = await booleans.IsDueling;

    // Check if player is in a duel
    if (isInDuel)
      return interaction.reply({
        content: "You cannot use this command while in a duel!",
        ephemeral: true,
      });

    // Get user's inventory
    let inventory = await Inventory.findOne({
      Guild: guild.id,
      User: member.id,
    });

    // Check if user has stand discs
    if (inventory.StandDisc <= 0)
      return interaction.reply({
        content: "You don't have any stand discs!",
        ephemeral: true,
      });

    // Get user's stand information
    const standData = await Database.findOne({
      Guild: guild.id,
      User: member.id,
    });

    // Check if user has a stand
    if (!standData) {
      interaction.reply({
        content:
          "You don't have a stand! Use /unlockstand to unlock your stand.",
        ephemeral: true,
      });
    } else {
      const standDisc = {
        Name: standData.Name,
        Healthpoints: standData.Healthpoints,
        Attack: standData.Attack,
        Defense: standData.Defense,
        Speed: standData.Speed,
        Ability: standData.Ability,
      };

      // Get player disc database
      const playerDiscs = await DiscCollection.findOne({
        Guild: guild.id,
        User: member.id,
      });

      // Check if user is already in database
      if (!playerDiscs) {
        await DiscCollection.create({
          Guild: guild.id,
          User: member.id,
          Discs: [standDisc],
        });
      } else playerDiscs.Discs.push(standDisc) && (await playerDiscs.save());

      interaction.reply({
        content: `${standData.Name} is now stored in a disc!`,
      });

      // Remove stand from user
      await Database.findOneAndDelete({ Guild: guild.id, User: member.id });

      // Subtract disc from inventory
      await Inventory.updateOne(
        { Guild: guild.id, User: member.id },
        { $set: { StandDisc: inventory.StandDisc - 1 } }
      );
    }
  },
};
