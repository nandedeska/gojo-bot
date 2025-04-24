const { EmbedBuilder, ActionRowBuilder } = require("discord.js");
const CombatHandler = require("../Utility/CombatHandler");
const { AdventureManager } = require("../Utility/AdventureManager");
const AdventureInfo = require("../Schemas/AdventureInfo");

describe("AdventureManager", () => {
  let adventureManager;

  beforeEach(() => {
    adventureManager = new AdventureManager();
    adventureManager.player = { id: "123" };
    adventureManager.opponent = { id: "321" };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("botTurn()", () => {
    let setTurnText;
    let attack;
    let dodge;

    beforeEach(() => {
      setTurnText = jest
        .spyOn(CombatHandler, "setTurnText")
        .mockImplementation();
      attack = jest.spyOn(adventureManager, "botAttack").mockImplementation();
      dodge = jest.spyOn(adventureManager, "botDodge").mockImplementation();
      jest.spyOn(adventureManager, "checkStandDeath").mockImplementation();
      adventureManager.opponentTurnEmbed = new EmbedBuilder();
      adventureManager.opponentStand = {};
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe("bot uses ability", () => {
      it("should not attack when an ability is used", async () => {
        jest.spyOn(Math, "random").mockImplementation(() => {
          return 0.5;
        });
        jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
          return { hasUsedAbility: true, abilityInfo: [] };
        });
        adventureManager.isMatchOver = false;

        await adventureManager.botTurn();

        expect(attack).not.toHaveBeenCalled();
      });

      it("should set ability text when using ability", async () => {
        jest.spyOn(Math, "random").mockImplementation(() => {
          return 0.5;
        });
        jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
          return { hasUsedAbility: true, abilityInfo: ["ability used!"] };
        });
        adventureManager.opponentStand = {
          Ability: [{ cooldown: 10, id: "heal", power: 20 }],
        };
        adventureManager.opponentAbilityCount = [0];

        await adventureManager.botTurn();

        expect(setTurnText).toHaveBeenCalledWith(
          expect.anything(),
          "ABILITY",
          expect.anything(),
          expect.anything()
        );
      });
    });

    describe("bot uses attack", () => {
      beforeEach(() => {
        jest.spyOn(Math, "random").mockImplementation(() => {
          return 0.5;
        });
      });

      it("should attack when no abilities were used", async () => {
        jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
          return false;
        });
        jest.spyOn(adventureManager, "botAttack").mockImplementation(() => {
          return { hasAttackHit: true, damage: 50 };
        });
        adventureManager.isMatchOver = false;

        await adventureManager.botTurn();

        expect(attack).toHaveBeenCalled();
      });

      it("should set attack text when attack hits", async () => {
        jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
          return false;
        });
        jest.spyOn(adventureManager, "botAttack").mockImplementation(() => {
          return { hasAttackHit: true, damage: 50 };
        });
        adventureManager.isMatchOver = false;

        await adventureManager.botTurn();

        expect(setTurnText).toHaveBeenCalledWith(
          expect.anything(),
          "ATTACK",
          expect.anything(),
          expect.anything()
        );
      });

      it("should set miss text when attack misses", async () => {
        jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
          return false;
        });
        jest.spyOn(adventureManager, "botAttack").mockImplementation(() => {
          return { hasAttackHit: false, damage: 0 };
        });
        adventureManager.isMatchOver = false;

        await adventureManager.botTurn();

        expect(setTurnText).toHaveBeenCalledWith(
          expect.anything(),
          "MISS",
          expect.anything(),
          expect.anything()
        );
      });
    });

    describe("bot uses dodge", () => {
      it("should dodge when neither attacking nor using ability", async () => {
        jest.spyOn(Math, "random").mockImplementation(() => {
          return 0.8;
        });

        await adventureManager.botTurn();

        expect(dodge).toHaveBeenCalled();
      });

      it("should set dodge text when dodging", async () => {
        jest.spyOn(Math, "random").mockImplementation(() => {
          return 0.8;
        });

        await adventureManager.botTurn();

        expect(setTurnText).toHaveBeenCalledWith(
          expect.anything(),
          "DODGE",
          expect.anything(),
          expect.anything()
        );
      });
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
  });

  describe("botAttack()", () => {
    let rollDamage;

    beforeEach(() => {
      rollDamage = jest.spyOn(CombatHandler, "rollDamage").mockImplementation();
      jest.spyOn(adventureManager, "updateSchema").mockImplementation();
      jest.spyOn(adventureManager, "updateAbilityCounts").mockImplementation();
      jest.spyOn(adventureManager, "checkStandDeath").mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should roll for damage when attack hits", () => {
      jest.spyOn(CombatHandler, "tryAttack").mockImplementation(() => {
        return true;
      });

      adventureManager.botAttack();

      expect(rollDamage).toHaveBeenCalledTimes(1);
    });
  });

  describe("botUseAbility()", () => {
    let setTurnText;
    let timeStopTurn;

    beforeEach(() => {
      jest.spyOn(CombatHandler, "tryAttack").mockImplementation(() => {
        return true;
      });
      setTurnText = jest
        .spyOn(CombatHandler, "setTurnText")
        .mockImplementation();
      timeStopTurn = jest
        .spyOn(adventureManager, "botTimeStopTurn")
        .mockImplementation();
      jest.spyOn(adventureManager, "updateSchema").mockImplementation();
      jest.spyOn(adventureManager, "updateAbilityCounts").mockImplementation();
      jest.spyOn(adventureManager, "checkStandDeath").mockImplementation();

      adventureManager.opponentStand = {
        Ability: [
          { cooldown: 5, id: "emeraldsplash", damage: 20 },
          { cooldown: 3, id: "timestop", turns: 5 },
          { cooldown: 10, id: "fruitpunch", damage: 20 },
          { cooldown: 2, id: "heal", power: 15 },
          { cooldown: 4, id: "aegisdome", modifier: 100 },
        ],
      };
      adventureManager.opponentExtraTurnEmbeds = [];
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should return false when no ability is used", async () => {
      adventureManager.opponentAbilityCount = [0, 0, 0, 0, 0];

      let result = (await adventureManager.botUseAbility()).hasUsedAbility;

      expect(result).toBe(false);
    });

    it("should return true when an ability is used", async () => {
      adventureManager.opponentAbilityCount = [5, 0, 0, 0, 0];

      let result = (await adventureManager.botUseAbility()).hasUsedAbility;

      expect(result).toBe(true);
    });

    describe("time stop ability", () => {
      it("should do extra turns when time is stopped", async () => {
        adventureManager.opponentAbilityCount = [0, 3, 0, 0, 0];

        await adventureManager.botUseAbility();

        expect(timeStopTurn).toHaveBeenCalledTimes(5);
      });
    });

    describe("attack-based ability", () => {
      let findOne;
      let min;

      beforeEach(() => {
        findOne = jest.spyOn(AdventureInfo, "findOne").mockReturnValue(() => {
          {
            DefenseModifier: 1;
          }
        });
        min = jest.spyOn(Math, "min").mockImplementation();
      });

      it("should fetch defense modifier when savedData exists", async () => {
        adventureManager.opponentAbilityCount = [5, 0, 0, 0, 0];
        adventureManager.savedData = {};

        await adventureManager.botUseAbility();

        expect(findOne).toHaveBeenCalledTimes(1);
      });

      it("should heal when ability has life steal", async () => {
        adventureManager.opponentAbilityCount = [0, 0, 10, 0, 0];

        await adventureManager.botUseAbility();

        expect(min).toHaveBeenCalledTimes(1);
      });
    });

    describe("heal ability", () => {
      let min;

      beforeEach(() => {
        min = jest.spyOn(Math, "min").mockImplementation();
      });

      it("should heal when ability is used", async () => {
        adventureManager.opponentAbilityCount = [0, 0, 0, 2, 0];

        await adventureManager.botUseAbility();

        expect(min).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("botTimeStopTurn()", () => {
    let setTurnText;
    let attack;
    let dodge;

    beforeEach(() => {
      setTurnText = jest
        .spyOn(CombatHandler, "setTurnText")
        .mockImplementation();
      attack = jest.spyOn(adventureManager, "botAttack").mockImplementation();
      dodge = jest.spyOn(adventureManager, "botDodge").mockImplementation();
      jest.spyOn(adventureManager, "checkStandDeath").mockImplementation();
      adventureManager.opponentTurnEmbed = new EmbedBuilder();
      adventureManager.opponentStand = {};
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe("bot uses ability", () => {
      it("should not attack when an ability is used", async () => {
        jest.spyOn(Math, "random").mockImplementation(() => {
          return 0.5;
        });
        jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
          return { hasUsedAbility: true, abilityInfo: [] };
        });
        adventureManager.isMatchOver = false;

        await adventureManager.botTimeStopTurn();

        expect(attack).not.toHaveBeenCalled();
      });

      it("should set ability text when using ability", async () => {
        jest.spyOn(Math, "random").mockImplementation(() => {
          return 0.5;
        });
        jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
          return { hasUsedAbility: true, abilityInfo: ["ability used!"] };
        });
        adventureManager.opponentStand = {
          Ability: [{ cooldown: 10, id: "heal", power: 20 }],
        };
        adventureManager.opponentAbilityCount = [0];

        await adventureManager.botTimeStopTurn();

        expect(setTurnText).toHaveBeenCalledWith(
          expect.anything(),
          "ABILITY",
          expect.anything(),
          expect.anything()
        );
      });
    });

    describe("bot uses attack", () => {
      beforeEach(() => {
        jest.spyOn(Math, "random").mockImplementation(() => {
          return 0.5;
        });
      });

      it("should attack when no abilities were used", async () => {
        jest.spyOn(Math, "random").mockImplementation(() => {
          return 0.5;
        });
        jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
          return false;
        });
        jest.spyOn(adventureManager, "botAttack").mockImplementation(() => {
          return { hasAttackHit: true, damage: 50 };
        });
        adventureManager.isMatchOver = false;

        await adventureManager.botTimeStopTurn();

        expect(attack).toHaveBeenCalled();
      });

      it("should set attack text when attack hits", async () => {
        jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
          return false;
        });
        jest.spyOn(adventureManager, "botAttack").mockImplementation(() => {
          return { hasAttackHit: true, damage: 50 };
        });
        adventureManager.isMatchOver = false;

        await adventureManager.botTimeStopTurn();

        expect(setTurnText).toHaveBeenCalledWith(
          expect.anything(),
          "ATTACK",
          expect.anything(),
          expect.anything()
        );
      });

      it("should set miss text when attack misses", async () => {
        jest.spyOn(adventureManager, "botUseAbility").mockImplementation(() => {
          return false;
        });
        jest.spyOn(adventureManager, "botAttack").mockImplementation(() => {
          return { hasAttackHit: false, damage: 0 };
        });
        adventureManager.isMatchOver = false;

        await adventureManager.botTimeStopTurn();

        expect(setTurnText).toHaveBeenCalledWith(
          expect.anything(),
          "MISS",
          expect.anything(),
          expect.anything()
        );
      });
    });

    describe("bot uses dodge", () => {
      it("should dodge when neither attacking nor using ability", async () => {
        jest.spyOn(Math, "random").mockImplementation(() => {
          return 0.95;
        });

        await adventureManager.botTimeStopTurn();

        expect(dodge).toHaveBeenCalled();
      });

      it("should set dodge text when dodging", async () => {
        jest.spyOn(Math, "random").mockImplementation(() => {
          return 0.95;
        });

        await adventureManager.botTimeStopTurn();

        expect(setTurnText).toHaveBeenCalledWith(
          expect.anything(),
          "DODGE",
          expect.anything(),
          expect.anything()
        );
      });
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

      expect(result).toStrictEqual([5, 6, 0]);
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
        let opponentTurnEmbed = new EmbedBuilder().setTitle("Opponent Turn");
        let fightEmbed = new EmbedBuilder();
        adventureManager.opponentTurnEmbed.setTitle("Opponent Turn");
        adventureManager.playerWinState = "ONGOING";

        let result = adventureManager.orderEmbedDisplay();

        expect(result).toStrictEqual([opponentTurnEmbed, fightEmbed]);
      });

      it("should return turnEmbed when it has content", () => {
        let turnEmbed = new EmbedBuilder().setTitle("Player Turn");
        let opponentTurnEmbed = new EmbedBuilder().setTitle("Opponent Turn");
        let fightEmbed = new EmbedBuilder();
        adventureManager.turnEmbed.setTitle("Player Turn");
        adventureManager.opponentTurnEmbed.setTitle("Opponent Turn");
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
        let opponentTurnEmbed = new EmbedBuilder().setTitle("Opponent Turn");
        let fightEmbed = new EmbedBuilder();
        adventureManager.turnEmbed.setTitle("Player Turn");
        adventureManager.opponentTurnEmbed.setTitle("Opponent Turn");
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
