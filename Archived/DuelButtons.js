const {
  Client,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const StandStats = require("../Schemas/StandStats");
const Inventory = require("../Schemas/PlayerInventory");
const PlayerBooleans = require("../Schemas/PlayerBooleans");
const Cooldowns = require("../Schemas/Cooldowns");
const PlayerStats = require("../Schemas/PlayerStats");
const DuelInfo = require("../Schemas/DuelInfo");
const StandAbilities = require("../Local Storage/standAbilities");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} buttonInteract
   * @param {Client} client
   * @returns
   */
  async execute(buttonInteract, client) {
    // Check if interaction is a button
    if (!buttonInteract.isButton()) return;

    // Split custom id
    const splitArray = buttonInteract.customId.split("-");
    if (splitArray[0] !== "Duel") return;
    const guildId = splitArray[2];

    // Get duel embed
    const duelEmbed = buttonInteract.message.embeds[0];
    if (!duelEmbed)
      return buttonInteract.reply({
        content:
          "Error found: Unable to find duel embed. Contact the developer.",
        ephemeral: true,
      });

    // Get user infos
    let challenger = await client.users.cache.get(splitArray[3]);
    let challenged = await client.users.cache.get(splitArray[4]);

    // Set player stands
    let challengerStand;
    let challengedStand;

    let currentDuelInfo = await DuelInfo.findOne({
      Guild: guildId,
      Challenger: challenger.id,
      Challenged: challenged.id,
    });

    // Get duel info
    let currentPlayer;

    let otherPlayer;

    if (currentDuelInfo) {
      currentPlayer = currentDuelInfo.CurrentPlayer;
      otherPlayer = currentDuelInfo.OtherPlayer;
    }

    let currentStand;
    let otherStand;

    // Check user clicking button
    if (!currentPlayer && buttonInteract.user.id !== challenged.id)
      return await buttonInteract.deferUpdate().catch(console.error);

    if (currentPlayer && buttonInteract.user.id !== currentPlayer[0])
      return await buttonInteract.deferUpdate().catch(console.error);

    // Get player stands
    challengerStand = await StandStats.findOne({
      Guild: splitArray[2],
      User: splitArray[3],
    });
    challengedStand = await StandStats.findOne({
      Guild: splitArray[2],
      User: splitArray[4],
    });

    let challengerHp = challengerStand.Healthpoints;

    let challengedHp = challengedStand.Healthpoints;

    let attackRollHeight = 75;

    if (currentDuelInfo) {
      challengerHp = currentDuelInfo.ChallengerHP;
      challengedHp = currentDuelInfo.ChallengedHP;
      attackRollHeight = currentDuelInfo.AttackRollHeight;
    }

    //console.log(attackRollHeight)

    let fightEmbed = new EmbedBuilder()
      .setAuthor({
        name: `DUEL: ${challenger.username} vs ${challenged.username}`,
      })
      .setColor("#D31A38")
      .setImage(
        "https://cdn.discordapp.com/attachments/562958339034841098/1088740524342640700/image.png"
      )
      .addFields(
        {
          name: `${challengerStand.Name}`,
          value: `Healthpoints: ${Math.max(challengerHp, 0)} / ${
            challengerStand.Healthpoints
          }`,
        },
        {
          name: `${challengedStand.Name}`,
          value: `Healthpoints: ${Math.max(challengedHp, 0)} / ${
            challengedStand.Healthpoints
          }`,
        }
      );

    if (currentPlayer) {
      if (currentPlayer[0] == challenger.id) {
        currentStand = challengerStand;
        otherStand = challengedStand;
      } else {
        currentStand = challengedStand;
        otherStand = challengerStand;
      }
      console.log(otherPlayer);
      fightEmbed.setTitle(`${otherPlayer[1]}'s Turn`);
    } else {
      if (challengerStand.Speed >= challengedStand.Speed) {
        currentPlayer = challenger;
        otherPlayer = challenged;
        currentStand = challengerStand;
        otherStand = challengedStand;
      } else {
        currentPlayer = challenged;
        otherPlayer = challenger;
        currentStand = challengedStand;
        otherStand = challengerStand;
      }

      //console.log(currentPlayer);
      fightEmbed.setTitle(`${currentPlayer.username}'s Turn`);
    }

    //console.log(currentPlayer.username);

    //console.log(fightEmbed.data.title);

    /*await buttonInteract.update({
      content: `<@${challenger.id}> <@${challenged.id}>`,
      embeds: [fightEmbed],
      fetchReply: true,
    });*/

    //console.log(currentStand);

    let abilityInCooldown = true;
    let challengedCooldownText = "";
    let challengerCooldownText = "";

    if (currentDuelInfo) {
      //console.log(currentPlayer[1]);

      if (currentPlayer[0] == challenger.id) {
        if (
          currentDuelInfo.ChallengerAbilityCount <
          currentStand.Ability[0].cooldown
        ) {
          abilityInCooldown = true;
          challengerCooldownText = `\nAbility Cooldown: ${
            currentStand.Ability[0].cooldown -
            currentDuelInfo.ChallengerAbilityCount
          } Turns`;
        } else {
          //console.log("WHAT");
          challengerCooldownText = "\nAbility Ready!";
        }

        if (
          currentDuelInfo.ChallengedAbilityCount <
          otherStand.Ability[0].cooldown
        ) {
          challengedCooldownText = `\nAbility Cooldown: ${
            otherStand.Ability[0].cooldown -
            currentDuelInfo.ChallengedAbilityCount
          } Turns`;
        } else {
          //console.log("WHEN");
          abilityInCooldown = false;
          challengedCooldownText = "\nAbility Ready!";
        }
      } else {
        if (
          currentDuelInfo.ChallengedAbilityCount <
          currentStand.Ability[0].cooldown
        ) {
          abilityInCooldown = true;
          challengedCooldownText = `\nAbility Cooldown: ${
            currentStand.Ability[0].cooldown -
            currentDuelInfo.ChallengedAbilityCount
          } Turns`;
          //console.log(otherStand.Ability[0].cooldown - currentDuelInfo.ChallengedAbilityCount);
        } else {
          //console.log("WHO");
          challengedCooldownText = "\nAbility Ready!";
        }

        if (
          currentDuelInfo.ChallengerAbilityCount <
          otherStand.Ability[0].cooldown
        ) {
          challengerCooldownText = `\nAbility Cooldown: ${
            otherStand.Ability[0].cooldown -
            currentDuelInfo.ChallengerAbilityCount
          } Turns`;
        } else {
          //console.log("WHY");
          abilityInCooldown = false;
          challengerCooldownText = "\nAbility Ready!";
        }
      }

      fightEmbed.data.fields[0].value += challengerCooldownText;
      fightEmbed.data.fields[1].value += challengedCooldownText;

      //console.log(`${fightEmbed.data.fields[0].value}`);
    }

    const duelButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Attack")
        .setCustomId(`Duel-Attack-${guildId}-${challenger.id}-${challenged.id}`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setLabel("Dodge")
        .setCustomId(`Duel-Dodge-${guildId}-${challenger.id}-${challenged.id}`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel("Ability")
        .setCustomId(
          `Duel-Ability-${guildId}-${challenger.id}-${challenged.id}`
        )
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(abilityInCooldown),
      new ButtonBuilder()
        .setLabel("Surrender")
        .setCustomId(
          `Duel-Surrender-${guildId}-${challenger.id}-${challenged.id}`
        )
        .setStyle(ButtonStyle.Danger)
    );

    const turnEmbed = new EmbedBuilder().setColor("#D31A38");
    const winEmbed = new EmbedBuilder()
      .setColor("#D31A38")
      .setImage(
        "https://cdn.discordapp.com/attachments/675612229676040192/1089139526624084040/image.png"
      );
    const rewardEmbed = new EmbedBuilder()
      .setColor("#FFDF00")
      .setAuthor({ name: "LOOT CRATE" })
      .setImage(
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5851f423-3ac3-4eef-88d5-2be0fc69382b/de3ayma-b38313b3-a404-4604-91e9-c7b9908f8ad1.png/v1/fill/w_1600,h_900,q_80,strp/jojo_stand_arrow_heads_by_mdwyer5_de3ayma-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6IlwvZlwvNTg1MWY0MjMtM2FjMy00ZWVmLTg4ZDUtMmJlMGZjNjkzODJiXC9kZTNheW1hLWIzODMxM2IzLWE0MDQtNDYwNC05MWU5LWM3Yjk5MDhmOGFkMS5wbmciLCJ3aWR0aCI6Ijw9MTYwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.y66dqY4BgvgJUSz2mCTRTKXmvoI5yxtf9yGNV349Ls0"
      )
      .setDescription("CONTACT DEVELOPER: REWARD EMBED ERROR");

    switch (splitArray[1]) {
      case "Accept":
        // Start duel
        // Check if challenged player is inviting
        let challengedBooleans = await PlayerBooleans.findOne({
          Guild: guildId,
          User: challenged.id,
        });

        if (challengedBooleans.IsInvitingToDuel) {
          await PlayerBooleans.updateOne(
            { Guild: guildId, User: challenger.id },
            { $set: { IsInvitingToDuel: false } }
          );
          return await buttonInteract.update({
            content: `${challenged.username} is already inviting someone!`,
            embeds: [],
            components: [],
          });
        }

        // Set IsDueling to true for both players
        await PlayerBooleans.updateOne(
          { Guild: guildId, User: challenger.id },
          { $set: { IsDueling: true } }
        );

        await PlayerBooleans.updateOne(
          { Guild: guildId, User: challenged.id },
          { $set: { IsDueling: true } }
        );

        // Set IsInvitingToDuel to false
        await PlayerBooleans.updateOne(
          { Guild: guildId, User: challenger.id },
          { $set: { IsInvitingToDuel: false } }
        );

        await buttonInteract.deferUpdate();
        await buttonInteract.editReply({
          content: `<@${challenger.id}> <@${challenged.id}>`,
          embeds: [fightEmbed],
          components: [duelButtons],
          fetchReply: true,
        });
        break;
      case "Decline":
        await PlayerBooleans.updateOne(
          { Guild: guildId, User: challenger.id },
          { $set: { IsInvitingToDuel: false } }
        );
        await buttonInteract.deferUpdate();
        return buttonInteract.editReply({
          embeds: [],
          components: [],
          content: `<@${challenger.id}>, ${challenged.username} declined the duel invite.`,
        });
      case "Attack":
        var attackRoll = Math.floor(Math.random() * attackRollHeight) + 1;
        //console.log(`${attackRollHeight}`);
        var nextDefenseModifier = 1;
        try {
          nextDefenseModifier = currentDuelInfo.DefenseModifier;
        } catch (err) {
          console.log(err);
        }
        if (attackRoll >= otherStand.Defense * nextDefenseModifier) {
          var damage = Math.floor(Math.random() * currentStand.Attack) + 1;
          turnEmbed.setTitle(
            `${currentStand.Name}'s attack hits! It deals ${damage} damage.`
          );

          if (otherPlayer[0] == challenger.id) challengerHp -= damage;
          else challengedHp -= damage;
        } else turnEmbed.setTitle(`${currentStand.Name} missed!`);

        fightEmbed.data.fields[0].value = `Healthpoints: ${Math.max(
          challengerHp,
          0
        )} / ${challengerStand.Healthpoints}${challengerCooldownText}`;

        fightEmbed.data.fields[1].value = `Healthpoints: ${Math.max(
          challengedHp,
          0
        )} / ${challengedStand.Healthpoints}${challengedCooldownText}`;

        if (challengerHp <= 0 && challengedHp <= 0) {
          winEmbed.setTitle("The duel ended in a draw!");
          await endDuelDraw(guildId, challenger, challenged);
          await editEmbed(buttonInteract, [turnEmbed, winEmbed], []);
        } else if (challengerHp <= 0) {
          winEmbed.setTitle(`${challenged.username} won the duel!`);
          await endDuel(
            guildId,
            challenger,
            challenged,
            challenged,
            challenger
          );

          if (Math.random() >= 0.5) {
            rewardEmbed.setTitle(`${challenged.username} found a loot crate!`);
            await giveRewards(challenged, guildId, rewardEmbed);
            await editEmbed(
              buttonInteract,
              [turnEmbed, winEmbed, rewardEmbed],
              []
            );
          } else await editEmbed(buttonInteract, [turnEmbed, winEmbed], []);
        } else if (challengedHp <= 0) {
          winEmbed.setTitle(`${challenger.username} won the duel!`);
          await endDuel(
            guildId,
            challenger,
            challenged,
            challenger,
            challenged
          );
          if (Math.random() >= 0.5) {
            rewardEmbed.setTitle(`${challenger.username} found a loot crate!`);
            await giveRewards(challenger, guildId, rewardEmbed);
            await editEmbed(
              buttonInteract,
              [turnEmbed, winEmbed, rewardEmbed],
              []
            );
          } else await editEmbed(buttonInteract, [turnEmbed, winEmbed], []);
        } else
          await editEmbed(
            buttonInteract,
            [turnEmbed, fightEmbed],
            [duelButtons]
          );

        if (
          (currentPlayer[0] == challenged.id &&
            challengedStand.Speed < challengerStand.Speed) ||
          (currentPlayer[0] == challenger.id &&
            challengerStand.Speed < challengedStand.Speed)
        ) {
          await DuelInfo.updateOne(
            {
              Guild: guildId,
              Challenger: challenger.id,
              Challenged: challenged.id,
            },
            {
              $set: {
                AttackRollHeight: 75,
                ChallengerAbilityCount:
                  currentDuelInfo.ChallengerAbilityCount + 1,
                ChallengedAbilityCount:
                  currentDuelInfo.ChallengedAbilityCount + 1,
                DefenseModifier: 1,
              },
            }
          );
        } /*else {
          await DuelInfo.updateOne(
            {
              Guild: guildId,
              Challenger: challenger.id,
              Challenged: challenged.id,
            },
            {
              $set: {
                AttackRollHeight: 75,
                ChallengedAbilityCount:
                  currentDuelInfo.ChallengedAbilityCount + 1,
                DefenseModifier: 1,
              },
            }
          );
        }*/
        break;
      case "Dodge":
        turnEmbed.setTitle(`${currentStand.Name} prepares to dodge!`);
        if (currentPlayer[0] == challenger.id) {
          await DuelInfo.updateOne(
            {
              Guild: guildId,
              Challenger: challenger.id,
              Challenged: challenged.id,
            },
            {
              $set: {
                AttackRollHeight: 50,
                ChallengerAbilityCount:
                  currentDuelInfo.ChallengerAbilityCount + 1,
                DefenseModifier: 1,
              },
            }
          );
        } else {
          await DuelInfo.updateOne(
            {
              Guild: guildId,
              Challenger: challenger.id,
              Challenged: challenged.id,
            },
            {
              $set: {
                AttackRollHeight: 50,
                ChallengedAbilityCount:
                  currentDuelInfo.ChallengedAbilityCount + 1,
              },
            }
          );
        }
        await editEmbed(buttonInteract, [turnEmbed, fightEmbed], [duelButtons]);
        break;
      case "Ability":
        let ability = currentStand.Ability[0];
        let abilityName = ability.id;
        let abilityInfo = StandAbilities.abilities[abilityName](
          currentStand,
          otherStand,
          ability
        );

        var damage = abilityInfo[1];
        var healAmount = abilityInfo[2];
        var nextDefenseModifier = abilityInfo[3];
        var currentDefenseModifier = abilityInfo[4];

        if (damage > 0) {
          var attackRoll = Math.floor(Math.random() * attackRollHeight) + 1;
          var defenseMod = 1;
          if (currentDefenseModifier)
            defenseMod = currentDefenseModifier.DefenseModifier;
          if (
            attackRoll >=
            otherStand.Defense * defenseMod * currentDefenseModifier
          ) {
            var damage = abilityInfo[1];

            if (otherPlayer[0] == challenger.id) challengerHp -= damage;
            else challengedHp -= damage;

            if (healAmount > 0) {
              if (currentPlayer[0] == challenger.id) challengerHp += healAmount;
              else challengedHp += healAmount;

              challengerHp = Math.min(
                challengerHp,
                challengerStand.Healthpoints
              );
              challengedHp = Math.min(
                challengedHp,
                challengedStand.Healthpoints
              );
            }
            turnEmbed.setTitle(abilityInfo[0]);
          } else turnEmbed.setTitle(`${currentStand.Name} missed!`);
        } else if (healAmount > 0) {
          if (currentPlayer[0] == challenger.id) challengerHp += healAmount;
          else challengedHp += healAmount;

          challengerHp = Math.min(challengerHp, challengerStand.Healthpoints);
          challengedHp = Math.min(challengedHp, challengedStand.Healthpoints);
          turnEmbed.setTitle(abilityInfo[0]);
        }

        fightEmbed.data.fields[0].value = `Healthpoints: ${Math.max(
          challengerHp,
          0
        )} / ${challengerStand.Healthpoints}${challengerCooldownText}`;

        fightEmbed.data.fields[1].value = `Healthpoints: ${Math.max(
          challengedHp,
          0
        )} / ${challengedStand.Healthpoints}${challengedCooldownText}`;

        if (challengerHp <= 0 && challengedHp <= 0) {
          winEmbed.setTitle("The duel ended in a draw!");
          await endDuelDraw(guildId, challenger, challenged);
          await editEmbed(buttonInteract, [turnEmbed, winEmbed], []);
        } else if (challengerHp <= 0) {
          winEmbed.setTitle(`${challenged.username} won the duel!`);
          await endDuel(
            guildId,
            challenger,
            challenged,
            challenged,
            challenger
          );

          if (Math.random() >= 0.5) {
            rewardEmbed.setTitle(`${challenged.username} found a loot crate!`);
            await giveRewards(challenged, guildId, rewardEmbed);
            await editEmbed(
              buttonInteract,
              [turnEmbed, winEmbed, rewardEmbed],
              []
            );
          } else await editEmbed(buttonInteract, [turnEmbed, winEmbed], []);
        } else if (challengedHp <= 0) {
          winEmbed.setTitle(`${challenger.username} won the duel!`);
          await endDuel(
            guildId,
            challenger,
            challenged,
            challenger,
            challenged
          );
          if (Math.random() >= 0.5) {
            rewardEmbed.setTitle(`${challenger.username} found a loot crate!`);
            await giveRewards(challenger, guildId, rewardEmbed);
            await editEmbed(
              buttonInteract,
              [turnEmbed, winEmbed, rewardEmbed],
              []
            );
          } else await editEmbed(buttonInteract, [turnEmbed, winEmbed], []);
        } else
          await editEmbed(
            buttonInteract,
            [turnEmbed, fightEmbed],
            [duelButtons]
          );

        if (currentPlayer[0] == challenger.id) {
          await DuelInfo.updateOne(
            {
              Guild: guildId,
              Challenger: challenger.id,
              Challenged: challenged.id,
            },
            {
              $set: {
                AttackRollHeight: 75,
                ChallengerAbilityCount: 0,
                DefenseModifier: nextDefenseModifier,
              },
            }
          );
        } else {
          await DuelInfo.updateOne(
            {
              Guild: guildId,
              Challenger: challenger.id,
              Challenged: challenged.id,
            },
            {
              $set: {
                AttackRollHeight: 75,
                ChallengedAbilityCount: 0,
                DefenseModifier: nextDefenseModifier,
              },
            }
          );
        }

        break;
      case "Surrender":
        turnEmbed.setTitle(
          `${currentPlayer[1]} surrenders! ${otherPlayer[1]} wins the duel.`
        );

        await endDuel(
          guildId,
          challenger,
          challenged,
          otherPlayer,
          currentPlayer
        );

        if (Math.random() >= 0.5) {
          rewardEmbed.setTitle(`${otherPlayer[1]} found a loot crate!`);
          await giveRewards(otherPlayer, guildId, rewardEmbed);
          await editEmbed(
            buttonInteract,
            [turnEmbed, winEmbed, rewardEmbed],
            []
          );
        } else await editEmbed(buttonInteract, [turnEmbed, winEmbed], []);
        break;
    }

    if (!currentDuelInfo) {
      await DuelInfo.create({
        Guild: guildId,
        Challenger: challenger.id,
        Challenged: challenged.id,
        CurrentPlayer: [currentPlayer.id, currentPlayer.username],
        OtherPlayer: [otherPlayer.id, otherPlayer.username],
        ChallengerHP: challengerHp,
        ChallengedHP: challengedHp,
        AttackRollHeight: 75,
        ChallengerAbilityCount: 0,
        ChallengedAbilityCount: 0,
        DefenseModifier: 1,
      });
    } else {
      await DuelInfo.updateOne(
        {
          Guild: guildId,
          Challenger: challenger.id,
          Challenged: challenged.id,
        },
        {
          $set: {
            CurrentPlayer: otherPlayer,
            OtherPlayer: currentPlayer,
            ChallengerHP: challengerHp,
            ChallengedHP: challengedHp,
          },
        }
      );
    }
  },
};

