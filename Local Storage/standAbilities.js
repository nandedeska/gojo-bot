const abilityPool = [
  {
    name: "Stand Barrage",
    id: "barrage",
    description: "The stand throws multiple punches towards the opponent.",
    cooldown: Math.max(Math.round(Math.random() * 7), 6),
  },
  {
    name: "Bright Ray of Light",
    id: "lightray",
    description:
      "The stand aims and produces a ray of light that can incinerate objects.",
    actionDescription: "blasts a ray of light",
    damage: Math.max(Math.round(Math.random() * 28), 5),
    cooldown: Math.max(Math.round(Math.random() * 7), 4),
  },
  {
    name: "Fifty Shards of Glass",
    id: "shards",
    description:
      "The stand shoots fifty or so glass shards in quick succession.",
    actionDescription: "shoots fifty glass shards",
    damage: Math.max(Math.round(Math.random() * 15), 7),
    cooldown: Math.max(Math.round(Math.random() * 4), 3),
  },
  {
    name: "Splinter in My Head",
    id: "splinter",
    description:
      "The stand causes great physical damage to the opponent's cranium.",
    actionDescription: "causes a great migraine",
    damage: Math.max(Math.round(Math.random() * 25), 10),
    cooldown: Math.max(Math.round(Math.random() * 4), 3),
  },
  {
    name: "Yo Da Yo",
    id: "yodayo",
    description: "**Yo. Da. Yo.**",
    actionDescription: "says Yo Da Yo",
    damage: Math.max(Math.round(Math.random() * 35), 15),
    cooldown: Math.max(Math.round(Math.random() * 3), 1),
  },
  {
    name: "Self Restoration",
    id: "heal",
    description: "The stand recovers lost healthpoints during a fight.",
    power: Math.max(Math.round(Math.random() * 12), 8),
    cooldown: Math.max(Math.round(Math.random() * 4), 2),
  },
  {
    name: "Home Run",
    id: "homerun",
    description: "The stand punches or kicks at speeds of over 160km/h.",
    actionDescription: "attacks at the speed of a baseball",
    modifier: 1.5,
    cooldown: Math.max(Math.round(Math.random() * 5), 3),
  },
  {
    name: "Fruit Punch",
    id: "fruitpunch",
    description:
      "The stand heals injuries by exposure to blood that isn't the user's.",
    actionDescription: "attacks and absorbs the opponent's blood",
    damage: Math.max(Math.round(Math.random() * 15), 5),
    cooldown: Math.max(Math.round(Math.random() * 6), 3),
  },
  {
    name: "Death's Kiss",
    id: "deathkiss",
    description: "The stand steals the life force of the opponent.",
    actionDescription: "drains the opponent's life force",
    damage: Math.max(Math.round(Math.random() * 17), 4),
    cooldown: Math.max(Math.round(Math.random() * 7), 3),
  },
  {
    name: "Dome of Aegis",
    id: "aegisdome",
    description:
      "The stand constructs an invisible dome that prevents anything from entering it. Any attacks towards the stand will miss.",
    actionDescription: "constructs the Dome of Aegis",
    modifier: 100,
    cooldown: Math.max(Math.round(Math.random() * 7), 4),
  },
  {
    name: "Invisible Yet Not So Invincible",
    id: "invisible",
    description:
      "The stand becomes completely transparent, making it hard for opponents to hit it.",
    actionDescription: "turns invisible",
    modifier: 1.25,
    cooldown: Math.max(Math.round(Math.random() * 6), 4),
  },
  {
    name: "Iron Fist",
    id: "ironfist",
    description:
      "The stand becomes pure metal, dealing more damage when attacking.",
    actionDescription: "turns into metal then attacks",
    modifier: 1.75,
    cooldown: Math.max(Math.round(Math.random() * 6), 4),
  },
];

