const {
  Client,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { AdventureData, EmbedData } = require("../../Utility/CombatHandler");
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

    let adventureData = new AdventureData();
    await adventureData.init(
      guildId,
      plr,
      AdventureOpponents.opponents[splitText[4]]
    );

    adventureData.playerWinState = "ONGOING";

    let embedData = new EmbedData();
    await embedData.init(adventureData);

    if (
      !adventureData.isPlayerFirst &&
      adventureData.savedData &&
      adventureData.timeStopTurns <= 0
    ) {
      await CombatHandler.botTurn(buttonInteract, adventureData, embedData);
    }

    if (adventureData.isMatchOver)
      return CombatHandler.endAdventure(
        buttonInteract,
        adventureData,
        embedData
      );

    let abilityCounts;

    let player = adventureData.player;
    let playerStand = adventureData.playerStand;
    let opponent = adventureData.opponent;
    let opponentStand = adventureData.opponentStand;

    if (adventureData.savedData)
      abilityCounts = adventureData.savedData.PlayerAbilityCount;
    else abilityCounts = Array(playerStand.Ability.length).fill(0);

    let isNewAdventure = false;

    switch (splitText[1]) {
      case "Accept":
        await acceptAdventure(buttonInteract, adventureData, embedData);
        isNewAdventure = true;
        break;
      case "Decline":
        return await declineAdventure(buttonInteract, adventureData);
      case "Attack":
        await attack(abilityCounts, adventureData, embedData);
        break;
      case "Dodge":
        await dodge(abilityCounts, adventureData, embedData);
        break;
      case "Ability":
        await useAbility(abilityCounts, adventureData, embedData);
        break;
      case "Surrender":
        return surrender(buttonInteract, adventureData, embedData);
    }

    if (adventureData.isMatchOver)
      return CombatHandler.endAdventure(
        buttonInteract,
        adventureData,
        embedData
      );

    if (
      adventureData.isPlayerFirst &&
      adventureData.savedData &&
      adventureData.timeStopTurns <= 0
    ) {
      await CombatHandler.botTurn(buttonInteract, adventureData, embedData);
    }

    if (adventureData.isMatchOver)
      return CombatHandler.endAdventure(
        buttonInteract,
        adventureData,
        embedData
      );

    CombatHandler.updateAbilityUI(adventureData, embedData);
    CombatHandler.updateAdventureDisplay(adventureData, embedData);

    let embeds = CombatHandler.orderEmbedDisplay(
      adventureData.isPlayerFirst,
      adventureData.playerWinState,
      embedData
    );

    if (!isNewAdventure)
      await CombatHandler.reply(buttonInteract, embeds, [
        embedData.adventureButtons,
        embedData.abilityButtons,
      ]);

    if (!adventureData.savedData) {
      let playerAbilityCount = Array(playerStand.Ability.length).fill(0);
      let opponentAbilityCount = Array(opponentStand.Ability.length).fill(0);
      await AdventureInfo.create({
        Guild: guildId,
        User: player.id,
        Opponent: opponent,
        PlayerHP: adventureData.playerHp,
        OpponentHP: adventureData.opponentHp,
        AttackRollHeight: 100,
        PlayerAbilityCount: playerAbilityCount,
        OpponentAbilityCount: opponentAbilityCount,
        DefenseModifier: 1,
        IsConfused: adventureData.isConfused,
        TimeStopTurns: 0,
      });
    } else {
      await CombatHandler.updateAdventureSchema(AdventureInfo, adventureData, {
        PlayerHP: adventureData.playerHp,
        OpponentHP: adventureData.opponentHp,
        IsConfused: adventureData.isConfused,
      });
    }
  },
};

