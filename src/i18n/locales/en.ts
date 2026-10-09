import type { Translation } from './tr';

export const en: Translation = {
  languageName: 'English',
  teams: {
    village: { name: 'Village', goal: 'Find every vampire and drive them out.' },
    vampire: { name: 'Vampires', goal: 'Equal or outnumber the villagers.' },
  },
  roles: {
    villager: {
      name: 'Villager',
      description: 'No special power. Debate during the day and vote out who you suspect.',
    },
    vampire: {
      name: 'Vampire',
      description: 'Each night you choose a victim together with the other vampires. You know your teammates.',
      abilities: { bite: { name: 'Bite', prompt: 'Who will you bite tonight?' } },
    },
    witch: {
      name: 'Witch',
      description:
        'You have two spells, each usable once. You can cast only one per night: protect everyone that night, or curse a player to death. Your curse fails on someone the Healer protects.',
      abilities: {
        shield: { name: 'Protective Shield', prompt: 'Protect the whole village tonight?' },
        curse: { name: 'Death Curse', prompt: 'Who will you curse?' },
      },
    },
    healer: {
      name: 'Healer',
      description:
        'Each night you protect one player, yourself included. You cannot protect the same person two nights in a row.',
      abilities: { heal: { name: 'Heal', prompt: 'Who will you protect tonight?' } },
    },
    avenger: {
      name: 'Avenger',
      description: 'If the village hangs you, you take one more player down with you.',
      abilities: { revenge: { name: 'Revenge', prompt: 'Who will you take with you?' } },
    },
  },
};
