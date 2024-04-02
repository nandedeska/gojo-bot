const { ButtonInteraction, EmbedBuilder, Client } = require("discord.js");
const PlayerInventory = require("../../Schemas/PlayerInventory");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");
const TradeInfo = require("../../Schemas/TradeInfo");
const DiscCollection = require("../../Schemas/PlayerDiscCollection");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} buttonInteract
   * @param {Client} client
   */
  async execute(buttonInteract, client) {
    // Check if interaction is a button
    if (!buttonInteract.isButton()) return;

    // Split custom id
    const splitArray = buttonInteract.customId.split("-");
    if (splitArray[0] !== "Trade") return;
    const guildId = splitArray[2];

    if (buttonInteract.user.id !== splitArray[3])
      return buttonInteract.deferUpdate().catch(console.error);

    const tradeInfo = await TradeInfo.findOne({
      Guild: guildId,
      Trader: splitArray[3],
    });

    const traderInventory = await PlayerInventory.findOne({
      Guild: guildId,
      User: splitArray[3],
    });

    if (!traderInventory)
      return buttonInteract.reply({
        content: `There was an error fetching a trader's inventory! Contact the developer.`,
      });

    const requestedTraderInventory = await PlayerInventory.findOne({
      Guild: guildId,
      User: splitArray[4],
    });

    if (!requestedTraderInventory)
      return buttonInteract.reply({
        content: `There was an error fetching a trader's inventory! Contact the developer.`,
      });

    switch (splitArray[1]) {
      case "Accept":
        const discNumber = tradeInfo.TradeOffer[0] || "not found";
        const arrowAmount = tradeInfo.TradeOffer[1] || 0;
        const discAmount = tradeInfo.TradeOffer[2] || 0;
        const fruitAmount = tradeInfo.TradeOffer[3] || 0;
        const pjcookingAmount = tradeInfo.TradeOffer[4] || 0;

        const secondDiscNumber = tradeInfo.SecondTradeOffer[0] || "not found";
        const secondArrowAmount = tradeInfo.SecondTradeOffer[1] || 0;
        const secondDiscAmount = tradeInfo.SecondTradeOffer[2] || 0;
        const secondFruitAmount = tradeInfo.SecondTradeOffer[3] || 0;
        const secondPjcookingAmount = tradeInfo.SecondTradeOffer[4] || 0;

        await PlayerInventory.updateOne(
          { Guild: guildId, User: splitArray[3] },
          {
            $set: {
              StandArrow:
                traderInventory.StandArrow - arrowAmount + secondArrowAmount,
              StandDisc:
                traderInventory.StandDisc - discAmount + secondDiscAmount,
              RocacacaFruit:
                traderInventory.RocacacaFruit - fruitAmount + secondFruitAmount,
              PJCooking:
                traderInventory.PJCooking -
                pjcookingAmount +
                secondPjcookingAmount,
            },
          }
        );

        await PlayerInventory.updateOne(
          { Guild: guildId, User: splitArray[4] },
          {
            $set: {
              StandArrow:
                requestedTraderInventory.StandArrow -
                secondArrowAmount +
                arrowAmount,
              StandDisc:
                requestedTraderInventory.StandDisc -
                secondDiscAmount +
                discAmount,
              RocacacaFruit:
                requestedTraderInventory.RocacacaFruit -
                secondFruitAmount +
                fruitAmount,
              PJCooking:
                requestedTraderInventory.PJCooking -
                secondPjcookingAmount +
                pjcookingAmount,
            },
          }
        );

        let traderDiscCollection = await DiscCollection.findOne({
          Guild: guildId,
          User: splitArray[3],
        });

        let requestedTraderDiscCollection = await DiscCollection.findOne({
          Guild: guildId,
          User: splitArray[4],
        });

        if (discNumber !== "not found") {
          if (!requestedTraderDiscCollection) {
            await DiscCollection.create({
              Guild: guildId,
              User: splitArray[4],
              Discs: [traderDiscCollection.Discs[discNumber - 1]],
            });
          } else
            requestedTraderDiscCollection.Discs.push(
              traderDiscCollection.Discs[discNumber - 1]
            ) && (await requestedTraderDiscCollection.save());

          traderDiscCollection.Discs.splice(discNumber - 1, 1) &&
            (await traderDiscCollection.save());
        }

        if (secondDiscNumber !== "not found") {
          if (!traderDiscCollection) {
            await DiscCollection.create({
              Guild: guildId,
              User: splitArray[3],
              Discs: [
                requestedTraderDiscCollection.Discs[secondDiscNumber - 1],
              ],
            });
          } else
            traderDiscCollection.Discs.push(
              requestedTraderDiscCollection.Discs[secondDiscNumber - 1]
            ) && (await traderDiscCollection.save());

          requestedTraderDiscCollection.Discs.splice(secondDiscNumber - 1, 1) &&
            (await requestedTraderDiscCollection.save());
        }

        buttonInteract.reply({
          content: "Trade was successful!",
        });
        break;
      case "Decline":
        buttonInteract.reply({
          content: `<@${splitArray[3]}> declined the trade offer.`,
        });
        break;
    }

    await PlayerBooleans.updateOne(
      { Guild: guildId, User: splitArray[3] },
      { $set: { IsTrading: false } }
    );

    await PlayerBooleans.updateOne(
      { Guild: guildId, User: splitArray[4] },
      { $set: { IsTrading: false } }
    );

    await TradeInfo.deleteOne({ Guild: guildId, Trader: splitArray[3] });

    let channel = client.channels.cache.get(buttonInteract.channelId);
    let message = await channel.messages.fetch(splitArray[5]);
    return message.edit({ content: "Trade is over!", components: [] });
  },
};
