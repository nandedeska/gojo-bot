const {
  Client,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const StandStats = require("../../Schemas/StandStats");
const Inventory = require("../../Schemas/PlayerInventory");
const PlayerBooleans = require("../../Schemas/PlayerBooleans");
const Cooldowns = require("../../Schemas/Cooldowns");
const PlayerStats = require("../../Schemas/PlayerStats");
const StandAbilities = require("../../Local Storage/standAbilities");
const DuelInfo = require("../../Schemas/DuelInfo");
const GlitchedText = {
  LongString: [
    "I̶̤̕Ɉ̵͚͂'̷̩̇ƨ̵̜͘ ̶̫͝į̶͔́υ̴͙̑ƨ̴̘̋Ɉ̷̡͑ ̸͕͝ɒ̶̠̎ ̶̦̃d̴͍̉υ̸̙͊ɿ̴̻͝n̷̜͌i̴͕̊ñ̵̝ϱ̴̙͗ ̶̫̐m̶̛̙ɘ̸̬̾m̵͉͠o̶͜͝ɿ̶̑͜γ̴̸̧̜̘̰̈́̅̓̾̓ͅ",
    "Ỵ̸͠o̷̦͝υ̴̧̒ɿ̷̦͐ ̵̘̾w̸̝͂ö̸̡ɿ̴̖̾l̸̺̐b̶̨̽ ̷̢͗w̴͠ͅĭ̷͕l̸̤̊l̵̳̓ ̸̰̐ƨ̴̦̅o̵̟̔o̵͖̓n̵̞̆ ̸͇̃ɔ̷͖̑ɘ̴͕͆ɒ̶̫̊ƨ̵̯͌ɘ̸̩͘",
    "A̶͙̎ʇ̶̖͑Ɉ̶͉͝ɘ̷̩̓ɿ̵͚̃ ̷̹͘ɒ̷͎̃l̷̦̿l̶̺͠,̴͎̔ ̷͖̀ȋ̵̥Ɉ̷̭̚'̶̰͘ƨ̷̡͛ ̷͈͘į̷̮͝υ̵͈͝ƨ̸̱͆Ɉ̶̺̊ ̵̯͗ɒ̶̣̽ ̷̧́d̷̞̿υ̸̙̇ɿ̷̨̓ṋ̶̚ĩ̶̢n̴͎̉ϱ̴̜̑ ̸͍̅m̷͚̍ɘ̷̱͑m̷͈͒ò̶͔ɿ̷̘̔γ̴̺̂",
  ],
  ShortString: [
    "ḏ̸͔̞̯̔̔͑͘υ̵̧̪͎̫̌̈́̀͋ɿ̶̗͖͙̱̂͒͗̂n̷͓͖͉̾̂̔̊͜ḭ̸̧̰̐̅̾̃ͅn̸̨̰̝͎̅͋̐̕ϱ̸͇̦̩̻͂̊͐̽",
    "ʜ̸͔͙̤̰̈̉̒͘ɘ̸̢̤̫̘̔͊̚͝ɒ̷̧̺͖̖̀́̌̐ɿ̷̭͙̲̗̉́̈́͘Ɉ̵̡̖̠̾͆̀̀͜ɒ̵̝͓͙͍̇̇̌̚ɔ̶̧͖̩̠̍̇̀̐ʜ̴̢͇͙͙̑͊̉͠ɘ̶͈͙̻̝̉̍̓͗ƨ̸̨̯̭̉͘͜͝͠",
    "ƨ̶̨͎̦̫͒̑̽̕ʜ̴̡̪̼͉̇̈́̏͘o̶̦͙̖̅͆͂̕ͅɿ̶̨̗̪̜̈́̍͗̄Ɉ̵̥̘̪̀̿̋̏ͅ",
    "b̷̹͉̀͒̅͊ͅͅɘ̶͍̪̖̮̈́͒̇́ḻ̶͎̻̣͒̇̄͝υ̵͈͔̘̩͋̂̽͂ƨ̴̠͈̩̱̇̓̈̕i̵̢̱̳̼͂͗̐̕o̷͓͉̥̝͛̐̅͠n̸̙̹̝̞͊̊̔̍",
    "ƨ̴̭̝̘̠̂̍̂̌ʜ̵̧̞̙̩̅̈́͝͝Ɉ̷̺̝͇͓̑͋̂̂o̸̪̱͓͉͐̇͑̎ ̴̱̭̹͕̆̂̌̔ɘ̶͕̟͚̻́́͂̄Ɉ̴̛̪̭̱͖̄͌̐ɒ̴͚̟̼̜̿̀̅͠",
    "ϱ̷̘̼͙̅́̀̈͜b̴̹̩̱͈͆͋̆̄ɘ̶̳̟̯̖̈́̈́̆̾ ̵͚̟̜̲̓̈́̊͗ɘ̶̮͈͚̟̂̋̑͝Ɉ̷̪̲̰̗̈́́̔̚ɒ̶̪̟͔͎͊͛͗̉",
  ],
  NumberString: ["୧̶͚̘͕̲͐͐̌͝͝ͅ୧̷̢̧̲͓̱͐͆͒̔̿", "მ̵̧̬̜͕̰̔̈͑͛̚μ̴̧̛̩̦̬̅̿̀͜͠", "Ɛ̶̧̩̙̙̰̆̑̔̓̌ς̶͙̪̩̥̮͛̀́͝͠", "Ɩ̵̛̼̤̯̱̲͂̌̀̊მ̷̝̘͓̤̞̀̾̅̽̚", "ɘ̵̨̡̺̬̞̀̀̂̉̎Ɉ̶̢͍͉͍̝̍͋͑̿͝ǭ̷͎̠̗̘̓̉̽͘", "m̶̹̦̓̑̏̏̕i̶͊̈́̚ƨ̴͕͂̊̂́̿ƨ̸͝"],
};

let guildId;
let challenger;
let challenged;
let currentPlayer;
let otherPlayer;

let currentDuelInfo;
let currentStand;
let otherStand;
let challengerStand;
let challengedStand;
let challengerHp;
let challengedHp;
let attackRollHeight;
let isConfused;

let fightEmbed;
let turnEmbed;
let winEmbed;
let rewardEmbed;

let standHasDied;

let abilityInCooldown;
let challengerCooldownText;
let challengedCooldownText;

let timeStopTurns;

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

    // Get user infos
    challenger = await client.users.cache.get(splitArray[3]);
    challenged = await client.users.cache.get(splitArray[4]);

    currentDuelInfo = await DuelInfo.findOne({
      Guild: guildId,
      Challenger: challenger.id,
      Challenged: challenged.id,
    });

    // Get duel info
    if (currentDuelInfo) {
      currentPlayer = currentDuelInfo.CurrentPlayer;
      otherPlayer = currentDuelInfo.OtherPlayer;
    }

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

    // set default values
    challengerHp = challengerStand.Healthpoints;
    challengedHp = challengedStand.Healthpoints;
    timeStopTurns = 0;
    attackRollHeight = 75;
    isConfused = false;
    standHasDied = false;

    // set values if they exist
    if (currentDuelInfo) {
      challengerHp = currentDuelInfo.ChallengerHP;
      challengedHp = currentDuelInfo.ChallengedHP;
      attackRollHeight = currentDuelInfo.AttackRollHeight;
      timeStopTurns = currentDuelInfo.TimeStopTurns;
    }

    //#region EMBEDS & BUTTONS
    fightEmbed = new EmbedBuilder()
      .setAuthor({
        name: `DUEL: ${challenger.username} vs ${challenged.username}`,
      })
      .setColor("#D31A38")
      .setImage(
        "https://cdn.discordapp.com/attachments/562958339034841098/1088740524342640700/image.png"
      );

    turnEmbed = new EmbedBuilder().setColor("#D31A38");

    winEmbed = new EmbedBuilder()
      .setColor("#D31A38")
      .setImage(
        "https://cdn.discordapp.com/attachments/675612229676040192/1089139526624084040/image.png"
      );

    rewardEmbed = new EmbedBuilder()
      .setColor("#FFDF00")
      .setAuthor({ name: "LOOT CRATE" })
      .setImage(
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5851f423-3ac3-4eef-88d5-2be0fc69382b/de3ayma-b38313b3-a404-4604-91e9-c7b9908f8ad1.png/v1/fill/w_1600,h_900,q_80,strp/jojo_stand_arrow_heads_by_mdwyer5_de3ayma-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6IlwvZlwvNTg1MWY0MjMtM2FjMy00ZWVmLTg4ZDUtMmJlMGZjNjkzODJiXC9kZTNheW1hLWIzODMxM2IzLWE0MDQtNDYwNC05MWU5LWM3Yjk5MDhmOGFkMS5wbmciLCJ3aWR0aCI6Ijw9MTYwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.y66dqY4BgvgJUSz2mCTRTKXmvoI5yxtf9yGNV349Ls0"
      )
      .setDescription("CONTACT DEVELOPER: REWARD EMBED ERROR");

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
        .setLabel("Surrender")
        .setCustomId(
          `Duel-Surrender-${guildId}-${challenger.id}-${challenged.id}`
        )
        .setStyle(ButtonStyle.Danger)
    );

    const abilityButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Ability")
        .setCustomId("Dummy")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );
    //#endregion EMBEDS & BUTTONS

    // set current and other player
    if (currentPlayer) {
      if (currentPlayer[0] == challenger.id) {
        currentStand = challengerStand;
        otherStand = challengedStand;
      } else {
        currentStand = challengedStand;
        otherStand = challengerStand;
      }

      if (timeStopTurns > 0) fightEmbed.setTitle(`${currentPlayer[1]}'s Turn`);
      else fightEmbed.setTitle(`${otherPlayer[1]}'s Turn`);
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

      fightEmbed.setTitle(`${currentPlayer.username}'s Turn`);
    }

    abilityInCooldown = Array(currentStand.Ability.length).fill(true);
    challengerCooldownText = "";
    challengedCooldownText = "";
    //#endregion SETUP

    //#region PLAYER TURN
    let challengerAbilityCount;
    let challengedAbilityCount;

    if (currentDuelInfo) {
      challengerAbilityCount = currentDuelInfo.ChallengerAbilityCount;
      challengedAbilityCount = currentDuelInfo.ChallengedAbilityCount;
    } else {
      challengerAbilityCount = Array(challengerStand.Ability.length).fill(0);
      challengedAbilityCount = Array(challengedStand.Ability.length).fill(0);
    }

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

        updateAbilityUI(abilityButtons);
        updateDuelDisplay();

        // reply
        await buttonInteract.deferUpdate();
        await buttonInteract.editReply({
          content: `<@${challenger.id}> <@${challenged.id}>`,
          embeds: [fightEmbed],
          components: [duelButtons, abilityButtons],
          fetchReply: true,
        });
        break;
      case "Decline":
        // update booleans
        await PlayerBooleans.updateOne(
          { Guild: guildId, User: challenger.id },
          { $set: { IsInvitingToDuel: false } }
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
        var attackRoll = Math.floor(Math.random() * attackRollHeight) + 1;

        // check for defense modifiers
        var nextDefenseModifier;
        try {
          nextDefenseModifier = currentDuelInfo.DefenseModifier;
        } catch (err) {
          nextDefenseModifier = 1;
        }

        // check if attack hits
        if (attackRoll >= otherStand.Defense * nextDefenseModifier) {
          var damage = Math.floor(Math.random() * currentStand.Attack) + 1;

          if (isConfused) turnEmbed.setTitle(generateGlitchedText("long"));
          else
            turnEmbed.setTitle(
              `${currentStand.Name}'s attack hits! It deals ${damage} damage.`
            );

          if (otherPlayer[0] == challenger.id) challengerHp -= damage;
          else challengedHp -= damage;
        } else {
          if (isConfused) turnEmbed.setTitle(generateGlitchedText("long"));
          else turnEmbed.setTitle(`${currentStand.Name} missed!`);
        }

        // increment ability count
        for (let i = 0; i < currentStand.Ability.length; i++) {
          try {
            if (currentStand == challengerStand)
              challengerAbilityCount[i] =
                currentDuelInfo.ChallengerAbilityCount[i] + 1;
            else
              challengedAbilityCount[i] =
                currentDuelInfo.ChallengedAbilityCount[i] + 1;
          } catch (err) {}
        }

        // update duel data
        await DuelInfo.updateOne(
          {
            Guild: guildId,
            Challenger: challenger.id,
            Challenged: challenged.id,
          },
          {
            $set: {
              AttackRollHeight: 75,
              ChallengerAbilityCount: challengerAbilityCount,
              ChallengedAbilityCount: challengedAbilityCount,
              DefenseModifier: 1,
            },
          }
        );

        // check for stand death
        await checkHealth(buttonInteract);
        if (standHasDied) return;
        updateAbilityUI(abilityButtons);
        updateDuelDisplay();

        // duel continue
        await reply(
          buttonInteract,
          [turnEmbed, fightEmbed],
          [duelButtons, abilityButtons]
        );

        console.log("DUEL PLAYER: ATTACK");
        break;
      case "Dodge":
        if (isConfused) turnEmbed.setTitle(generateGlitchedText("long"));
        else turnEmbed.setTitle(`${currentStand.Name} prepares to dodge!`);

        // increment ability count
        for (let i = 0; i < currentStand.Ability.length; i++) {
          try {
            if (currentStand == challengerStand)
              challengerAbilityCount[i] =
                currentDuelInfo.ChallengerAbilityCount[i] + 1;
            else
              challengedAbilityCount[i] =
                currentDuelInfo.ChallengedAbilityCount[i] + 1;
          } catch (err) {}
        }

        // update duel data
        await DuelInfo.updateOne(
          {
            Guild: guildId,
            Challenger: challenger.id,
            Challenged: challenged.id,
          },
          {
            $set: {
              AttackRollHeight: 75,
              ChallengerAbilityCount: challengerAbilityCount,
              ChallengedAbilityCount: challengedAbilityCount,
              DefenseModifier: 1,
            },
          }
        );

        // check for stand death
        await checkHealth(buttonInteract);
        if (standHasDied) return;
        updateAbilityUI(abilityButtons);
        updateDuelDisplay();

        // duel continue
        await reply(
          buttonInteract,
          [turnEmbed, fightEmbed],
          [duelButtons, abilityButtons]
        );

        console.log("DUEL PLAYER: DODGE");
        break;
      case "Ability":
        // fetch ability
        let ability = currentStand.Ability[splitArray[5]];
        let abilityId = ability.id;
        let abilityInfo = StandAbilities.abilities[abilityId](
          currentStand,
          otherStand,
          ability
        );

        var damage = abilityInfo[1];
        var healAmount = abilityInfo[2];
        var nextDefenseModifier = abilityInfo[3];
        var currentDefenseModifier = abilityInfo[4];
        if (abilityInfo[6] > 0) timeStopTurns = abilityInfo[6];

        // execute ability
        if (timeStopTurns > 0) {
          fightEmbed.setTitle(`${currentPlayer[1]}'s Turn`);
          turnEmbed.setTitle(abilityInfo[0]);
        } else if (damage > 0) {
          // attack based ability
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
              // life steal ability
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

            if (isConfused) turnEmbed.setTitle(generateGlitchedText("long"));
            else turnEmbed.setTitle(abilityInfo[0]);
          } else {
            if (isConfused) turnEmbed.setTitle(generateGlitchedText("long"));
            else turnEmbed.setTitle(`${currentStand.Name} missed!`);
          }
        } else if (healAmount > 0) {
          // heal ability
          if (currentPlayer[0] == challenger.id) challengerHp += healAmount;
          else challengedHp += healAmount;

          challengerHp = Math.min(challengerHp, challengerStand.Healthpoints);
          challengedHp = Math.min(challengedHp, challengedStand.Healthpoints);
          turnEmbed.setTitle(abilityInfo[0]);
        }

        // increment other ability counts except for used ability
        for (let i = 0; i < currentStand.Ability.length; i++) {
          if (currentPlayer[0] == challenger.id) {
            if (i == splitArray[5]) {
              challengerAbilityCount[i] = 0;
              console.log(`PLAYER: USED ABILITY ${i + 1}`);
            } else {
              try {
                challengerAbilityCount[i] =
                  currentDuelInfo.ChallengerAbilityCount[i] + 1;
              } catch (err) {
                console.log(err);
              }
            }
          } else {
            if (i == splitArray[5]) {
              challengedAbilityCount[i] = 0;
              console.log(`PLAYER: USED ABILITY ${i + 1}`);
            } else {
              try {
                challengedAbilityCount[i] =
                  currentDuelInfo.ChallengedAbilityCount[i] + 1;
              } catch (err) {
                console.log(err);
              }
            }
          }
        }

        // update duel data
        await DuelInfo.updateOne(
          {
            Guild: guildId,
            Challenger: challenger.id,
            Challenged: challenged.id,
          },
          {
            $set: {
              AttackRollHeight: 75,
              ChallengerAbilityCount: challengerAbilityCount,
              ChallengedAbilityCount: challengedAbilityCount,
              DefenseModifier: 1,
            },
          }
        );

        // check for stand death
        await checkHealth(buttonInteract);
        if (standHasDied) return;
        updateAbilityUI(abilityButtons);
        updateDuelDisplay();

        // duel continue
        await reply(
          buttonInteract,
          [turnEmbed, fightEmbed],
          [duelButtons, abilityButtons]
        );
        break;
      case "Surrender":
        turnEmbed.setTitle(
          `${currentPlayer[1]} surrenders! ${otherPlayer[1]} wins the duel.`
        );

        await endDuel(otherPlayer, currentPlayer);

        if (Math.random() >= 0.5) {
          rewardEmbed.setTitle(`${otherPlayer[1]} found a loot crate!`);
          await giveRewards(otherPlayer, guildId, rewardEmbed);
          await reply(buttonInteract, [turnEmbed, winEmbed, rewardEmbed], []);
        } else await reply(buttonInteract, [turnEmbed, winEmbed], []);
        break;
    }
    //#endregion PLAYER TURN

    // initialize/update duel info
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
        ChallengerAbilityCount: challengerAbilityCount,
        ChallengedAbilityCount: challengedAbilityCount,
        DefenseModifier: 1,
        TimeStopTurns: 0,
      });
    } else {
      if (timeStopTurns > 0)
        await DuelInfo.updateOne(
          {
            Guild: guildId,
            Challenger: challenger.id,
            Challenged: challenged.id,
          },
          {
            $set: {
              CurrentPlayer: currentPlayer,
              OtherPlayer: otherPlayer,
              ChallengerHP: challengerHp,
              ChallengedHP: challengedHp,
              TimeStopTurns: timeStopTurns - 1,
            },
          }
        );
      else
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
              TimeStopTurns: timeStopTurns - 1,
            },
          }
        );
    }
  },
};

