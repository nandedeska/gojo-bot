const opponentPool = [
  "holhorse",
  "grayfly",
  "kakyoin",
  "polnareff",
  "ndoul",
  "vanillaice",
  "lamborgat",
  "lindberg",
  "kaiser",
];
const canonPool = [
  "holhorse",
  "grayfly",
  "kakyoin",
  "polnareff",
  "ndoul",
  "vanillaice",
];
const alternatePool = ["lamborgat", "lindberg", "kaiser", "kemppainen"];

const opponents = {
  // CANON
  holhorse: {
    id: "holhorse",
    displayName: "Hol Horse",
    displayImage:
      "https://64.media.tumblr.com/0bbd097f0343b1f70f029ae13b914c7c/afcfaf79420273eb-ab/s1280x1920/9601e97f64941f4e5a8dd3b3b1c5dac2dd5175f5.jpg",
    quotePool: [
      "The gun's mightier than the sword!",
      "It's all about being Number 2! That's the motto I like to live by!",
    ],
    stand: {
      Name: "The Emperor",
      Healthpoints: 37,
      Attack: 50,
      Defense: 16,
      Speed: 39,
      Ability: [
        {
          name: "Homing Bullets",
          id: "homingbullets",
          description:
            "The Emperor summons a gun that have an infinite amount of bullets. Hol Horse has free control over the trajectory of each bullet.",
          actionDescription: "shoots and changes the direction of its bullet",
          modifier: 0.25,
          cooldown: 2,
        },
      ],
    },
  },
  grayfly: {
    id: "grayfly",
    displayName: "Gray Fly",
    displayImage:
      "https://static.jojowiki.com/images/b/b0/latest/20230320143643/Grayflyteeth.png",
    quotePool: [
      "Even if you fired ten guns from only one centimeter in front of me... none of them could touch my Stand! Not that guns could hurt a Stand...",
      "You'll go mad from the pain once this rips its tongue out!",
      "My Stand is the Tower card, which signifies accidents and the end of journeys!",
    ],
    stand: {
      Name: "Tower of Gray",
      Healthpoints: 1,
      Attack: 10,
      Defense: 60,
      Speed: 100,
      Ability: [
        {
          name: "Tower Needle",
          id: "towerneedle",
          description:
            "Tower of Gray shoots a long stinger from its mouth. Its great speed allows it to pierce through flesh effortlessly.",
          actionDescription: "shoots its stinger",
          modifier: 4,
          cooldown: 3,
        },
      ],
    },
  },
  kakyoin: {
    id: "kakyoin",
    displayName: "Noriaki Kakyoin",
    displayImage: "https://i.ytimg.com/vi/UVOjCfE4Lx4/maxresdefault.jpg",
    quotePool: [
      "The side which survives is good and how they do it is beside the point. The loser is the evil one.",
      "No regrets. About anything that has happened on this journey or will happen from this point on. I will regret nothing.",
    ],
    stand: {
      Name: "Hierophant Green",
      Healthpoints: 39,
      Attack: 12,
      Defense: 14,
      Speed: 8,
      Ability: [
        {
          name: "Emerald Splash",
          id: "emeraldsplash",
          description:
            "Hierophant Green fires a massive amount of energy in the form of emeralds.",
          actionDescription: "launches an Emerald Splash",
          damage: 50,
          cooldown: 3,
        },
      ],
    },
  },
  polnareff: {
    id: "polnareff",
    displayName: "Jean Pierre Polnareff",
    displayImage:
      "https://cdn.discordapp.com/attachments/675612229676040192/1095221274940293211/image.png",
    quotePool: [
      "My Stand is the chariot... the war machine, Silver Chariot!",
      "Thats right. We have yet to introduce ourselves. You've beeen so kind as to share your last meal with Jean Pierre Polnareff.",
      "I'm gonna turn you into a pincushion!!... As for the rest, I'll leave that to the Devil himself.",
      "I'll dice you like a daikon radish!",
    ],
    stand: {
      Name: "Silver Chariot",
      Healthpoints: 28,
      Attack: 13,
      Defense: 32,
      Speed: 72,
      Ability: [
        {
          name: "Hora Rush",
          id: "horarush",
          description:
            "Silver Chariot rushes in and attacks with multiple stabs and slashes.",
          actionDescription: "rushes in and performs a barrage with its sword",
          cooldown: 5,
        },
      ],
    },
  },
  ndoul: {
    id: "ndoul",
    displayName: "N'Doul",
    displayImage:
      "https://static.wikia.nocookie.net/jjba/images/7/7f/NDoul_first.png/revision/latest?cb=20140913164510",
    quotePool: [
      "I do not fear death, but I don't want to be killed by that man... evil needs a savior as well...",
      "There doesn't seem to be any need for this walking stick anymore. But when I return... It'll still be useful.",
    ],
    stand: {
      Name: "Geb",
      Healthpoints: 7,
      Attack: 42,
      Defense: 31,
      Speed: 81,
      Ability: [
        {
          name: "Sense Surroundings",
          id: "sensenearby",
          description:
            "Geb checks its surroundings, sensing any moving hostiles within a large radius.",
          actionDescription:
            "senses its surroundings, making it hard to attack",
          modifier: 2,
          cooldown: 3,
        },
      ],
    },
  },
  vanillaice: {
    id: "vanillaice",
    displayName: "Vanilla Ice",
    displayImage:
      "https://static.wikia.nocookie.net/jjba/images/b/b6/Vanilla_inside_Cream.png/revision/latest?cb=20150607121756",
    quotePool: [
      "One by one, one after the other, I, Vanilla Ice, will scatter your atoms across my void...",
      "Lord DIO... I will not... let you down. I promise. I will... finish them off.",
    ],
    stand: {
      Name: "Cream",
      Healthpoints: 42,
      Attack: 25,
      Defense: 12,
      Speed: 46,
      Ability: [
        {
          name: "The Void",
          id: "creamvoid",
          description: "Void. Void. Void.",
          actionDescription: [
            "opens its mouth, allowing Vanilla Ice to peek through it",
            "attacks from the void dimension",
          ],
          modifier: 100,
          cooldown: 0,
        },
      ],
    },
  },

  // ALTERNATE UNIVERSE
  lamborgat: {
    id: "lamborgat",
    displayName: "Crescenzo Lamborgat",
    displayImage:
      "https://media.istockphoto.com/id/1297857458/photo/old-playing-card-isolated.jpg?s=612x612&w=0&k=20&c=22jveBP3WVP-WdPEPgAJabsQsgPwDis1Rs8G7P8tAaQ=",
    quotePool: [
      "I've no time for people who disregard the works of Liszt... They do not know of his virtuosity and passion!",
      "My ultimate goal is to reach the bridge to the transcendental land.",
      "The Croupier... a mysterious man. The master over Stands.",
      "The Eight of Diamonds... its meaning is still a mystery to me...",
    ],
    stand: {
      Name: "Paganini",
      Healthpoints: 46,
      Attack: 27,
      Defense: 12,
      Speed: 8,
      Ability: [
        {
          name: "Caprice 24",
          id: "caprice",
          description:
            "Paganini silences any sounds within a 100 feet radius, everyone but Crescenzo is deafened, leaving them at a disadvantage.",
          actionDescription: "deafens you then attacks",
          modifier: 0.35,
          cooldown: 2,
        },
      ],
    },
  },
  lindberg: {
    id: "lindberg",
    displayName: "Verner Lindberg",
    displayImage:
      "https://thumbs.dreamstime.com/b/four-hearts-vintage-playing-card-isolated-white-clipping-path-included-four-hearts-vintage-playing-card-isolated-white-175517183.jpg",
    quotePool: [". . ."],
    stand: {
      Name: "Troublemaker",
      Healthpoints: 16,
      Attack: 12,
      Defense: 15,
      Speed: 17,
      Ability: [
        {
          name: "Thunderclouds",
          id: "thunderclouds",
          description:
            "Troublemaker discharges an immense amount of dark smoke, severely obstructing anyone's vision inside (including the user).",
          actionDescription:
            "discharges a large smoke which obstructs your vision",
          modifier: 0.15,
          cooldown: 2,
        },
      ],
    },
  },
  kaiser: {
    id: "kaiser",
    displayName: "Stefanie Kaiser",
    displayImage:
      "https://media.istockphoto.com/id/182270676/photo/old-used-ten-of-spades-playing-card-isolated-on-white.jpg?s=612x612&w=0&k=20&c=gqVSloGmH1Z-4h2SaP61zIKrBHTRqUYTYL_gs2AfAYM=",
    quotePool: [
      "The card dealer wants you dead. You must know something about the other land...",
    ],
    stand: {
      Name: "Erlkönig",
      Healthpoints: 11,
      Attack: 100,
      Defense: 21,
      Speed: 23,
      Ability: [
        {
          name: "Mein Vater",
          id: "meinvater",
          description:
            "Erlkönig takes a ghostly form, subtly appearing every once in a while to attack. Only the person being pursued can see the stand when it appears.",
          actionDescription: [
            "hides, subtly watching you. You can hear it whispering nearby",
            "materializes and pulls out your life force",
          ],
          modifier: 10,
          cooldown: 0,
        },
      ],
    },
  },
  kemppainen: {
    id: "kemppainen",
    displayName: "Elial Kemppainen",
    displayImage:
      "https://media.discordapp.net/attachments/675612229676040192/1141749377375944786/ace_of_hearts.png?width=662&height=662",
    quotePool: [
      "The human mind is extraordinary, it holds the world inside it... yet it is simple to deceive.",
      "Take a look at the world before I take it from you.",
      "My stand, Heartaches, changes... or rather... disfigures you from the inside out.",
      "Heartaches! The fight has not started but it is already over...",
    ],
    stand: {
      Name: "Heartaches",
      Healthpoints: 76,
      Attack: 20,
      Defense: 52,
      Speed: 1,
      Ability: [
        {
          name: "It's Just A Burning Memory",
          id: "burningmemory",
          description:
            "Heartaches provokes a target causing a spontaneous confusion. While this ability is active, all thoughts, senses, and memories are amalgamated and distorted.",
          cooldown: 0,
        },
      ],
    },
  },
};

module.exports = { opponentPool, canonPool, alternatePool, opponents };
