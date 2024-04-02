const { ButtonInteraction, EmbedBuilder } = require("discord.js");
const DiscCollection = require("../../Schemas/PlayerDiscCollection");

module.exports = {
  name: "interactionCreate",
  /**
   *=
   * @param {ButtonInteraction} buttonInteract
   * @returns
   */
  async execute(buttonInteract) {
    // Check if interaction is a button
    if (!buttonInteract.isButton()) return;

    // Split custom id
    const splitArray = buttonInteract.customId.split("-");
    if (splitArray[0] !== "Discs") return;

    //if (buttonInteract.user.id !== splitArray[3]) return;

    const discEmbed = buttonInteract.message.embeds[0];
    if (!discEmbed)
      return buttonInteract.reply({
        content:
          "Error found: Unable to find disc embed. Contact the developer.",
        ephemeral: true,
      });

    const collection = await DiscCollection.findOne({
      Guild: splitArray[2],
      User: splitArray[3],
    });

    const titleSplit = discEmbed.author.name.split("#");

    let discIndex = parseInt(titleSplit[titleSplit.length - 1]) - 1;

    let healthpointsField = discEmbed.fields[0];
    let attackField = discEmbed.fields[1];
    let defenseField = discEmbed.fields[2];
    let speedField = discEmbed.fields[3];

    const discs = collection.Discs;
    //console.log(discIndex);

    switch (splitArray[1]) {
      case "Left":
        discIndex = discIndex - 1 < 0 ? discs.length - 1 : discIndex - 1;
        break;
      case "Right":
        discIndex = discIndex + 1 >= discs.length ? 0 : discIndex + 1;
        break;
    }

    var stand = discs[discIndex];

    const ability = stand.Ability[0];

    let abilityText = `*${ability.name}*\n${ability.description}\n`;

    if (ability.damage) abilityText += `\nPower: ${ability.damage}`;
    if (ability.power) abilityText += `\nPower: ${ability.power}`;

    abilityText += `\nCooldown: ${ability.cooldown}`;

    var newEmbed = new EmbedBuilder()
      .setTitle(stand.Name)
      .setColor("#202020")
      .setAuthor({ name: `${splitArray[4]}'s Disc #${discIndex + 1}` })
      .setImage(
        "https://static.wikia.nocookie.net/jjba/images/2/24/Stand_Discs.png/revision/latest?cb=20191103214745"
      )
      .addFields(
        {
          name: "Healthpoints",
          value: `${stand.Healthpoints}`,
        },
        {
          name: "Attack",
          value: `${stand.Attack}`,
        },
        {
          name: "Defense",
          value: `${stand.Defense}`,
        },
        {
          name: "Speed",
          value: `${stand.Speed}`,
        },
        { name: "Ability", value: abilityText }
      );
    await buttonInteract.update({ embeds: [newEmbed] });
  },
};
