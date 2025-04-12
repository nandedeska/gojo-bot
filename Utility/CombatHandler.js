const {
  Client,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const AdventureInfo = require("../Schemas/AdventureInfo");
const DuelInfo = require("../Schemas/DuelInfo");
const StandStats = require("../Schemas/StandStats");
const Inventory = require("../Schemas/PlayerInventory");
const PlayerBooleans = require("../Schemas/PlayerBooleans");
const Cooldowns = require("../Schemas/Cooldowns");
const StandAbilities = require("../Local Storage/standAbilities");
const PlayerStats = require("../Schemas/PlayerStats");
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

class AdventureManager {
  guildId;
  player;
  playerStand;
  playerHp;
  opponent;
  opponentStand;
  opponentHp;

  savedData;

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
    this.opponentTurnEmbed = null;
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
}

class DuelManager {
  guildId;
  challenger;
  challengerStand;
  challengerHp;
  challenged;
  challengedStand;
  challengedHp;

  currentPlayer;
  currentStand;
  otherPlayer;
  otherStand;

  savedData;

  challengerAbilityCount;
  challengedAbilityCount;

  attackRollHeight;
  timeStopTurns;

  isMatchOver;
  areAbilitiesInCooldown;
  isConfused;

  playerWinState;

  challengerCooldownText;
  challengedCooldownText;

  fightEmbed;
  turnEmbed;
  winEmbed;
  rewardEmbed;

  duelButtons;
  abilityButtons;

  constructor() {}

  async init(guildId, challenger, challenged, client) {
    this.client = client;
    this.guildId = guildId;
    this.challenger = challenger;
    this.challenged = challenged;

    this.savedData = await DuelInfo.findOne({
      Guild: this.guildId,
      Challenger: this.challenger.id,
      Challenged: this.challenged.id,
    });

    this.challengerStand = await StandStats.findOne({
      Guild: this.guildId,
      User: this.challenger.id,
    });
    this.challengedStand = await StandStats.findOne({
      Guild: this.guildId,
      User: this.challenged.id,
    });

    this.challengerHp = this.challengerStand.Healthpoints;
    this.challengedHp = this.challengedStand.Healthpoints;
    this.timeStopTurns = 0;
    this.attackRollHeight = 100;
    this.isMatchOver = false;
    this.isConfused = false;

    this.challengerAbilityCount = Array(
      this.challengerStand.Ability.length
    ).fill(0);
    this.challengedAbilityCount = Array(
      this.challengedStand.Ability.length
    ).fill(0);

    if (this.challengerStand.Speed >= this.challengedStand.Speed) {
      this.currentPlayer = this.challenger;
      this.otherPlayer = this.challenged;
      this.currentStand = this.challengerStand;
      this.otherStand = this.challengedStand;
    } else {
      this.currentPlayer = this.challenged;
      this.otherPlayer = this.challenger;
      this.currentStand = this.challengedStand;
      this.otherStand = this.challengerStand;
    }

    this.playerWinState = "ONGOING";

    this.challengerCooldownText = "";
    this.challengedCooldownText = "";

    this.fightEmbed = new EmbedBuilder()
      .setAuthor({
        name: `DUEL: ${this.challenger.username} vs ${this.challenged.username}`,
      })
      .setColor("#D31A38")
      .setImage(
        "https://cdn.discordapp.com/attachments/562958339034841098/1088740524342640700/image.png"
      );

    this.fightEmbed.setTitle(`${this.currentPlayer.username}'s Turn`);

    this.turnEmbed = new EmbedBuilder().setColor("#D31A38");

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

    if (this.savedData) {
      this.currentPlayer = await client.users.cache.get(
        this.savedData.CurrentPlayer
      );
      this.otherPlayer = await client.users.cache.get(
        this.savedData.OtherPlayer
      );
      this.challengerHp = this.savedData.ChallengerHP;
      this.challengedHp = this.savedData.ChallengedHP;
      this.attackRollHeight = this.savedData.AttackRollHeight;
      this.timeStopTurns = this.savedData.TimeStopTurns;
      this.challengerAbilityCount = this.savedData.ChallengerAbilityCount;
      this.challengedAbilityCount = this.savedData.ChallengedAbilityCount;

      if (this.currentPlayer.id == this.challenger.id) {
        this.currentStand = this.challengerStand;
        this.otherStand = this.challengedStand;
      } else {
        this.currentStand = this.challengedStand;
        this.otherStand = this.challengerStand;
      }

      if (this.timeStopTurns > 0)
        this.fightEmbed.setTitle(`${this.currentPlayer.username}'s Turn`);
      else this.fightEmbed.setTitle(`${this.otherPlayer.username}'s Turn`);
    }

    this.areAbilitiesInCooldown =
      this.savedData && this.timeStopTurns <= 0
        ? Array(this.otherStand.Ability.length).fill(true)
        : Array(this.currentStand.Ability.length).fill(true);

    this.duelButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Attack")
        .setCustomId(
          `Duel-Attack-${this.guildId}-${this.challenger.id}-${this.challenged.id}`
        )
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setLabel("Dodge")
        .setCustomId(
          `Duel-Dodge-${this.guildId}-${this.challenger.id}-${this.challenged.id}`
        )
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel("Surrender")
        .setCustomId(
          `Duel-Surrender-${this.guildId}-${this.challenger.id}-${this.challenged.id}`
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

  async updateSchema(schema, data, updateSave = false, player = null) {
    if (updateSave)
      await schema.updateOne(
        {
          Guild: this.guildId,
          Challenger: this.challenger.id,
          Challenged: this.challenged.id,
        },
        { $set: data }
      );
    else
      await schema.updateOne(
        {
          Guild: this.guildId,
          User: player.id,
        },
        { $set: data }
      );
  }

  checkStandDeath() {
    if (this.challengerHp <= 0 && this.challengedHp <= 0) {
      this.playerWinState = "DRAW";
      this.isMatchOver = true;
    }
    // PLAYER WON
    else if (this.challengerHp <= 0) {
      this.playerWinState = "CHALLENGED";
      this.isMatchOver = true;
    }
    // OPPONENT WON
    else if (this.challengedHp <= 0) {
      this.playerWinState = "CHALLENGER";
      this.isMatchOver = true;
    }
  }

  updateDisplay() {
    for (let i = 0; i < this.challengerStand.Ability.length; i++) {
      this.challengerCooldownText += setCooldownText(
        this.challengerAbilityCount[i],
        this.challengerStand.Ability[i].cooldown
      );
    }

    for (let i = 0; i < this.challengedStand.Ability.length; i++) {
      this.challengedCooldownText += setCooldownText(
        this.challengedAbilityCount[i],
        this.challengedStand.Ability[i].cooldown
      );
    }

    this.fightEmbed.addFields(
      {
        name: `${this.challengerStand.Name}`,
        value: `Healthpoints: ${Math.max(this.challengerHp, 0)} / ${
          this.challengerStand.Healthpoints
        }${this.challengerCooldownText}`,
      },
      {
        name: `${this.challengedStand.Name}`,
        value: `Healthpoints: ${Math.max(this.challengedHp, 0)} / ${
          this.challengedStand.Healthpoints
        }${this.challengedCooldownText}`,
      }
    );
  }

  updateAbilityUI() {
    let buttons = [];

    let stand =
      this.savedData && this.timeStopTurns <= 0
        ? this.otherStand
        : this.currentStand;
    let abilityCount = [];

    if (this.savedData) {
      abilityCount =
        stand == this.challengerStand
          ? this.savedData.ChallengerAbilityCount
          : this.savedData.ChallengedAbilityCount;
    } else {
      abilityCount =
        stand == this.challengerStand
          ? Array(this.challengerStand.Ability.length).fill(0)
          : Array(this.challengedStand.Ability.length).fill(0);
    }

    for (let i = 0; i < stand.Ability.length; i++) {
      if (abilityCount[i] < stand.Ability[i].cooldown)
        this.areAbilitiesInCooldown[i] = true;
      else this.areAbilitiesInCooldown[i] = false;

      let abilityButton = new ButtonBuilder()
        .setLabel(`Ability ${i + 1}`)
        .setCustomId(
          `Duel-Ability-${this.guildId}-${this.challenger.id}-${this.challenged.id}-${i}`
        )
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(this.areAbilitiesInCooldown[i]);

      buttons.push(abilityButton);
    }

    this.abilityButtons.setComponents(buttons);
  }

  updateAbilityCounts(exceptionIndex = -1) {
    for (let i = 0; i < this.currentStand.Ability.length; i++) {
      let abilityInfo = StandAbilities.abilities[
        this.currentStand.Ability[i].id
      ](this.currentStand, this.otherStand, this.currentStand.Ability[i]);
      let isTimeStopAbility = abilityInfo[6] > 0;

      if (this.currentPlayer.id == this.challenger.id) {
        if (i == exceptionIndex) {
          if (isTimeStopAbility)
            this.challengerAbilityCount[i] = -abilityInfo[6];
          else this.challengerAbilityCount[i] = 0;
        } else {
          this.challengerAbilityCount[i] =
            this.savedData.ChallengerAbilityCount[i] + 1;
        }
      } else {
        if (i == exceptionIndex) {
          if (isTimeStopAbility)
            this.challengedAbilityCount[i] = -abilityInfo[6];
          else this.challengedAbilityCount[i] = 0;
        } else {
          this.challengedAbilityCount[i] =
            this.savedData.ChallengedAbilityCount[i] + 1;
        }
      }
    }
  }

  async giveRewards() {
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

    let plr =
      this.playerWinState == "CHALLENGER" ? this.challenger : this.challenged;

    let playerInventory = await Inventory.findOne({
      Guild: this.guildId,
      User: plr.id,
    });

    await this.updateSchema(
      Inventory,
      {
        StandArrow: playerInventory.StandArrow + arrowAmount,
        StandDisc: playerInventory.StandDisc + discAmount,
        RocacacaFruit: playerInventory.RocacacaFruit + fruitAmount,
      },
      false,
      plr
    );

    let rewardText = "";

    if (arrowAmount > 0) rewardText += `${arrowAmount}x Stand Arrow\n`;
    if (discAmount > 0) rewardText += `${discAmount}x Stand Disc\n`;
    if (fruitAmount > 0) rewardText += `${fruitAmount}x Rocacaca Fruit\n`;

    this.rewardEmbed.data.description = rewardText;
  }

  async clearDuelInfo() {
    await DuelInfo.findOneAndDelete({
      Guild: this.guildId,
      Challenger: this.challenger.id,
      Challenged: this.challenged.id,
    });
  }

  async endDuel(buttonInteract) {
    await this.clearDuelInfo();

    await this.updateSchema(
      PlayerBooleans,
      { IsDueling: false },
      false,
      this.challenger
    );
    await this.updateSchema(
      PlayerBooleans,
      { IsDueling: false },
      false,
      this.challenged
    );

    await Cooldowns.create({
      Guild: this.guildId,
      User: this.challenger.id,
      Command: "duel",
      Cooldown: Date.now(),
    });
    await Cooldowns.create({
      Guild: this.guildId,
      User: this.challenged.id,
      Command: "duel",
      Cooldown: Date.now(),
    });

    if (this.playerWinState == "DRAW") {
      let challengerStats = await PlayerStats.findOne({
        Guild: this.guildId,
        User: this.challenger.id,
      });

      if (!challengerStats) {
        challengerStats = await PlayerStats.create({
          Guild: this.guildId,
          User: this.challenger.id,
          DuelWins: 0,
          DuelPlays: 0,
          AdventureWins: 0,
          AdventurePlays: 0,
        });
      }

      let challengedStats = await PlayerStats.findOne({
        Guild: this.guildId,
        User: this.challenged.id,
      });

      if (!challengedStats) {
        challengedStats = await PlayerStats.create({
          Guild: this.guildId,
          User: this.challenged.id,
          DuelWins: 0,
          DuelPlays: 0,
          AdventureWins: 0,
          AdventurePlays: 0,
        });
      }

      await this.updateSchema(
        PlayerStats,
        { DuelPlays: challengerStats.DuelPlays + 1 },
        false,
        this.challenger
      );
      await this.updateSchema(
        PlayerStats,
        { DuelPlays: challengedStats.DuelPlays + 1 },
        false,
        this.challenged
      );

      this.winEmbed.setTitle(
        `${this.challenger.username} and ${this.challenged.username} drew!`
      );
    } else {
      let winner =
        this.playerWinState == "CHALLENGER" ? this.challenger : this.challenged;
      let loser =
        this.playerWinState == "CHALLENGER" ? this.challenged : this.challenger;

      let winnerStats = await PlayerStats.findOne({
        Guild: this.guildId,
        User: winner.id,
      });

      if (!winnerStats) {
        winnerStats = await PlayerStats.create({
          Guild: this.guildId,
          User: winner.id,
          DuelWins: 0,
          DuelPlays: 0,
          AdventureWins: 0,
          AdventurePlays: 0,
        });
      }

      let loserStats = await PlayerStats.findOne({
        Guild: this.guildId,
        User: loser.id,
      });

      if (!loserStats) {
        loserStats = await PlayerStats.create({
          Guild: this.guildId,
          User: loser.id,
          DuelWins: 0,
          DuelPlays: 0,
          AdventureWins: 0,
          AdventurePlays: 0,
        });
      }

      await this.updateSchema(
        PlayerStats,
        {
          DuelWins: winnerStats.DuelWins + 1,
          DuelPlays: winnerStats.DuelPlays + 1,
        },
        false,
        winner
      );

      await this.updateSchema(
        PlayerStats,
        {
          DuelPlays: loserStats.DuelPlays + 1,
        },
        false,
        loser
      );

      this.winEmbed.setTitle(`${winner.username} won the duel!`);
    }

    let embeds = [this.turnEmbed, this.winEmbed];

    if (Math.random() < 0.5) {
      this.giveRewards();
      embeds.push(this.rewardEmbed);
    }

    reply(buttonInteract, embeds, []);
  }
}

async function botTurn(buttonInteract, adventureManager) {
class EmbedData {
  fightEmbed;
  turnEmbed;
  opponentTurnEmbed;
  opponentExtraTurnEmbeds;
  quoteEmbed;
  winEmbed;
  rewardEmbed;

  adventureButtons;
  duelButtons;
  abilityButtons;

  constructor() {}

  async init(data) {
    if (data instanceof AdventureManager) {
      let guildId = data.guildId;
      let player = data.player;
      let opponent = data.opponent;

      this.fightEmbed = new EmbedBuilder()
        .setAuthor({
          name: `DUEL: ${player.username} vs ${opponent.displayName}`,
        })
        .setColor("#D31A38")
        .setImage(
          "https://cdn.discordapp.com/attachments/562958339034841098/1088740524342640700/image.png"
        );

      this.turnEmbed = new EmbedBuilder().setColor("#D31A38");
      this.opponentTurnEmbed = null;
      this.opponentExtraTurnEmbeds = [];

      this.quoteEmbed = new EmbedBuilder()
        .setColor("#80FEFF")
        .setDescription(
          `**"${
            opponent.quotePool[
              Math.floor(Math.random() * opponent.quotePool.length)
            ]
          }"**`
        )
        .setFooter({ text: `${opponent.displayName}` });

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
            `Adventure-Attack-${guildId}-${player.id}-${opponent.id}`
          )
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

      this.abilityButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Ability")
          .setCustomId("Dummy")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
    } else if (data instanceof DuelData) {
      let guildId = data.guildId;
      let challenger = data.challenger;
      let challenged = data.challenged;

      this.fightEmbed = new EmbedBuilder()
        .setAuthor({
          name: `DUEL: ${challenger.username} vs ${challenged.username}`,
        })
        .setColor("#D31A38")
        .setImage(
          "https://cdn.discordapp.com/attachments/562958339034841098/1088740524342640700/image.png"
        );

      this.turnEmbed = new EmbedBuilder().setColor("#D31A38");

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

      this.duelButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Attack")
          .setCustomId(
            `Duel-Attack-${guildId}-${challenger.id}-${challenged.id}`
          )
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setLabel("Dodge")
          .setCustomId(
            `Duel-Dodge-${guildId}-${challenger.id}-${challenged.id}`
          )
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setLabel("Surrender")
          .setCustomId(
            `Duel-Surrender-${guildId}-${challenger.id}-${challenged.id}`
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
  }
}

  const rand = Math.random();
  adventureManager.opponentTurnEmbed = new EmbedBuilder().setColor("#D31A38");

  let guildId = adventureManager.guildId;
  let player = adventureManager.player;
  let playerStand = adventureManager.playerStand;
  let opponent = adventureManager.opponent;
  let opponentStand = adventureManager.opponentStand;

  let abilityCounts;
  if (adventureManager.savedData)
    abilityCounts = adventureManager.savedData.OpponentAbilityCount;

  if (rand < 0.8) {
    let hasUsedAbility = false;
    for (let i = 0; i < opponentStand.Ability.length; i++) {
      if (abilityCounts[i] >= opponentStand.Ability[i].cooldown) {
        let ability = opponentStand.Ability[i];
        let abilityId = ability.id;
        let abilityInfo = StandAbilities.abilities[abilityId](
          opponentStand,
          playerStand,
          ability
        );

        let damage = abilityInfo[1];
        let healAmount = abilityInfo[2];
        let nextDefenseModifier = abilityInfo[3];
        let currentDefenseModifier = abilityInfo[4];
        adventureManager.isConfused = abilityInfo[5];
        let timeStopTurns = abilityInfo[6];

        // TIME STOP ABILITY
        if (timeStopTurns > 0) {
          // time stop ability
          abilityCounts[i] = 0;
          await updateAdventureSchema(AdventureInfo, adventureManager, {
            AttackRollHeight: 100,
            OpponentAbilityCount: abilityCounts,
            DefenseModifier: nextDefenseModifier,
          });

          for (let i = 0; i < timeStopTurns; i++) {
            adventureManager.opponentExtraTurnEmbeds.push(
              await botTimeStopTurn(adventureManager)
            );
          }
          adventureManager.opponentTurnEmbed.setTitle(abilityInfo[0]);
        }
        // ATTACK-BASED ABILITY
        else if (damage > 0) {
          let defenseMod = 1;
          if (adventureManager.savedData) {
            adventureManager.savedData = await AdventureInfo.findOne({
              Guild: guildId,
              User: player.id,
            });
            defenseMod = adventureManager.savedData.DefenseModifier;
          }

          let attackRoll =
            Math.floor(Math.random() * adventureManager.attackRollHeight) + 1;

          if (
            attackRoll >=
            playerStand.Defense * defenseMod * currentDefenseModifier
          ) {
            adventureManager.playerHp -= damage;

            // LIFE STEAL
            if (healAmount > 0) {
              adventureManager.opponentHp += healAmount;
              adventureManager.opponentHp = Math.min(
                adventureManager.opponentHp,
                opponentStand.Healthpoints
              );
            }

            // HEARTACHES ABILITY
            if (adventureManager.isConfused)
              adventureManager.opponentTurnEmbed.setTitle(
                generateGlitchedText("long")
              );
            else adventureManager.opponentTurnEmbed.setTitle(abilityInfo[0]);
          } else {
            // HEARTACHES ABILITY
            if (adventureManager.isConfused)
              adventureManager.opponentTurnEmbed.setTitle(
                generateGlitchedText("long")
              );
            else
              adventureManager.opponentTurnEmbed.setTitle(
                `${opponentStand.Name} missed!`
              );
          }
        }
        // HEAL ABILITY
        else if (healAmount > 0) {
          adventureManager.opponentHp += healAmount;
          adventureManager.opponentHp = Math.min(
            adventureManager.opponentHp,
            opponentStand.Healthpoints
          );
          adventureManager.opponentTurnEmbed.setTitle(abilityInfo[0]);
        } else adventureManager.opponentTurnEmbed.setTitle(abilityInfo[0]);

        // Increment all abilities except this
        for (let j = 0; j < opponentStand.Ability.length; j++) {
          if (j == i) abilityCounts[j] = 0;
          else
            abilityCounts[j] =
              adventureManager.savedData.OpponentAbilityCount[j] + 1;
        }

        // Update saved data
        await updateAdventureSchema(AdventureInfo, adventureManager, {
          AttackRollHeight: 100,
          OpponentAbilityCount: abilityCounts,
          DefenseModifier: nextDefenseModifier,
        });

        hasUsedAbility = true;

        // Check if stand died
        await checkStandDeath(adventureManager);

        if (adventureManager.isMatchOver) return;
      }
    }

    if (!hasUsedAbility) {
      let attackRoll =
        Math.floor(Math.random() * adventureManager.attackRollHeight) + 1;
      let currentDefenseModifier = 1;

      if (adventureManager.savedData) {
        adventureManager.savedData = await AdventureInfo.findOne({
          Guild: guildId,
          User: player.id,
        });
        currentDefenseModifier = adventureManager.savedData.DefenseModifier;
      }

      if (attackRoll >= playerStand.Defense * currentDefenseModifier) {
        let damage = Math.floor(Math.random() * opponentStand.Attack) + 1;
        if (adventureManager.isConfused)
          adventureManager.opponentTurnEmbed.setTitle(
            generateGlitchedText("long")
          );
        else
          adventureManager.opponentTurnEmbed.setTitle(
            `${opponentStand.Name}'s attack hits! It deals ${damage} damage.`
          );

        adventureManager.playerHp -= damage;
      } else {
        if (adventureManager.isConfused)
          adventureManager.opponentTurnEmbed.setTitle(
            generateGlitchedText("long")
          );
        else
          adventureManager.opponentTurnEmbed.setTitle(
            `${opponentStand.Name} missed!`
          );
      }

      // Increment ability count
      for (let i = 0; i < opponentStand.Ability.length; i++) {
        try {
          abilityCounts[i] =
            adventureManager.savedData.OpponentAbilityCount[i] + 1;
        } catch (err) {
          console.log(err);
        }
      }

      await updateAdventureSchema(AdventureInfo, adventureManager, {
        AttackRollHeight: 100,
        OpponentAbilityCount: abilityCounts,
        DefenseModifier: 1,
      });

      await checkStandDeath(adventureManager);
    }
  } else {
    // DODGE
    if (adventureManager.isConfused)
      adventureManager.opponentTurnEmbed.setTitle(generateGlitchedText("long"));
    else
      adventureManager.opponentTurnEmbed.setTitle(
        `${opponentStand.Name} prepares to dodge!`
      );

    // increment ability count
    for (let i = 0; i < opponentStand.Ability.length; i++) {
      try {
        abilityCounts[i] =
          adventureManager.savedData.OpponentAbilityCount[i] + 1;
      } catch (err) {
        console.log(err);
      }
    }

    await updateAdventureSchema(AdventureInfo, adventureManager, {
      AttackRollHeight: 75,
      OpponentAbilityCount: abilityCounts,
      DefenseModifier: 1,
    });

    await checkStandDeath(adventureManager);
  }
}

async function botTimeStopTurn(adventureManager) {
  const rand = Math.random();
  let abilityCounts;

  let guildId = adventureManager.guildId;
  let player = adventureManager.player;
  let playerStand = adventureManager.playerStand;
  let opponent = adventureManager.opponent;
  let opponentStand = adventureManager.opponentStand;

  if (adventureManager.savedData)
    abilityCounts = adventureManager.savedData.OpponentAbilityCount;

  let extraTurnEmbed = new EmbedBuilder().setColor("#D31A38");
  if (rand < 0.95) {
    // Attack or ability
    let hasUsedAbility = false;
    for (let i = 0; i < opponentStand.Ability.length; i++) {
      // Check if bot can use ability
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

        let damage = abilityInfo[1];
        let healAmount = abilityInfo[2];
        let nextDefenseModifier = abilityInfo[3];
        let currentDefenseModifier = abilityInfo[4];
        adventureManager.isConfused = abilityInfo[5];
        let timeStopTurns = abilityInfo[6];

        if (timeStopTurns > 0) {
          // TIME STOP
          extraTurnEmbed.setTitle(abilityInfo[0]);
        } else if (damage > 0) {
          // ATTACK BASED ABILITY
          let defenseMod = 1;
          if (adventureManager.savedData) {
            adventureManager.savedData = await AdventureInfo.findOne({
              Guild: adventureManager.guildId,
              User: adventureManager.player.id,
            });
            defenseMod = adventureManager.savedData.DefenseModifier;
          }

          if (defenseMod < 100) {
            let damage = abilityInfo[1];

            adventureManager.playerHp -= damage;
            if (healAmount > 0) {
              // life steal ability
              adventureManager.opponentHp += healAmount;

              adventureManager.opponentHp = Math.min(
                adventureManager.opponentHp,
                opponentStand.Healthpoints
              );
            }

            if (adventureManager.isConfused)
              extraTurnEmbed.setTitle(generateGlitchedText("long"));
            else extraTurnEmbed.setTitle(abilityInfo[0]);
          } else {
            if (adventureManager.isConfused)
              extraTurnEmbed.setTitle(generateGlitchedText("long"));
            else extraTurnEmbed.setTitle(`${opponentStand.Name} missed!`);
          }
        } else if (healAmount > 0) {
          // heal ability
          adventureManager.opponentHp += healAmount;

          adventureManager.opponentHp = Math.min(
            adventureManager.opponentHp,
            opponentStand.Healthpoints
          );
          extraTurnEmbed.setTitle(abilityInfo[0]);
        } else extraTurnEmbed.setTitle(abilityInfo[0]);

        // Reset ability count
        abilityCounts[i] = 0;

        await updateAdventureSchema(AdventureInfo, adventureManager, {
          AttackRollHeight: 100,
          OpponentAbilityCount: abilityCounts,
          DefenseModifier: nextDefenseModifier,
        });

        hasUsedAbility = true;
      }
    }

    if (!hasUsedAbility) {
      let currentDefenseModifier = 1;

      if (adventureManager.savedData) {
        adventureManager.savedData = await AdventureInfo.findOne({
          Guild: adventureManager.guildId,
          User: adventureManager.player.id,
        });
        currentDefenseModifier = adventureManager.savedData.DefenseModifier;
      }

      if (currentDefenseModifier < 100) {
        let damage = Math.floor(Math.random() * opponentStand.Attack) + 1;
        if (adventureManager.isConfused)
          extraTurnEmbed.setTitle(generateGlitchedText("long"));
        else
          extraTurnEmbed.setTitle(
            `${opponentStand.Name}'s attack hits! It deals ${damage} damage.`
          );

        adventureManager.playerHp -= damage;
      } else {
        if (adventureManager.isConfused)
          extraTurnEmbed.setTitle(generateGlitchedText("long"));
        else extraTurnEmbed.setTitle(`${opponentStand.Name} missed!`);
      }

      await updateAdventureSchema(AdventureInfo, adventureManager, {
        AttackRollHeight: 100,
        DefenseModifier: 1,
      });
    }
  } else {
    // DODGE
    if (adventureManager.isConfused)
      extraTurnEmbed.setTitle(generateGlitchedText("long"));
    else extraTurnEmbed.setTitle(`${opponentStand.Name} prepares to dodge!`);

    await updateAdventureSchema(AdventureInfo, adventureManager, {
      AttackRollHeight: 75,
      DefenseModifier: 1,
    });
  }

  return extraTurnEmbed.data;
}

async function updateAdventureSchema(schema, adventureManager, data) {
  await schema.updateOne(
    {
      Guild: adventureManager.guildId,
      User: adventureManager.player.id,
    },
    { $set: data }
  );
}

async function checkStandDeath(adventureManager) {
  // DRAW
  if (adventureManager.playerHp <= 0 && adventureManager.opponentHp <= 0) {
    adventureManager.playerWinState = "DRAW";
    adventureManager.isMatchOver = true;
  }
  // PLAYER WON
  else if (adventureManager.opponentHp <= 0) {
    adventureManager.playerWinState = "WIN";
    adventureManager.isMatchOver = true;
  }
  // OPPONENT WON
  else if (adventureManager.playerHp <= 0) {
    adventureManager.playerWinState = "LOSE";
    adventureManager.isMatchOver = true;
  }
}

function setCooldownText(currentAbilityCount, abilityCooldown) {
  if (currentAbilityCount < abilityCooldown) {
    return `\nAbility Cooldown: ${abilityCooldown - currentAbilityCount} Turns`;
  } else {
    return "\nAbility Ready!";
  }
}

function generateGlitchedText(type) {
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

function updateAdventureDisplay(adventureManager) {
  playerStand = adventureManager.playerStand;
  opponentStand = adventureManager.opponentStand;

  if (adventureManager.savedData) {
    for (let i = 0; i < playerStand.Ability.length; i++) {
      adventureManager.playerCooldownText += setCooldownText(
        playerStand,
        i,
        adventureManager.savedData.PlayerAbilityCount
      );
    }

    for (let i = 0; i < opponentStand.Ability.length; i++) {
      adventureManager.opponentCooldownText += setCooldownText(
        opponentStand,
        i,
        adventureManager.savedData.OpponentAbilityCount
      );
    }
  }

  console.log(
    `${adventureManager.playerCooldownText} ${adventureManager.opponentCooldownText}`
  );

  if (adventureManager.isConfused) {
    adventureManager.fightEmbed.addFields(
      {
        name: `${generateGlitchedText("short")}`,
        value: `${generateGlitchedText("short")}: ${generateGlitchedText(
          "number"
        )} / ${generateGlitchedText("number")}${generateGlitchedText("short")}`,
      },
      {
        name: `${generateGlitchedText("short")}`,
        value: `${generateGlitchedText("short")}: ${generateGlitchedText(
          "number"
        )} / ${generateGlitchedText("number")}${generateGlitchedText("short")}`,
      }
    );
  } else {
    adventureManager.fightEmbed.addFields(
      {
        name: `${playerStand.Name}`,
        value: `Healthpoints: ${Math.max(adventureManager.playerHp, 0)} / ${
          playerStand.Healthpoints
        }${adventureManager.playerCooldownText}`,
      },
      {
        name: `${opponentStand.Name}`,
        value: `Healthpoints: ${Math.max(adventureManager.opponentHp, 0)} / ${
          opponentStand.Healthpoints
        }${adventureManager.opponentCooldownText}`,
      }
    );
  }
}

function updateAbilityUI(adventureManager) {
  let buttons = [];
  for (let i = 0; i < adventureManager.playerStand.Ability.length; i++) {
    if (adventureManager.savedData) {
      if (
        adventureManager.savedData.PlayerAbilityCount[i] <
        adventureManager.playerStand.Ability[i].cooldown
      )
        adventureManager.areAbilitiesInCooldown[i] = true;
      else adventureManager.areAbilitiesInCooldown[i] = false;
    }

    abilityButton = new ButtonBuilder()
      .setLabel(`Ability ${i + 1}`)
      .setCustomId(
        `Adventure-Ability-${adventureManager.guildId}-${adventureManager.player.id}-${adventureManager.opponent.id}-${i}`
      )
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(adventureManager.areAbilitiesInCooldown[i]);
    buttons.push(abilityButton);
  }

  adventureManager.abilityButtons.setComponents(buttons);
}

function orderEmbedDisplay(isPlayerFirst, playerWinState, adventureManager) {
  let embeds = [];

  if (playerWinState == "SURRENDER") {
    embeds.push(adventureManager.turnEmbed, adventureManager.winEmbed);
    return embeds;
  }

  if (isPlayerFirst) {
    if (adventureManager.turnEmbed?.data?.title)
      embeds.push(adventureManager.turnEmbed);
    if (adventureManager.opponentTurnEmbed?.data?.title)
      embeds.push(adventureManager.opponentTurnEmbed);
    if (adventureManager.opponentExtraTurnEmbeds.length > 0)
      embeds.push(...adventureManager.opponentExtraTurnEmbeds);
  } else {
    if (adventureManager.opponentTurnEmbed?.data?.title)
      embeds.push(adventureManager.opponentTurnEmbed);
    if (adventureManager.opponentExtraTurnEmbeds.length > 0)
      embeds.push(...adventureManager.opponentExtraTurnEmbeds);
    if (adventureManager.turnEmbed?.data?.title)
      embeds.push(adventureManager.turnEmbed);
  }

  if (playerWinState == "ONGOING") embeds.push(adventureManager.fightEmbed);
  else embeds.push(adventureManager.winEmbed);
  if (playerWinState == "WIN") embeds.push(adventureManager.rewardEmbed);
  return embeds;
}

async function reply(buttonInteract, embedList, componentList) {
  await buttonInteract.deferUpdate();
  await buttonInteract.editReply({
    embeds: embedList,
    components: componentList,
  });
}

async function clearAdventureInfo(buttonInteract, adventureManager) {
  await AdventureInfo.findOneAndDelete({
    Guild: adventureManager.guildId,
    User: adventureManager.player.id,
  });
  console.log("Cleared AdventureInfo");
}

async function endAdventure(buttonInteract, adventureManager) {
  await clearAdventureInfo(buttonInteract, adventureManager);

  // Set IsAdventuring to false
  await updateAdventureSchema(PlayerBooleans, adventureManager, {
    IsAdventuring: false,
  });

  // Set adventure cooldown
  await Cooldowns.create({
    Guild: adventureManager.guildId,
    User: adventureManager.player.id,
    Command: "adventure",
    Cooldown: Date.now(),
  });

  let playerStats = await PlayerStats.findOne({
    Guild: adventureManager.guildId,
    User: adventureManager.player.id,
  });

  if (!playerStats) {
    playerStats = await PlayerStats.create({
      Guild: adventureManager.guildId,
      User: adventureManager.player.id,
      DuelWins: 0,
      DuelPlays: 0,
      AdventureWins: 0,
      AdventurePlays: 0,
    });
  }

  if (adventureManager.playerWinState == "WIN")
    await updateAdventureSchema(PlayerStats, adventureManager, {
      AdventureWins: playerStats.AdventureWins + 1,
      AdventurePlays: playerStats.AdventurePlays + 1,
    });
  else
    await updateAdventureSchema(PlayerStats, adventureManager, {
      AdventurePlays: playerStats.AdventurePlays + 1,
    });

  // DRAW
  if (adventureManager.playerWinState == "DRAW") {
    adventureManager.winEmbed.setTitle("The duel ended in a draw!");

    let embeds = orderEmbedDisplay(
      adventureManager.isPlayerFirst,
      "DRAW",
      adventureManager
    );

    await reply(buttonInteract, embeds, []);
  }
  // PLAYER WON
  else if (adventureManager.playerWinState == "WIN") {
    adventureManager.winEmbed.setTitle(
      `${adventureManager.player.username} won the duel!`
    );

    // Handle rewards
    adventureManager.rewardEmbed.setTitle(
      `${adventureManager.player.username} found a loot crate!`
    );
    await giveRewards(adventureManager, adventureManager);

    let embeds = orderEmbedDisplay(
      adventureManager.isPlayerFirst,
      "WIN",
      adventureManager
    );

    await reply(buttonInteract, embeds, []);
  }
  // OPPONENT WON
  else if (adventureManager.playerWinState == "LOSE") {
    adventureManager.winEmbed.setTitle(
      `${adventureManager.opponent.displayName} won the duel!`
    );

    let embeds = orderEmbedDisplay(
      adventureManager.isPlayerFirst,
      "LOSE",
      adventureManager
    );

    await reply(buttonInteract, embeds, []);
  }
  // PLAYER SURRENDER
  else if (adventureManager.playerWinState == "SURRENDER") {
    adventureManager.turnEmbed.setTitle(
      `${adventureManager.player.username} surrenders! ${adventureManager.opponent.displayName} wins the duel.`
    );
    adventureManager.winEmbed.setTitle(
      `${adventureManager.opponent.displayName} won the duel!`
    );

    let embeds = orderEmbedDisplay(
      adventureManager.isPlayerFirst,
      "SURRENDER",
      adventureManager
    );

    await reply(buttonInteract, embeds, []);
  }
}

async function giveRewards(adventureManager) {
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

  if (opponent.id == "dio")
    theWorldShardAmount = Math.floor(Math.random() * 3) + 1;

  let playerInventory = await Inventory.findOne({
    Guild: adventureManager.guildId,
    User: adventureManager.player.id,
  });

  await updateAdventureSchema(Inventory, adventureManager, {
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

  adventureManager.rewardEmbed.data.description = rewardText;
}

module.exports = {
  AdventureManager,
  DuelManager,
  botTurn,
  checkStandDeath,
  endAdventure,
  generateGlitchedText,
  orderEmbedDisplay,
  reply,
  setCooldownText,
  updateAbilityUI,
  updateAdventureDisplay,
  updateAdventureSchema,
};
