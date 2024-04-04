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
const CooldownTime = 30000;
const PlayerStats = require("../../Schemas/PlayerStats");
const AdventureInfo = require("../../Schemas/AdventureInfo");
const StandAbilities = require("../../Local Storage/standAbilities");
const AdventureOpponents = require("../../Local Storage/adventureOpponents");
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

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} buttonInteract
   * @param {Client} client
   */
  async execute(buttonInteract, client) {
    // Check if interaction is a button
    if (!buttonInteract.isButton()) return;

    // Split custom id
    const splitArray = buttonInteract.customId.split("-");
    if (splitArray[0] !== "Adventure") return;
    const guildId = splitArray[2];

    // Get user info
    let player = await client.users.cache.get(splitArray[3]);

    let playerStand = await StandStats.findOne({
      Guild: guildId,
      User: player.id,
    });

    const { opponents } = AdventureOpponents;

    let opponent = opponents[splitArray[4]];

    let opponentStand = opponent.stand;

    let currentAdventureInfo = await AdventureInfo.findOne({
      Guild: guildId,
      User: splitArray[3],
    });

    if (buttonInteract.user.id !== splitArray[3])
      return await buttonInteract.deferUpdate().catch(console.error);

    let playerFirst = playerStand.Speed >= opponentStand.Speed ? true : false;

    let opponentTurnEmbed;
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

    let playerHp = playerStand.Healthpoints;

    let opponentHp = opponentStand.Healthpoints;

    let attackRollHeight = 75;

    let isConfused = false;

    if (currentAdventureInfo) {
      playerHp = currentAdventureInfo.PlayerHP;
      opponentHp = currentAdventureInfo.OpponentHP;
      attackRollHeight = currentAdventureInfo.AttackRollHeight;
      isConfused = currentAdventureInfo.IsConfused;
    }

    try {
      console.log(
        `START: ${currentAdventureInfo.DefenseModifier} plyr:${currentAdventureInfo.PlayerAbilityCount} bot:${currentAdventureInfo.OpponentAbilityCount}`
      );
    } catch (err) {
      console.log(err);
    }

    const fightEmbed = isConfused
      ? new EmbedBuilder()
          .setAuthor({
            name: `DUEL: ${player.username} vs ${opponent.displayName}`,
          })
          .setColor("#D31A38")
          .setImage(
            "https://cdn.discordapp.com/attachments/562958339034841098/1088740524342640700/image.png"
          )
          .addFields(
            {
              name: `${playerStand.Name}`,
              value: `${
                GlitchedText.ShortString[
                  Math.floor(Math.random() * GlitchedText.ShortString.length)
                ]
              }: ${
                GlitchedText.NumberString[
                  Math.floor(Math.random() * GlitchedText.NumberString.length)
                ]
              } / ${
                GlitchedText.NumberString[
                  Math.floor(Math.random() * GlitchedText.NumberString.length)
                ]
              }`,
            },
            {
              name: `${opponentStand.Name}`,
              value: `${
                GlitchedText.ShortString[
                  Math.floor(Math.random() * GlitchedText.ShortString.length)
                ]
              }: ${
                GlitchedText.NumberString[
                  Math.floor(Math.random() * GlitchedText.NumberString.length)
                ]
              } / ${
                GlitchedText.NumberString[
                  Math.floor(Math.random() * GlitchedText.NumberString.length)
                ]
              }`,
            }
          )
      : new EmbedBuilder()
          .setAuthor({
            name: `DUEL: ${player.username} vs ${opponent.displayName}`,
          })
          .setColor("#D31A38")
          .setImage(
            "https://cdn.discordapp.com/attachments/562958339034841098/1088740524342640700/image.png"
          )
          .addFields(
            {
              name: `${playerStand.Name}`,
              value: `Healthpoints: ${Math.max(playerHp, 0)} / ${
                playerStand.Healthpoints
              }`,
            },
            {
              name: `${opponentStand.Name}`,
              value: `Healthpoints: ${Math.max(opponentHp, 0)} / ${
                opponentStand.Healthpoints
              }`,
            }
          );

    const turnEmbed = new EmbedBuilder().setColor("#D31A38");
    const quoteEmbed = new EmbedBuilder()
      .setColor("#80FEFF")
      .setDescription(
        `**"${
          opponent.quotePool[
            Math.floor(Math.random() * opponent.quotePool.length)
          ]
        }"**`
      )
      .setFooter({ text: `${opponent.displayName}` });

    let abilityInCooldown = true;
    let playerCooldownText = "";
    let opponentCooldownText = "";

    if (currentAdventureInfo) {
      //console.log(currentPlayer[1]);
      //console.log(currentAdventureInfo.PlayerAbilityCount);

      if (
        currentAdventureInfo.PlayerAbilityCount <
        playerStand.Ability[0].cooldown
      ) {
        abilityInCooldown = true;
        playerCooldownText = isConfused
          ? GlitchedText.LongString[
              Math.floor(Math.random() * GlitchedText.LongString.length)
            ]
          : `\nAbility Cooldown: ${
              playerStand.Ability[0].cooldown -
              currentAdventureInfo.PlayerAbilityCount
            } Turns`;
      } else {
        //console.log("WHAT");
        abilityInCooldown = false;
        playerCooldownText = isConfused
          ? GlitchedText.LongString[
              Math.floor(Math.random() * GlitchedText.LongString.length)
            ]
          : "\nAbility Ready!";
      }

      if (
        currentAdventureInfo.OpponentAbilityCount <
        opponentStand.Ability[0].cooldown
      ) {
        opponentCooldownText = isConfused
          ? GlitchedText.LongString[
              Math.floor(Math.random() * GlitchedText.LongString.length)
            ]
          : `\nAbility Cooldown: ${
              opponentStand.Ability[0].cooldown -
              currentAdventureInfo.OpponentAbilityCount
            } Turns`;
      } else {
        //console.log("WHEN");
        opponentCooldownText = isConfused
          ? GlitchedText.LongString[
              Math.floor(Math.random() * GlitchedText.LongString.length)
            ]
          : "\nAbility Ready!";
      }

      fightEmbed.data.fields[0].value += playerCooldownText;
      fightEmbed.data.fields[1].value += opponentCooldownText;

      //console.log(`${fightEmbed.data.fields[0].value}`);

      //console.log(abilityInCooldown);
      //console.log(currentAdventureInfo.PlayerAbilityCount);
    }

    const adventureButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Attack")
        .setCustomId(`Adventure-Attack-${guildId}-${player.id}-${opponent.id}`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setLabel("Dodge")
        .setCustomId(`Adventure-Dodge-${guildId}-${player.id}-${opponent.id}`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel("Ability")
        .setCustomId(`Adventure-Ability-${guildId}-${player.id}-${opponent.id}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(abilityInCooldown),
      new ButtonBuilder()
        .setLabel("Surrender")
        .setCustomId(
          `Adventure-Surrender-${guildId}-${player.id}-${opponent.id}`
        )
        .setStyle(ButtonStyle.Danger)
    );

    //#region BOT TURN
    // Opponent turn if player goes last
    if (!playerFirst || currentAdventureInfo) {
      const rand = Math.random();
      opponentTurnEmbed = new EmbedBuilder().setColor("#D31A38");
      let abilityCount = 0;

      if (currentAdventureInfo)
        abilityCount = currentAdventureInfo.OpponentAbilityCount;

      if (rand < 0.8) {
        if (abilityCount >= opponentStand.Ability[0].cooldown) {
          console.log("BOT: ABILITY");
          let ability = opponentStand.Ability[0];
          let abilityName = ability.id;
          let abilityInfo = StandAbilities.abilities[abilityName](
            opponentStand,
            playerStand,
            ability
          );

          var damage = abilityInfo[1];
          var healAmount = abilityInfo[2];
          var nextDefenseModifier = abilityInfo[3];
          var currentDefenseModifier = abilityInfo[4];
          isConfused = abilityInfo[5];

          if (damage > 0) {
            var attackRoll = Math.floor(Math.random() * attackRollHeight) + 1;
            var defenseMod = 1;
            if (currentAdventureInfo)
              defenseMod = currentAdventureInfo.DefenseModifier;
            if (
              attackRoll >=
              playerStand.Defense * defenseMod * currentDefenseModifier
            ) {
              var damage = abilityInfo[1];

              playerHp -= damage;
              if (healAmount > 0) {
                opponentHp += healAmount;

                playerHp = Math.min(playerHp, playerStand.Healthpoints);
                opponentHp = Math.min(opponentHp, opponentStand.Healthpoints);
              }

              if (isConfused)
                opponentTurnEmbed.setTitle(
                  GlitchedText.LongString[
                    Math.floor(Math.random() * GlitchedText.LongString.length)
                  ]
                );
              else opponentTurnEmbed.setTitle(abilityInfo[0]);
            } else {
              if (isConfused)
                opponentTurnEmbed.setTitle(
                  GlitchedText.LongString[
                    Math.floor(Math.random() * GlitchedText.LongString.length)
                  ]
                );
              else opponentTurnEmbed.setTitle(`${opponentStand.Name} missed!`);
            }
          } else if (healAmount > 0) {
            opponentHp += healAmount;

            playerHp = Math.min(playerHp, playerStand.Healthpoints);
            opponentHp = Math.min(opponentHp, opponentStand.Healthpoints);
            opponentTurnEmbed.setTitle(abilityInfo[0]);
          } else opponentTurnEmbed.setTitle(abilityInfo[0]);

          updateDisplay(
            fightEmbed,
            playerHp,
            playerStand,
            playerCooldownText,
            opponentHp,
            opponentStand,
            opponentCooldownText,
            isConfused
          );

          abilityCount = 0;

          await AdventureInfo.updateOne(
            {
              Guild: guildId,
              User: player.id,
            },
            {
              $set: {
                AttackRollHeight: 75,
                OpponentAbilityCount: 0,
                DefenseModifier: nextDefenseModifier,
              },
            }
          );
        } else {
          console.log("BOT: ATTACK");
          var attackRoll = Math.floor(Math.random() * attackRollHeight) + 1;
          var currentDefenseModifier = 1;
          try {
            currentDefenseModifier = currentAdventureInfo.DefenseModifier;
          } catch (err) {
            currentDefenseModifier = 1;
          }
          if (attackRoll >= playerStand.Defense * currentDefenseModifier) {
            var damage = Math.floor(Math.random() * opponentStand.Attack) + 1;
            if (isConfused)
              opponentTurnEmbed.setTitle(
                GlitchedText.LongString[
                  Math.floor(Math.random() * GlitchedText.LongString.length)
                ]
              );
            else
              opponentTurnEmbed.setTitle(
                `${opponentStand.Name}'s attack hits! It deals ${damage} damage.`
              );

            playerHp -= damage;
          } else {
            if (isConfused)
              opponentTurnEmbed.setTitle(
                GlitchedText.LongString[
                  Math.floor(Math.random() * GlitchedText.LongString.length)
                ]
              );
            else opponentTurnEmbed.setTitle(`${opponentStand.Name} missed!`);
          }

          updateDisplay(
            fightEmbed,
            playerHp,
            playerStand,
            playerCooldownText,
            opponentHp,
            opponentStand,
            opponentCooldownText,
            isConfused
          );

          await AdventureInfo.updateOne(
            { Guild: guildId, User: player.id },
            {
              $set: {
                AttackRollHeight: 75,
                OpponentAbilityCount: abilityCount + 1,
                DefenseModifier: 1,
              },
            }
          );
        }
      } else {
        console.log("BOT: DODGE");
        if (isConfused)
          opponentTurnEmbed.setTitle(
            GlitchedText.LongString[
              Math.floor(Math.random() * GlitchedText.LongString.length)
            ]
          );
        else
          opponentTurnEmbed.setTitle(
            `${opponentStand.Name} prepares to dodge!`
          );
        await AdventureInfo.updateOne(
          { Guild: guildId, User: player.id },
          {
            $set: {
              AttackRollHeight: 100,
              OpponentAbilityCount: abilityCount + 1,
              DefenseModifier: 1,
            },
          }
        );
      }

      if (playerHp <= 0 && opponentHp <= 0) {
        winEmbed.setTitle("The duel ended in a draw!");
        await endDuelDraw(guildId, player);
        if (opponentTurnEmbed) {
          await buttonInteract.deferUpdate();
          return await buttonInteract
            .editReply({
              embeds: [opponentTurnEmbed, fightEmbed],
            })
            .catch(console.log);
        } else {
          await buttonInteract.deferUpdate();
          return await buttonInteract
            .editReply({
              embeds: [fightEmbed],
            })
            .catch(console.log);
        }
      } else if (opponentHp <= 0) {
        winEmbed.setTitle(`${player.username} won the duel!`);
        await endDuel(guildId, player, true);

        if (Math.random() >= 0.5) {
          rewardEmbed.setTitle(`${player.username} found a loot crate!`);
          await giveRewards(player, guildId, rewardEmbed);
          await buttonInteract.deferUpdate();
          return await buttonInteract
            .editReply({
              embeds: [opponentTurnEmbed, winEmbed, rewardEmbed],
              components: [],
            })
            .catch(console.log);
        } else {
          await buttonInteract.deferUpdate();
          return await buttonInteract
            .editReply({
              embeds: [opponentTurnEmbed, winEmbed],
              components: [],
            })
            .catch(console.log);
        }
      } else if (playerHp <= 0) {
        winEmbed.setTitle(`${opponent.displayName} won the duel!`);
        await endDuel(guildId, player, false);
        await buttonInteract.deferUpdate();
        return await buttonInteract
          .editReply({
            embeds: [opponentTurnEmbed, winEmbed],
            components: [],
          })
          .catch(console.log);
      }

      if (currentAdventureInfo)
        currentAdventureInfo = await AdventureInfo.findOne({
          Guild: guildId,
          User: player.id,
        });
      //console.log(currentAdventureInfo);
    }
    //#endregion BOT TURN

    // Player Turn
    switch (splitArray[1]) {
      case "Accept":
        const cooldown = await Cooldowns.findOne({
          Guild: guildId,
          User: player.id,
          Command: "adventure",
        });

        if (cooldown) {
          if (Date.now() - cooldown.Cooldown >= CooldownTime)
            await Cooldowns.findOneAndDelete({
              Guild: guildId,
              User: player.id,
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
            await buttonInteract.deferUpdate();
            return await buttonInteract
              .editReply({
                content: `You can go on an adventure again in ${remainingTime}.`,
                ephemeral: true,
              })
              .catch(console.error);
          }
        }
        if (
          PlayerBooleans.findOne({ Guild: guildId, User: player.id })
            .IsAdventuring
        ) {
          await buttonInteract.deferUpdate();
          return awaitbuttonInteract.editReply({
            content: "You are already in an adventure!",
            ephemeral: true,
          });
        }
        if (opponentTurnEmbed)
          editEmbed(
            buttonInteract,
            [quoteEmbed, opponentTurnEmbed, fightEmbed],
            [adventureButtons]
          );
        else
          editEmbed(
            buttonInteract,
            [quoteEmbed, fightEmbed],
            [adventureButtons]
          );
        break;
      case "Decline":
        await Cooldowns.create({
          Guild: guildId,
          User: player.id,
          Command: "adventure",
          Cooldown: Date.now(),
        });

        await buttonInteract.deferUpdate();
        return buttonInteract.editReply({
          content: `You ran away from ${opponent.displayName}!`,
          embeds: [],
          components: [],
        });
      case "Attack":
        var attackRoll = Math.floor(Math.random() * attackRollHeight) + 1;
        //console.log(`${attackRollHeight}`);
        var currentDefenseModifier;
        try {
          currentDefenseModifier = currentAdventureInfo.DefenseModifier;
        } catch (err) {
          currentDefenseModifier = 1;
        }

        if (attackRoll >= opponentStand.Defense * currentDefenseModifier) {
          var damage = Math.floor(Math.random() * playerStand.Attack) + 1;

          if (isConfused)
            turnEmbed.setTitle(
              GlitchedText.LongString[
                Math.floor(Math.random() * GlitchedText.LongString.length)
              ]
            );
          else
            turnEmbed.setTitle(
              `${playerStand.Name}'s attack hits! It deals ${damage} damage.`
            );

          opponentHp -= damage;
        } else {
          if (isConfused)
            turnEmbed.setTitle(
              GlitchedText.LongString[
                Math.floor(Math.random() * GlitchedText.LongString.length)
              ]
            );
          else turnEmbed.setTitle(`${playerStand.Name} missed!`);
        }

        updateDisplay(
          fightEmbed,
          playerHp,
          playerStand,
          playerCooldownText,
          opponentHp,
          opponentStand,
          opponentCooldownText,
          isConfused
        );

        if (playerHp <= 0 && opponentHp <= 0) {
          winEmbed.setTitle("The duel ended in a draw!");
          await endDuelDraw(guildId, player);
          if (opponentTurnEmbed) await editEmbed(buttonInteract, [fightEmbed]);
          else await editEmbed(buttonInteract, [opponentTurnEmbed, fightEmbed]);
        } else if (opponentHp <= 0) {
          winEmbed.setTitle(`${player.username} won the duel!`);
          await endDuel(guildId, player, true);
          rewardEmbed.setTitle(`${player.username} found a loot crate!`);
          await giveRewards(player, guildId, rewardEmbed);
          if (opponentTurnEmbed.data.description)
            await editEmbed(
              buttonInteract,
              [opponentTurnEmbed, turnEmbed, winEmbed, rewardEmbed],
              []
            );
          else
            await editEmbed(
              buttonInteract,
              [turnEmbed, winEmbed, rewardEmbed],
              []
            );
        } else if (playerHp <= 0) {
          winEmbed.setTitle(`${opponent.displayName} won the duel!`);
          await endDuel(guildId, player, false);

          if (opponentTurnEmbed)
            await editEmbed(
              buttonInteract,
              [turnEmbed, opponentTurnEmbed, winEmbed],
              []
            );
          else await editEmbed(buttonInteract, [turnEmbed, winEmbed], []);
        } else {
          if (opponentTurnEmbed)
            await editEmbed(
              buttonInteract,
              [turnEmbed, opponentTurnEmbed, fightEmbed],
              [adventureButtons]
            );
          else
            await editEmbed(
              buttonInteract,
              [turnEmbed, fightEmbed],
              [adventureButtons]
            );
        }

        await AdventureInfo.updateOne(
          {
            Guild: guildId,
            User: player.id,
          },
          {
            $set: {
              AttackRollHeight: 75,
              PlayerAbilityCount: currentAdventureInfo.PlayerAbilityCount + 1,
              DefenseModifier: 1,
            },
          }
        );
        console.log("PLAYER: ATTACK");
        break;
      case "Dodge":
        if (isConfused)
          turnEmbed.setTitle(
            GlitchedText.LongString[
              Math.floor(Math.random() * GlitchedText.LongString.length)
            ]
          );
        else turnEmbed.setTitle(`${playerStand.Name} prepares to dodge!`);
        await AdventureInfo.updateOne(
          {
            Guild: guildId,
            User: player.id,
          },
          {
            $set: {
              AttackRollHeight: 50,
              PlayerAbilityCount: currentAdventureInfo.PlayerAbilityCount + 1,
              DefenseModifier: 1,
            },
          }
        );

        if (opponentTurnEmbed)
          await editEmbed(
            buttonInteract,
            [turnEmbed, opponentTurnEmbed, fightEmbed],
            [adventureButtons]
          );
        else
          await editEmbed(
            buttonInteract,
            [turnEmbed, fightEmbed],
            [adventureButtons]
          );
        console.log("PLAYER: DODGE");
        break;
      case "Ability":
        let ability = playerStand.Ability[0];
        let abilityName = ability.id;
        let abilityInfo = StandAbilities.abilities[abilityName](
          playerStand,
          opponentStand,
          ability
        );

        var damage = abilityInfo[1];
        var healAmount = abilityInfo[2];
        var currentDefenseModifier = abilityInfo[3];

        if (damage > 0) {
          var attackRoll = Math.floor(Math.random() * attackRollHeight) + 1;
          if (attackRoll >= opponentStand.Defense * currentDefenseModifier) {
            var damage = abilityInfo[1];

            opponentHp -= damage;
            if (healAmount > 0) {
              playerHp += healAmount;

              playerHp = Math.min(playerHp, playerStand.Healthpoints);
            }
            if (isConfused)
              turnEmbed.setTitle(
                GlitchedText.LongString[
                  Math.floor(Math.random() * GlitchedText.LongString.length)
                ]
              );
            else turnEmbed.setTitle(abilityInfo[0]);
          } else {
            if (isConfused)
              turnEmbed.setTitle(
                GlitchedText.LongString[
                  Math.floor(Math.random() * GlitchedText.LongString.length)
                ]
              );
            else turnEmbed.setTitle(`${playerStand.Name} missed!`);
          }
        } else if (healAmount > 0) {
          playerHp += healAmount;

          playerHp = Math.min(playerHp, playerStand.Healthpoints);
          turnEmbed.setTitle(abilityInfo[0]);
        }

        updateDisplay(
          fightEmbed,
          playerHp,
          playerStand,
          playerCooldownText,
          opponentHp,
          opponentStand,
          opponentCooldownText,
          isConfused
        );

        if (playerHp <= 0 && opponentHp <= 0) {
          winEmbed.setTitle("The duel ended in a draw!");
          await endDuelDraw(guildId, player);
          if (opponentTurnEmbed)
            await editEmbed(
              buttonInteract,
              [turnEmbed, opponentTurnEmbed, winEmbed],
              []
            );
          else await editEmbed(buttonInteract, [turnEmbed, winEmbed], []);
        } else if (opponentHp <= 0) {
          winEmbed.setTitle(`${player.username} won the duel!`);
          await endDuel(guildId, player, true);

          rewardEmbed.setTitle(`${player.username} found a loot crate!`);
          await giveRewards(player, guildId, rewardEmbed);
          if (opponentTurnEmbed)
            await editEmbed(
              buttonInteract,
              [turnEmbed, opponentTurnEmbed, winEmbed, rewardEmbed],
              []
            );
          else
            await editEmbed(
              buttonInteract,
              [turnEmbed, winEmbed, rewardEmbed],
              []
            );
        } else if (playerHp <= 0) {
          winEmbed.setTitle(`${opponent.displayName} won the duel!`);
          await endDuel(guildId, player, false);

          if (opponentTurnEmbed)
            await editEmbed(
              buttonInteract,
              [turnEmbed, opponentTurnEmbed, winEmbed],
              []
            );
          else await editEmbed(buttonInteract, [turnEmbed, winEmbed], []);
        } else if (opponentTurnEmbed)
          await editEmbed(
            buttonInteract,
            [turnEmbed, opponentTurnEmbed, fightEmbed],
            [adventureButtons]
          );
        else
          editEmbed(
            buttonInteract,
            [turnEmbed, fightEmbed],
            [adventureButtons]
          );

        await AdventureInfo.updateOne(
          {
            Guild: guildId,
            User: player.id,
          },
          {
            $set: {
              AttackRollHeight: 75,
              PlayerAbilityCount: 0,
              DefenseModifier: currentDefenseModifier,
            },
          }
        );
        break;
      case "Surrender":
        turnEmbed.setTitle(
          `${player.username} surrenders! ${opponent.displayName} wins the duel.`
        );

        await endDuel(guildId, player, false);

        if (opponentTurnEmbed)
          await editEmbed(
            buttonInteract,
            [turnEmbed, opponentTurnEmbed, winEmbed],
            []
          );
        else await editEmbed(buttonInteract, [turnEmbed, winEmbed], []);
        break;
    }

    try {
      console.log(
        `END: ${currentAdventureInfo.DefenseModifier} plyr:${currentAdventureInfo.PlayerAbilityCount} bot:${currentAdventureInfo.OpponentAbilityCount}`
      );
    } catch (err) {
      console.log(err);
    }

    if (!currentAdventureInfo) {
      await AdventureInfo.create({
        Guild: guildId,
        User: player.id,
        Opponent: opponent,
        PlayerHP: playerHp,
        OpponentHP: opponentHp,
        AttackRollHeight: 75,
        PlayerAbilityCount: 0,
        OpponentAbilityCount: 0,
        DefenseModifier: 1,
        isConfused: isConfused,
      });
    } else {
      await AdventureInfo.updateOne(
        { Guild: guildId, User: player.id },
        { $set: { PlayerHP: playerHp, OpponentHP: opponentHp } }
      );
    }
  },
};