async function checkHealth(buttonInteract) {
  if (challengerHp <= 0 && challengedHp <= 0) {
    // duel draw
    winEmbed.setTitle("The duel ended in a draw!");

    await endDuelDraw();

    standHasDied = true;

    return await reply(buttonInteract, [fightEmbed], []);
  } else if (challengerHp <= 0) {
    // challenger won
    winEmbed.setTitle(`${challenged.username} won the duel!`);

    await endDuel(challenged, challenger);

    standHasDied = true;

    // handle rewards
    if (Math.random() >= 0.5) {
      rewardEmbed.setTitle(`${challenged.username} found a loot crate!`);
      await giveRewards(challenged, guildId, rewardEmbed);
      return await reply(
        buttonInteract,
        [turnEmbed, winEmbed, rewardEmbed],
        []
      );
    }

    return await reply(buttonInteract, [turnEmbed, winEmbed, rewardEmbed], []);
  } else if (challengedHp <= 0) {
    // challenged won
    winEmbed.setTitle(`${challenger.username} won the duel!`);

    await endDuel(challenger, challenged);

    standHasDied = true;

    // handle rewards
    if (Math.random() >= 0.5) {
      rewardEmbed.setTitle(`${challenged.username} found a loot crate!`);
      await giveRewards(challenged, guildId, rewardEmbed);
      return await reply(
        buttonInteract,
        [turnEmbed, winEmbed, rewardEmbed],
        []
      );
    }

    return await reply(buttonInteract, [turnEmbed, winEmbed], []);
  } else standHasDied = false;
}

