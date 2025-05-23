const {
  Client,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { AdventureManager } = require("../../Utility/AdventureManager");
const CombatHandler = require("../../Utility/CombatHandler");
const StandStats = require("../../Schemas/StandStats");
const Inventory = require("../../Schemas/PlayerInventory");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");
const Cooldowns = require("../../Schemas/Cooldowns");
const CooldownTime = 30000;
const AdventureInfo = require("../../Schemas/AdventureInfo");
const StandAbilities = require("../../Local Storage/standAbilities");
const AdventureOpponents = require("../../Local Storage/adventureOpponents");
const HumanizeDuration = require("humanize-duration");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} buttonInteract
   * @param {Client} client
   */
  async execute(buttonInteract, client) {
    if (!buttonInteract.isButton()) return;

    const splitText = buttonInteract.customId.split("-");
    if (splitText[0] !== "Adventure") return;
    let guildId = splitText[2];

    if (buttonInteract.user.id !== splitText[3])
      return await buttonInteract.deferUpdate().catch(console.error);

    await buttonInteract.deferUpdate();

    var plr = await client.users.cache.get(splitText[3]);

    let adventureManager = new AdventureManager();
    await adventureManager.init(
      guildId,
      plr,
      AdventureOpponents.opponents[splitText[4]]
    );

    adventureManager.playerWinState = "ONGOING";

    if (
      !adventureManager.isPlayerFirst &&
      adventureManager.savedData &&
      adventureManager.timeStopTurns <= 0
    ) {
      await adventureManager.botTurn(buttonInteract);
    }

    if (adventureManager.isMatchOver)
      return adventureManager.endAdventure(buttonInteract);

    let player = adventureManager.player;
    let playerStand = adventureManager.playerStand;
    let opponent = adventureManager.opponent;
    let opponentStand = adventureManager.opponentStand;

    let isNewAdventure = false;

    switch (splitText[1]) {
      case "Accept":
        await acceptAdventure(buttonInteract, adventureManager);
        isNewAdventure = true;
        break;
      case "Decline":
        return await declineAdventure(buttonInteract, adventureManager);
      case "Attack":
        await attack(adventureManager);
        break;
      case "Dodge":
        await dodge(adventureManager);
        break;
      case "Ability":
        await useAbility(splitText[5], adventureManager);
        break;
      case "Surrender":
        return surrender(buttonInteract, adventureManager);
    }

    if (adventureManager.isMatchOver)
      return adventureManager.endAdventure(buttonInteract, adventureManager);

    if (
      adventureManager.isPlayerFirst &&
      adventureManager.savedData &&
      adventureManager.timeStopTurns <= 0
    ) {
      await adventureManager.botTurn(buttonInteract);
    }

    if (adventureManager.isMatchOver)
      return adventureManager.endAdventure(buttonInteract);

    adventureManager.updateAbilityUI();
    adventureManager.updateDisplay();

    let embeds = adventureManager.orderEmbedDisplay();

    if (!isNewAdventure)
      await CombatHandler.reply(buttonInteract, embeds, [
        adventureManager.adventureButtons,
        adventureManager.abilityButtons,
      ]);

    if (!adventureManager.savedData) {
      await AdventureInfo.create({
        Guild: guildId,
        User: player.id,
        Opponent: opponent,
        PlayerHP: adventureManager.playerHp,
        OpponentHP: adventureManager.opponentHp,
        AttackRollHeight: 100,
        PlayerAbilityCount: adventureManager.playerAbilityCount,
        OpponentAbilityCount: adventureManager.opponentAbilityCount,
        DefenseModifier: 1,
        IsConfused: adventureManager.isConfused,
        TimeStopTurns: 0,
      });
    } else {
      await adventureManager.updateSchema(AdventureInfo, {
        PlayerHP: adventureManager.playerHp,
        OpponentHP: adventureManager.opponentHp,
        IsConfused: adventureManager.isConfused,
      });
    }
  },
  acceptAdventure,
  declineAdventure,
  attack,
  dodge,
  useAbility,
  surrender,
};