function updateDisplay(
  fightEmbed,
  playerHp,
  playerStand,
  playerCooldownText,
  opponentHp,
  opponentStand,
  opponentCooldownText,
  isConfused
) {
  fightEmbed.data.fields[0].value = isConfused
    ? `${
        GlitchedText.ShortString[
          Math.floor(Math.random() * GlitchedText.ShortString.length)
        ]
      }: ${
        GlitchedText.NumberString[
          Math.floor(Math.random() * GlitchedText.NumberString.length)
        ]
      } / ${
        GlitchedText.NumberString[
          Math.floor(Math.random() * GlitchedText.NumberString.length)
        ]
      }${playerCooldownText}`
    : `Healthpoints: ${Math.max(playerHp, 0)} / ${
        playerStand.Healthpoints
      }${playerCooldownText}`;

  fightEmbed.data.fields[1].value = isConfused
    ? `${
        GlitchedText.ShortString[
          Math.floor(Math.random() * GlitchedText.ShortString.length)
        ]
      }: ${
        GlitchedText.NumberString[
          Math.floor(Math.random() * GlitchedText.NumberString.length)
        ]
      } / ${
        GlitchedText.NumberString[
          Math.floor(Math.random() * GlitchedText.NumberString.length)
        ]
      }${opponentCooldownText}`
    : `Healthpoints: ${Math.max(opponentHp, 0)} / ${
        opponentStand.Healthpoints
      }${opponentCooldownText}`;
}

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
  discAmount = Math.floor(Math.random() * 40);
  fruitAmount = Math.floor(Math.random() * 100);
  let sum = arrowAmount + discAmount + fruitAmount;

  console.log(`${arrowAmount}-${discAmount}-${fruitAmount}`);

  arrowAmount = Math.round((arrowAmount / sum) * 8);
  discAmount = Math.round((discAmount / sum) * 8);
  fruitAmount = Math.round((fruitAmount / sum) * 8);

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