async function editEmbed(buttonInteract, embedList) {
  await buttonInteract.deferUpdate();
  await buttonInteract.editReply({ embeds: embedList });
}

async function editEmbed(buttonInteract, embedList, componentList) {
  await buttonInteract.deferUpdate();
  await buttonInteract.editReply({
    embeds: embedList,
    components: componentList,
  });
}

async function giveRewards(rewardUser, guildId, rewardEmbed) {
  let arrowAmount;
  let discAmount;
  let fruitAmount;

  arrowAmount = 1;
  discAmount = Math.floor(Math.random() * 25);
  fruitAmount = Math.floor(Math.random() * 50);
  let sum = arrowAmount + discAmount + fruitAmount;

  console.log(`${arrowAmount}-${discAmount}-${fruitAmount}`);

  arrowAmount = Math.round((arrowAmount / sum) * 4);
  discAmount = Math.round((discAmount / sum) * 4);
  fruitAmount = Math.round((fruitAmount / sum) * 4);

  let playerInventory = await Inventory.findOne({
    Guild: guildId,
    User: rewardUser.id,
  });

  await Inventory.updateOne(
    { Guild: guildId, User: rewardUser.id },
    {
      $set: {
        StandArrow: playerInventory.StandArrow + arrowAmount,
        StandDisc: playerInventory.StandDisc + discAmount,
        RocacacaFruit: playerInventory.RocacacaFruit + fruitAmount,
      },
    }
  );

  let rewardText = "";

  if (arrowAmount > 0) rewardText += `${arrowAmount}x Stand Arrow\n`;
  if (discAmount > 0) rewardText += `${discAmount}x Stand Disc\n`;
  if (fruitAmount > 0) rewardText += `${fruitAmount}x Rocacaca Fruit`;

  rewardEmbed.data.description = rewardText;
}

