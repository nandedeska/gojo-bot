const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const StandStats = require("../../Schemas/StandStats");
const PlayerInventory = require("../../Schemas/PlayerInventory");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("enhancestand")
    .setDescription("Upgrades your stand's base stats.")
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("stat")
        .setDescription("The stat to enhance.")
        .setRequired(true)
        .addChoices(
          { name: "Healthpoints", value: "hp" },
          { name: "Attack", value: "atk" },
          { name: "Defense", value: "def" },
          { name: "Speed", value: "spd" }
        )
    )
    .addIntegerOption((options) =>
      options
        .setName("enhanceamount")
        .setDescription("The amount of times to enhance the stand.")
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

    const isDueling = booleans.isDueling;

    if (isDueling)
      return interaction.reply({
        content: "You can't enhance your stand while in a duel!",
        ephemeral: true,
      });

    let stand = await StandStats.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!stand)
      return interaction.reply({
        content: "You don't have an active stand!",
        ephemeral: true,
      });

    const inventory = await PlayerInventory.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (inventory.PJCooking <= 0) {
      return interaction.reply({
        content: "You don't have any Pearl Jam's Cooking!",
        ephemeral: true,
      });
    }

    let amount = options.getInteger("enhanceamount") || 1;

    if (inventory.PJCooking < amount) {
      return interaction.reply({
        content: `You don't have enough Pearl Jam's Cooking! You need ${amount}.`,
        ephemeral: true,
      });
    }

    let statToUpgrade = options.getString("stat");

    let hpUpgrade = 0;
    let atkUpgrade = 0;
    let defUpgrade = 0;
    let spdUpgrade = 0;
    let upgrade;

    let statName;

    for (let i = 0; i < amount; i++) {
      switch (statToUpgrade) {
        case "hp":
          if (stand.Healthpoints >= 500)
            return interaction.reply({
              content: "This stat is maxed out!",
            });
          hpUpgrade += Math.max(Math.floor(Math.random() * 5) + 1, 2);
          upgrade = hpUpgrade;
          statName = "Healthpoints";
          break;
        case "atk":
          if (stand.Attack >= 100)
            return interaction.reply({
              content: "This stat is maxed out!",
            });
          atkUpgrade += Math.floor(Math.random() * 2) + 1;
          upgrade = atkUpgrade;
          statName = "Attack";
          break;
        case "def":
          if (stand.Defense >= 70)
            return interaction.reply({
              content: "This stat is maxed out!",
            });
          defUpgrade += Math.floor(Math.random() * 2) + 1;
          upgrade = defUpgrade;
          statName = "Defense";
          break;
        case "spd":
          if (stand.Healthpoints >= 300)
            return interaction.reply({
              content: "This stat is maxed out!",
            });
          spdUpgrade += Math.floor(Math.random() * 5) + 1;
          upgrade = spdUpgrade;
          statName = "Speed";
          break;
        default:
          return interaction.reply({
            content: "Error detected! Contact the developer.",
          });
      }
    }

    await StandStats.updateOne(
      { Guild: guild.id, User: member.id },
      {
        $set: {
          Healthpoints: Math.min(stand.Healthpoints + hpUpgrade, 500),
          Attack: Math.min(stand.Attack + atkUpgrade, 100),
          Defense: Math.min(stand.Defense + defUpgrade, 70),
          Speed: Math.min(stand.Speed + spdUpgrade, 100),
        },
      }
    );

    stand = await StandStats.findOne({ Guild: guild.id, User: member.id });

    await PlayerInventory.updateOne(
      { Guild: guild.id, User: member.id },
      { $set: { PJCooking: inventory.PJCooking - amount } }
    );

    const upgradeEmbed = new EmbedBuilder()
      .setAuthor({ name: "STAND ENHANCEMENT" })
      .setTitle(`${stand.Name}'s ${statName} increased by ${upgrade}!`)
      .setColor("#FFD700")
      .addFields(
        {
          name: "Healthpoints",
          value: `${stand.Healthpoints} / 500`,
          inline: true,
        },
        {
          name: "Attack",
          value: `${stand.Attack} / 100`,
          inline: true,
        },
        {
          name: "Defense",
          value: `${stand.Defense} / 70`,
          inline: true,
        },
        {
          name: "Speed",
          value: `${stand.Speed} / 300`,
          inline: true,
        }
      )
      .setImage(
        "https://cdn.discordapp.com/attachments/675612229676040192/1091249723542880337/image.png"
      );

    interaction.reply({ embeds: [upgradeEmbed] });
  },
};
