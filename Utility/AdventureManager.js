const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const AdventureInfo = require("../Schemas/AdventureInfo");
const StandStats = require("../Schemas/StandStats");
const Inventory = require("../Schemas/PlayerInventory");
const PlayerBooleans = require("../Schemas/PlayerBooleans");
const Cooldowns = require("../Schemas/Cooldowns");
const StandAbilities = require("../Local Storage/standAbilities");
const PlayerStats = require("../Schemas/PlayerStats");
const CombatHandler = require("./CombatHandler");

class AdventureManager {
  guildId;
  player;
  playerStand;
  playerHp;
  opponent;
  opponentStand;
  opponentHp;

  savedData;

  playerAbilityCount;
  opponentAbilityCount;

  attackRollHeight;
  timeStopTurns;

  isPlayerFirst;
  isMatchOver;
  areAbilitiesInCooldown;
  isConfused;
  playerWinState;

  playerCooldownText;
  opponentCooldownText;

  fightEmbed;
  turnEmbed;
  opponentTurnEmbed;
  opponentExtraTurnEmbeds;
  quoteEmbed;
  winEmbed;
  rewardEmbed;

  adventureButtons;
  abilityButtons;

  constructor() {}

  async init(guildId, player, opponent) {
    this.guildId = guildId;

    this.player = player;
    this.playerStand = await StandStats.findOne({
      Guild: this.guildId,
      User: this.player.id,
    });
    this.playerHp = this.playerStand.Healthpoints;

    this.opponent = opponent;
    this.opponentStand = this.opponent.stand;
    this.opponentHp = this.opponentStand.Healthpoints;

    this.attackRollHeight = 100;
    this.timeStopTurns = 0;

    this.isPlayerFirst =
      this.playerStand.Speed >= this.opponentStand.Speed ? true : false;
    this.isMatchOver = false;
    this.areAbilitiesInCooldown = Array(this.playerStand.Ability.length).fill(
      true
    );
    this.isConfused = false;

    this.playerAbilityCount = Array(this.playerStand.Ability.length).fill(0);
    this.opponentAbilityCount = Array(this.opponentStand.Ability.length).fill(
      0
    );

    this.playerCooldownText = "";
    this.opponentCooldownText = "";

    this.savedData = await AdventureInfo.findOne({
      Guild: this.guildId,
      User: this.player.id,
    });

    if (this.savedData) {
      this.playerHp = this.savedData.PlayerHP;
      this.opponentHp = this.savedData.OpponentHP;
      this.attackRollHeight = this.savedData.AttackRollHeight;
      this.isConfused = this.savedData.IsConfused;
      this.timeStopTurns = this.savedData.TimeStopTurns;
      this.playerAbilityCount = this.savedData.PlayerAbilityCount;
      this.opponentAbilityCount = this.savedData.OpponentAbilityCount;
    }

    this.fightEmbed = new EmbedBuilder()
      .setAuthor({
        name: `DUEL: ${this.player.username} vs ${this.opponent.displayName}`,
      })
      .setColor("#D31A38")
      .setImage(
        "https://cdn.discordapp.com/attachments/562958339034841098/1088740524342640700/image.png"
      );

    this.turnEmbed = new EmbedBuilder().setColor("#D31A38");
    this.opponentTurnEmbed = new EmbedBuilder().setColor("#D31A38");
    this.opponentExtraTurnEmbeds = [];

    this.quoteEmbed = new EmbedBuilder()
      .setColor("#80FEFF")
      .setDescription(
        `**"${
          this.opponent.quotePool[
            Math.floor(Math.random() * this.opponent.quotePool.length)
          ]
        }"**`
      )
      .setFooter({ text: `${this.opponent.displayName}` });

    this.winEmbed = new EmbedBuilder()
      .setColor("#D31A38")
      .setImage(
        "https://cdn.discordapp.com/attachments/675612229676040192/1089139526624084040/image.png"
      );

    this.rewardEmbed = new EmbedBuilder()
      .setColor("#FFDF00")
      .setAuthor({ name: "LOOT CRATE" })
      .setImage(
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5851f423-3ac3-4eef-88d5-2be0fc69382b/de3ayma-b38313b3-a404-4604-91e9-c7b9908f8ad1.png/v1/fill/w_1600,h_900,q_80,strp/jojo_stand_arrow_heads_by_mdwyer5_de3ayma-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6IlwvZlwvNTg1MWY0MjMtM2FjMy00ZWVmLTg4ZDUtMmJlMGZjNjkzODJiXC9kZTNheW1hLWIzODMxM2IzLWE0MDQtNDYwNC05MWU5LWM3Yjk5MDhmOGFkMS5wbmciLCJ3aWR0aCI6Ijw9MTYwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.y66dqY4BgvgJUSz2mCTRTKXmvoI5yxtf9yGNV349Ls0"
      )
      .setDescription("CONTACT DEVELOPER: REWARD EMBED ERROR");

    this.adventureButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Attack")
        .setCustomId(
          `Adventure-Attack-${this.guildId}-${this.player.id}-${this.opponent.id}`
        )
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setLabel("Dodge")
        .setCustomId(
          `Adventure-Dodge-${this.guildId}-${this.player.id}-${this.opponent.id}`
        )
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel("Surrender")
        .setCustomId(
          `Adventure-Surrender-${this.guildId}-${this.player.id}-${this.opponent.id}`
        )
        .setStyle(ButtonStyle.Danger)
    );

