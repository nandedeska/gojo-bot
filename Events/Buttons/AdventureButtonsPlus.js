const {
  Client,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { AdventureManager, EmbedData } = require("../../Utility/CombatHandler");
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

    var plr = await client.users.cache.get(splitText[3]);

    let adventureManager = new AdventureManager();
    await adventureManager.init(
      guildId,
      plr,
      AdventureOpponents.opponents[splitText[4]]
    );

    adventureManager.playerWinState = "ONGOING";

    let embedData = new EmbedData();
    await embedData.init(adventureManager);

    if (
      !adventureManager.isPlayerFirst &&
      adventureManager.savedData &&
      adventureManager.timeStopTurns <= 0
    ) {
      await CombatHandler.botTurn(buttonInteract, adventureManager, embedData);
    }

    if (adventureManager.isMatchOver)
      return CombatHandler.endAdventure(
        buttonInteract,
        adventureManager,
        embedData
      );

    let abilityCounts;

    let player = adventureManager.player;
    let playerStand = adventureManager.playerStand;
    let opponent = adventureManager.opponent;
    let opponentStand = adventureManager.opponentStand;

    if (adventureManager.savedData)
      abilityCounts = adventureManager.savedData.PlayerAbilityCount;
    else abilityCounts = Array(playerStand.Ability.length).fill(0);

    let isNewAdventure = false;

    switch (splitText[1]) {
      case "Accept":
        await acceptAdventure(buttonInteract, adventureManager, embedData);
        isNewAdventure = true;
        break;
      case "Decline":
        return await declineAdventure(buttonInteract, adventureManager);
      case "Attack":
        await attack(abilityCounts, adventureManager, embedData);
        break;
      case "Dodge":
        await dodge(abilityCounts, adventureManager, embedData);
        break;
      case "Ability":
        await useAbility(abilityCounts, adventureManager, embedData);
        break;
      case "Surrender":
        return surrender(buttonInteract, adventureManager, embedData);
    }

    if (adventureManager.isMatchOver)
      return CombatHandler.endAdventure(
        buttonInteract,
        adventureManager,
        embedData
      );

    if (
      adventureManager.isPlayerFirst &&
      adventureManager.savedData &&
      adventureManager.timeStopTurns <= 0
    ) {
      await CombatHandler.botTurn(buttonInteract, adventureManager, embedData);
    }

    if (adventureManager.isMatchOver)
      return CombatHandler.endAdventure(
        buttonInteract,
        adventureManager,
        embedData
      );

    CombatHandler.updateAbilityUI(adventureManager, embedData);
    CombatHandler.updateAdventureDisplay(adventureManager, embedData);

    let embeds = CombatHandler.orderEmbedDisplay(
      adventureManager.isPlayerFirst,
      adventureManager.playerWinState,
      embedData
    );

    if (!isNewAdventure)
      await CombatHandler.reply(buttonInteract, embeds, [
        embedData.adventureButtons,
        embedData.abilityButtons,
      ]);

    if (!adventureManager.savedData) {
      let playerAbilityCount = Array(playerStand.Ability.length).fill(0);
      let opponentAbilityCount = Array(opponentStand.Ability.length).fill(0);
      await AdventureInfo.create({
        Guild: guildId,
        User: player.id,
        Opponent: opponent,
        PlayerHP: adventureManager.playerHp,
        OpponentHP: adventureManager.opponentHp,
        AttackRollHeight: 100,
        PlayerAbilityCount: playerAbilityCount,
        OpponentAbilityCount: opponentAbilityCount,
        DefenseModifier: 1,
        IsConfused: adventureManager.isConfused,
        TimeStopTurns: 0,
      });
    } else {
      await CombatHandler.updateAdventureSchema(
        AdventureInfo,
        adventureManager,
        {
          PlayerHP: adventureManager.playerHp,
          OpponentHP: adventureManager.opponentHp,
          IsConfused: adventureManager.isConfused,
        }
      );
    }
  },
};

