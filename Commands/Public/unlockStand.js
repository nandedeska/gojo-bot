const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const Database = require("../../Schemas/StandStats");
const StandCollection = require("../../Schemas/StandCollection");
const Inventory = require("../../Schemas/PlayerInventory");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");
const StandAbilities = require("../../Local Storage/standAbilities");
const { initialize } = require("../../Utility/Utility");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlockstand")
    .setDescription("Unlocks your stand.")
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("standname")
        .setDescription("Choose the name of your stand.")
        .setMaxLength(64)
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;

    booleans = await PlayerBooleans.findOne({
      Guild: guild.id,
      User: member.id,
    });

    let isInDuel;

    if (!booleans) booleans = await initialize("booleans", member.id, guild.id);

    isInDuel = await booleans.IsDueling;

    // Check if player is in a duel
    if (isInDuel)
      return interaction.reply({
        content: "You cannot use this command while in a duel!",
        ephemeral: true,
      });

    // Check is user has inventory
    let playerInventory = await Inventory.findOne({
      Guild: guild.id,
      User: member.id,
    });

    // Set inventory if not found
    if (!playerInventory) {
      playerInventory = await initialize("inventory", member.id, guild.id);
    }

    if (playerInventory.StandArrow <= 0)
      return interaction.reply({
        content: "You don't have any stand arrows!",
        ephemeral: true,
      });

    const checkStandName = await StandCollection.findOne({
      Guild: guild.id,
      StandName: options.getString("standname").toLowerCase(),
    });

    if (checkStandName)
      return interaction.reply({
        content: "This stand already exists in this server!",
        ephemeral: true,
      });

    let userData = await Database.findOne({ Guild: guild.id, User: member.id });

    if (!userData) {
      // Prepare stand data and embed
      let healthpoints = Math.max(Math.floor(Math.random() * 50) + 1, 7);
      let attack = Math.floor(Math.random() * 20);
      let defense = Math.floor(Math.random() * 20);
      let speed = Math.floor(Math.random() * 20);
      let sum = attack + defense + speed;

      console.log(`${attack}, ${defense}, ${speed}`);

      attack = Math.max(Math.round((attack / sum) * 50), 1);
      defense = Math.max(Math.round((defense / sum) * 50), 1);
      speed = Math.max(Math.round((speed / sum) * 50), 1);

      let ability = [
        StandAbilities.abilityPool[
          Math.floor(Math.random() * StandAbilities.abilityPool.length)
        ],
      ];

      let abilityText = `*${ability[0].name}*\n${ability[0].description}\n`;

      if (ability[0].damage) abilityText += `\nPower: ${ability[0].damage}`;
      if (ability[0].power) abilityText += `\nPower: ${ability[0].power}`;

      abilityText += `\nCooldown: ${ability[0].cooldown}`;

      const standEmbed = new EmbedBuilder()
        .setTitle(options.getString("standname"))
        .setColor("#FFD700")
        .addFields(
          {
            name: "Healthpoints",
            value: `${healthpoints}`,
            inline: true,
          },
          {
            name: "Attack",
            value: `${attack}`,
            inline: true,
          },
          {
            name: "Defense",
            value: `${defense}`,
            inline: true,
          },
          {
            name: "Speed",
            value: `${speed}`,
            inline: true,
          },
          { name: "Ability", value: abilityText }
        )
        .setImage(
          "https://static.wikia.nocookie.net/jjba/images/8/83/Beetle_arrow_anime.png/revision/latest?cb=20190614221523"
        )
        .setAuthor({ name: "Stand Unlocked!" })
        .setFooter({
          text: "You unlocked your stand! Use /summon to see your stand.",
        });

      // Send stand embed
      interaction.reply({ embeds: [standEmbed] });

      // Save changes to database
      await Database.create({
        Guild: guild.id,
        User: member.id,
        Name: options.getString("standname"),
        Healthpoints: healthpoints,
        Attack: attack,
        Defense: defense,
        Speed: speed,
        Ability: ability,
      });
      await StandCollection.create({
        Guild: guild.id,
        StandName: options.getString("standname").toLowerCase(),
      });
      await Inventory.updateOne(
        { Guild: guild.id, User: member.id },
        { $set: { StandArrow: playerInventory.StandArrow - 1 } }
      );
    } else
      interaction.reply({
        content:
          "You already have a stand! Use /summon to see your stand's info.",
        ephemeral: true,
      });
  },
};