    this.abilityButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Ability")
        .setCustomId("Dummy")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );
  }

  async botTurn() {
    const rand = Math.random();

    if (rand < 0.8) {
      let hasUsedAbility = false;
      hasUsedAbility = await this.botUseAbility();

      await this.checkStandDeath();

      if (this.isMatchOver) return;

      if (!hasUsedAbility) await this.botAttack();
    } else await this.botDodge();
  }

  async botAttack() {
    let enemyDefenseModifier = 1;

    if (this.savedData) {
      this.savedData = await AdventureInfo.findOne({
        Guild: this.guildId,
        User: this.player.id,
      });
      enemyDefenseModifier = this.savedData.DefenseModifier;
    }

    if (
      CombatHandler.tryAttack(
        this.playerStand,
        enemyDefenseModifier,
        this.attackRollHeight
      )
    ) {
      let damage = CombatHandler.rollDamage(this.opponentStand);
      CombatHandler.setTurnText(
        this.opponentTurnEmbed,
        "ATTACK",
        this.opponentStand,
        {
          damage: damage,
          isConfused: this.isConfused,
        }
      );

      this.playerHp -= damage;
    } else {
      CombatHandler.setTurnText(
        this.opponentTurnEmbed,
        "MISS",
        this.opponentStand,
        {
          isConfused: this.isConfused,
        }
      );
    }

    // Increment ability count
    this.updateAbilityCounts(this.opponentStand);

    await this.updateSchema(AdventureInfo, {
      AttackRollHeight: 100,
      OpponentAbilityCount: this.opponentAbilityCount,
      DefenseModifier: 1,
    });

    this.checkStandDeath();
  }

  async botDodge() {
    CombatHandler.setTurnText(
      this.opponentTurnEmbed,
      "DODGE",
      this.opponentStand,
      {
        isConfused: this.isConfused,
      }
    );

    // increment ability count
    this.updateAbilityCounts(this.opponentStand);

    await this.updateSchema(AdventureInfo, {
      AttackRollHeight: 75,
      OpponentAbilityCount: this.opponentAbilityCount,
      DefenseModifier: 1,
    });

    this.checkStandDeath();
  }

  async botUseAbility() {
    for (let i = 0; i < this.opponentStand.Ability.length; i++) {
      if (
        this.opponentAbilityCount[i] >= this.opponentStand.Ability[i].cooldown
      ) {
        let ability = this.opponentStand.Ability[i];
        let abilityId = ability.id;
        let abilityInfo = StandAbilities.abilities[abilityId](
          this.opponentStand,
          this.playerStand,
          ability
        );

        let damage = abilityInfo[1];
        let healAmount = abilityInfo[2];
        let nextTurnDefenseModifier = abilityInfo[3];
        let thisTurnDefenseModifier = abilityInfo[4];
        this.isConfused = abilityInfo[5];
        let timeStopTurns = abilityInfo[6];

        // TIME STOP ABILITY
        if (timeStopTurns > 0) {
          // time stop ability
          this.opponentAbilityCount[i] = 0;
          await this.updateSchema(AdventureInfo, {
            AttackRollHeight: 100,
            OpponentAbilityCount: this.opponentAbilityCount,
            DefenseModifier: nextTurnDefenseModifier,
          });

          for (let i = 0; i < timeStopTurns; i++) {
            this.opponentExtraTurnEmbeds.push(await this.botTimeStopTurn());
          }

          CombatHandler.setTurnText(
            this.opponentTurnEmbed,
            "ABILITY",
            this.opponentStand,
            {
              abilityText: abilityInfo[0],
              isConfused: this.isConfused,
            }
          );
        }
        // ATTACK-BASED ABILITY
        else if (damage > 0) {
          let enemyDefenseModifier = 1;
          if (this.savedData) {
            this.savedData = await AdventureInfo.findOne({
              Guild: this.guildId,
              User: this.player.id,
            });
            enemyDefenseModifier = this.savedData.DefenseModifier;
          }

          if (
            CombatHandler.tryAttack(
              this.playerStand,
              enemyDefenseModifier * thisTurnDefenseModifier,
              this.attackRollHeight
            )
          ) {
            this.playerHp -= damage;

            // LIFE STEAL
            if (healAmount > 0) {
              this.opponentHp += healAmount;
              this.opponentHp = Math.min(
                this.opponentHp,
                this.opponentStand.Healthpoints
              );
            }

            CombatHandler.setTurnText(
              this.opponentTurnEmbed,
              "ABILITY",
              this.opponentStand,
              {
                abilityText: abilityInfo[0],
                isConfused: this.isConfused,
              }
            );
          } else {
            CombatHandler.setTurnText(
              this.opponentTurnEmbed,
              "MISS",
              this.opponentStand,
              {
                isConfused: this.isConfused,
              }
            );
          }
        }
        // HEAL ABILITY
        else if (healAmount > 0) {
          this.opponentHp += healAmount;
          this.opponentHp = Math.min(
            this.opponentHp,
            this.opponentStand.Healthpoints
          );

          CombatHandler.setTurnText(
            this.opponentTurnEmbed,
            "ABILITY",
            this.opponentStand,
            {
              abilityText: abilityInfo[0],
              isConfused: this.isConfused,
            }
          );
        } else
          CombatHandler.setTurnText(
            this.opponentTurnEmbed,
            "ABILITY",
            this.opponentStand,
            {
              abilityText: abilityInfo[0],
              isConfused: this.isConfused,
            }
          );

        this.updateAbilityCounts(this.opponentStand, i);

        // Update saved data
        await this.updateSchema(AdventureInfo, {
          AttackRollHeight: 100,
          OpponentAbilityCount: this.opponentAbilityCount,
          DefenseModifier: nextTurnDefenseModifier,
        });

        return true;
      }
    }

    return false;
  }

  async botTimeStopTurn() {
    const rand = Math.random();

    let extraTurnEmbed = new EmbedBuilder().setColor("#D31A38");
    if (rand < 0.95) {
      // Attack or ability
      let hasUsedAbility = false;
      for (let i = 0; i < this.opponentStand.Ability.length; i++) {
        // Check if bot can use ability
        if (
          this.opponentAbilityCount[i] >= this.opponentStand.Ability[i].cooldown
        ) {
          console.log(`BOT: ABILITY ${i + 1}`);
          // fetch ability
          let ability = this.opponentStand.Ability[i];
          let abilityId = ability.id;
          let abilityInfo = StandAbilities.abilities[abilityId](
            this.opponentStand,
            this.playerStand,
            ability
          );

          let damage = abilityInfo[1];
          let healAmount = abilityInfo[2];
          let nextTurnDefenseModifier = abilityInfo[3];
          this.isConfused = abilityInfo[5];
          let timeStopTurns = abilityInfo[6];

          if (timeStopTurns > 0) {
            // TIME STOP
            extraTurnEmbed.setTitle(abilityInfo[0]);
          } else if (damage > 0) {
            // ATTACK BASED ABILITY
            let enemyDefenseModifier = 1;
            if (this.savedData) {
              this.savedData = await AdventureInfo.findOne({
                Guild: this.guildId,
                User: this.player.id,
              });
              enemyDefenseModifier = this.savedData.DefenseModifier;
            }

            if (enemyDefenseModifier < 100) {
              let damage = abilityInfo[1];

              this.playerHp -= damage;
              if (healAmount > 0) {
                // life steal ability
                this.opponentHp += healAmount;

                this.opponentHp = Math.min(
                  this.opponentHp,
                  this.opponentStand.Healthpoints
                );
              }

              CombatHandler.setTurnText(
                extraTurnEmbed,
                "ABILITY",
                this.opponentStand,
                {
                  abilityText: abilityInfo[0],
                  isConfused: this.isConfused,
                }
              );
            } else {
              CombatHandler.setTurnText(
                extraTurnEmbed,
                "MISS",
                this.opponentStand,
                {
                  isConfused: this.isConfused,
                }
              );
            }
          } else if (healAmount > 0) {
            // heal ability
            this.opponentHp += healAmount;

            this.opponentHp = Math.min(
              this.opponentHp,
              this.opponentStand.Healthpoints
            );

            CombatHandler.setTurnText(
              extraTurnEmbed,
              "ABILITY",
              this.opponentStand,
              {
                abilityText: abilityInfo[0],
                isConfused: this.isConfused,
              }
            );
          } else
            CombatHandler.setTurnText(
              extraTurnEmbed,
              "ABILITY",
              this.opponentStand,
              {
                abilityText: abilityInfo[0],
                isConfused: this.isConfused,
              }
            );

          // Reset ability count
          this.opponentAbilityCount[i] = 0;

          if (this.timeStopTurns <= 1)
            await this.updateSchema(AdventureInfo, {
              AttackRollHeight: 100,
              OpponentAbilityCount: this.opponentAbilityCount,
              DefenseModifier: nextTurnDefenseModifier,
            });
          else
            await this.updateSchema(AdventureInfo, {
              AttackRollHeight: 100,
              OpponentAbilityCount: this.opponentAbilityCount,
            });

          hasUsedAbility = true;
        }
      }

      if (!hasUsedAbility) {
        let enemyDefenseModifier = 1;

        if (this.savedData) {
          this.savedData = await AdventureInfo.findOne({
            Guild: this.guildId,
            User: this.player.id,
          });
          enemyDefenseModifier = this.savedData.DefenseModifier;
        }

        if (enemyDefenseModifier < 100) {
          let damage = CombatHandler.rollDamage(this.opponentStand);
          CombatHandler.setTurnText(
            extraTurnEmbed,
            "ATTACK",
            this.opponentStand,
            {
              damage: damage,
              isConfused: this.isConfused,
            }
          );

          this.playerHp -= damage;
        } else {
          CombatHandler.setTurnText(
            extraTurnEmbed,
            "MISS",
            this.opponentStand,
            {
              isConfused: this.isConfused,
            }
          );
        }

        await this.updateSchema(AdventureInfo, {
          AttackRollHeight: 100,
          DefenseModifier: 1,
        });
      }
    } else {
      // DODGE
      CombatHandler.setTurnText(extraTurnEmbed, "DODGE", this.opponentStand, {
        isConfused: this.isConfused,
      });

      await this.updateSchema(AdventureInfo, {
        AttackRollHeight: 75,
        DefenseModifier: 1,
      });
    }

    return extraTurnEmbed.data;
  }

  async updateSchema(schema, data) {
    await schema.updateOne(
      {
        Guild: this.guildId,
        User: this.player.id,
      },
      { $set: data }
    );
  }

  checkStandDeath() {
    // DRAW
    if (this.playerHp <= 0 && this.opponentHp <= 0) {
      this.playerWinState = "DRAW";
      this.isMatchOver = true;
    }
    // PLAYER WON
    else if (this.opponentHp <= 0) {
      this.playerWinState = "WIN";
      this.isMatchOver = true;
    }
    // OPPONENT WON
    else if (this.playerHp <= 0) {
      this.playerWinState = "LOSE";
      this.isMatchOver = true;
    } else this.playerWinState = "ONGOING";
  }

  updateDisplay() {
    for (let i = 0; i < this.playerStand.Ability.length; i++) {
      this.playerCooldownText += CombatHandler.setCooldownText(
        this.playerAbilityCount[i],
        this.playerStand.Ability[i].cooldown
      );
    }

    for (let i = 0; i < this.opponentStand.Ability.length; i++) {
      this.opponentCooldownText += CombatHandler.setCooldownText(
        this.opponentAbilityCount[i],
        this.opponentStand.Ability[i].cooldown
      );
    }

    if (this.isConfused) {
      this.fightEmbed.addFields(
        {
          name: `${CombatHandler.generateGlitchedText("short")}`,
          value: `${CombatHandler.generateGlitchedText(
            "short"
          )}: ${CombatHandler.generateGlitchedText(
            "number"
          )} / ${CombatHandler.generateGlitchedText(
            "number"
          )}${CombatHandler.generateGlitchedText("short")}`,
        },
        {
          name: `${CombatHandler.generateGlitchedText("short")}`,
          value: `${CombatHandler.generateGlitchedText(
            "short"
          )}: ${CombatHandler.generateGlitchedText(
            "number"
          )} / ${CombatHandler.generateGlitchedText(
            "number"
          )}${CombatHandler.generateGlitchedText("short")}`,
        }
      );
    } else {
      this.fightEmbed.addFields(
        {
          name: `${this.playerStand.Name}`,
          value: `Healthpoints: ${Math.max(this.playerHp, 0)} / ${
            this.playerStand.Healthpoints
          }${this.playerCooldownText}`,
        },
        {
          name: `${this.opponentStand.Name}`,
          value: `Healthpoints: ${Math.max(this.opponentHp, 0)} / ${
            this.opponentStand.Healthpoints
          }${this.opponentCooldownText}`,
        }
      );
    }
  }

  updateAbilityUI() {
    let buttons = [];
    for (let i = 0; i < this.playerStand.Ability.length; i++) {
      if (this.playerAbilityCount[i] < this.playerStand.Ability[i].cooldown)
        this.areAbilitiesInCooldown[i] = true;
      else this.areAbilitiesInCooldown[i] = false;

      let abilityButton = new ButtonBuilder()
        .setLabel(`Ability ${i + 1}`)
        .setCustomId(
          `Adventure-Ability-${this.guildId}-${this.player.id}-${this.opponent.id}-${i}`
        )
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(this.areAbilitiesInCooldown[i]);
      buttons.push(abilityButton);
    }

    this.abilityButtons.setComponents(buttons);
  }

  updateAbilityCounts(stand, exceptionIndex = -1) {
    let otherStand =
      stand == this.playerStand ? this.opponentStand : this.playerStand;

    for (let i = 0; i < stand.Ability.length; i++) {
      let abilityInfo = StandAbilities.abilities[stand.Ability[i].id](
        stand,
        otherStand,
        stand.Ability[i]
      );
      let isTimeStopAbility = abilityInfo[6] > 0;

      if (stand == this.playerStand) {
        if (i == exceptionIndex) {
          if (isTimeStopAbility) this.playerAbilityCount[i] = -abilityInfo[6];
          else this.playerAbilityCount[i] = 0;
        } else {
          this.playerAbilityCount[i] = this.savedData.PlayerAbilityCount[i] + 1;
        }
      } else if (stand == this.opponentStand) {
        if (i == exceptionIndex) {
          if (isTimeStopAbility) this.opponentAbilityCount[i] = -abilityInfo[6];
          else this.opponentAbilityCount[i] = 0;
        } else {
          this.opponentAbilityCount[i] =
            this.savedData.OpponentAbilityCount[i] + 1;
        }
      }
    }
  }

  orderEmbedDisplay() {
    let embeds = [];

    if (this.playerWinState == "SURRENDER") {
      embeds.push(this.turnEmbed, this.winEmbed);
      return embeds;
    }

    if (this.isPlayerFirst) {
      embeds.push(this.turnEmbed);
      if (this.opponentTurnEmbed?.data?.title)
        embeds.push(this.opponentTurnEmbed);
      if (this.opponentExtraTurnEmbeds.length > 0)
        embeds.push(...this.opponentExtraTurnEmbeds);
    } else {
      embeds.push(this.opponentTurnEmbed);
      if (this.opponentExtraTurnEmbeds.length > 0)
        embeds.push(...this.opponentExtraTurnEmbeds);
      if (this.turnEmbed?.data?.title) embeds.push(this.turnEmbed);
    }

    if (this.playerWinState == "ONGOING") embeds.push(this.fightEmbed);
    else embeds.push(this.winEmbed);
    if (this.playerWinState == "WIN") embeds.push(this.rewardEmbed);
    return embeds;
  }

  async clearAdventureInfo() {
    await AdventureInfo.findOneAndDelete({
      Guild: this.guildId,
      User: this.player.id,
    });
    console.log("Cleared AdventureInfo");
  }

  async endAdventure(buttonInteract) {
    await this.clearAdventureInfo(buttonInteract);

    // Set IsAdventuring to false
    await this.updateSchema(PlayerBooleans, {
      IsAdventuring: false,
    });

    // Set adventure cooldown
    await Cooldowns.create({
      Guild: this.guildId,
      User: this.player.id,
      Command: "adventure",
      Cooldown: Date.now(),
    });

    let playerStats = await PlayerStats.findOne({
      Guild: this.guildId,
      User: this.player.id,
    });

    if (!playerStats) {
      playerStats = await PlayerStats.create({
        Guild: this.guildId,
        User: this.player.id,
        DuelWins: 0,
        DuelPlays: 0,
        AdventureWins: 0,
        AdventurePlays: 0,
      });
    }

    if (this.playerWinState == "WIN")
      await this.updateSchema(PlayerStats, {
        AdventureWins: playerStats.AdventureWins + 1,
        AdventurePlays: playerStats.AdventurePlays + 1,
      });
    else
      await this.updateSchema(PlayerStats, {
        AdventurePlays: playerStats.AdventurePlays + 1,
      });

    // DRAW
    if (this.playerWinState == "DRAW") {
      this.winEmbed.setTitle("The duel ended in a draw!");

      let embeds = this.orderEmbedDisplay();

      await CombatHandler.reply(buttonInteract, embeds, []);
    }
    // PLAYER WON
    else if (this.playerWinState == "WIN") {
      this.winEmbed.setTitle(`${this.player.username} won the duel!`);

      // Handle rewards
      this.rewardEmbed.setTitle(`${this.player.username} found a loot crate!`);
      await this.giveRewards();

      let embeds = this.orderEmbedDisplay();

      await CombatHandler.reply(buttonInteract, embeds, []);
    }
    // OPPONENT WON
    else if (this.playerWinState == "LOSE") {
      this.winEmbed.setTitle(`${this.opponent.displayName} won the duel!`);

      let embeds = this.orderEmbedDisplay();

      await CombatHandler.reply(buttonInteract, embeds, []);
    }
    // PLAYER SURRENDER
    else if (this.playerWinState == "SURRENDER") {
      this.turnEmbed.setTitle(
        `${this.player.username} surrenders! ${this.opponent.displayName} wins the duel.`
      );
      this.winEmbed.setTitle(`${this.opponent.displayName} won the duel!`);

      let embeds = this.orderEmbedDisplay();

      await CombatHandler.reply(buttonInteract, embeds, []);
    }
  }

  async giveRewards() {
    let arrowAmount;
    let discAmount;
    let fruitAmount;
    let theWorldShardAmount = 0;

    arrowAmount = 1;
    discAmount = Math.floor(Math.random() * 40);
    fruitAmount = Math.floor(Math.random() * 100);
    let sum = arrowAmount + discAmount + fruitAmount;

    console.log(`${arrowAmount}-${discAmount}-${fruitAmount}`);

    arrowAmount = Math.round((arrowAmount / sum) * 8);
    discAmount = Math.round((discAmount / sum) * 8);
    fruitAmount = Math.round((fruitAmount / sum) * 8);

    if (this.opponent.id == "dio")
      theWorldShardAmount = Math.floor(Math.random() * 3) + 1;

    let playerInventory = await Inventory.findOne({
      Guild: this.guildId,
      User: this.player.id,
    });

    await this.updateSchema(Inventory, {
      StandArrow: playerInventory.StandArrow + arrowAmount,
      StandDisc: playerInventory.StandDisc + discAmount,
      RocacacaFruit: playerInventory.RocacacaFruit + fruitAmount,
      TheWorldShard: playerInventory.TheWorldShard + theWorldShardAmount,
    });

    let rewardText = "";

    if (arrowAmount > 0) rewardText += `${arrowAmount}x Stand Arrow\n`;
    if (discAmount > 0) rewardText += `${discAmount}x Stand Disc\n`;
    if (fruitAmount > 0) rewardText += `${fruitAmount}x Rocacaca Fruit\n`;
    if (theWorldShardAmount > 0)
      rewardText += `**RARE DROP!** ${theWorldShardAmount}x The World Shard`;

    this.rewardEmbed.data.description = rewardText;
  }
}

module.exports = { AdventureManager };
