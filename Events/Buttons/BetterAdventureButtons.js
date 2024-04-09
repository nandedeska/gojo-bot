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

let guildId;
let player;
let opponent;
let playerFirst;

let currentAdventureInfo;
let playerStand;
let playerHp;
let opponentStand;
let opponentHp;
let attackRollHeight;
let isConfused;

let fightEmbed;
let turnEmbed;
let opponentTurnEmbed;
let quoteEmbed;
let winEmbed;
let rewardEmbed;

let standHasDied;

let abilityInCooldown;
let playerCooldownText;
let opponentCooldownText;

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

    // split custom id
    const splitArray = buttonInteract.customId.split("-");
    if (splitArray[0] !== "Adventure") return;
    guildId = splitArray[2];

    // get player info
    player = await client.users.cache.get(splitArray[3]);
    playerStand = await StandStats.findOne({
      Guild: guildId,
      User: player.id,
    });

    // get opponent info
    const { opponents } = AdventureOpponents;
    opponent = opponents[splitArray[4]];
    opponentStand = opponent.stand;

    if (buttonInteract.user.id !== splitArray[3])
      return await buttonInteract.deferUpdate().catch(console.error);

    playerFirst = playerStand.Speed >= opponentStand.Speed ? true : false;

    // set default values
    playerHp = playerStand.Healthpoints;
    opponentHp = opponentStand.Healthpoints;
    attackRollHeight = 75;
    isConfused = false;

    // fetch duel data
    currentAdventureInfo = await AdventureInfo.findOne({
      Guild: guildId,
      User: splitArray[3],
    });

    // set updated values if they exist
    if (currentAdventureInfo) {
      playerHp = currentAdventureInfo.PlayerHP;
      opponentHp = currentAdventureInfo.OpponentHP;
      attackRollHeight = currentAdventureInfo.AttackRollHeight;
      isConfused = currentAdventureInfo.IsConfused;
    }

    try {
      console.log(
        `=====\nSTART: ${currentAdventureInfo.DefenseModifier} plyr:${currentAdventureInfo.PlayerAbilityCount} bot:${currentAdventureInfo.OpponentAbilityCount}`
      );
    } catch (err) {}

    abilityInCooldown = Array(playerStand.Ability.length).fill(true);
    playerCooldownText = "";
    opponentCooldownText = "";

    //#region EMBEDS & BUTTONS
    fightEmbed = new EmbedBuilder()
      .setAuthor({
        name: `DUEL: ${player.username} vs ${opponent.displayName}`,
      })
      .setColor("#D31A38")
      .setImage(
        "https://cdn.discordapp.com/attachments/562958339034841098/1088740524342640700/image.png"
      );

    turnEmbed = new EmbedBuilder().setColor("#D31A38");
    opponentTurnEmbed = null;

    quoteEmbed = new EmbedBuilder()
      .setColor("#80FEFF")
      .setDescription(
        `**"${
          opponent.quotePool[
            Math.floor(Math.random() * opponent.quotePool.length)
          ]
        }"**`
      )
      .setFooter({ text: `${opponent.displayName}` });

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
        .setLabel("Surrender")
        .setCustomId(
          `Adventure-Surrender-${guildId}-${player.id}-${opponent.id}`
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
    //#endregion SETUP

    if (!playerFirst && currentAdventureInfo)
      await opponentTurn(buttonInteract, adventureButtons, abilityButtons);

    if (standHasDied) return;

    //#region PLAYER TURN
    let abilityCounts;

    if (currentAdventureInfo)
      abilityCounts = currentAdventureInfo.PlayerAbilityCount;
    else abilityCounts = Array(playerStand.Ability.length).fill(0);

    switch (splitArray[1]) {
      case "Accept":
        // check if player is in cooldown
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

        // check if player is already in an adventure
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

        // if player goes last then update duel UI
        updateAbilityUI(abilityButtons);
        updateDuelDisplay();

        await reply(
          buttonInteract,
          [quoteEmbed, fightEmbed],
          [adventureButtons, abilityButtons]
        );
        break;
      case "Decline":
        // start cooldown
        await Cooldowns.create({
          Guild: guildId,
          User: player.id,
          Command: "adventure",
          Cooldown: Date.now(),
        });

        // update booleans
        await PlayerBooleans.updateOne(
          { Guild: guildId, User: player.id },
          { $set: { IsAdventuring: false } }
        );

        await buttonInteract.deferUpdate();
        return buttonInteract.editReply({
          content: `You ran away from ${opponent.displayName}!`,
          embeds: [],
          components: [],
        });
      case "Attack":
        // roll for attack
        var attackRoll = Math.floor(Math.random() * attackRollHeight) + 1;

        // check for defense modifiers
        var currentDefenseModifier;
        try {
          currentDefenseModifier = currentAdventureInfo.DefenseModifier;
        } catch (err) {
          currentDefenseModifier = 1;
        }

        // check if attack hits
        if (attackRoll >= opponentStand.Defense * currentDefenseModifier) {
          var damage = Math.floor(Math.random() * playerStand.Attack) + 1;

          if (isConfused) turnEmbed.setTitle(generateGlitchedText("long"));
          else
            turnEmbed.setTitle(
              `${playerStand.Name}'s attack hits! It deals ${damage} damage.`
            );

          opponentHp -= damage;
        } else {
          if (isConfused) turnEmbed.setTitle(generateGlitchedText("long"));
          else turnEmbed.setTitle(`${playerStand.Name} missed!`);
        }

        // increment ability count
        for (let i = 0; i < playerStand.Ability.length; i++) {
          try {
            abilityCounts[i] = currentAdventureInfo.PlayerAbilityCount[i] + 1;
          } catch (err) {
            console.log(err);
          }
        }

        // update duel data
        await AdventureInfo.updateOne(
          {
            Guild: guildId,
            User: player.id,
          },
          {
            $set: {
              AttackRollHeight: 75,
              PlayerAbilityCount: abilityCounts,
              DefenseModifier: 1,
            },
          }
        );

        // check for stand death
        await checkHealth(buttonInteract);
        if (standHasDied) return;

        if (!playerFirst) {
          updateAbilityUI(abilityButtons);
          updateDuelDisplay();

          // duel continue
          if (opponentTurnEmbed)
            await reply(
              buttonInteract,
              [turnEmbed, opponentTurnEmbed, fightEmbed],
              [adventureButtons, abilityButtons]
            );
          else
            await reply(
              buttonInteract,
              [turnEmbed, fightEmbed],
              [adventureButtons, abilityButtons]
            );
        }

        console.log("PLAYER: ATTACK");
        break;
      case "Dodge":
        if (isConfused) turnEmbed.setTitle(generateGlitchedText("long"));
        else turnEmbed.setTitle(`${playerStand.Name} prepares to dodge!`);

        // increment ability count
        for (let i = 0; i < playerStand.Ability.length; i++) {
          try {
            abilityCounts[i] = currentAdventureInfo.PlayerAbilityCount[i] + 1;
          } catch (err) {
            console.log(err);
          }
        }

        // update duel data
        await AdventureInfo.updateOne(
          {
            Guild: guildId,
            User: player.id,
          },
          {
            $set: {
              AttackRollHeight: 50,
              PlayerAbilityCount: abilityCounts,
              DefenseModifier: 1,
            },
          }
        );

        // check for stand death
        await checkHealth(buttonInteract);
        if (standHasDied) return;

        if (!playerFirst) {
          updateAbilityUI(abilityButtons);
          updateDuelDisplay();

          // duel continue
          if (opponentTurnEmbed)
            await reply(
              buttonInteract,
              [turnEmbed, opponentTurnEmbed, fightEmbed],
              [adventureButtons, abilityButtons]
            );
          else
            await reply(
              buttonInteract,
              [turnEmbed, fightEmbed],
              [adventureButtons, abilityButtons]
            );
        }

        console.log("PLAYER: DODGE");
        break;
      case "Ability":
        // fetch ability
        let ability = playerStand.Ability[splitArray[5]];
        let abilityId = ability.id;
        let abilityInfo = StandAbilities.abilities[abilityId](
          playerStand,
          opponentStand,
          ability
        );

        var damage = abilityInfo[1];
        var healAmount = abilityInfo[2];
        var currentDefenseModifier = abilityInfo[3];

        // execute ability
        if (damage > 0) {
          // attack based ability
          var attackRoll = Math.floor(Math.random() * attackRollHeight) + 1;
          if (attackRoll >= opponentStand.Defense * currentDefenseModifier) {
            var damage = abilityInfo[1];

            opponentHp -= damage;
            if (healAmount > 0) {
              // life steal ability
              playerHp += healAmount;

              playerHp = Math.min(playerHp, playerStand.Healthpoints);
            }

            if (isConfused) turnEmbed.setTitle(generateGlitchedText("long"));
            else turnEmbed.setTitle(abilityInfo[0]);
          } else {
            if (isConfused) turnEmbed.setTitle(generateGlitchedText("long"));
            else turnEmbed.setTitle(`${playerStand.Name} missed!`);
          }
        } else if (healAmount > 0) {
          // heal ability
          playerHp += healAmount;

          playerHp = Math.min(playerHp, playerStand.Healthpoints);
          turnEmbed.setTitle(abilityInfo[0]);
        }

        // increment other ability counts except for used ability
        for (let i = 0; i < playerStand.Ability.length; i++) {
          if (i == splitArray[5]) {
            abilityCounts[i] = 0;
            console.log(`PLAYER: USED ABILITY ${i + 1}`);
          } else {
            try {
              abilityCounts[i] = currentAdventureInfo.PlayerAbilityCount[i] + 1;
            } catch (err) {
              console.log(err);
            }
          }
        }

        // update duel data
        await AdventureInfo.updateOne(
          {
            Guild: guildId,
            User: player.id,
          },
          {
            $set: {
              AttackRollHeight: 75,
              PlayerAbilityCount: abilityCounts,
              DefenseModifier: currentDefenseModifier,
            },
          }
        );

        // check for stand death
        await checkHealth(buttonInteract);
        if (standHasDied) return;

        if (!playerFirst) {
          updateAbilityUI(abilityButtons);
          updateDuelDisplay();

          // duel continue
          if (opponentTurnEmbed)
            await reply(
              buttonInteract,
              [turnEmbed, opponentTurnEmbed, fightEmbed],
              [adventureButtons, abilityButtons]
            );
          else
            await reply(
              buttonInteract,
              [turnEmbed, fightEmbed],
              [adventureButtons, abilityButtons]
            );
        }
        break;
      case "Surrender":
        turnEmbed.setTitle(
          `${player.username} surrenders! ${opponent.displayName} wins the duel.`
        );

        await endDuel(false);

        if (opponentTurnEmbed)
          return await updateDuelEmbeds(
            buttonInteract,
            [turnEmbed, opponentTurnEmbed, winEmbed],
            []
          );
        else
          return await updateDuelEmbeds(
            buttonInteract,
            [turnEmbed, winEmbed],
            []
          );
    }
    //#endregion PLAYER TURN

    if (playerFirst && currentAdventureInfo)
      await opponentTurn(buttonInteract, adventureButtons, abilityButtons);

    try {
      console.log(
        `END: ${currentAdventureInfo.DefenseModifier} plyr:${currentAdventureInfo.PlayerAbilityCount} bot:${currentAdventureInfo.OpponentAbilityCount}`
      );
    } catch (err) {}

    // initialize/update duel info
    if (!currentAdventureInfo) {
      let playerAbilityCount = Array(playerStand.Ability.length).fill(0);
      let opponentAbilityCount = Array(opponentStand.Ability.length).fill(0);
      await AdventureInfo.create({
        Guild: guildId,
        User: player.id,
        Opponent: opponent,
        PlayerHP: playerHp,
        OpponentHP: opponentHp,
        AttackRollHeight: 75,
        PlayerAbilityCount: playerAbilityCount,
        OpponentAbilityCount: opponentAbilityCount,
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

async function checkHealth(buttonInteract) {
  if (playerHp <= 0 && opponentHp <= 0) {
    // duel draw
    winEmbed.setTitle("The duel ended in a draw!");

    await endDuelDraw();

    standHasDied = true;

    if (opponentTurnEmbed) return await reply(buttonInteract, [fightEmbed], []);
    else
      return await reply(buttonInteract, [opponentTurnEmbed, fightEmbed], []);
  } else if (opponentHp <= 0) {
    // player won
    winEmbed.setTitle(`${player.username} won the duel!`);

    await endDuel(true);

    // handle rewards
    rewardEmbed.setTitle(`${player.username} found a loot crate!`);
    await giveRewards(player, guildId, rewardEmbed);

    standHasDied = true;

    if (opponentTurnEmbed)
      return await reply(
        buttonInteract,
        [opponentTurnEmbed, turnEmbed, winEmbed, rewardEmbed],
        []
      );
    else
      return await reply(
        buttonInteract,
        [turnEmbed, winEmbed, rewardEmbed],
        []
      );
  } else if (playerHp <= 0) {
    // opponent won
    winEmbed.setTitle(`${opponent.displayName} won the duel!`);

    await endDuel(false);

    standHasDied = true;

    if (opponentTurnEmbed)
      return await reply(
        buttonInteract,
        [turnEmbed, opponentTurnEmbed, winEmbed],
        []
      );
    else return await reply(buttonInteract, [turnEmbed, winEmbed], []);
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
  for (let i = 0; i < playerStand.Ability.length; i++) {
    if (currentAdventureInfo) {
      if (
        currentAdventureInfo.PlayerAbilityCount[i] <
        playerStand.Ability[i].cooldown
      )
        abilityInCooldown[i] = true;
      else abilityInCooldown[i] = false;
    }

    abilityButton = new ButtonBuilder()
      .setLabel(`Ability ${i + 1}`)
      .setCustomId(
        `Adventure-Ability-${guildId}-${player.id}-${opponent.id}-${i}`
      )
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(abilityInCooldown[i]);
    buttons.push(abilityButton);
  }
  abilityButtons.setComponents(buttons);
}

function updateDuelDisplay() {
  if (currentAdventureInfo) {
    for (let i = 0; i < playerStand.Ability.length; i++) {
      playerCooldownText += setCooldownText(
        playerStand,
        i,
        currentAdventureInfo.PlayerAbilityCount
      );
    }

    for (let i = 0; i < opponentStand.Ability.length; i++) {
      opponentCooldownText += setCooldownText(
        opponentStand,
        i,
        currentAdventureInfo.OpponentAbilityCount
      );
    }
  }

  console.log(`${playerCooldownText} ${opponentCooldownText}`);

  fightEmbed.addFields(
    {
      name: `${playerStand.Name}`,
      value: `Healthpoints: ${Math.max(playerHp, 0)} / ${
        playerStand.Healthpoints
      }${playerCooldownText}`,
    },
    {
      name: `${opponentStand.Name}`,
      value: `Healthpoints: ${Math.max(opponentHp, 0)} / ${
        opponentStand.Healthpoints
      }${opponentCooldownText}`,
    }
  );
}

function setCooldownText(stand, abilityIndex, abilityCount) {
  if (abilityCount < stand.Ability[abilityIndex].cooldown) {
    return `\nAbility Cooldown: ${
      stand.Ability[abilityIndex].cooldown - abilityCount
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

async function giveRewards() {
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
    User: player.id,
  });

  await Inventory.updateOne(
    { Guild: guildId, User: player.id },
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

async function endDuel(playerWonDuel) {
  await clearDuelInfo(guildId, player);

  // Set IsAdventuring to false
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
  if (playerWonDuel)
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

async function endDuelDraw() {
  console.log("cleared duel info");
  clearDuelInfo(guildId, player);

  // Set IsAdventuring to false
  await PlayerBooleans.updateOne(
    { Guild: guildId, User: player.id },
    { $set: { IsAdventuring: false } }
  );

  // Set adventure cooldown
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

async function clearDuelInfo() {
  await AdventureInfo.findOneAndDelete({
    Guild: guildId,
    User: player.id,
  });
  console.log("cleared duel info");
}

//#region BOT TURN
async function opponentTurn(buttonInteract, adventureButtons, abilityButtons) {
  // turn setup
  const rand = Math.random();
  opponentTurnEmbed = new EmbedBuilder().setColor("#D31A38");
  let abilityCounts;

  if (currentAdventureInfo)
    abilityCounts = currentAdventureInfo.OpponentAbilityCount;

  if (rand < 0.8) {
    // attack or ability
    let opponentUsedAbility = false;
    for (let i = 0; i < opponentStand.Ability.length; i++) {
      // check if bot can use ability
      if (abilityCounts[i] >= opponentStand.Ability[i].cooldown) {
        console.log(`BOT: ABILITY ${i + 1}`);
        // fetch ability
        let ability = opponentStand.Ability[i];
        let abilityId = ability.id;
        let abilityInfo = StandAbilities.abilities[abilityId](
          opponentStand,
          playerStand,
          ability
        );

        var damage = abilityInfo[1];
        var healAmount = abilityInfo[2];
        var nextDefenseModifier = abilityInfo[3];
        var currentDefenseModifier = abilityInfo[4];
        isConfused = abilityInfo[5];

        // execute ability
        if (damage > 0) {
          // attack based ability
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
              // life steal ability
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
              opponentTurnEmbed.setTitle(generateGlitchedText("long"));
            else opponentTurnEmbed.setTitle(`${opponentStand.Name} missed!`);
          }
        } else if (healAmount > 0) {
          // heal ability
          opponentHp += healAmount;

          playerHp = Math.min(playerHp, playerStand.Healthpoints);
          opponentHp = Math.min(opponentHp, opponentStand.Healthpoints);
          opponentTurnEmbed.setTitle(abilityInfo[0]);
        } else opponentTurnEmbed.setTitle(abilityInfo[0]);

        // increment ability count except for used ability
        for (let j = 0; j < opponentStand.Ability.length; j++) {
          if (j == i) abilityCounts[j] = 0;
          else
            abilityCounts[i] = currentAdventureInfo.OpponentAbilityCount[j] + 1;
        }

        // update duel data
        await AdventureInfo.updateOne(
          {
            Guild: guildId,
            User: player.id,
          },
          {
            $set: {
              AttackRollHeight: 75,
              OpponentAbilityCount: abilityCounts,
              DefenseModifier: nextDefenseModifier,
            },
          }
        );

        opponentUsedAbility = true;

        // check for stand death
        await checkHealth(buttonInteract);
        if (standHasDied) return;

        if (playerFirst) {
          updateAbilityUI(abilityButtons);
          updateDuelDisplay();

          // duel continue
          if (opponentTurnEmbed)
            await reply(
              buttonInteract,
              [turnEmbed, opponentTurnEmbed, fightEmbed],
              [adventureButtons, abilityButtons]
            );
          else
            await reply(
              buttonInteract,
              [turnEmbed, fightEmbed],
              [adventureButtons, abilityButtons]
            );
        }
        break;
      }
    }

    if (!opponentUsedAbility) {
      // bot attacks
      console.log("BOT: ATTACK");

      // roll for attack
      var attackRoll = Math.floor(Math.random() * attackRollHeight) + 1;
      var currentDefenseModifier = 1;
      try {
        currentDefenseModifier = currentAdventureInfo.DefenseModifier;
      } catch (err) {
        currentDefenseModifier = 1;
      }

      // check if attack hits
      if (attackRoll >= playerStand.Defense * currentDefenseModifier) {
        var damage = Math.floor(Math.random() * opponentStand.Attack) + 1;
        if (isConfused)
          opponentTurnEmbed.setTitle(generateGlitchedText("long"));
        else
          opponentTurnEmbed.setTitle(
            `${opponentStand.Name}'s attack hits! It deals ${damage} damage.`
          );

        playerHp -= damage;
      } else {
        if (isConfused)
          opponentTurnEmbed.setTitle(generateGlitchedText("long"));
        else opponentTurnEmbed.setTitle(`${opponentStand.Name} missed!`);
      }

      // increment ability count
      for (let i = 0; i < opponentStand.Ability.length; i++) {
        try {
          abilityCounts[i] = currentAdventureInfo.OpponentAbilityCount[i] + 1;
        } catch (err) {
          console.log(err);
        }
      }

      // update duel data
      await AdventureInfo.updateOne(
        { Guild: guildId, User: player.id },
        {
          $set: {
            AttackRollHeight: 75,
            OpponentAbilityCount: abilityCounts,
            DefenseModifier: 1,
          },
        }
      );

      // check for stand death
      await checkHealth(buttonInteract);
      if (standHasDied) return;

      if (playerFirst) {
        updateAbilityUI(abilityButtons);
        updateDuelDisplay();

        // duel continue
        if (opponentTurnEmbed)
          await reply(
            buttonInteract,
            [turnEmbed, opponentTurnEmbed, fightEmbed],
            [adventureButtons, abilityButtons]
          );
        else
          await reply(
            buttonInteract,
            [turnEmbed, fightEmbed],
            [adventureButtons, abilityButtons]
          );
      }
    }
  } else {
    // dodge
    console.log("BOT: DODGE");
    if (isConfused) opponentTurnEmbed.setTitle(generateGlitchedText("long"));
    else opponentTurnEmbed.setTitle(`${opponentStand.Name} prepares to dodge!`);

    // increment ability count
    for (let i = 0; i < opponentStand.Ability.length; i++) {
      try {
        abilityCounts[i] = currentAdventureInfo.OpponentAbilityCount[i] + 1;
      } catch (err) {
        console.log(err);
      }
    }

    // update duel data
    await AdventureInfo.updateOne(
      { Guild: guildId, User: player.id },
      {
        $set: {
          AttackRollHeight: 100,
          OpponentAbilityCount: abilityCounts,
          DefenseModifier: 1,
        },
      }
    );

    // check for stand death
    await checkHealth(buttonInteract);
    if (standHasDied) return;

    if (playerFirst) {
      updateAbilityUI(abilityButtons);
      updateDuelDisplay();

      // duel continue
      if (opponentTurnEmbed)
        await reply(
          buttonInteract,
          [turnEmbed, opponentTurnEmbed, fightEmbed],
          [adventureButtons, abilityButtons]
        );
      else
        await reply(
          buttonInteract,
          [turnEmbed, fightEmbed],
          [adventureButtons, abilityButtons]
        );
    }
  }
}
//#endregion