async function acceptAdventure(buttonInteract, adventureManager, embedData) {
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
      await buttonInteract.deferUpdate();
      const remainingTime = HumanizeDuration(
        cooldown.Cooldown + CooldownTime - Date.now(),
        {
          largest: 2,
          round: true,
        }
      );
      return await buttonInteract
        .editReply({
          content: `You can go on an adventure again in ${remainingTime}.`,
          ephemeral: true,
        })
        .catch(console.log);
    }
  }

  if (
    await PlayerBooleans.findOne({
      Guild: adventureManager.guildId,
      User: adventureManager.player.id,
    }).IsAdventuring
  ) {
    await buttonInteract.deferUpdate();
    return await buttonInteract.editReply({
      content: "You are already in an adventure!",
      ephemeral: true,
    });
  }

  CombatHandler.updateAbilityUI(adventureManager, embedData);
  CombatHandler.updateAdventureDisplay(adventureManager, embedData);

  await buttonInteract.deferUpdate();
  await buttonInteract.editReply({
    content: null,
    embeds: [embedData.quoteEmbed, embedData.fightEmbed],
    components: [embedData.adventureButtons, embedData.abilityButtons],
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
  await CombatHandler.updateAdventureSchema(PlayerBooleans, adventureManager, {
    IsAdventuring: false,
  });

  await buttonInteract.deferUpdate();
  await buttonInteract.editReply({
    content: `You ran away from ${adventureManager.opponent.displayName}!`,
    embeds: [],
    components: [],
  });
}

async function attack(abilityCounts, adventureManager, embedData) {
  var attackRoll =
    Math.floor(Math.random() * adventureManager.attackRollHeight) + 1;

  var currentDefenseModifier = 1;

  if (adventureManager.savedData) {
    adventureManager.savedData = await AdventureInfo.findOne({
      Guild: adventureManager.guildId,
      User: adventureManager.player.id,
    });
    currentDefenseModifier = adventureManager.savedData.DefenseModifier;
  }

  if (
    attackRoll >=
    adventureManager.opponentStand.Defense * currentDefenseModifier
  ) {
    var damage =
      Math.floor(Math.random() * adventureManager.playerStand.Attack) + 1;

    if (adventureManager.isConfused) {
      embedData.turnEmbed.setTitle(
        CombatHandler.generateGlitchedText("long")
      );
    } else
      embedData.turnEmbed.setTitle(
        `${adventureManager.playerStand.Name}'s attack hits! It deals ${damage} damage.`
      );

    adventureManager.opponentHp -= damage;
  } else {
    if (adventureManager.isConfused)
      embedData.turnEmbed.setTitle(
        CombatHandler.generateGlitchedText("long")
      );
    else
      embedData.turnEmbed.setTitle(
        `${adventureManager.playerStand.Name} missed!`
      );
  }

  for (let i = 0; i < adventureManager.playerStand.Ability.length; i++) {
    try {
      abilityCounts[i] = adventureManager.savedData.PlayerAbilityCount[i] + 1;
    } catch (err) {
      console.log(err);
    }
  }

  await CombatHandler.updateAdventureSchema(AdventureInfo, adventureManager, {
    AttackRollHeight: 100,
    PlayerAbilityCount: abilityCounts,
    DefenseModifier: 1,
    TimeStopTurns: adventureManager.timeStopTurns - 1,
  });

  await CombatHandler.checkStandDeath(adventureManager);
}

async function dodge(abilityCounts, adventureManager, embedData) {
  if (adventureManager.isConfused)
    embedData.turnEmbed.setTitle(
      CombatHandler.generateGlitchedText("long")
    );
  else
    embedData.turnEmbed.setTitle(
      `${adventureManager.playerStand.Name} prepares to dodge!`
    );

  // increment ability count
  for (let i = 0; i < adventureManager.playerStand.Ability.length; i++) {
    try {
      abilityCounts[i] = adventureManager.savedData.PlayerAbilityCount[i] + 1;
    } catch (err) {
      console.log(err);
    }
  }

  await CombatHandler.updateAdventureSchema(AdventureInfo, adventureManager, {
    AttackRollHeight: 75,
    PlayerAbilityCount: abilityCounts,
    DefenseModifier: 1,
    TimeStopTurns: adventureManager.timeStopTurns - 1,
  });

  await CombatHandler.checkStandDeath(adventureManager);
}

async function useAbility(abilityIndex, abilityCounts, adventureManager, embedData) {
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
  var currentDefenseModifier = abilityInfo[3];
  var timeStopTurns = abilityInfo[6];

  // execute ability
  if (timeStopTurns > 0) {
    // time stop ability
    abilityCounts[abilityIndex] = 0;
    adventureManager.timeStopTurns = timeStopTurns;
    adventureManager.turnEmbed.setTitle(abilityInfo[0]);
  } else if (damage > 0) {
    // attack based ability
    var defenseMod = 1;

    if (adventureManager.savedData) {
      adventureManager.savedData = await AdventureInfo.findOne({
        Guild: adventureManager.guildId,
        User: adventureManager.player.id,
      });
      defenseMod = adventureManager.savedData.DefenseModifier;
    }

    var attackRoll =
      Math.floor(Math.random() * adventureManager.attackRollHeight) + 1;
    if (
      attackRoll >=
      adventureManager.opponentStand.Defense *
        defenseMod *
        currentDefenseModifier
    ) {
      var damage = abilityInfo[1];

      adventureManager.opponentHp -= damage;
      if (healAmount > 0) {
        // life steal ability
        adventureManager.playerHp += healAmount;

        adventureManager.playerHp = Math.min(
          adventureManager.playerHp,
          playerStand.Healthpoints
        );
      }

      if (adventureManager.isConfused)
        adventureManager.turnEmbed.setTitle(
          CombatHandler.generateGlitchedText("long")
        );
      else adventureManager.turnEmbed.setTitle(abilityInfo[0]);
    } else {
      if (adventureManager.isConfused)
        adventureManager.turnEmbed.setTitle(
          CombatHandler.generateGlitchedText("long")
        );
      else
        adventureManager.turnEmbed.setTitle(
          `${adventureManager.playerStand.Name} missed!`
        );
    }
  } else if (healAmount > 0) {
    // heal ability
    adventureManager.playerHp += healAmount;

    adventureManager.playerHp = Math.min(
      adventureManager.playerHp,
      playerStand.Healthpoints
    );
    adventureManager.turnEmbed.setTitle(abilityInfo[0]);
  }

  // increment other ability counts except for used ability
  for (let i = 0; i < adventureManager.playerStand.Ability.length; i++) {
    if (i == abilityIndex) {
      abilityCounts[i] = 0;
    } else {
      try {
        abilityCounts[i] = adventureManager.savedData.PlayerAbilityCount[i] + 1;
      } catch (err) {
        console.log(err);
      }
    }
  }

  // update duel data
  // check if player used time stop ability
  if (timeStopTurns > 0)
    await CombatHandler.updateAdventureSchema(AdventureInfo, adventureManager, {
      AttackRollHeight: 100,
      PlayerAbilityCount: abilityCounts,
      DefenseModifier: currentDefenseModifier,
    });
  else
    await CombatHandler.updateAdventureSchema(AdventureInfo, adventureManager, {
      AttackRollHeight: 100,
      PlayerAbilityCount: abilityCounts,
      DefenseModifier: currentDefenseModifier,
      TimeStopTurns: adventureManager.timeStopTurns - 1,
    });

  await CombatHandler.checkStandDeath(adventureManager);
}

function surrender(buttonInteract, adventureManager, embedData) {
  embedData.turnEmbed.setTitle(
    `${adventureManager.player.username} surrenders! ${adventureManager.opponent.displayName} wins the duel.`
  );

  adventureManager.playerWinState = "SURRENDER";
  CombatHandler.endAdventure(buttonInteract, adventureManager, embedData);
}