async function endDuel(guildId, player, playerWin) {
  await clearDuelInfo(guildId, player);

  // Set IsDueling to false
  await PlayerBooleans.updateOne(
    { Guild: guildId, User: player.id },
    { $set: { IsAdventuring: false } }
  );

  // Set duel cooldown
  await Cooldowns.create({
    Guild: guildId,
    User: player.id,
    Command: "adventure",
    Cooldown: Date.now(),
  });

  let playerStats = await PlayerStats.findOne({
    Guild: guildId,
    User: player.id,
  });

  if (!playerStats) {
    playerStats = await PlayerStats.create({
      Guild: guildId,
      User: player.id,
      DuelWins: 0,
      DuelPlays: 0,
      AdventureWins: 0,
      AdventurePlays: 0,
    });
  }
  if (playerWin)
    await PlayerStats.updateOne(
      { Guild: guildId, User: player.id },
      {
        $set: {
          AdventureWins: playerStats.AdventureWins + 1,
          AdventurePlays: playerStats.AdventurePlays + 1,
        },
      }
    );
  else
    await PlayerStats.updateOne(
      { Guild: guildId, User: player.id },
      {
        $set: {
          AdventurePlays: playerStats.AdventurePlays + 1,
        },
      }
    );
}

async function endDuelDraw(guildId, player) {
  console.log("cleared duel info");
  clearDuelInfo(guildId, player);

  // Set IsDueling to false for both players
  await PlayerBooleans.updateOne(
    { Guild: guildId, User: player.id },
    { $set: { IsAdventuring: false } }
  );

  // Set duel cooldown
  await Cooldowns.create({
    Guild: guildId,
    User: player.id,
    Command: "adventure",
    Cooldown: Date.now(),
  });

  let playerStats = await PlayerStats.findOne({
    Guild: guildId,
    User: player.id,
  });

  if (!playerStats) {
    playerStats = await PlayerStats.create({
      Guild: guildId,
      User: player.id,
      DuelWins: 0,
      DuelPlays: 0,
      AdventureWins: 0,
      AdventurePlays: 0,
    });
  }

  await PlayerStats.updateOne(
    { Guild: guildId, User: player.id },
    {
      $set: {
        AdventurePlays: playerStats.AdventurePlays + 1,
      },
    }
  );
}

async function clearDuelInfo(guildId, player) {
  await AdventureInfo.findOneAndDelete({
    Guild: guildId,
    User: player.id,
  });
  console.log("cleared duel info");
}