async function generateGlitchedText(type) {
  switch (type) {
    case "short":
      return GlitchedText.ShortString[
        Math.floor(Math.random() * GlitchedText.ShortString.length)
      ];
    case "long":
      return GlitchedText.LongString[
        Math.floor(Math.random() * GlitchedText.LongString.length)
      ];
    case "number":
      return GlitchedText.NumberString[
        Math.floor(Math.random() * GlitchedText.NumberString.length)
      ];
  }
}

function updateAbilityUI(abilityButtons) {
  let buttons = [];
  if (currentDuelInfo) {
    if (timeStopTurns > 0) {
      for (let i = 0; i < currentStand.Ability.length; i++) {
        if (currentStand == challengerStand) {
          if (
            currentDuelInfo.ChallengerAbilityCount[i] <
            currentStand.Ability[i].cooldown
          )
            abilityInCooldown[i] = true;
          else abilityInCooldown[i] = false;
        } else if (currentStand == challengedStand) {
          if (
            currentDuelInfo.ChallengedAbilityCount[i] <
            currentStand.Ability[i].cooldown
          )
            abilityInCooldown[i] = true;
          else abilityInCooldown[i] = false;
        }

        abilityButton = new ButtonBuilder()
          .setLabel(`Ability ${i + 1}`)
          .setCustomId(
            `Duel-Ability-${guildId}-${challenger.id}-${challenged.id}-${i}`
          )
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(abilityInCooldown[i]);

        buttons.push(abilityButton);
      }
    } else {
      for (let i = 0; i < otherStand.Ability.length; i++) {
        if (otherStand == challengerStand) {
          if (
            currentDuelInfo.ChallengerAbilityCount[i] <
            otherStand.Ability[i].cooldown
          )
            abilityInCooldown[i] = true;
          else abilityInCooldown[i] = false;
        } else if (otherStand == challengedStand) {
          if (
            currentDuelInfo.ChallengedAbilityCount[i] <
            otherStand.Ability[i].cooldown
          )
            abilityInCooldown[i] = true;
          else abilityInCooldown[i] = false;
        }

        abilityButton = new ButtonBuilder()
          .setLabel(`Ability ${i + 1}`)
          .setCustomId(
            `Duel-Ability-${guildId}-${challenger.id}-${challenged.id}-${i}`
          )
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(abilityInCooldown[i]);

        buttons.push(abilityButton);
      }
    }
    abilityButtons.setComponents(buttons);
  }
}

