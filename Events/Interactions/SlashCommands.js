const { ChatInputCommandInteraction } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        content: "This command does not exist!",
        ephemeral: true,
      });
    if (command.developer && interaction.user.id !== "489726179503374336")
      return interaction.reply({
        content: "You do not have permission to use developer commands!",
        ephemeral: true,
      });

    const subCommand = interaction.options.getSubcommand(false);
    if (subCommand) {
      const subCommandFile = client.subCommands.get(
        `${interaction.commandName}.${subCommand}`
      );
      if (!subCommandFile)
        return interaction.reply({
          content: "This subcommand is no longer supported.",
          ephemeral: true,
        });

      subCommandFile.execute(interaction, client);
    } else command.execute(interaction, client);
  },
};
