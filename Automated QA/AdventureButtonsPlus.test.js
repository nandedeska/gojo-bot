const AdventureButtons = require("../Events/Buttons/AdventureButtonsPlus");
const { AdventureManager } = require("../Utility/AdventureManager");
const Cooldowns = require("../Schemas/Cooldowns");
const PlayerBooleans = require("../Schemas/PlayerBooleans");
const { EmbedBuilder, ActionRowBuilder } = require("discord.js");

describe("AdventureButtons.js", () => {
  let adventureManager;
  let buttonInteract;

  beforeEach(() => {
    adventureManager = new AdventureManager();
    buttonInteract = { deferUpdate: jest.fn(), editReply: jest.fn() };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    buttonInteract.deferUpdate.mockRestore();
    buttonInteract.editReply.mockRestore();
  });

  describe("acceptAdventure", () => {
    beforeEach(() => {
      jest.spyOn(adventureManager, "updateAbilityUI").mockImplementation();
      jest.spyOn(adventureManager, "updateDisplay").mockImplementation();
      jest.spyOn(buttonInteract, "deferUpdate").mockImplementation();
      jest.spyOn(Cooldowns, "findOne").mockImplementation();

      adventureManager.player = { id: "123" };
      adventureManager.guildId = "963";
    });

    it("should not accept when cooldown is still active", async () => {
      jest.spyOn(Cooldowns, "findOne").mockReturnValue({ Cooldown: 20000 });
      jest.spyOn(Date, "now").mockReturnValue(40000);
      let editReply = jest
        .spyOn(buttonInteract, "editReply")
        .mockImplementation();

      await AdventureButtons.acceptAdventure(buttonInteract, adventureManager);

      expect(editReply).toHaveBeenCalledWith({
        content: `You can go on an adventure again in 10 seconds.`,
        ephemeral: true,
      });
    });

    it("should not accept when player is already in an adventure", async () => {
      jest.spyOn(Cooldowns, "findOne").mockImplementation();
      jest
        .spyOn(PlayerBooleans, "findOne")
        .mockReturnValue({ IsAdventuring: true });
      let editReply = jest
        .spyOn(buttonInteract, "editReply")
        .mockImplementation();

      await AdventureButtons.acceptAdventure(buttonInteract, adventureManager);

      expect(editReply).toHaveBeenCalledWith({
        content: "You are already in an adventure!",
        ephemeral: true,
      });
    });

    it("should accept adventure otherwise", async () => {
      jest.spyOn(Cooldowns, "findOne").mockReturnValue();
      jest
        .spyOn(PlayerBooleans, "findOne")
        .mockReturnValue({ IsAdventuring: false });
      let editReply = jest
        .spyOn(buttonInteract, "editReply")
        .mockImplementation();

      await AdventureButtons.acceptAdventure(buttonInteract, adventureManager);

      expect(editReply).toHaveBeenCalledWith({
        content: null,
        embeds: [adventureManager.quoteEmbed, adventureManager.fightEmbed],
        components: [
          adventureManager.adventureButtons,
          adventureManager.abilityButtons,
        ],
      });
    });

    it("should delete cooldown from database when cooldown is over", async () => {
      jest.spyOn(Cooldowns, "findOne").mockReturnValue({ Cooldown: 20000 });
      jest.spyOn(Date, "now").mockReturnValue(50000);
      jest
        .spyOn(PlayerBooleans, "findOne")
        .mockReturnValue({ IsAdventuring: false });
      let findOneAndDelete = jest
        .spyOn(Cooldowns, "findOneAndDelete")
        .mockImplementation();

      await AdventureButtons.acceptAdventure(buttonInteract, adventureManager);

      expect(findOneAndDelete).toHaveBeenCalledTimes(1);
    });
  });
});
