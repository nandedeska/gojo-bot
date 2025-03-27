const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const StandStats = require("../../Schemas/StandStats");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");
const Inventory = require("../../Schemas/PlayerInventory");
const HumanizeDuration = require("humanize-duration");
const Cooldowns = require("../../Schemas/Cooldowns");
const CooldownTime = 0;
const AdventureOpponents = require("../../Local Storage/adventureOpponents");
const AdventureInfo = require("../../Schemas/AdventureInfo");
const { initialize } = require("../../Utility/Utility");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adventure")
    .setDescription("Go out on a bizzare adventure!")
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("gamemode")
        .setDescription(
          "Selects canon or alternate universe stands (custom made by me). Leave this blank for both gamemodes."
        )
        .addChoices(
          { name: "Canon", value: "canon" },
          { name: "Alternate Universe", value: "au" }
        )
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

    if (!booleans) {
      booleans = await initialize("booleans", member.id, guild.id);
    }

    let isInDuel = booleans.IsDueling;
    let isTrading = booleans.IsTrading;
    let isAdventuring = booleans.IsAdventuring;

    if (isInDuel)
      return interaction.reply({
        content: "You cannot go on an adventure while dueling!",
        ephemeral: true,
      });

    if (isTrading)
      return interaction.reply({
        content: "You cannot go on an adventure while trading!",
        ephemeral: true,
      });

    if (isAdventuring)
      return interaction.reply({
        content: "You are already in an adventure!",
        ephemeral: true,
      });

    const cooldown = await Cooldowns.findOne({
      Guild: guild.id,
      User: member.id,
      Command: "adventure",
    });

    if (cooldown) {
      if (Date.now() - cooldown.Cooldown >= CooldownTime)
        await Cooldowns.findOneAndDelete({
          Guild: guild.id,
          User: member.id,
          Command: "adventure",
        });
      else {
        const remainingTime = HumanizeDuration(
          cooldown.Cooldown + CooldownTime - Date.now(),
          {
            largest: 2,
            round: true,
          }
        );
        return interaction
          .reply({
            content: `You can go on an adventure again in ${remainingTime}.`,
            ephemeral: true,
          })
          .catch(console.error);
      }
    }

    const stand = await StandStats.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!stand)
      return interaction.reply({
        content: "You don't have an active stand!",
        ephemeral: true,
      });

    const rewardEmbed = new EmbedBuilder()
      .setTitle(`${member.user.username} found a loot crate from adventuring!`)
      .setColor("#FFDF00")
      .setAuthor({ name: "LOOT CRATE" })
      .setImage(
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5851f423-3ac3-4eef-88d5-2be0fc69382b/de3ayma-b38313b3-a404-4604-91e9-c7b9908f8ad1.png/v1/fill/w_1600,h_900,q_80,strp/jojo_stand_arrow_heads_by_mdwyer5_de3ayma-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6IlwvZlwvNTg1MWY0MjMtM2FjMy00ZWVmLTg4ZDUtMmJlMGZjNjkzODJiXC9kZTNheW1hLWIzODMxM2IzLWE0MDQtNDYwNC05MWU5LWM3Yjk5MDhmOGFkMS5wbmciLCJ3aWR0aCI6Ijw9MTYwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.y66dqY4BgvgJUSz2mCTRTKXmvoI5yxtf9yGNV349Ls0"
      )
      .setDescription("CONTACT DEVELOPER: REWARD EMBED ERROR");

    if (Math.random() < 0.15) {
      let arrowAmount;
      let discAmount;
      let fruitAmount;

      arrowAmount = 1;
      discAmount = Math.floor(Math.random() * 40);
      fruitAmount = Math.floor(Math.random() * 100);
      let sum = arrowAmount + discAmount + fruitAmount;

      console.log(`${arrowAmount}-${discAmount}-${fruitAmount}`);

      arrowAmount = Math.round((arrowAmount / sum) * 8);
      discAmount = Math.round((discAmount / sum) * 8);
      fruitAmount = Math.round((fruitAmount / sum) * 8);

      let playerInventory = await Inventory.findOne({
        Guild: guild.id,
        User: member.id,
      });

      await Inventory.updateOne(
        { Guild: guild.id, User: member.id },
        {
          $set: {
            StandArrow: playerInventory.StandArrow + arrowAmount,
            StandDisc: playerInventory.StandDisc + discAmount,
            RocacacaFruit: playerInventory.RocacacaFruit + fruitAmount,
          },
        }
      );

      let rewardText = "";

      if (arrowAmount > 0) rewardText += `${arrowAmount}x Stand Arrow\n`;
      if (discAmount > 0) rewardText += `${discAmount}x Stand Disc\n`;
      if (fruitAmount > 0) rewardText += `${fruitAmount}x Rocacaca Fruit`;

      rewardEmbed.setDescription(rewardText);

      await Cooldowns.create({
        Guild: guild.id,
        User: member.id,
        Command: "adventure",
        Cooldown: Date.now(),
      });

      return interaction.reply({ content: null, embeds: [rewardEmbed] });
    }

    const { opponentPool, bossPool, canonPool, alternatePool, opponents } =
      AdventureOpponents;

    // random both canon and au
    //    let opponent =
    //    opponents[opponentPool[Math.floor(Math.random() * opponentPool.length)]];

    // default canon
    opponent =
      opponents[canonPool[Math.floor(Math.random() * canonPool.length)]];

    const gamemode = options.getString("gamemode");

    if (gamemode == "canon")
      opponent =
        opponents[canonPool[Math.floor(Math.random() * canonPool.length)]];
    else if (gamemode == "au")
      opponent =
        opponents[
          alternatePool[Math.floor(Math.random() * alternatePool.length)]
        ];

    if (Math.random() < 0.1 && gamemode != "au")
      opponent =
        opponents[bossPool[Math.floor(Math.random() * bossPool.length)]];

    const opponentEmbed = new EmbedBuilder()
      .setAuthor({ name: "OPPONENT FOUND!" })
      .setColor("#D31A38")
      .setImage(opponent.displayImage)
      .setDescription(
        `While on your adventure, you encounter ${opponent.displayName}!\n\nWarning: Declining the match still starts your cooldown time.`
      );
    await interaction
      .reply({ content: null, embeds: [opponentEmbed], fetchReply: true })
      .catch(console.log);

    const offerButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Fight")
        .setStyle(ButtonStyle.Success)
        .setCustomId(
          `Adventure-Accept-${guild.id}-${member.id}-${opponent.id}`
        ),
      new ButtonBuilder()
        .setLabel("Run Away")
        .setStyle(ButtonStyle.Danger)
        .setCustomId(
          `Adventure-Decline-${guild.id}-${member.id}-${opponent.id}`
        )
    );

    await PlayerBooleans.updateOne(
      { Guild: guild, User: member.id },
      { $set: { IsAdventuring: true } }
    );

    await interaction.editReply({ components: [offerButtons] });
  },
};