async function acceptAdventure(buttonInteract, adventureData, embedData) {
  // check if player is in cooldown
  const cooldown = await Cooldowns.findOne({
    Guild: adventureData.guildId,
    User: adventureData.player.id,
    Command: "adventure",
  });

  if (cooldown) {
    if (Date.now() - cooldown.Cooldown >= CooldownTime)
      await Cooldowns.findOneAndDelete({
        Guild: adventureData.guildId,
        User: adventureData.player.id,
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
      Guild: adventureData.guildId,
      User: adventureData.player.id,
    }).IsAdventuring
  ) {
    await buttonInteract.deferUpdate();
    return await buttonInteract.editReply({
      content: "You are already in an adventure!",
      ephemeral: true,
    });
  }

  CombatHandler.updateAbilityUI(adventureData, embedData);
  CombatHandler.updateAdventureDisplay(adventureData, embedData);

  await buttonInteract.deferUpdate();
  await buttonInteract.editReply({
    content: null,
    embeds: [embedData.quoteEmbed, embedData.fightEmbed],
    components: [embedData.adventureButtons, embedData.abilityButtons],
  });
}

async function declineAdventure(buttonInteract, adventureData) {
  // start cooldown
  await Cooldowns.create({
    Guild: adventureData.guildId,
    User: adventureData.player.id,
    Command: "adventure",
    Cooldown: Date.now(),
  });

  // update booleans
  await CombatHandler.updateAdventureSchema(PlayerBooleans, adventureData, {
    IsAdventuring: false,
  });

  await buttonInteract.deferUpdate();
  await buttonInteract.editReply({
    content: `You ran away from ${adventureData.opponent.displayName}!`,
    embeds: [],
    components: [],
  });
}

async function attack(abilityCounts, adventureData, embedData) {
  var attackRoll =
    Math.floor(Math.random() * adventureData.attackRollHeight) + 1;

  var currentDefenseModifier = 1;

  if (adventureData.savedData) {
    adventureData.savedData = await AdventureInfo.findOne({
      Guild: adventureData.guildId,
      User: adventureData.player.id,
    });
    currentDefenseModifier = adventureData.savedData.DefenseModifier;
  }

  if (
    attackRoll >=
    adventureData.opponentStand.Defense * currentDefenseModifier
  ) {
    var damage =
      Math.floor(Math.random() * adventureData.playerStand.Attack) + 1;

    if (adventureData.isConfused) {
      embedData.turnEmbed.setTitle(CombatHandler.generateGlitchedText("long"));
    } else
      embedData.turnEmbed.setTitle(
        `${adventureData.playerStand.Name}'s attack hits! It deals ${damage} damage.`
      );

    adventureData.opponentHp -= damage;
  } else {
    if (adventureData.isConfused)
      embedData.turnEmbed.setTitle(CombatHandler.generateGlitchedText("long"));
    else
      embedData.turnEmbed.setTitle(`${adventureData.playerStand.Name} missed!`);
  }

  for (let i = 0; i < adventureData.playerStand.Ability.length; i++) {
    try {
      abilityCounts[i] = adventureData.savedData.PlayerAbilityCount[i] + 1;
    } catch (err) {
      console.log(err);
    }
  }

  await CombatHandler.updateAdventureSchema(AdventureInfo, adventureData, {
    AttackRollHeight: 100,
    PlayerAbilityCount: abilityCounts,
    DefenseModifier: 1,
    TimeStopTurns: adventureData.timeStopTurns - 1,
  });

  await CombatHandler.checkStandDeath(adventureData);
}

async function dodge(abilityCounts, adventureData, embedData) {
  if (adventureData.isConfused)
    embedData.turnEmbed.setTitle(CombatHandler.generateGlitchedText("long"));
  else
    embedData.turnEmbed.setTitle(
      `${adventureData.playerStand.Name} prepares to dodge!`
    );

  // increment ability count
  for (let i = 0; i < adventureData.playerStand.Ability.length; i++) {
    try {
      abilityCounts[i] = adventureData.savedData.PlayerAbilityCount[i] + 1;
    } catch (err) {
      console.log(err);
    }
  }

  await CombatHandler.updateAdventureSchema(AdventureInfo, adventureData, {
    AttackRollHeight: 75,
    PlayerAbilityCount: abilityCounts,
    DefenseModifier: 1,
    TimeStopTurns: adventureData.timeStopTurns - 1,
  });

  await CombatHandler.checkStandDeath(adventureData);
}