async function acceptAdventure(buttonInteract, adventureManager) {
  // check if player is in cooldown
  const cooldown = await Cooldowns.findOne({
    Guild: adventureManager.guildId,
    User: adventureManager.player.id,
    Command: "adventure",
  });

  if (cooldown) {
    if (Date.now() - cooldown.Cooldown >= CooldownTime)
      await Cooldowns.findOneAndDelete({
        Guild: adventureManager.guildId,
        User: adventureManager.player.id,
        Command: "adventure",
      });
    else {
      const remainingTime = HumanizeDuration(
        cooldown.Cooldown + CooldownTime - Date.now(),
        {
          largest: 2,
          round: true,
        }
      );
      return await buttonInteract.editReply({
        content: `You can go on an adventure again in ${remainingTime}.`,
        ephemeral: true,
      });
    }
  }

  if (
    (
      await PlayerBooleans.findOne({
        Guild: adventureManager.guildId,
        User: adventureManager.player.id,
      })
    ).IsAdventuring
  ) {
    return await buttonInteract.editReply({
      content: "You are already in an adventure!",
      ephemeral: true,
    });
  }

  adventureManager.updateAbilityUI();
  adventureManager.updateDisplay();

  await adventureManager.updateSchema(PlayerBooleans, { IsAdventuring: true });

  await buttonInteract.editReply({
    content: null,
    embeds: [adventureManager.quoteEmbed, adventureManager.fightEmbed],
    components: [
      adventureManager.adventureButtons,
      adventureManager.abilityButtons,
    ],
  });
}

async function declineAdventure(buttonInteract, adventureManager) {
  // start cooldown
  await Cooldowns.create({
    Guild: adventureManager.guildId,
    User: adventureManager.player.id,
    Command: "adventure",
    Cooldown: Date.now(),
  });

  // update booleans
  await adventureManager.updateSchema(PlayerBooleans, {
    IsAdventuring: false,
  });

  await buttonInteract.editReply({
    content: `You ran away from ${adventureManager.opponent.displayName}!`,
    embeds: [],
    components: [],
  });
}

async function attack(adventureManager) {
  var enemyDefenseModifier = 1;

  if (adventureManager.savedData) {
    adventureManager.savedData = await AdventureInfo.findOne({
      Guild: adventureManager.guildId,
      User: adventureManager.player.id,
    });
    enemyDefenseModifier = adventureManager.savedData.DefenseModifier;
  }

  if (
    CombatHandler.tryAttack(
      adventureManager.playerStand,
      adventureManager.opponentStand,
      enemyDefenseModifier,
      adventureManager.attackRollHeight
    )
  ) {
    var damage = CombatHandler.rollDamage(adventureManager.playerStand);

    CombatHandler.setTurnText(
      adventureManager.turnEmbed,
      "ATTACK",
      adventureManager.playerStand,
      { damage: damage, isConfused: adventureManager.isConfused }
    );

    adventureManager.opponentHp -= damage;
  } else {
    CombatHandler.setTurnText(
      adventureManager.turnEmbed,
      "MISS",
      adventureManager.playerStand,
      {
        isConfused: adventureManager.isConfused,
      }
    );
  }

  adventureManager.updateAbilityCounts(adventureManager.playerStand);

  await adventureManager.updateSchema(AdventureInfo, {
    AttackRollHeight: 100,
    PlayerAbilityCount: adventureManager.playerAbilityCount,
    DefenseModifier: 1,
    TimeStopTurns: adventureManager.timeStopTurns - 1,
  });

  adventureManager.checkStandDeath();
}

async function dodge(adventureManager) {
  CombatHandler.setTurnText(
    adventureManager.turnEmbed,
    "DODGE",
    adventureManager.playerStand,
    {
      isConfused: adventureManager.isConfused,
    }
  );

  // increment ability count
  adventureManager.updateAbilityCounts(adventureManager.playerStand);

  await adventureManager.updateSchema(AdventureInfo, {
    AttackRollHeight: 75,
    PlayerAbilityCount: adventureManager.playerAbilityCount,
    DefenseModifier: 1,
    TimeStopTurns: adventureManager.timeStopTurns - 1,
  });

  adventureManager.checkStandDeath();
}

