const { ButtonInteraction, EmbedBuilder } = require("discord.js");
const PatchNotes = require("../../Commands/Public/patchNotes");

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
    if (splitArray[0] !== "Patch") return;

    let patchNotes = Object.keys(PatchNotes.patchNotes).map(
      (key) => PatchNotes.patchNotes[key]
    );

    let versionNumbers = Object.keys(PatchNotes.patchNotes).map((key) => key);

    //console.log(versionNumbers);

    const patchEmbed = buttonInteract.message.embeds[0];
    if (!patchEmbed)
      return buttonInteract.reply({
        content:
          "Error found: Unable to find patch notes embed. Contact the developer.",
        ephemeral: true,
      });

    const titleSplit = patchEmbed.title.split("v");
    //console.log(titleSplit[titleSplit.length - 1]);
    //console.log(versionNumbers.indexOf(titleSplit[titleSplit.length - 1]));

    let patchIndex = versionNumbers.indexOf(titleSplit[titleSplit.length - 1]);

    switch (splitArray[1]) {
      case "Left":
        patchIndex =
          patchIndex - 1 < 0 ? patchNotes.length - 1 : patchIndex - 1;
        break;
      case "Right":
        patchIndex = patchIndex + 1 >= patchNotes.length ? 0 : patchIndex + 1;
        break;
    }

    let version = versionNumbers[patchIndex];
    let update = patchNotes[patchIndex];

    var newEmbed = new EmbedBuilder()
      .setAuthor({ name: `PATCH NOTES` })
      .setTitle(`v${version}`)
      .setDescription(update.notes)
      .setColor("#FFFFFF");

    await buttonInteract.update({ embeds: [newEmbed] });
  },
};