async function useAbility(
  abilityIndex,
  abilityCounts,
  adventureData,
  embedData
) {
  // fetch ability
  let ability = adventureData.playerStand.Ability[abilityIndex];
  let abilityId = ability.id;
  let abilityInfo = StandAbilities.abilities[abilityId](
    adventureData.playerStand,
    adventureData.opponentStand,
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
    adventureData.timeStopTurns = timeStopTurns;
    embedData.turnEmbed.setTitle(abilityInfo[0]);
  } else if (damage > 0) {
    // attack based ability
    var defenseMod = 1;

    if (adventureData.savedData) {
      adventureData.savedData = await AdventureInfo.findOne({
        Guild: adventureData.guildId,
        User: adventureData.player.id,
      });
      defenseMod = adventureData.savedData.DefenseModifier;
    }

    var attackRoll =
      Math.floor(Math.random() * adventureData.attackRollHeight) + 1;
    if (
      attackRoll >=
      adventureData.opponentStand.Defense * defenseMod * currentDefenseModifier
    ) {
      var damage = abilityInfo[1];

      adventureData.opponentHp -= damage;
      if (healAmount > 0) {
        // life steal ability
        adventureData.playerHp += healAmount;

        adventureData.playerHp = Math.min(
          adventureData.playerHp,
          playerStand.Healthpoints
        );
      }

      if (adventureData.isConfused)
        embedData.turnEmbed.setTitle(
          CombatHandler.generateGlitchedText("long")
        );
      else embedData.turnEmbed.setTitle(abilityInfo[0]);
    } else {
      if (adventureData.isConfused)
        embedData.turnEmbed.setTitle(
          CombatHandler.generateGlitchedText("long")
        );
      else
        embedData.turnEmbed.setTitle(
          `${adventureData.playerStand.Name} missed!`
        );
    }
  } else if (healAmount > 0) {
    // heal ability
    adventureData.playerHp += healAmount;

    adventureData.playerHp = Math.min(
      adventureData.playerHp,
      playerStand.Healthpoints
    );
    embedData.turnEmbed.setTitle(abilityInfo[0]);
  }

  // increment other ability counts except for used ability
  for (let i = 0; i < adventureData.playerStand.Ability.length; i++) {
    if (i == abilityIndex) {
      abilityCounts[i] = 0;
    } else {
      try {
        abilityCounts[i] = adventureData.savedData.PlayerAbilityCount[i] + 1;
      } catch (err) {
        console.log(err);
      }
    }
  }

  // update duel data
  // check if player used time stop ability
  if (timeStopTurns > 0)
    await CombatHandler.updateAdventureSchema(AdventureInfo, adventureData, {
      AttackRollHeight: 100,
      PlayerAbilityCount: abilityCounts,
      DefenseModifier: currentDefenseModifier,
    });
  else
    await CombatHandler.updateAdventureSchema(AdventureInfo, adventureData, {
      AttackRollHeight: 100,
      PlayerAbilityCount: abilityCounts,
      DefenseModifier: currentDefenseModifier,
      TimeStopTurns: adventureData.timeStopTurns - 1,
    });

  await CombatHandler.checkStandDeath(adventureData);
}

function surrender(buttonInteract, adventureData, embedData) {
  embedData.turnEmbed.setTitle(
    `${adventureData.player.username} surrenders! ${adventureData.opponent.displayName} wins the duel.`
  );

  adventureData.playerWinState = "SURRENDER";
  CombatHandler.endAdventure(buttonInteract, adventureData, embedData);
}
