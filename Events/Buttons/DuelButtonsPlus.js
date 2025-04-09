const {
  Client,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const CombatHandler = require("../../Utility/CombatHandler");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");
const StandAbilities = require("../../Local Storage/standAbilities");
const DuelInfo = require("../../Schemas/DuelInfo");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} buttonInteract
   * @param {Client} client
   */
  async execute(buttonInteract, client) {
    //#region SETUP
    // check if interaction is a button
    if (!buttonInteract.isButton()) return;

    // Split custom id
    const splitArray = buttonInteract.customId.split("-");
    if (splitArray[0] !== "Duel") return;
    guildId = splitArray[2];

    var challenger = await client.users.cache.get(splitArray[3]);
    var challenged = await client.users.cache.get(splitArray[4]);

    let duelManager = new CombatHandler.DuelManager();
    await duelManager.init(guildId, challenger, challenged, client);

    if (
      !duelManager.currentPlayer &&
      buttonInteract.user.id !== duelManager.challenged.id
    )
      return await buttonInteract.deferUpdate().catch(console.error);

    if (
      duelManager.currentPlayer &&
      buttonInteract.user.id !== duelManager.currentPlayer.id
    )
      return await buttonInteract.deferUpdate().catch(console.error);

    if (duelManager.savedData) {
      if (duelManager.currentPlayer.id == duelManager.challenger.id) {
        duelManager.currentStand = duelManager.challengerStand;
        duelManager.otherStand = duelManager.challengedStand;
      } else {
        duelManager.currentStand = duelManager.challengedStand;
        duelManager.otherStand = duelManager.challengerStand;
      }

      if (duelManager.timeStopTurns > 0)
        duelManager.fightEmbed.setTitle(
          `${duelManager.currentPlayer.username}'s Turn`
        );
      else
        duelManager.fightEmbed.setTitle(
          `${duelManager.otherPlayer.username}'s Turn`
        );
    } else {
      if (
        duelManager.challengerStand.Speed >= duelManager.challengedStand.Speed
      ) {
        duelManager.currentPlayer = duelManager.challenger;
        duelManager.otherPlayer = duelManager.challenged;
        duelManager.currentStand = duelManager.challengerStand;
        duelManager.otherStand = duelManager.challengedStand;
      } else {
        duelManager.currentPlayer = duelManager.challenged;
        duelManager.otherPlayer = duelManager.challenger;
        duelManager.currentStand = duelManager.challengedStand;
        duelManager.otherStand = duelManager.challengerStand;
      }

      duelManager.fightEmbed.setTitle(
        `${duelManager.currentPlayer.username}'s Turn`
      );
    }

    duelManager.areAbilitiesInCooldown = Array(
      duelManager.currentStand.Ability.length
    ).fill(true);

    let challengerAbilityCount;
    let challengedAbilityCount;

    if (duelManager.savedData) {
      challengerAbilityCount = duelManager.savedData.ChallengerAbilityCount;
      challengedAbilityCount = duelManager.savedData.ChallengedAbilityCount;
    } else {
      challengerAbilityCount = Array(
        duelManager.challengerStand.Ability.length
      ).fill(0);
      challengedAbilityCount = Array(
        duelManager.challengedStand.Ability.length
      ).fill(0);
    }

    let isNewDuel = false;

    switch (splitArray[1]) {
      case "Accept":
        // Start duel
        // Check if challenged player is inviting
        let challengedBooleans = await PlayerBooleans.findOne({
          Guild: duelManager.guildId,
          User: duelManager.challenged.id,
        });

        if (challengedBooleans.IsInvitingToDuel) {
          await duelManager.updateSchema(
            PlayerBooleans,
            { IsInvitingToDuel: false },
            false,
            duelManager.challenger
          );

          return await buttonInteract.update({
            content: `${duelManager.challenged.username} is already inviting someone!`,
            embeds: [],
            components: [],
          });
        }

        // Set IsDueling to true for both players
        duelManager.updateSchema(
          PlayerBooleans,
          { IsDueling: true },
          false,
          duelManager.challenger
        );
        duelManager.updateSchema(
          PlayerBooleans,
          { IsDueling: true },
          false,
          duelManager.challenged
        );

        // Set IsInvitingToDuel to false
        duelManager.updateSchema(
          PlayerBooleans,
          { IsInvitingToDuel: false },
          false,
          duelManager.challenger
        );

        isNewDuel = true;

        duelManager.updateAbilityUI();
        duelManager.updateDisplay();

        // reply
        await buttonInteract.deferUpdate();
        await buttonInteract.editReply({
          content: `<@${duelManager.challenger.id}> <@${duelManager.challenged.id}>`,
          embeds: [duelManager.fightEmbed],
          components: [duelManager.duelButtons, duelManager.abilityButtons],
          fetchReply: true,
        });
        break;
      case "Decline":
        // update booleans
        duelManager.updateSchema(
          PlayerBooleans,
          { IsInvitingToDuel: false },
          false,
          duelManager.challenger
        );

        // reply
        await buttonInteract.deferUpdate();
        return buttonInteract.editReply({
          embeds: [],
          components: [],
          content: `<@${challenger.id}>, ${challenged.username} declined the duel invite.`,
        });
      case "Attack":
        // roll for attack
        let attackRoll =
          Math.floor(Math.random() * duelManager.attackRollHeight) + 1;

        // check for defense modifiers
        var nextDefenseModifier = 1;
        if (duelManager.savedData)
          nextDefenseModifier = duelManager.savedData.DefenseModifier;

        // check if attack hits
        if (
          attackRoll >=
          duelManager.otherStand.Defense * nextDefenseModifier
        ) {
          let damage =
            Math.floor(Math.random() * duelManager.currentStand.Attack) + 1;

          if (duelManager.isConfused)
            duelManager.turnEmbed.setTitle(
              CombatHandler.generateGlitchedText("long")
            );
          else
            duelManager.turnEmbed.setTitle(
              `${duelManager.currentStand.Name}'s attack hits! It deals ${damage} damage.`
            );

          if (duelManager.otherPlayer.id == duelManager.challenger.id)
            duelManager.challengerHp -= damage;
          else duelManager.challengedHp -= damage;
        } else {
          if (duelManager.isConfused)
            duelManager.turnEmbed.setTitle(
              CombatHandler.generateGlitchedText("long")
            );
          else
            duelManager.turnEmbed.setTitle(
              `${duelManager.currentStand.Name} missed!`
            );
        }

        // increment ability count
        for (let i = 0; i < duelManager.currentStand.Ability.length; i++) {
          try {
            if (duelManager.currentStand == duelManager.challengerStand)
              duelManager.challengerAbilityCount[i] =
                duelManager.savedData.ChallengerAbilityCount[i] + 1;
            else
              duelManager.challengedAbilityCount[i] =
                duelManager.savedData.ChallengedAbilityCount[i] + 1;
          } catch (err) {}
        }

        // update duel data
        await duelManager.updateSchema(
          DuelInfo,
          {
            AttackRollHeight: 100,
            ChallengerAbilityCount: duelManager.challengerAbilityCount,
            ChallengedAbilityCount: duelManager.challengedAbilityCount,
            DefenseModifier: 1,
          },
          true
        );

        duelManager.checkStandDeath();
        break;
      case "Dodge":
        if (duelManager.isConfused)
          duelManager.turnEmbed.setTitle(
            CombatHandler.generateGlitchedText("long")
          );
        else
          duelManager.turnEmbed.setTitle(
            `${duelManager.currentStand.Name} prepares to dodge!`
          );

        // increment ability count
        for (let i = 0; i < duelManager.currentStand.Ability.length; i++) {
          try {
            if (duelManager.currentStand == duelManager.challengerStand)
              duelManager.challengerAbilityCount[i] =
                duelManager.savedData.ChallengerAbilityCount[i] + 1;
            else
              duelManager.challengedAbilityCount[i] =
                duelManager.savedData.ChallengedAbilityCount[i] + 1;
          } catch (err) {}
        }

        // update duel data
        duelManager.updateSchema(
          DuelInfo,
          {
            AttackRollHeight: 75,
            ChallengerAbilityCount: duelManager.challengerAbilityCount,
            ChallengedAbilityCount: duelManager.challengedAbilityCount,
            DefenseModifier: 1,
          },
          true
        );

        await duelManager.checkStandDeath();
        break;
      case "Ability":
        // fetch ability
        let ability = duelManager.currentStand.Ability[splitArray[5]];
        let abilityId = ability.id;
        let abilityInfo = StandAbilities.abilities[abilityId](
          duelManager.currentStand,
          duelManager.otherStand,
          ability
        );

        let damage = abilityInfo[1];
        let healAmount = abilityInfo[2];
        var nextDefenseModifier = abilityInfo[3];
        let currentDefenseModifier = abilityInfo[4];
        if (abilityInfo[6] > 0) duelManager.timeStopTurns = abilityInfo[6];

        // execute ability
        if (duelManager.timeStopTurns > 0) {
          duelManager.fightEmbed.setTitle(`${currentPlayer.username}'s Turn`);
          duelManager.turnEmbed.setTitle(abilityInfo[0]);
        } else if (damage > 0) {
          // attack based ability
          let attackRoll =
            Math.floor(Math.random() * duelManager.attackRollHeight) + 1;
          let defenseMod = 1;
          if (currentDefenseModifier)
            defenseMod = currentDefenseModifier.DefenseModifier;
          if (
            attackRoll >=
            duelManager.otherStand.Defense * defenseMod * currentDefenseModifier
          ) {
            let damage = abilityInfo[1];

            if (duelManager.otherPlayer.id == duelManager.challenger.id)
              duelManager.challengerHp -= damage;
            else duelManager.challengedHp -= damage;

            if (healAmount > 0) {
              // life steal ability
              if (duelManager.currentPlayer.id == duelManager.challenger.id)
                duelManager.challengerHp += healAmount;
              else duelManager.challengedHp += healAmount;

              duelManager.challengerHp = Math.min(
                duelManager.challengerHp,
                duelManager.challengerStand.Healthpoints
              );
              duelManager.challengedHp = Math.min(
                duelManager.challengedHp,
                duelManager.challengedStand.Healthpoints
              );
            }

            if (duelManager.isConfused)
              duelManager.turnEmbed.setTitle(
                CombatHandler.generateGlitchedText("long")
              );
            else duelManager.turnEmbed.setTitle(abilityInfo[0]);
          } else {
            if (duelManager.isConfused)
              duelManager.turnEmbed.setTitle(
                CombatHandler.generateGlitchedText("long")
              );
            else
              duelManager.turnEmbed.setTitle(
                `${duelManager.currentStand.Name} missed!`
              );
          }
        } else if (healAmount > 0) {
          // heal ability
          if (duelManager.currentPlayer.id == duelManager.challenger.id)
            duelManager.challengerHp += healAmount;
          else duelManager.challengedHp += healAmount;

          duelManager.challengerHp = Math.min(
            duelManager.challengerHp,
            duelManager.challengerStand.Healthpoints
          );
          duelManager.challengedHp = Math.min(
            duelManager.challengedHp,
            duelManager.challengedStand.Healthpoints
          );
          duelManager.turnEmbed.setTitle(abilityInfo[0]);
        }

        // increment other ability counts except for used ability
        for (let i = 0; i < duelManager.currentStand.Ability.length; i++) {
          if (duelManager.currentPlayer.id == duelManager.challenger.id) {
            if (i == splitArray[5]) {
              challengerAbilityCount[i] = 0;
            } else {
              try {
                challengerAbilityCount[i] =
                  duelManager.savedData.ChallengerAbilityCount[i] + 1;
              } catch (err) {
                console.log(err);
              }
            }
          } else {
            if (i == splitArray[5]) {
              challengedAbilityCount[i] = 0;
            } else {
              try {
                challengedAbilityCount[i] =
                  duelManager.savedData.ChallengedAbilityCount[i] + 1;
              } catch (err) {
                console.log(err);
              }
            }
          }
        }

        // update duel data
        await duelManager.updateSchema(
          DuelInfo,
          {
            AttackRollHeight: 100,
            ChallengerAbilityCount: duelManager.challengerAbilityCount,
            ChallengedAbilityCount: duelManager.challengedAbilityCount,
            DefenseModifier: 1,
          },
          true
        );

        await duelManager.checkStandDeath();
        break;
      case "Surrender":
        duelManager.turnEmbed.setTitle(
          `${duelManager.currentPlayer.username} surrenders! ${duelManager.otherPlayer.username} wins the duel.`
        );

        duelManager.playerWinState =
          duelManager.currentPlayer == duelManager.challenger
            ? "CHALLENGED"
            : "CHALLENGER";
        await duelManager.endDuel(buttonInteract);

        if (Math.random() >= 0.5) {
          duelManager.rewardEmbed.setTitle(
            `${otherPlayer.username} found a loot crate!`
          );
          await duelManager.giveRewards();
          await reply(
            buttonInteract,
            [
              duelManager.turnEmbed,
              duelManager.winEmbed,
              duelManager.rewardEmbed,
            ],
            []
          );
        } else await reply(buttonInteract, [turnEmbed, winEmbed], []);
        break;
    }

    if (duelManager.isMatchOver) return duelManager.endDuel(buttonInteract);

    duelManager.updateAbilityUI();
    duelManager.updateDisplay();

    if (!isNewDuel)
      await CombatHandler.reply(
        buttonInteract,
        [duelManager.turnEmbed, duelManager.fightEmbed],
        [duelManager.duelButtons, duelManager.abilityButtons]
      );

    // initialize/update duel info
    if (!duelManager.savedData) {
      await DuelInfo.create({
        Guild: duelManager.guildId,
        Challenger: duelManager.challenger.id,
        Challenged: duelManager.challenged.id,
        CurrentPlayer: duelManager.currentPlayer.id,
        OtherPlayer: duelManager.otherPlayer.id,
        ChallengerHP: duelManager.challengerHp,
        ChallengedHP: duelManager.challengedHp,
        AttackRollHeight: 100,
        ChallengerAbilityCount: challengerAbilityCount,
        ChallengedAbilityCount: challengedAbilityCount,
        DefenseModifier: 1,
        TimeStopTurns: 0,
      });
    } else {
      if (duelManager.timeStopTurns > 0)
        await duelManager.updateSchema(
          DuelInfo,
          {
            CurrentPlayer: duelManager.currentPlayer.id,
            OtherPlayer: duelManager.otherPlayer.id,
            ChallengerHP: duelManager.challengerHp,
            ChallengedHP: duelManager.challengedHp,
            TimeStopTurns: duelManager.timeStopTurns - 1,
          },
          true
        );
      else
        await duelManager.updateSchema(
          DuelInfo,
          {
            CurrentPlayer: duelManager.otherPlayer.id,
            OtherPlayer: duelManager.currentPlayer.id,
            ChallengerHP: duelManager.challengerHp,
            ChallengedHP: duelManager.challengedHp,
            TimeStopTurns: duelManager.timeStopTurns - 1,
          },
          true
        );
    }
  },
};
