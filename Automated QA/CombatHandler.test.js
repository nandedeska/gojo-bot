const { EmbedBuilder } = require("discord.js");
const CombatHandler = require("../Utility/CombatHandler");

describe("CombatHandler", () => {
  describe("setCooldownText()", () => {
    it('should return "Ability Ready!" when cooldown is over', () => {
      let result = CombatHandler.setCooldownText(5, 5);

      expect(result).toBe("\nAbility Ready!");
    });

    it("should return cooldown turns when cooldown is active", () => {
      let result = CombatHandler.setCooldownText(0, 5);

      expect(result).toBe("\nAbility Cooldown: 5 Turns");
    });
  });

  describe("setTurnText()", () => {
    let turnEmbed;
    let stand;

    beforeEach(() => {
      turnEmbed = new EmbedBuilder();
      stand = { Name: "TEST" };
    });

    it("should set turn text to glitched text when player is confused", () => {
      let generateGlitchedText = jest
        .spyOn(CombatHandler, "generateGlitchedText")
        .mockReturnValue("GLITCHED TEXT");

      CombatHandler.setTurnText(turnEmbed, "ATTACK", stand, {
        abilityText: "",
        isConfused: true,
      });

      expect(generateGlitchedText).toHaveBeenCalledTimes(1);

      generateGlitchedText.mockRestore();
    });

    it("should set turn text to ability text when ability is used", () => {
      CombatHandler.setTurnText(turnEmbed, "ABILITY", stand, {
        abilityText: "ABILITY USED",
      });

      expect(turnEmbed.data.title).toBe("ABILITY USED");
    });

    it("should set turn text to attack text when attacking", () => {
      CombatHandler.setTurnText(turnEmbed, "ATTACK", stand, {
        damage: 20,
      });

      expect(turnEmbed.data.title).toBe(
        "TEST's attack hits! It deals 20 damage."
      );
    });

    it("should set turn text to dodge text when dodging", () => {
      CombatHandler.setTurnText(turnEmbed, "DODGE", stand);

      expect(turnEmbed.data.title).toBe("TEST prepares to dodge!");
    });

    it("should set turn text to miss text when attack misses", () => {
      CombatHandler.setTurnText(turnEmbed, "MISS", stand);

      expect(turnEmbed.data.title).toBe("TEST misses!");
    });

    it('should set turn text to "INVALID" otherwise', () => {
      CombatHandler.setTurnText(turnEmbed, "NOTHING", stand);

      expect(turnEmbed.data.title).toBe("INVALID");
    });
  });

  describe("tryAttack()", () => {
    let attackingStand;
    let defendingStand;
    let defenseModifier;

    beforeEach(() => {
      attackingStand = { Speed: 50 };
      defendingStand = { Defense: 25 };
      defenseModifier = 2;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should return true when attack roll is higher than or equal to enemy defense", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.45);

      let result = CombatHandler.tryAttack(
        attackingStand,
        defendingStand,
        defenseModifier,
        100
      );

      expect(result).toBe(true);
    });

    it("should return false when attack roll is lower than enemy defense", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.1);

      let result = CombatHandler.tryAttack(
        attackingStand,
        defendingStand,
        defenseModifier,
        100
      );

      expect(result).toBe(false);
    });
  });
});