const abilities = {
  // Stand Barrage
  barrage: multiAttack,
  // Bright Ray of Light
  lightray: flavoredAttack,
  // Fifty Shards of Glass
  shards: flavoredAttack,
  // Splinter in My Head
  splinter: flavoredAttack,
  // Yo Da Yo
  yodayo: flavoredAttack,
  // Self Restoration
  heal: healStand,
  // Home Run
  homerun: modifiedAttack,
  // Fruit Punch
  fruitpunch: lifeSteal,
  // Death's Kiss
  deathkiss: lifeSteal,
  // Dome of Aegis
  aegisdome: modifiedDefense,
  // Invisible Yet Not So Invincible
  invisible: modifiedDefense,
  // Iron Fist
  ironfist: modifiedAttack,
  // Homing Bullets
  homingbullets: modifiedDefenseWithAttack,
  // Tower Needle
  towerneedle: modifiedAttack,
  // Emerald Splash
  emeraldsplash: flavoredAttack,
  // Hora Rush
  horarush: multiAttack,
  // Sense Surroundings
  sensenearby: modifiedDefense,
  // Caprice 24
  caprice: modifiedDefenseWithAttack,
  // Thunderclouds
  thunderclouds: modifiedDefenseBoth,
  // The Void
  creamvoid: creamInvisible,
  // Mein Vater
  meinvater: elfking,
  // It's Just A Burning Memory
  burningmemory: burningmemory,
};

function burningmemory(currentStand, otherStand, abilityInfo) {
  let damage = Math.floor(Math.random() * currentStand.Attack) + 1;

  let actionText = `Ì̷͉M̵͖͘Գ̵̘̇O̵̘̊Ƨ̶͉̀Ƨ̷͓̃Í̵͎ઘ̷̜̏⅃̴̟̎Ǝ̴̥̅!̸̬͒.̷͖͠.̶̻͆.̶̦̀ ̶͍̑H̸̪̆O̵̖̍W̶̢̋ ̵̪̚Ɔ̴̲̊A̶͖͂И̴͙̅ ̴̥͊Ỳ̴̪Ỏ̷͉Ú̸̩ ̷̜͘Ƨ̶̥͒T̷̡̂I̸̳͑⅃̸̞̇⅃̶̲͆ ̸̝͌Ɔ̴̜̀Ơ̷̝M̷͈̈́Գ̸̺̈́Я̷̱͠Ǝ̷̼̾Ḣ̵̙Ǝ̴̝̃И̷̜͗Ⴇ̸̰͝ ̶̩̊T̵͇̈H̶̫͠I̷͈̽Ƨ̶̭͆`;

  return convertToCombatInfo({
    actionText: actionText,
    damage: damage,
    isConfused: true,
  });
}

function flavoredAttack(currentStand, otherStand, abilityInfo) {
  let damage = Math.floor(Math.random() * currentStand.Attack) + 1;

  let actionText = `${currentStand.Name} ${abilityInfo.actionDescription[0]}!`;

  return convertToCombatInfo({
    actionText: actionText,
    damage: damage,
  });
}

function creamInvisible(currentStand, otherStand, abilityInfo) {
  let rand = Math.random();

  if (rand < 0.3) {
    let actionText = `${currentStand.Name} ${abilityInfo.actionDescription[0]}!`;
    return convertToCombatInfo({
      actionText: actionText,
    });
  } else {
    let damage = Math.floor(Math.random() * currentStand.Attack) + 1;
    let actionText = `${currentStand.Name} ${abilityInfo.actionDescription[1]} dealing ${damage} damage!`;
    let modifier = abilityInfo.modifier;
    return convertToCombatInfo({
      actionText: actionText,
      damage: damage,
      selfDefMod: modifier,
    });
  }
}

function elfking(currentStand, otherStand, abilityInfo) {
  let rand = Math.random();

  if (rand < 0.9) {
    let actionText = `${currentStand.Name} ${abilityInfo.actionDescription[0]}!`;
    let modifier = abilityInfo.modifier;
    return convertToCombatInfo({
      actionText: actionText,
      selfDefMod: modifier,
    });
  } else {
    let damage = Math.floor(Math.random() * currentStand.Attack) + 1;
    let actionText = `${currentStand.Name} ${abilityInfo.actionDescription[1]} dealing ${damage} damage!`;
    return convertToCombatInfo({
      actionText: actionText,
      damage: damage,
    });
  }
}