async function endDuel(guildId, challenger, challenged, winner, loser) {
  await clearDuelInfo(guildId, challenger, challenged);

  // Set IsDueling to false for both players
  await PlayerBooleans.updateOne(
    { Guild: guildId, User: winner.id },
    { $set: { IsDueling: false } }
  );

  await PlayerBooleans.updateOne(
    { Guild: guildId, User: loser.id },
    { $set: { IsDueling: false } }
  );

  // Set duel cooldown
  await Cooldowns.create({
    Guild: guildId,
    User: winner.id,
    Command: "duel",
    Cooldown: Date.now(),
  });
  await Cooldowns.create({
    Guild: guildId,
    User: loser.id,
    Command: "duel",
    Cooldown: Date.now(),
  });

  let winnerStats = await PlayerStats.findOne({
    Guild: guildId,
    User: winner.id,
  });

  if (!winnerStats) {
    winnerStats = await PlayerStats.create({
      Guild: guildId,
      User: winner.id,
      DuelWins: 0,
      DuelPlays: 0,
      AdventureWins: 0,
      AdventurePlays: 0,
    });
  }

  let loserStats = await PlayerStats.findOne({
    Guild: guildId,
    User: loser.id,
  });

  if (!loserStats) {
    loserStats = await PlayerStats.create({
      Guild: guildId,
      User: loser.id,
      DuelWins: 0,
      DuelPlays: 0,
      AdventureWins: 0,
      AdventurePlays: 0,
    });
  }

  await PlayerStats.updateOne(
    { Guild: guildId, User: winner.id },
    {
      $set: {
        DuelWins: winnerStats.DuelWins + 1,
        DuelPlays: winnerStats.DuelPlays + 1,
      },
    }
  );

  await PlayerStats.updateOne(
    { Guild: guildId, User: loser.id },
    {
      $set: {
        DuelPlays: loserStats.DuelPlays + 1,
      },
    }
  );
}

