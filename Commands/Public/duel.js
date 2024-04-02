const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const StandStats = require("../../Schemas/StandStats");
const HumanizeDuration = require("humanize-duration");
const Cooldowns = require("../../Schemas/Cooldowns");
const CooldownTime = 120000;
const PlayerBooleans = require("../../Schemas/PlayerBooleans");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("duel")
    .setDescription("Duel another player.")
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("membername")
        .setDescription("The player to duel.")
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member, options } = interaction;

    //#region Prepare duel
    const challengedPlayer = options.getUser("membername");

    // Get player booleans
    let booleans = await PlayerBooleans.findOne({
      Guild: guild.id,
      User: member.id,
    });

    let challengedBooleans = await PlayerBooleans.findOne({
      Guild: guild.id,
      User: challengedPlayer.id,
    });

    let isInDuel;
    let isInviting;
    let isTrading;
    let challengedIsInDuel;
    let challengedIsInviting;
    let challengedIsTrading;

    if (!booleans) {
      booleans = await PlayerBooleans.create({
        Guild: guild.id,
        User: member.id,
        IsDueling: false,
        IsInvitingToDuel: false,
        IsTrading: false,
      });
    }

    if (!challengedBooleans)
      challengedBooleans = await PlayerBooleans.create({
        Guild: guild.id,
        User: challengedPlayer.id,
        IsDueling: false,
        IsInvitingToDuel: false,
        IsTrading: false,
      });

    isInDuel = booleans.IsDueling;
    isInviting = booleans.IsInvitingToDuel;
    isTrading = booleans.IsTrading;
    challengedIsInDuel = challengedBooleans.IsDueling;
    challengedIsInviting = challengedBooleans.IsInvitingToDuel;
    challengedIsTrading = challengedBooleans.IsTrading;

    // Check if player is already in a duel
    if (isInDuel)
      return interaction.reply({
        content: "You are already in a duel!",
        ephemeral: true,
      });

    // Check if player is already inviting
    if (isInviting)
      return interaction.reply({
        content: "You are already inviting a player!",
        ephemeral: true,
      });

    // Check if challenged player is inviting
    if (challengedIsInviting)
      return interaction.reply({
        content: `${challengedPlayer.username} is already inviting a player!`,
        ephemeral: true,
      });

    // Check if challenged player is already in a duel
    if (challengedIsInDuel)
      return interaction.reply({
        content: `${challengedPlayer.username} is already in a duel!`,
        ephemeral: true,
      });

    if (isTrading)
      return interaction.reply({
        content: "You cannot duel while trading!",
        ephemeral: true,
      });

    if (challengedIsTrading)
      return interaction.reply({
        content: `${challengedPlayer.username} is trading!`,
        ephemeral: true,
      });

    // Check if challenger is in cooldown
    const challengerCooldown = await Cooldowns.findOne({
      Guild: guild.id,
      User: member.id,
      Command: "duel",
    });

    if (challengerCooldown) {
      if (Date.now() - challengerCooldown.Cooldown >= CooldownTime)
        await Cooldowns.findOneAndDelete({
          Guild: guild.id,
          User: member.id,
          Command: "duel",
        });
      else {
        const remainingTime = HumanizeDuration(
          challengerCooldown.Cooldown + CooldownTime - Date.now(),
          {
            largest: 2,
            round: true,
          }
        );
        return interaction
          .reply({
            content: `You can duel again in ${remainingTime}.`,
            ephemeral: true,
          })
          .catch(console.error);
      }
    }

    // Check if challenged player is in cooldown
    const challengedCooldown = await Cooldowns.findOne({
      Guild: guild.id,
      User: challengedPlayer.id,
      Command: "duel",
    });

    if (challengedCooldown) {
      if (Date.now() - challengedCooldown.Cooldown >= CooldownTime)
        await Cooldowns.findOneAndDelete({
          Guild: guild.id,
          User: challengedPlayer.id,
          Command: "duel",
        });
      else {
        const remainingTime = HumanizeDuration(
          challengedCooldown.Cooldown + CooldownTime - Date.now(),
          {
            largest: 2,
            round: true,
          }
        );
        return interaction
          .reply({
            content: `${challengedPlayer.username} cannot duel right now. They can duel again in ${remainingTime}.`,
            ephemeral: true,
          })
          .catch(console.error);
      }
    }

    // Get challenger's stand
    const challengerStand = await StandStats.findOne({
      Guild: guild.id,
      User: member.id,
    });

    // Check if challenger has an active stand
    if (!challengerStand)
      return interaction.reply({
        content:
          "You don't have an active stand! Unlock a stand with /unlockstand or insert a stand from a disc with /insertstand.",
        ephemeral: true,
      });

    // Check if challenged == challenger
    if (challengedPlayer.id == member.id)
      return interaction.reply({
        content: "You cannot duel yourself!",
        ephemeral: true,
      });

    // Check if challenged == bot
    if (challengedPlayer.bot)
      return interaction.reply({
        content: "You cannot duel a bot!",
        ephemeral: true,
      });

    // Get challenged player's stand
    const challengedStand = await StandStats.findOne({
      Guild: guild.id,
      User: challengedPlayer.id,
    });

    // Check if challenged player has an active stand
    if (!challengedStand)
      return interaction.reply({
        content: `${challengedPlayer.username} doesn't have an active stand!`,
        ephemeral: true,
      });
    //#endregion

    const inviteEmbed = new EmbedBuilder()
      .setTitle(`${member.user.username} is challenging you to a duel!`)
      .setAuthor({ name: "DUEL CHALLENGE" })
      .setDescription("You have one minute to accept the duel.")
      .setColor("#D31A38")
      .setImage(
        "https://i.kym-cdn.com/photos/images/newsfeed/001/466/335/9cf.png"
      );

    const inviteMessage = await interaction.reply({
      content: `<@${challengedPlayer.id}>`,
      embeds: [inviteEmbed],
      fetchReply: true,
    });

    const inviteButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Accept")
        .setCustomId(
          `Duel-Accept-${guild.id}-${member.id}-${challengedPlayer.id}`
        )
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setLabel("Decline")
        .setCustomId(
          `Duel-Decline-${guild.id}-${member.id}-${challengedPlayer.id}`
        )
        .setStyle(ButtonStyle.Danger)
    );

    interaction.editReply({ components: [inviteButtons] });

    await PlayerBooleans.updateOne(
      { Guild: guild.id, User: member.id },
      { $set: { IsInvitingToDuel: true } }
    );

    setTimeout(async () => {
      if (isInDuel) return;
      if (inviteMessage.embeds[0].data !== inviteEmbed.data) return;
      console.log(inviteMessage.embeds[0].data);
      console.log(inviteEmbed.data);
      await PlayerBooleans.updateOne(
        { Guild: guild.id, User: member.id },
        { $set: { IsInvitingToDuel: false } }
      );
      inviteEmbed.data.author.name = "DUEL CHALLENGE EXPIRED";
      interaction.editReply({ embeds: [inviteEmbed], components: [] });
    }, 60000);
  },
};
