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

function tryAttack(
  attackingStand,
  defendingStand,
  defenseModifier,
  attackRollHeight
) {
  let attackRoll =
    Math.floor(
      Math.random() * (attackRollHeight + Math.floor(attackingStand.Speed / 5))
    ) + 1;

  if (attackRoll >= defendingStand.Defense * defenseModifier) return true;
  else return false;
}

function rollDamage(attackingStand) {
  return Math.floor(Math.random() * attackingStand.Attack) + 1;
}

function setTurnText(
  turnEmbed,
  turnState,
  stand,
  { damage = "INVALID", abilityText = "INVALID", isConfused = false } = {}
) {
  let text = "INVALID";

  if (isConfused) text = module.exports.generateGlitchedText("long");
  else if (turnState == "ABILITY") text = abilityText;
  else if (turnState == "ATTACK")
    text = `${stand.Name}'s attack hits! It deals ${damage} damage.`;
  else if (turnState == "DODGE") text = `${stand.Name} prepares to dodge!`;
  else if (turnState == "MISS") text = `${stand.Name} misses!`;

  turnEmbed.setTitle(text);
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

async function reply(buttonInteract, embedList, componentList) {
  await buttonInteract.editReply({
    embeds: embedList,
    components: componentList,
  });
}

module.exports = {
  generateGlitchedText,
  reply,
  rollDamage,
  setCooldownText,
  setTurnText,
  tryAttack,
};