async function useAbility(abilityIndex, adventureManager) {
  // fetch ability
  let ability = adventureManager.playerStand.Ability[abilityIndex];
  let abilityId = ability.id;
  let abilityInfo = StandAbilities.abilities[abilityId](
    adventureManager.playerStand,
    adventureManager.opponentStand,
    ability
  );

  var damage = abilityInfo[1];
  var healAmount = abilityInfo[2];
  var nextTurnDefenseModifier = abilityInfo[3];
  var thisTurnDefenseModifier = abilityInfo[4];
  var timeStopTurns = abilityInfo[6];

  // execute ability
  if (timeStopTurns > 0) {
    // time stop ability
    adventureManager.playerAbilityCount[abilityIndex] = 0;
    adventureManager.timeStopTurns = timeStopTurns;
    CombatHandler.setTurnText(
      adventureManager.turnEmbed,
      "ABILITY",
      adventureManager.playerStand,
      { abilityText: abilityInfo[0], isConfused: adventureManager.isConfused }
    );
  } else if (damage > 0) {
    // attack based ability
    var enemyDefenseModifier = 1;

    if (adventureManager.savedData) {
      adventureManager.savedData = await AdventureInfo.findOne({
        Guild: adventureManager.guildId,
        User: adventureManager.player.id,
      });
      enemyDefenseModifier = adventureManager.savedData.DefenseModifier;
    }

    if (
      CombatHandler.tryAttack(
        adventureManager.playerStand,
        adventureManager.opponentStand,
        enemyDefenseModifier * thisTurnDefenseModifier,
        adventureManager.attackRollHeight
      )
    ) {
      var damage = abilityInfo[1];

      adventureManager.opponentHp -= damage;
      if (healAmount > 0) {
        // life steal ability
        adventureManager.playerHp += healAmount;

        adventureManager.playerHp = Math.min(
          adventureManager.playerHp,
          adventureManager.playerStand.Healthpoints
        );
      }

      CombatHandler.setTurnText(
        adventureManager.turnEmbed,
        "ABILITY",
        adventureManager.playerStand,
        { abilityText: abilityInfo[0], isConfused: adventureManager.isConfused }
      );
    } else {
      CombatHandler.setTurnText(
        adventureManager.turnEmbed,
        "MISS",
        adventureManager.playerStand,
        {
          isConfused: adventureManager.isConfused,
        }
      );
    }
  } else if (healAmount > 0) {
    // heal ability
    adventureManager.playerHp += healAmount;

    adventureManager.playerHp = Math.min(
      adventureManager.playerHp,
      adventureManager.playerStand.Healthpoints
    );
    CombatHandler.setTurnText(
      adventureManager.turnEmbed,
      "ABILITY",
      adventureManager.playerStand,
      { abilityText: abilityInfo[0], isConfused: adventureManager.isConfused }
    );
  } else
    CombatHandler.setTurnText(
      adventureManager.turnEmbed,
      "ABILITY",
      adventureManager.playerStand,
      { abilityText: abilityInfo[0], isConfused: adventureManager.isConfused }
    );

  // increment other ability counts except for used ability
  adventureManager.updateAbilityCounts(
    adventureManager.playerStand,
    abilityIndex
  );

  // update duel data
  // check if player used time stop ability
  if (timeStopTurns > 0)
    await adventureManager.updateSchema(AdventureInfo, {
      AttackRollHeight: 100,
      PlayerAbilityCount: adventureManager.playerAbilityCount,
      DefenseModifier: nextTurnDefenseModifier,
      TimeStopTurns: adventureManager.timeStopTurns,
    });
  else
    await adventureManager.updateSchema(AdventureInfo, {
      AttackRollHeight: 100,
      PlayerAbilityCount: adventureManager.playerAbilityCount,
      DefenseModifier: nextTurnDefenseModifier,
      TimeStopTurns: adventureManager.timeStopTurns - 1,
    });

  adventureManager.checkStandDeath();
}

function surrender(buttonInteract, adventureManager) {
  adventureManager.turnEmbed.setTitle(
    `${adventureManager.player.username} surrenders! ${adventureManager.opponent.displayName} wins the duel.`
  );

  adventureManager.playerWinState = "SURRENDER";
  adventureManager.endAdventure(buttonInteract);
}