function modifiedDefense(currentStand, otherStand, abilityInfo) {
  let modifier = abilityInfo.modifier;

  let actionText = `${currentStand.Name} ${abilityInfo.actionDescription}!`;

  return convertToCombatInfo({
    actionText: actionText,
    selfDefMod: modifier,
  });
}

function modifiedDefenseBoth(currentStand, otherStand, abilityInfo) {
  let modifier = abilityInfo.modifier;

  let actionText = `${currentStand.Name} ${abilityInfo.actionDescription}!`;

  return convertToCombatInfo({
    actionText: actionText,
    selfDefMod: modifier,
    opponentDefMod: modifier,
  });
}

function modifiedDefenseWithAttack(currentStand, otherStand, abilityInfo) {
  let modifier = abilityInfo.modifier;
  let damage = Math.floor(Math.random() * currentStand.Attack) + 1;

  let actionText = `${currentStand.Name} ${abilityInfo.actionDescription} dealing ${damage} damage!`;

  return convertToCombatInfo({
    actionText: actionText,
    damage: damage,
    opponentDefMod: modifier,
  });
}

function modifiedAttack(currentStand, otherStand, abilityInfo) {
  let damage =
    Math.round(
      Math.random() * Math.round(currentStand.Attack * abilityInfo.modifier)
    ) + 1;

  let actionText = `${currentStand.Name} ${abilityInfo.actionDescription} dealing ${damage} damage!`;

  // Turn Embed Text, Damage, HP Healed, Self Defense Modifier, Opponent Defense Modifier
  return convertToCombatInfo({
    actionText: actionText,
    damage: damage,
  });
}

function flavoredAttack(currentStand, otherStand, abilityInfo) {
  let damage = Math.floor(Math.random() * abilityInfo.damage) + 1;

  let actionText = `${currentStand.Name} ${abilityInfo.actionDescription} dealing ${damage} damage!`;
  return convertToCombatInfo({
    actionText: actionText,
    damage: damage,
  });
}

function multiAttack(currentStand, otherStand, abilityInfo) {
  attackAmount = Math.max(Math.round(Math.random() * 3) + 1, 2);

  let damage = 0;

  for (let i = 0; i < attackAmount; i++) {
    damage +=
      Math.floor(Math.random() * Math.round(currentStand.Attack * 0.75)) + 1;
  }

  let actionText = `${currentStand.Name} attacks ${attackAmount} times dealing ${damage} damage!`;

  return convertToCombatInfo({
    actionText: actionText,
    damage: damage,
  });
}

function healStand(currentStand, otherStand, abilityInfo) {
  let healAmount = Math.max(
    Math.floor(Math.random() * abilityInfo.power) + 1,
    3
  );

  let actionText = `${currentStand.Name} healed ${healAmount} HP!`;

  return convertToCombatInfo({
    actionText: actionText,
    healAmount: healAmount,
  });
}

function lifeSteal(currentStand, otherStand, abilityInfo) {
  let damage = Math.floor(Math.random() * abilityInfo.damage) + 1;

  let actionText = `${currentStand.Name} ${abilityInfo.actionDescription} dealing ${damage} damage! It heals ${damage} HP.`;

  return convertToCombatInfo({
    actionText: actionText,
    damage: damage,
    healAmount: damage,
  });
}

function timeStop(currentStand, otherStand, abilityInfo) {
  let actionText = `${currentStand.Name} ${abilityInfo.actionDescription}`;

  return convertToCombatInfo({});
}

function convertToCombatInfo(abilityOutput) {
  let actionText = abilityOutput.actionText;
  let damage = abilityOutput.damage || 0;
  let healAmount = abilityOutput.healAmount || 0;
  let selfDefMod = abilityOutput.selfDefMod || 1;
  let opponentDefMod = abilityOutput.opponentDefMod || 1;
  let isConfused = abilityOutput.isConfused || false;

  return [
    actionText,
    damage,
    healAmount,
    selfDefMod,
    opponentDefMod,
    isConfused,
  ];
}

module.exports = { abilities, abilityPool };
