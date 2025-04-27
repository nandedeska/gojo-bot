const { EmbedBuilder, ActionRowBuilder } = require("discord.js");
const { DuelManager } = require("../Utility/DuelManager");
const PlayerInventory = require("../Schemas/PlayerInventory");

describe("DuelManager", () => {
  /*describe("init()", () => {
      let duelManager;
  
      beforeEach(() => {
        duelManager = new CombatHandler.DuelManager();
      });
    });*/

  describe("checkStandDeath()", () => {
    let duelManager;
    beforeEach(() => {
      duelManager = new DuelManager();
      duelManager.playerWinState = "ONGOING";
    });

    it("should set win state to ongoing when both players are above 0 hp", () => {
      duelManager.challengerHp = 50;
      duelManager.challengedHp = 50;

      duelManager.checkStandDeath();

      expect(duelManager.playerWinState).toBe("ONGOING");
    });

    it("should set win state to draw when both players have no hp", () => {
      duelManager.challengerHp = 0;
      duelManager.challengedHp = 0;

      duelManager.checkStandDeath();

      expect(duelManager.playerWinState).toBe("DRAW");
    });

    it("should set win state to challenged when challenger has no hp", () => {
      duelManager.challengerHp = 0;
      duelManager.challengedHp = 50;

      duelManager.checkStandDeath();

      expect(duelManager.playerWinState).toBe("CHALLENGED");
    });

    it("should set win state to challenger when challenged has no hp", () => {
      duelManager.challengerHp = 50;
      duelManager.challengedHp = 0;

      duelManager.checkStandDeath();

      expect(duelManager.playerWinState).toBe("CHALLENGER");
    });
  });

  describe("updateDisplay()", () => {
    let duelManager;
    let challengerStand;
    let challengedStand;

    beforeEach(() => {
      duelManager = new DuelManager();
      duelManager.challengerCooldownText = "";
      duelManager.challengedCooldownText = "";
      duelManager.fightEmbed = new EmbedBuilder();
    });

    describe("stands with only one ability", () => {
      beforeEach(() => {
        duelManager.challengerStand = { Ability: [{ cooldown: 5 }] };
        duelManager.challengedStand = { Ability: [{ cooldown: 3 }] };
      });

      it('should display "Ability Ready!" when challenger cooldown is over', () => {
        duelManager.challengerAbilityCount = [5];
        duelManager.challengedAbilityCount = [3];

        duelManager.updateDisplay();
        let result = duelManager.challengerCooldownText;

        expect(result).toBe("\nAbility Ready!");
      });

      it('should display "Ability Ready!" when challenged cooldown is over', () => {
        duelManager.challengerAbilityCount = [5];
        duelManager.challengedAbilityCount = [3];

        duelManager.updateDisplay();
        let result = duelManager.challengedCooldownText;

        expect(result).toBe("\nAbility Ready!");
      });

      it('should display "Ability Cooldown: x Turns" when challenger cooldown is active', () => {
        duelManager.challengerAbilityCount = [3];
        duelManager.challengedAbilityCount = [2];

        duelManager.updateDisplay();
        let result = duelManager.challengerCooldownText;

        expect(result).toBe("\nAbility Cooldown: 2 Turns");
      });

      it('should display "Ability Cooldown: x Turns" when challenged cooldown is active', () => {
        duelManager.challengerAbilityCount = [3];
        duelManager.challengedAbilityCount = [2];

        duelManager.updateDisplay();
        let result = duelManager.challengedCooldownText;

        expect(result).toBe("\nAbility Cooldown: 1 Turns");
      });
    });

    describe("stands with more than one ability", () => {
      beforeEach(() => {
        duelManager.challengerStand = {
          Ability: [{ cooldown: 5 }, { cooldown: 7 }],
        };
        duelManager.challengedStand = {
          Ability: [{ cooldown: 3 }, { cooldown: 9 }, { cooldown: 4 }],
        };
      });

      it('should display "Ability Ready!" for all abilities when challenger cooldowns are over', () => {
        duelManager.challengerAbilityCount = [5, 7];
        duelManager.challengedAbilityCount = [3, 9, 4];

        duelManager.updateDisplay();
        let result = duelManager.challengerCooldownText;

        expect(result).toBe("\nAbility Ready!\nAbility Ready!");
      });

      it('should display "Ability Ready!" for all abilities when challenged cooldowns are over', () => {
        duelManager.challengerAbilityCount = [5, 7];
        duelManager.challengedAbilityCount = [3, 9, 4];

        duelManager.updateDisplay();
        let result = duelManager.challengedCooldownText;

        expect(result).toBe("\nAbility Ready!\nAbility Ready!\nAbility Ready!");
      });

      it('should display "Ability Cooldown: x Turns" when challenger cooldowns are active', () => {
        duelManager.challengerAbilityCount = [1, 1];
        duelManager.challengedAbilityCount = [2, 2, 2];

        duelManager.updateDisplay();
        let result = duelManager.challengerCooldownText;

        expect(result).toBe(
          "\nAbility Cooldown: 4 Turns\nAbility Cooldown: 6 Turns"
        );
      });

      it('should display "Ability Cooldown: x Turns" when challenged cooldowns are active', () => {
        duelManager.challengerAbilityCount = [1, 1];
        duelManager.challengedAbilityCount = [2, 2, 2];

        duelManager.updateDisplay();
        let result = duelManager.challengedCooldownText;

        expect(result).toBe(
          "\nAbility Cooldown: 1 Turns\nAbility Cooldown: 7 Turns\nAbility Cooldown: 2 Turns"
        );
      });

      it('should display both "Ability Ready!" and "Ability Cooldown: x Turns" when some challenger cooldowns are active', () => {
        duelManager.challengerAbilityCount = [5, 0];
        duelManager.challengedAbilityCount = [0, 3, 4];

        duelManager.updateDisplay();
        let result = duelManager.challengerCooldownText;

        expect(result).toBe("\nAbility Ready!\nAbility Cooldown: 7 Turns");
      });

      it('should display both "Ability Ready!" and "Ability Cooldown: x Turns" when some challenged cooldowns are active', () => {
        duelManager.challengerAbilityCount = [5, 0];
        duelManager.challengedAbilityCount = [0, 3, 4];

        duelManager.updateDisplay();
        let result = duelManager.challengedCooldownText;

        expect(result).toBe(
          "\nAbility Cooldown: 3 Turns\nAbility Cooldown: 6 Turns\nAbility Ready!"
        );
      });
    });
  });

  describe("updateAbilityUI()", () => {
    let duelManager;

    beforeEach(() => {
      duelManager = new DuelManager();
      duelManager.challenger = { id: "123" };
      duelManager.challenged = { id: "321" };
    });

    describe("when loading ability buttons", () => {
      beforeEach(() => {
        duelManager.challengerStand = {
          Ability: [{ cooldown: 5 }, { cooldown: 2 }],
        };
        duelManager.challengedStand = {
          Ability: [{ cooldown: 3 }],
        };
        duelManager.currentStand = duelManager.challengerStand;
        duelManager.otherStand = duelManager.challengedStand;
        duelManager.abilityButtons = new ActionRowBuilder();
      });

      it("should display faster stand's ability buttons when the duel starts", () => {
        duelManager.timeStopTurns = 0;
        duelManager.areAbilitiesInCooldown = [true, true];
        duelManager.challengerAbilityCount = Array(
          duelManager.challengerStand.Ability.length
        ).fill(0);

        duelManager.updateAbilityUI();
        let result = duelManager.abilityButtons.components.length;

        expect(result).toBe(2);
      });

      it("should display same stand's ability buttons when time is stopped", () => {
        duelManager.challengerAbilityCount = [0, 0];
        duelManager.challengedAbilityCount = [0];
        duelManager.timeStopTurns = 1;
        duelManager.areAbilitiesInCooldown = [true];

        duelManager.updateAbilityUI();
        let result = duelManager.abilityButtons.components.length;

        expect(result).toBe(2);
      });

      it("should display next stand's ability buttons otherwise", () => {
        duelManager.challengerAbilityCount = [0, 0];
        duelManager.challengedAbilityCount = [0];
        duelManager.timeStopTurns = 0;
        duelManager.areAbilitiesInCooldown = [true];
        duelManager.savedData = {};

        duelManager.updateAbilityUI();
        let result = duelManager.abilityButtons.components.length;

        expect(result).toBe(1);
      });
    });

    describe("when checking ability cooldowns", () => {
      beforeEach(() => {
        duelManager.challengerStand = { Ability: [{ cooldown: 5 }] };
        duelManager.challengedStand = { Ability: [{ cooldown: 3 }] };
        duelManager.areAbilitiesInCooldown = [null];
        duelManager.abilityButtons = new ActionRowBuilder();
        duelManager.timeStopTurns = 0;
        duelManager.savedData = {};
      });

      it("should disable ability button when challenger cooldown is active", () => {
        duelManager.currentStand = duelManager.challengedStand;
        duelManager.otherStand = duelManager.challengerStand;
        duelManager.challengerAbilityCount = [0];

        duelManager.updateAbilityUI();
        let result = duelManager.abilityButtons.components[0].data.disabled;

        expect(result).toBe(true);
      });

      it("should disable ability button when challenged cooldown is active", () => {
        duelManager.currentStand = duelManager.challengerStand;
        duelManager.otherStand = duelManager.challengedStand;
        duelManager.challengedAbilityCount = [0];

        duelManager.updateAbilityUI();
        let result = duelManager.abilityButtons.components[0].data.disabled;

        expect(result).toBe(true);
      });

      it("should enable ability button when challenger cooldown is over", () => {
        duelManager.currentStand = duelManager.challengedStand;
        duelManager.otherStand = duelManager.challengerStand;
        duelManager.challengerAbilityCount = [5];

        duelManager.updateAbilityUI();
        let result = duelManager.abilityButtons.components[0].data.disabled;

        expect(result).toBe(false);
      });

      it("should enable ability button when challenged cooldown is over", () => {
        duelManager.currentStand = duelManager.challengerStand;
        duelManager.otherStand = duelManager.challengedStand;
        duelManager.challengedAbilityCount = [3];

        duelManager.updateAbilityUI();
        let result = duelManager.abilityButtons.components[0].data.disabled;

        expect(result).toBe(false);
      });
    });
  });

  describe("updateAbilityCounts()", () => {
    let duelManager;

    beforeEach(() => {
      duelManager = new DuelManager();
      duelManager.challenger = { id: "123" };
      duelManager.challenged = { id: "321" };
      duelManager.challengerAbilityCount = [0, 0, 0];
      duelManager.challengedAbilityCount = [0, 0, 0];
      duelManager.savedData = {
        ChallengerAbilityCount: [1, 2, 3],
        ChallengedAbilityCount: [4, 5, 6],
      };
      duelManager.currentStand = { Ability: [0, 0, 0] };
    });

    it("should increment all challenger ability counts when no exception index is passed", () => {
      duelManager.currentPlayer = duelManager.challenger;
      duelManager.currentStand = {
        Ability: [{ id: "barrage" }, { id: "barrage" }, { id: "barrage" }],
      };
      duelManager.timeStopTurns = 0;

      duelManager.updateAbilityCounts();
      let result = duelManager.challengerAbilityCount;

      expect(result).toStrictEqual([2, 3, 4]);
    });

    it("should increment all challenged ability counts when no exception index is passed", () => {
      duelManager.currentPlayer = duelManager.challenged;
      duelManager.currentStand = {
        Ability: [{ id: "barrage" }, { id: "barrage" }, { id: "barrage" }],
      };
      duelManager.timeStopTurns = 0;

      duelManager.updateAbilityCounts();
      let result = duelManager.challengedAbilityCount;

      expect(result).toStrictEqual([5, 6, 7]);
    });

    it("should increment all challenger ability counts but reset one when an exception index is passed", () => {
      duelManager.currentPlayer = duelManager.challenger;
      duelManager.currentStand = {
        Ability: [{ id: "barrage" }, { id: "barrage" }, { id: "barrage" }],
      };
      duelManager.timeStopTurns = 0;

      duelManager.updateAbilityCounts(1);
      let result = duelManager.challengerAbilityCount;

      expect(result).toStrictEqual([2, 0, 4]);
    });

    it("should increment all challenged ability counts but reset one when an exception index is passed", () => {
      duelManager.currentPlayer = duelManager.challenged;
      duelManager.currentStand = {
        Ability: [{ id: "barrage" }, { id: "barrage" }, { id: "barrage" }],
      };
      duelManager.timeStopTurns = 0;

      duelManager.updateAbilityCounts(2);
      let result = duelManager.challengedAbilityCount;

      expect(result).toStrictEqual([5, 6, 0]);
    });

    it("should increment challenger time stop ability count when time is not stopped", () => {
      duelManager.currentPlayer = duelManager.challenger;
      duelManager.currentStand = {
        Ability: [
          { id: "barrage" },
          { id: "timestop", turns: 3 },
          { id: "barrage" },
        ],
      };
      duelManager.timeStopTurns = 0;

      duelManager.updateAbilityCounts();
      let result = duelManager.challengerAbilityCount;

      expect(result).toStrictEqual([2, 3, 4]);
    });

    it("should increment challenged time stop ability count when time is not stopped", () => {
      duelManager.currentPlayer = duelManager.challenged;
      duelManager.currentStand = {
        Ability: [
          { id: "barrage" },
          { id: "barrage" },
          { id: "timestop", turns: 3 },
        ],
      };
      duelManager.timeStopTurns = 0;

      duelManager.updateAbilityCounts();
      let result = duelManager.challengedAbilityCount;

      expect(result).toStrictEqual([5, 6, 7]);
    });

    it("should set challenger time stop ability count below zero when time stop is used", () => {
      duelManager.currentPlayer = duelManager.challenger;
      duelManager.currentStand = {
        Ability: [
          { id: "barrage" },
          { id: "timestop", turns: 3 },
          { id: "barrage" },
        ],
      };
      duelManager.timeStopTurns = 1;

      duelManager.updateAbilityCounts(1);
      let result = duelManager.challengerAbilityCount;

      expect(result).toStrictEqual([2, -3, 4]);
    });

    it("should set challenged time stop ability count below zero when time stop is used", () => {
      duelManager.currentPlayer = duelManager.challenged;
      duelManager.currentStand = {
        Ability: [
          { id: "barrage" },
          { id: "barrage" },
          { id: "timestop", turns: 4 },
        ],
      };
      duelManager.timeStopTurns = 1;

      duelManager.updateAbilityCounts(2);
      let result = duelManager.challengedAbilityCount;

      expect(result).toStrictEqual([5, 6, -4]);
    });
  });

  describe("giveRewards()", () => {
    let duelManager;

    beforeEach(() => {
      duelManager = new DuelManager();
      duelManager.challenger = { id: "123" };
      duelManager.challenged = { id: "321" };
      duelManager.rewardEmbed = new EmbedBuilder().setDescription(
        "CONTACT DEVELOPER: REWARD EMBED ERROR"
      );

      jest
        .spyOn(PlayerInventory, "findOne")
        .mockReturnValue({ StandArrow: 0, StandDisc: 0, RocacacaFruit: 0 });
      jest.spyOn(duelManager, "updateSchema").mockImplementation();
      jest.spyOn(console, "log").mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should change embed description to reward text when challenger gets reward", async () => {
      jest.spyOn(Math, "random").mockReturnValue(0);
      duelManager.playerWinState = "CHALLENGER";

      await duelManager.giveRewards();

      expect(duelManager.rewardEmbed.data.description).toBe("8x Stand Arrow\n");
    });

    it("should change embed description to reward text when challenged gets reward", async () => {
      jest.spyOn(Math, "random").mockReturnValue(0);
      duelManager.playerWinState = "CHALLENGED";

      await duelManager.giveRewards();

      expect(duelManager.rewardEmbed.data.description).toBe("8x Stand Arrow\n");
    });
  });
});