async function endDuelDraw(guildId, challenger, challenged) {
  console.log("cleared duel info");
  clearDuelInfo(guildId, challenger, challenged);

  // Set IsDueling to false for both players
  await PlayerBooleans.updateOne(
    { Guild: guildId, User: challenger.id },
    { $set: { IsDueling: false } }
  );

  await PlayerBooleans.updateOne(
    { Guild: guildId, User: challenged.id },
    { $set: { IsDueling: false } }
  );

  // Set duel cooldown
  await Cooldowns.create({
    Guild: guildId,
    User: challenger.id,
    Command: "duel",
    Cooldown: Date.now(),
  });
  await Cooldowns.create({
    Guild: guildId,
    User: challenged.id,
    Command: "duel",
    Cooldown: Date.now(),
  });

  let challengerStats = await PlayerStats.findOne({
    Guild: guildId,
    User: challenger.id,
  });

  if (!challengerStats) {
    challengerStats = await PlayerStats.create({
      Guild: guildId,
      User: challenger.id,
      DuelWins: 0,
      DuelPlays: 0,
      AdventureWins: 0,
      AdventurePlays: 0,
    });
  }

  let challengedStats = await PlayerStats.findOne({
    Guild: guildId,
    User: challenged.id,
  });

  if (!challengedStats) {
    challengedStats = await PlayerStats.create({
      Guild: guildId,
      User: challenged.id,
      DuelWins: 0,
      DuelPlays: 0,
      AdventureWins: 0,
      AdventurePlays: 0,
    });
  }

  await PlayerStats.updateOne(
    { Guild: guildId, User: challenger.id },
    {
      $set: {
        DuelPlays: challengerStats.DuelPlays + 1,
      },
    }
  );

  await PlayerStats.updateOne(
    { Guild: guildId, User: challenged.id },
    {
      $set: {
        DuelPlays: challengedStats.DuelPlays + 1,
      },
    }
  );
}

async function clearDuelInfo(guildId, challenger, challenged) {
  await DuelInfo.findOneAndDelete({
    Guild: guildId,
    Challenger: challenger.id,
    Challenged: challenged.id,
  });
  console.log("cleared duel info");
}
