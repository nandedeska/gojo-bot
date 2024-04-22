const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const PlayerInventory = require("../../Schemas/PlayerInventory");
const HumanizeDuration = require("humanize-duration");
const Cooldowns = require("../../Schemas/Cooldowns");
const { initialize } = require("../../Utility/Utility");
const CooldownTime = 72000000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dailyloot")
    .setDescription("Opens your daily loot crate.")
    .setDMPermission(false),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member } = interaction;

    // Check if user is in cooldown
    const userCooldown = await Cooldowns.findOne({
      Guild: guild.id,
      User: member.id,
      Command: "dailyLoot",
    });

    if (userCooldown) {
      if (Date.now() - userCooldown.Cooldown >= CooldownTime)
        await Cooldowns.findOneAndDelete({
          Guild: guild.id,
          User: member.id,
          Command: "dailyLoot",
        });
      else {
        const remainingTime = HumanizeDuration(
          userCooldown.Cooldown + CooldownTime - Date.now(),
          {
            largest: 2,
            round: true,
          }
        );
        return interaction
          .reply({
            content: `You can claim your daily loot again in ${remainingTime}`,
            ephemeral: true,
          })
          .catch(console.error);
      }
    }

    let inventory = await PlayerInventory.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!inventory) {
      inventory = await initialize("inventory", member.id, guild.id);
    }

    const lootEmbed = new EmbedBuilder()
      .setAuthor({ name: "DAILY LOOT CRATE" })
      .setTitle(`${member.user.username} opened a loot crate!`)
      .setColor("#FFDF00")
      .setImage(
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5851f423-3ac3-4eef-88d5-2be0fc69382b/de3ayma-b38313b3-a404-4604-91e9-c7b9908f8ad1.png/v1/fill/w_1600,h_900,q_80,strp/jojo_stand_arrow_heads_by_mdwyer5_de3ayma-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6IlwvZlwvNTg1MWY0MjMtM2FjMy00ZWVmLTg4ZDUtMmJlMGZjNjkzODJiXC9kZTNheW1hLWIzODMxM2IzLWE0MDQtNDYwNC05MWU5LWM3Yjk5MDhmOGFkMS5wbmciLCJ3aWR0aCI6Ijw9MTYwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.y66dqY4BgvgJUSz2mCTRTKXmvoI5yxtf9yGNV349Ls0"
      )
      .setDescription("CONTACT DEVELOPER: LOOT EMBED ERROR");

    let arrowAmount;
    let discAmount;
    let fruitAmount;

    arrowAmount = 1;
    discAmount = Math.floor(Math.random() * 50);
    fruitAmount = Math.floor(Math.random() * 400);
    let sum = arrowAmount + discAmount + fruitAmount;

    console.log(`${arrowAmount}-${discAmount}-${fruitAmount}`);

    arrowAmount = Math.round((arrowAmount / sum) * 16);
    discAmount = Math.round((discAmount / sum) * 16);
    fruitAmount = Math.round((fruitAmount / sum) * 16);

    let rewardText = "";

    if (arrowAmount > 0) rewardText += `${arrowAmount}x Stand Arrow\n`;
    if (discAmount > 0) rewardText += `${discAmount}x Stand Disc\n`;
    if (fruitAmount > 0) rewardText += `${fruitAmount}x Rocacaca Fruit`;

    lootEmbed.setDescription(rewardText);

    await PlayerInventory.updateOne(
      { Guild: guild.id, User: member.id },
      {
        $set: {
          StandArrow: inventory.StandArrow + arrowAmount,
          StandDisc: inventory.StandDisc + discAmount,
          RocacacaFruit: inventory.RocacacaFruit + fruitAmount,
        },
      }
    );

    await Cooldowns.create({
      Guild: guild.id,
      User: member.id,
      Command: "dailyLoot",
      Cooldown: Date.now(),
    });

    await interaction.reply({ embeds: [lootEmbed] });
  },
};
