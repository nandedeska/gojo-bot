const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const Inventory = require("../../Schemas/PlayerInventory");
const StandStats = require("../../Schemas/StandStats");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");
const { initialize, randomRange } = require("../../Utility/Utility");

const AbilityPool = {
  timestop: {
    name: "Time Stop",
    id: "timestop",
    description: "The stand stops time for a few turns.",
    actionDescription: "stops time",
    turns: randomRange(1, 3),
    cooldown: randomRange(5, 8),
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("infuseability")
    .setDescription("Infuses an ability into your stand.")
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("ability")
        .setDescription("Select ability to infuse.")
        .addChoices({ name: "Time Stop", value: "timestop" })
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member, options } = interaction;

    await interaction.deferReply();

    const stand = await StandStats.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!stand)
      return await interaction.editReply({
        content: "You don't have a stand!",
        ephemeral: true,
      });

    let booleans = await PlayerBooleans.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!booleans) {
      booleans = await initialize("booleans", member.id, guild.id);
    }

    let isInDuel = booleans.IsDueling;
    let isTrading = booleans.IsTrading;
    let isAdventuring = booleans.IsAdventuring;

    if (isInDuel)
      return await interaction.editReply({
        content: "You cannot infuse abilities while dueling!",
        ephemeral: true,
      });

    if (isTrading)
      return await interaction.editReply({
        content: "You cannot infuse abilities while trading!",
        ephemeral: true,
      });

    if (isAdventuring)
      return await interaction.editReply({
        content: "You cannot infuse abilities while adventuring!",
        ephemeral: true,
      });

    // Check is user has inventory
    let playerInventory = await Inventory.findOne({
      Guild: guild.id,
      User: member.id,
    });

    // Set inventory if not found
    if (!playerInventory)
      playerInventory = await initialize("inventory", member.id, guild.id);

    let abilityText = "";
    let ability;
    let newStandAbilities = stand.Ability;

    switch (options.getString("ability")) {
      case "timestop":
        if (playerInventory.TheWorldShard < 25)
          return await interaction.editReply(
            "You need 25 The World Shards to infuse this ability!"
          );

        if (stand.Ability.length >= 3)
          return await interaction.editReply({
            content:
              "You already have 3 abilities! Remove one to infuse this ability.",
          });

        ability = AbilityPool["timestop"];

        abilityText += `**${ability.name}**\n${ability.description}\n`;

        if (ability.damage) abilityText += `\nPower: ${ability.damage}`;
        if (ability.power) abilityText += `\nPower: ${ability.power}`;
        if (ability.turns) abilityText += `\nTurns: ${ability.turns}`;
        abilityText += `\nCooldown: ${ability.cooldown}`;

        newStandAbilities.push(ability);

        await StandStats.updateOne(
          { Guild: guild.id, User: member.id },
          { $set: { Ability: newStandAbilities } }
        );

        await Inventory.updateOne(
          { Guild: guild.id, User: member.id },
          { $set: { TheWorldShard: playerInventory.TheWorldShard - 25 } }
        );
        break;

      default:
        return await interaction.editReply({
          content: "ERROR: MISSING ABILITY! CONTACT DEVELOPER",
        });
    }

    // Create inventory embed
    const abilityEmbed = new EmbedBuilder()
      .setTitle(`Infused ${ability.name} to ${stand.Name}!`)
      .setColor("#FFFFFF")
      .setDescription(abilityText);

    await interaction.editReply({ embeds: [abilityEmbed] });
  },
};
