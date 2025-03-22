const AdventureInfo = require("../Schemas/AdventureInfo");
const StandStats = require("../Schemas/StandStats");

class AdventureData {
  guildId;
  player;
  playerStand;
  playerHp;
  opponent;
  opponentStand;
  opponentHp;

  attackRollHeight;
  timeStopTurns;

  isPlayerFirst;
  isStandDead;
  areAbilitiesInCooldown;
  isConfused;

  playerCooldownText;
  opponentCooldownText;

  constructor() {}

  static async new(guildId, player, opponent) {
    const data = new AdventureData();
    await data.init(guildId, player, opponent);
    return data;
  }

  async init() {
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

    this.attackRollHeight = 75;
    this.timeStopTurns = 0;

    this.isPlayerFirst =
      this.playerStand.Speed >= this.opponentStand.Speed ? true : false;
    this.isStandDead = false;
    this.areAbilitiesInCooldown = Array(this.playerStand.Ability.length).fill(
      true
    );
    this.isConfused = false;

    this.playerCooldownText = "";
    this.opponentCooldownText = "";

    adventureInfo = await AdventureInfo.findOne({
      Guild: this.guildId,
      User: this.player.id,
    });

    if (adventureInfo) {
      this.playerHp = adventureInfo.PlayerHP;
      this.opponentHp = adventureInfo.OpponentHP;
      this.attackRollHeight = adventureInfo.AttackRollHeight;
      this.isConfused = adventureInfo.IsConfused;
      this.timeStopTurns = adventureInfo.TimeStopTurns;
    }
  }
}

