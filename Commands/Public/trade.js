const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const PlayerInventory = require("../../Schemas/PlayerInventory");
const DiscCollection = require("../../Schemas/PlayerDiscCollection");
const TradeInfo = require("../../Schemas/TradeInfo");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trade")
    .setDescription("Trade with another player.")
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("membername")
        .setDescription("The player to trade with.")
        .setRequired(true)
    )
    .addIntegerOption((options) =>
      options
        .setName("standarrow")
        .setDescription("The amount of Stand Arrows to trade.")
        .setMinValue(1)
    )
    .addIntegerOption((options) =>
      options
        .setName("standdisc")
        .setDescription("The amount of Stand Discs to trade.")
        .setMinValue(1)
    )
    .addIntegerOption((options) =>
      options
        .setName("rocacacafruit")
        .setDescription("The amount of Rocacaca Fruit to trade.")
        .setMinValue(1)
    )
    .addIntegerOption((options) =>
      options
        .setName("pearljamcooking")
        .setDescription("The amount of Pearl Jam's Cooking to trade.")
        .setMinValue(1)
    )
    .addIntegerOption((options) =>
      options
        .setName("discnumber")
        .setDescription("The number of the Stand (stored in disc) to trade.")
        .setMinValue(1)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    const { guild, member, options } = interaction;

    let requestedMember = options.getUser("membername");

    if (requestedMember.id == member.id)
      return interaction.reply({
        content: "You can't trade with yourself!",
        ephemeral: true,
      });

    if (requestedMember.bot)
      return interaction.reply({
        content: "You can't trade with a bot!",
        ephemeral: true,
      });

    const booleans = await PlayerBooleans.findOne({
      Guild: guild.id,
      User: member.id,
    });

    const isTrading = booleans.IsTrading;
    const isDueling = booleans.IsDueling;

    if (isTrading)
      return interaction.reply({
        content: "You are already trading!",
        ephemeral: true,
      });

    if (isDueling)
      return interaction.reply({
        content: "You can't trade while dueling!",
        ephemeral: true,
      });

    let traderInventory = await PlayerInventory.findOne({
      Guild: guild.id,
      User: member.id,
    });

    if (!traderInventory) {
      traderInventory = await PlayerInventory.create({
        Guild: guild.id,
        User: member.id,
        StandArrow: 2,
        StandDisc: 0,
        RocacacaFruit: 0,
        PJCooking: 0,
      });
    }

    let traderOfferText = "";
    let arrowAmount = options.getInteger("standarrow");
    let discAmount = options.getInteger("standdisc");
    let fruitAmount = options.getInteger("rocacacafruit");
    let pjcookingAmount = options.getInteger("pearljamcooking");
    let discNumber = options.getInteger("discnumber");

    let traderStand;

    if (arrowAmount > 0) {
      if (arrowAmount > traderInventory.StandArrow)
        return interaction.reply({
          content: `You don't have ${arrowAmount} Stand Arrows!`,
          ephemeral: true,
        });
      traderOfferText += `${arrowAmount}x Stand Arrow\n`;
    }
    if (discAmount > 0) {
      if (discAmount > traderInventory.StandDisc)
        return interaction.reply({
          content: `You don't have ${discAmount} Stand Discs!`,
          ephemeral: true,
        });
      traderOfferText += `${discAmount}x Stand Disc\n`;
    }
    if (fruitAmount > 0) {
      if (fruitAmount > traderInventory.RocacacaFruit)
        return interaction.reply({
          content: `You don't have ${arrowAmount} Rocacaca Fruits!`,
          ephemeral: true,
        });
      traderOfferText += `${fruitAmount}x Rocacaca Fruit\n`;
    }
    if (pjcookingAmount > 0) {
      if (pjcookingAmount > traderInventory.PJCooking)
        return interaction.reply({
          content: `You don't have ${pjcookingAmount} Pearl Jam's Cooking!`,
          ephemeral: true,
        });
      traderOfferText += `${pjcookingAmount}x Pearl Jam's Cooking\n`;
    }
    if (discNumber > 0) {
      let traderDiscCollection = await DiscCollection.findOne({
        Guild: guild.id,
        User: member.id,
      });

      if (!traderDiscCollection)
        return interaction.reply({
          content: "You don't have any stored discs!",
          ephemeral: true,
        });

      traderStand = traderDiscCollection.Discs[discNumber - 1];

      if (!traderStand)
        return interaction.reply({
          content: `Disc #${discNumber} doesn't exist!`,
          ephemeral: true,
        });

      traderOfferText += `\n**Stand Offer:** \n${traderStand.Name}\nHealthpoints: ${traderStand.Healthpoints}\nAttack: ${traderStand.Attack}\nDefense: ${traderStand.Defense}\nSpeed: ${traderStand.Speed}\nAbility: ${traderStand.Ability.name}`;
    }

    if (traderOfferText == "") traderOfferText = "Nothing.";

    let requestedTrader = await TradeInfo.findOne({
      Guild: guild.id,
      Trader: requestedMember.id,
    });

    let tradeEmbed;
    let tradeReply;

    if (requestedTrader) {
      requestedTraderOffer = requestedTrader.TradeOffer;
      let requestedTraderOfferText = "";

      if (requestedTraderOffer[1] > 0) {
        requestedTraderOfferText += `${requestedTraderOffer[1]}x Stand Arrow\n`;
      }
      if (requestedTraderOffer[2] > 0) {
        requestedTraderOfferText += `${requestedTraderOffer[2]}x Stand Disc\n`;
      }
      if (requestedTraderOffer[3] > 0) {
        requestedTraderOfferText += `${requestedTraderOffer[3]}x Rocacaca Fruit\n`;
      }
      if (requestedTraderOffer[4] > 0) {
        requestedTraderOfferText += `${requestedTraderOffer[4]}x Pearl Jam's Cooking\n`;
      }

      if (requestedTraderOffer[0]) {
        let requestedTraderDiscCollection = await DiscCollection.findOne({
          Guild: guild.id,
          User: requestedMember.id,
        });

        if (requestedTraderDiscCollection) {
          let requestedTraderStand =
            requestedTraderDiscCollection.Discs[requestedTraderOffer[0] - 1];

          requestedTraderOfferText += `\n**Stand Offer:** \n${requestedTraderStand.Name}\nHealthpoints: ${requestedTraderStand.Healthpoints}\nAttack: ${requestedTraderStand.Attack}\nDefense: ${requestedTraderStand.Defense}\nSpeed: ${requestedTraderStand.Speed}\nAbility: ${requestedTraderStand.Ability.name}`;
        }
      }

      if (requestedTraderOfferText == "") requestedTraderOfferText = "Nothing.";

      tradeEmbed = new EmbedBuilder()
        .setAuthor({
          name: `TRADE: ${requestedMember.username} and ${member.user.username}`,
        })
        .setTitle(`${member.user.username} has an offer!`)
        .setImage(
          "https://cdn.discordapp.com/attachments/675612229676040192/1091919872386142228/image.png"
        )
        .addFields(
          {
            name: `${requestedMember.username}'s Offer`,
            value: requestedTraderOfferText,
            inline: true,
          },
          {
            name: `${member.user.username}'s Offer`,
            value: traderOfferText,
            inline: true,
          }
        );

      await TradeInfo.updateOne(
        {
          Guild: guild.id,
          Trader: requestedMember.id,
        },
        {
          $set: {
            SecondTradeOffer: [
              discNumber,
              arrowAmount,
              discAmount,
              fruitAmount,
              pjcookingAmount,
            ],
          },
        }
      );

      tradeReply = await interaction.reply({
        content: `<@${requestedMember.id}>`,
        embeds: [tradeEmbed],
        fetchReply: true,
      });

      const tradeButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Accept")
          .setCustomId(
            `Trade-Accept-${guild.id}-${requestedMember.id}-${member.id}-${tradeReply.id}`
          )
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setLabel("Decline")
          .setCustomId(
            `Trade-Decline-${guild.id}-${requestedMember.id}-${member.id}-${tradeReply.id}`
          )
          .setStyle(ButtonStyle.Danger)
      );

      tradeReply = interaction.editReply({ components: [tradeButtons] });
    } else {
      await TradeInfo.create({
        Guild: guild.id,
        Trader: member.id,
        TradeOffer: [
          discNumber,
          arrowAmount,
          discAmount,
          fruitAmount,
          pjcookingAmount,
        ],
      });

      tradeEmbed = new EmbedBuilder()
        .setAuthor({ name: "TRADE OFFER" })
        .setTitle(`${member.user.username} wants to trade!`)
        .setImage(
          "https://cdn.discordapp.com/attachments/675612229676040192/1091919872386142228/image.png"
        )
        .addFields({
          name: `${member.user.username}'s Offer`,
          value: traderOfferText,
        });

      tradeReply = interaction.reply({
        content: `<@${requestedMember.id}>`,
        embeds: [tradeEmbed],
      });
    }

    await PlayerBooleans.updateOne(
      { Guild: guild.id, User: member.id },
      { $set: { IsTrading: true } }
    );

    setTimeout(async () => {
      if (!tradeReply.embeds) return;
      if (!tradeReply.embeds.length) return;
      await PlayerBooleans.updateOne(
        { Guild: guild.id, User: member.id },
        { $set: { IsTrading: false } }
      );
      await PlayerBooleans.updateOne(
        { Guild: guild.id, User: requestedMember.id },
        { $set: { IsTrading: false } }
      );
      tradeEmbed.data.author.name = "TRADE EXPIRED";
      interaction.editReply({ embeds: [tradeEmbed], components: [] });
    }, 180000);
  },
};
