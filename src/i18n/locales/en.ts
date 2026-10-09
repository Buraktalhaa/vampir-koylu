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
      abilityPrompt: 'Who will you bite tonight?',
    },
    seer: {
      name: 'Seer',
      description: "Each night you learn one player's true role.",
      abilityPrompt: 'Whose role do you want to see?',
    },
    healer: {
      name: 'Healer',
      description: 'Each night you protect one player from the vampires. You cannot protect the same person two nights in a row.',
      abilityPrompt: 'Who will you protect tonight?',
    },
    hunter: {
      name: 'Hunter',
      description: 'When you die, you take one last shot and bring someone down with you.',
      abilityPrompt: 'Who gets your last bullet?',
    },
  },
};