function updateDuelDisplay() {
  if (currentDuelInfo) {
    for (let i = 0; i < challengerStand.Ability.length; i++) {
      challengerCooldownText += setCooldownText(
        challengerStand,
        i,
        currentDuelInfo.ChallengerAbilityCount
      );
    }

    for (let i = 0; i < challengedStand.Ability.length; i++) {
      challengedCooldownText += setCooldownText(
        challengedStand,
        i,
        currentDuelInfo.ChallengedAbilityCount
      );
    }
  }

  console.log(`${challengerCooldownText} || ${challengedCooldownText}`);

  fightEmbed.addFields(
    {
      name: `${challengerStand.Name}`,
      value: `Healthpoints: ${Math.max(challengerHp, 0)} / ${
        challengerStand.Healthpoints
      }${challengerCooldownText}`,
    },
    {
      name: `${challengedStand.Name}`,
      value: `Healthpoints: ${Math.max(challengedHp, 0)} / ${
        challengedStand.Healthpoints
      }${challengedCooldownText}`,
    }
  );
}

function setCooldownText(stand, abilityIndex, abilityCount) {
  if (abilityCount[abilityIndex] < stand.Ability[abilityIndex].cooldown) {
    return `\nAbility Cooldown: ${
      stand.Ability[abilityIndex].cooldown - abilityCount[abilityIndex]
    } Turns`;
  } else {
    return "\nAbility Ready!";
  }
}

async function reply(buttonInteract, embedList) {
  await buttonInteract.deferUpdate();
  await buttonInteract.editReply({
    embeds: embedList,
  });
}

async function reply(buttonInteract, embedList, componentList) {
  await buttonInteract.deferUpdate();
  await buttonInteract.editReply({
    embeds: embedList,
    components: componentList,
  });
}

async function giveRewards(rewardUser) {
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

async function endDuel(winner, loser) {
  await clearDuelInfo();

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

async function endDuelDraw() {
  console.log("cleared duel info");
  clearDuelInfo();

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

async function clearDuelInfo() {
  await DuelInfo.findOneAndDelete({
    Guild: guildId,
    Challenger: challenger.id,
    Challenged: challenged.id,
  });
  console.log("cleared duel info");
}
