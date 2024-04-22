const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const DiscCollection = require("../../Schemas/PlayerDiscCollection");
const PlayerStand = require("../../Schemas/StandStats");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");
const { initialize } = require("../../Utility/Utility");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("insertstand")
    .setDescription(
      "Inserts a disc into you. The stand stored inside will become yours."
    )
    .setDMPermission(false)
    .addNumberOption((options) =>
      options
        .setName("discnumber")
        .setDescription("Choose the disc you want to insert.")
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member, options } = interaction;

    let booleans = await PlayerBooleans.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!booleans) booleans = await initialize("booleans", member.id, guild.id);

    let isInDuel;
    let isInTrade;

    if (booleans) {
      isInDuel = booleans.IsDueling;
      isInTrade = booleans.IsTrading;
    }

    // Check if player is in a duel
    if (isInDuel)
      return interaction.reply({
        content: "You cannot use this command while in a duel!",
        ephemeral: true,
      });

    if (isInTrade)
      return interaction.reply({
        content: "You cannot use this command while in a trade!",
        ephemeral: true,
      });

    const discNumber = options.getNumber("discnumber");

    const collection = await DiscCollection.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!collection)
      return interaction.reply({
        content: "You don't have any stand discs stored!",
        ephemeral: true,
      });

    const stand = await PlayerStand.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (stand)
      return interaction.reply({
        content: "You already have an active stand!",
        ephemeral: true,
      });

    if (discNumber <= 0 || discNumber > collection.Discs.length)
      return interaction.reply({
        content: `Disc #${discNumber} doesn't exist!`,
        ephemeral: true,
      });

    const selectedStand = collection.Discs[discNumber - 1];

    await PlayerStand.create({
      Guild: guild.id,
      User: member.id,
      Name: selectedStand.Name,
      Healthpoints: selectedStand.Healthpoints,
      Attack: selectedStand.Attack,
      Defense: selectedStand.Defense,
      Speed: selectedStand.Speed,
      Ability: selectedStand.Ability,
    });

    collection.Discs =
      {
        Guild: guild.id,
        User: member.id,
        Discs: collection.Discs.splice(discNumber - 1, 1),
      } && (await collection.save());

    interaction.reply({ content: `You inserted Disc #${discNumber}!` });
  },
};
