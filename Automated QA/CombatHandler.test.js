const { EmbedBuilder, ActionRowBuilder } = require("discord.js");
const CombatHandler = require("../Utility/CombatHandler");
const { AdventureManager } = require("../Utility/AdventureManager");
const { DuelManager } = require("../Utility/DuelManager");

describe("AdventureManager", () => {
  let adventureManager;

  beforeEach(() => {
    adventureManager = new AdventureManager();
    adventureManager.player = { id: "123" };
    adventureManager.opponent = { id: "321" };
  });

  describe("botTurn()", () => {
    let attack;
    let dodge;

    beforeEach(() => {
      attack = jest.spyOn(adventureManager, "botAttack").mockImplementation();
      dodge = jest.spyOn(adventureManager, "botDodge").mockImplementation();
      jest.spyOn(adventureManager, "checkStandDeath").mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should not attack when an ability is used", async () => {
      jest.spyOn(Math, "random").mockImplementation(() => {
        return 0.5;
      });
      jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
        return true;
      });
      adventureManager.isMatchOver = false;

      await adventureManager.botTurn();

      expect(attack).not.toHaveBeenCalled();
    });

    it("should not attack when a stand has died from an ability", async () => {
      jest.spyOn(Math, "random").mockImplementation(() => {
        return 0.5;
      });
      jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
        return false;
      });
      adventureManager.isMatchOver = true;

      await adventureManager.botTurn();

      expect(attack).not.toHaveBeenCalled();
    });

    it("should attack when no abilities were used", async () => {
      jest.spyOn(Math, "random").mockImplementation(() => {
        return 0.5;
      });
      jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
        return false;
      });
      adventureManager.isMatchOver = false;

      await adventureManager.botTurn();

      expect(attack).toHaveBeenCalled();
    });

    it("should dodge when neither attacking nor using ability", async () => {
      jest.spyOn(Math, "random").mockImplementation(() => {
        return 0.8;
      });

      await adventureManager.botTurn();

      expect(dodge).toHaveBeenCalled();
    });
  });

  describe("checkStandDeath()", () => {
    it("should set win state to ongoing when player and opponent are above 0 hp", () => {
      adventureManager.playerHp = 50;
      adventureManager.opponentHp = 50;

      adventureManager.checkStandDeath();

      expect(adventureManager.playerWinState).toBe("ONGOING");
    });

    it("should set win state to draw when player and opponent have no hp", () => {
      adventureManager.playerHp = 0;
      adventureManager.opponentHp = 0;

      adventureManager.checkStandDeath();

      expect(adventureManager.playerWinState).toBe("DRAW");
    });

    it("should set win state to lose when player has no hp", () => {
      adventureManager.playerHp = 0;
      adventureManager.opponentHp = 50;

      adventureManager.checkStandDeath();

      expect(adventureManager.playerWinState).toBe("LOSE");
    });

    it("should set win state to win when opponent has no hp", () => {
      adventureManager.playerHp = 50;
      adventureManager.opponentHp = 0;

      adventureManager.checkStandDeath();

      expect(adventureManager.playerWinState).toBe("WIN");
    });
  });

  describe("updateDisplay()", () => {
    beforeEach(() => {
      adventureManager.playerCooldownText = "";
      adventureManager.opponentCooldownText = "";
      adventureManager.fightEmbed = new EmbedBuilder();
    });

    describe("stands with only one ability", () => {
      beforeEach(() => {
        adventureManager.playerStand = { Ability: [{ cooldown: 5 }] };
        adventureManager.opponentStand = { Ability: [{ cooldown: 3 }] };
      });

      it('should display "Ability Ready!" when player cooldown is over', () => {
        adventureManager.playerAbilityCount = [5];
        adventureManager.opponentAbilityCount = [3];

        adventureManager.updateDisplay();
        let result = adventureManager.playerCooldownText;

        expect(result).toBe("\nAbility Ready!");
      });

      it('should display "Ability Ready!" when opponent cooldown is over', () => {
        adventureManager.playerAbilityCount = [5];
        adventureManager.opponentAbilityCount = [3];

        adventureManager.updateDisplay();
        let result = adventureManager.opponentCooldownText;

        expect(result).toBe("\nAbility Ready!");
      });

      it('should display "Ability Cooldown: x Turns" when player cooldown is active', () => {
        adventureManager.playerAbilityCount = [3];
        adventureManager.opponentAbilityCount = [2];

        adventureManager.updateDisplay();
        let result = adventureManager.playerCooldownText;

        expect(result).toBe("\nAbility Cooldown: 2 Turns");
      });

      it('should display "Ability Cooldown: x Turns" when opponent cooldown is active', () => {
        adventureManager.playerAbilityCount = [3];
        adventureManager.opponentAbilityCount = [2];

        adventureManager.updateDisplay();
        let result = adventureManager.opponentCooldownText;

        expect(result).toBe("\nAbility Cooldown: 1 Turns");
      });
    });

    describe("stands with more than one ability", () => {
      beforeEach(() => {
        adventureManager.playerStand = {
          Ability: [{ cooldown: 5 }, { cooldown: 7 }],
        };
        adventureManager.opponentStand = {
          Ability: [{ cooldown: 3 }, { cooldown: 9 }, { cooldown: 4 }],
        };
      });

      it('should display "Ability Ready!" for all abilities when player cooldowns are over', () => {
        adventureManager.playerAbilityCount = [5, 7];
        adventureManager.opponentAbilityCount = [3, 9, 4];

        adventureManager.updateDisplay();
        let result = adventureManager.playerCooldownText;

        expect(result).toBe("\nAbility Ready!\nAbility Ready!");
      });

      it('should display "Ability Ready!" for all abilities when opponent cooldowns are over', () => {
        adventureManager.playerAbilityCount = [5, 7];
        adventureManager.opponentAbilityCount = [3, 9, 4];

        adventureManager.updateDisplay();
        let result = adventureManager.opponentCooldownText;

        expect(result).toBe("\nAbility Ready!\nAbility Ready!\nAbility Ready!");
      });

      it('should display "Ability Cooldown: x Turns" when player cooldowns are active', () => {
        adventureManager.playerAbilityCount = [1, 1];
        adventureManager.opponentAbilityCount = [2, 2, 2];

        adventureManager.updateDisplay();
        let result = adventureManager.playerCooldownText;

        expect(result).toBe(
          "\nAbility Cooldown: 4 Turns\nAbility Cooldown: 6 Turns"
        );
      });

      it('should display "Ability Cooldown: x Turns" when opponent cooldowns are active', () => {
        adventureManager.playerAbilityCount = [1, 1];
        adventureManager.opponentAbilityCount = [2, 2, 2];

        adventureManager.updateDisplay();
        let result = adventureManager.opponentCooldownText;

        expect(result).toBe(
          "\nAbility Cooldown: 1 Turns\nAbility Cooldown: 7 Turns\nAbility Cooldown: 2 Turns"
        );
      });

      it('should display both "Ability Ready!" and "Ability Cooldown: x Turns" when some player cooldowns are active', () => {
        adventureManager.playerAbilityCount = [5, 0];
        adventureManager.opponentAbilityCount = [0, 3, 4];

        adventureManager.updateDisplay();
        let result = adventureManager.playerCooldownText;

        expect(result).toBe("\nAbility Ready!\nAbility Cooldown: 7 Turns");
      });

      it('should display both "Ability Ready!" and "Ability Cooldown: x Turns" when some opponent cooldowns are active', () => {
        adventureManager.playerAbilityCount = [5, 0];
        adventureManager.opponentAbilityCount = [0, 3, 4];

        adventureManager.updateDisplay();
        let result = adventureManager.opponentCooldownText;

        expect(result).toBe(
          "\nAbility Cooldown: 3 Turns\nAbility Cooldown: 6 Turns\nAbility Ready!"
        );
      });
    });

    it("should display glitched text when player is confused", () => {
      adventureManager.playerStand = {
        Ability: [{ cooldown: 5 }, { cooldown: 7 }],
      };
      adventureManager.opponentStand = {
        Ability: [{ cooldown: 3 }, { cooldown: 9 }, { cooldown: 4 }],
      };
      adventureManager.playerAbilityCount = [5, 0];
      adventureManager.opponentAbilityCount = [0, 3, 4];
      adventureManager.isConfused = true;
      let generateText = jest
        .spyOn(CombatHandler, "generateGlitchedText")
        .mockImplementation();

      adventureManager.updateDisplay();

      expect(generateText).toHaveBeenCalledTimes(10);
    });
  });

  describe("updateAbilityUI()", () => {
    it("should display stand's ability buttons", () => {
      adventureManager.playerStand = {
        Ability: [{ cooldown: 5 }, { cooldown: 2 }],
      };
      adventureManager.abilityButtons = new ActionRowBuilder();
      adventureManager.areAbilitiesInCooldown = [true, false];
      adventureManager.playerAbilityCount = [0];

      adventureManager.updateAbilityUI();
      let result = adventureManager.abilityButtons.components.length;

      expect(result).toBe(2);
    });

    describe("when checking ability cooldowns", () => {
      beforeEach(() => {
        adventureManager.playerStand = { Ability: [{ cooldown: 5 }] };
        adventureManager.areAbilitiesInCooldown = [null];
        adventureManager.abilityButtons = new ActionRowBuilder();
      });

      it("should disable ability button when stand cooldown is active", () => {
        adventureManager.playerAbilityCount = [0];

        adventureManager.updateAbilityUI();
        let result =
          adventureManager.abilityButtons.components[0].data.disabled;

        expect(result).toBe(true);
      });

      it("should enable ability button when stand cooldown is over", () => {
        adventureManager.playerAbilityCount = [5];

        adventureManager.updateAbilityUI();
        let result =
          adventureManager.abilityButtons.components[0].data.disabled;

        expect(result).toBe(false);
      });
    });
  });

  describe("updateAbilityCounts()", () => {
    beforeEach(() => {
      adventureManager.playerAbilityCount = [0, 0, 0];
      adventureManager.opponentAbilityCount = [0, 0, 0];
      adventureManager.savedData = {
        PlayerAbilityCount: [1, 2, 3],
        OpponentAbilityCount: [4, 5, 6],
      };
    });

    it("should increment all player ability counts when no exception index is passed", () => {
      adventureManager.playerStand = {
        Ability: [{ id: "barrage" }, { id: "barrage" }, { id: "barrage" }],
      };
      adventureManager.timeStopTurns = 0;
      let stand = adventureManager.playerStand;

      adventureManager.updateAbilityCounts(stand);
      let result = adventureManager.playerAbilityCount;

      expect(result).toStrictEqual([2, 3, 4]);
    });

    it("should increment all opponent ability counts when no exception index is passed", () => {
      adventureManager.opponentStand = {
        Ability: [{ id: "barrage" }, { id: "barrage" }, { id: "barrage" }],
      };
      adventureManager.timeStopTurns = 0;
      let stand = adventureManager.opponentStand;

      adventureManager.updateAbilityCounts(stand);
      let result = adventureManager.opponentAbilityCount;

      expect(result).toStrictEqual([5, 6, 7]);
    });

    it("should increment all player ability counts but reset one when an exception index is passed", () => {
      adventureManager.playerStand = {
        Ability: [{ id: "barrage" }, { id: "barrage" }, { id: "barrage" }],
      };
      adventureManager.timeStopTurns = 0;
      let stand = adventureManager.playerStand;

      adventureManager.updateAbilityCounts(stand, 1);
      let result = adventureManager.playerAbilityCount;

      expect(result).toStrictEqual([2, 0, 4]);
    });

    it("should increment all opponent ability counts but reset one when an exception index is passed", () => {
      adventureManager.opponentStand = {
        Ability: [{ id: "barrage" }, { id: "barrage" }, { id: "barrage" }],
      };
      adventureManager.timeStopTurns = 0;
      let stand = adventureManager.opponentStand;

      adventureManager.updateAbilityCounts(stand, 2);
      let result = adventureManager.opponentAbilityCount;

      expect(result).toStrictEqual([5, 6, 0]);
    });

    it("should increment player time stop ability count when time is not stopped", () => {
      adventureManager.playerStand = {
        Ability: [
          { id: "barrage" },
          { id: "timestop", turns: 3 },
          { id: "barrage" },
        ],
      };
      adventureManager.timeStopTurns = 0;
      let stand = adventureManager.playerStand;

      adventureManager.updateAbilityCounts(stand);
      let result = adventureManager.playerAbilityCount;

      expect(result).toStrictEqual([2, 3, 4]);
    });

    it("should increment opponent time stop ability count when time is not stopped", () => {
      adventureManager.opponentStand = {
        Ability: [
          { id: "barrage" },
          { id: "barrage" },
          { id: "timestop", turns: 4 },
        ],
      };
      adventureManager.timeStopTurns = 0;
      let stand = adventureManager.opponentStand;

      adventureManager.updateAbilityCounts(stand);
      let result = adventureManager.opponentAbilityCount;

      expect(result).toStrictEqual([5, 6, 7]);
    });

    it("should set player time stop ability count below zero when time stop is used", () => {
      adventureManager.playerStand = {
        Ability: [
          { id: "barrage" },
          { id: "timestop", turns: 3 },
          { id: "barrage" },
        ],
      };
      adventureManager.timeStopTurns = 1;
      let stand = adventureManager.playerStand;

      adventureManager.updateAbilityCounts(stand, 1);
      let result = adventureManager.playerAbilityCount;

      expect(result).toStrictEqual([2, -3, 4]);
    });

    it("should set opponent time stop ability count below zero when time stop is used", () => {
      adventureManager.opponentStand = {
        Ability: [
          { id: "barrage" },
          { id: "barrage" },
          { id: "timestop", turns: 4 },
        ],
      };
      adventureManager.timeStopTurns = 1;
      let stand = adventureManager.opponentStand;

      adventureManager.updateAbilityCounts(stand, 2);
      let result = adventureManager.opponentAbilityCount;

      expect(result).toStrictEqual([5, 6, -4]);
    });
  });

  describe("orderEmbedDisplay()", () => {
    beforeEach(() => {
      adventureManager.fightEmbed = new EmbedBuilder();
      adventureManager.turnEmbed = new EmbedBuilder();
      adventureManager.opponentTurnEmbed = new EmbedBuilder();
      adventureManager.quoteEmbed = new EmbedBuilder();
      adventureManager.winEmbed = new EmbedBuilder();
      adventureManager.rewardEmbed = new EmbedBuilder();
      adventureManager.opponentExtraTurnEmbeds = [];
    });

    describe("if player goes first", () => {
      beforeEach(() => {
        adventureManager.isPlayerFirst = true;
      });

      it("should not return opponentTurnEmbed when it has no content", () => {
        let turnEmbed = new EmbedBuilder();
        let fightEmbed = new EmbedBuilder();
        adventureManager.playerWinState = "ONGOING";

        let result = adventureManager.orderEmbedDisplay();

        expect(result).toStrictEqual([turnEmbed, fightEmbed]);
      });

      it("should return opponentTurnEmbed when it has content", () => {
        let turnEmbed = new EmbedBuilder();
        let opponentTurnEmbed = new EmbedBuilder().setTitle("Opponent Turn");
        let fightEmbed = new EmbedBuilder();
        adventureManager.opponentTurnEmbed.setTitle("Opponent Turn");
        adventureManager.playerWinState = "ONGOING";

        let result = adventureManager.orderEmbedDisplay();

        expect(result).toStrictEqual([
          turnEmbed,
          opponentTurnEmbed,
          fightEmbed,
        ]);
      });

      it("should return opponentExtraTurnEmbeds when they are present", () => {
        let turnEmbed = new EmbedBuilder();
        let opponentTurnEmbed = new EmbedBuilder().setTitle("Opponent Turn");
        let fightEmbed = new EmbedBuilder();
        adventureManager.opponentTurnEmbed.setTitle("Opponent Turn");
        adventureManager.opponentExtraTurnEmbeds = [0, 0, 0];
        adventureManager.playerWinState = "ONGOING";

        let result = adventureManager.orderEmbedDisplay();

        expect(result).toStrictEqual([
          turnEmbed,
          opponentTurnEmbed,
          0,
          0,
          0,
          fightEmbed,
        ]);
      });
    });

    describe("if opponent goes first", () => {
      beforeEach(() => {
        adventureManager.isPlayerFirst = false;
      });

      it("should not return turnEmbed when it has no content", () => {
        let opponentTurnEmbed = new EmbedBuilder();
        let fightEmbed = new EmbedBuilder();
        adventureManager.playerWinState = "ONGOING";

        let result = adventureManager.orderEmbedDisplay();

        expect(result).toStrictEqual([opponentTurnEmbed, fightEmbed]);
      });

      it("should return turnEmbed when it has content", () => {
        let turnEmbed = new EmbedBuilder().setTitle("Player Turn");
        let opponentTurnEmbed = new EmbedBuilder();
        let fightEmbed = new EmbedBuilder();
        adventureManager.turnEmbed.setTitle("Player Turn");
        adventureManager.playerWinState = "ONGOING";

        let result = adventureManager.orderEmbedDisplay();

        expect(result).toStrictEqual([
          opponentTurnEmbed,
          turnEmbed,
          fightEmbed,
        ]);
      });

      it("should return opponentExtraTurnEmbeds when they are present", () => {
        let turnEmbed = new EmbedBuilder().setTitle("Player Turn");
        let opponentTurnEmbed = new EmbedBuilder();
        let fightEmbed = new EmbedBuilder();
        adventureManager.turnEmbed.setTitle("Player Turn");
        adventureManager.opponentExtraTurnEmbeds = [0, 0, 0];
        adventureManager.playerWinState = "ONGOING";

        let result = adventureManager.orderEmbedDisplay();

        expect(result).toStrictEqual([
          opponentTurnEmbed,
          0,
          0,
          0,
          turnEmbed,
          fightEmbed,
        ]);
      });
    });

    it("should return winEmbed when match is over", () => {
      let turnEmbed = new EmbedBuilder();
      let winEmbed = new EmbedBuilder();
      adventureManager.isPlayerFirst = true;
      adventureManager.playerWinState = "";

      let result = adventureManager.orderEmbedDisplay();

      expect(result).toStrictEqual([turnEmbed, winEmbed]);
    });

    it("should return rewardEmbed when player is winner", () => {
      let turnEmbed = new EmbedBuilder();
      let winEmbed = new EmbedBuilder();
      let rewardEmbed = new EmbedBuilder();
      adventureManager.isPlayerFirst = true;
      adventureManager.playerWinState = "WIN";

      let result = adventureManager.orderEmbedDisplay();

      expect(result).toStrictEqual([turnEmbed, winEmbed, rewardEmbed]);
    });

    it("should return turnEmbed and winEmbed when player surrenders", () => {
      let turnEmbed = new EmbedBuilder();
      let winEmbed = new EmbedBuilder();
      adventureManager.isPlayerFirst = true;
      adventureManager.playerWinState = "SURRENDER";

      let result = adventureManager.orderEmbedDisplay();

      expect(result).toStrictEqual([turnEmbed, winEmbed]);
    });
  });
});

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
});
