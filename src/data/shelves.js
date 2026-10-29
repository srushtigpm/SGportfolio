// Each genre on the bookshelf is kept under the tarot card whose picture fits it best.
// Ordered by card number, so the shelves read like the Major Arcana.
// `cloth` is the spine colour family for that shelf: [hue, saturation %, lightness %].
export const shelves = [
  { category: 'Memoir & Biography', short: 'Lives', card: '00-TheFool', num: '0', name: 'The Fool', cloth: [22, 34, 32],
    why: 'A traveller at the start of a long road. Other people’s life stories.' },
  { category: 'Psychology', short: 'The mind', card: '02-TheHighPriestess', num: 'II', name: 'The High Priestess', cloth: [262, 26, 34],
    why: 'She guards what lies beneath the surface. Books about how minds work.' },
  { category: 'Creativity & Art', short: 'Making', card: '03-TheEmpress', num: 'III', name: 'The Empress', cloth: [92, 26, 34],
    why: 'Everything grows around her. Books about making things.' },
  { category: 'Business & Entrepreneurship', short: 'Business', card: '04-TheEmperor', num: 'IV', name: 'The Emperor', cloth: [355, 42, 31],
    why: 'He sits on a stone throne at the head of an empire. Books on building companies.' },
  { category: 'Spirituality & Religion', short: 'Spirit', card: '05-TheHierophant', num: 'V', name: 'The Hierophant', cloth: [300, 24, 32],
    why: 'A teacher handing down sacred traditions. Books on the spirit.' },
  { category: 'Marketing & Persuasion', short: 'Persuasion', card: '06-TheLovers', num: 'VI', name: 'The Lovers', cloth: [12, 46, 43],
    why: 'Two people drawn together under an angel. Books on attraction, influence and choice.' },
  { category: 'Leadership & Management', short: 'Leading', card: '07-TheChariot', num: 'VII', name: 'The Chariot', cloth: [215, 36, 32],
    why: 'A driver steering two sphinxes by will alone. Books on leading people.' },
  { category: 'Mindset & Self-Help', short: 'Mindset', card: '08-Strength', num: 'VIII', name: 'Strength', cloth: [30, 52, 40],
    why: 'A woman calmly closing a lion’s jaws. Books on inner strength and habits.' },
  { category: 'Philosophy', short: 'Philosophy', card: '09-TheHermit', num: 'IX', name: 'The Hermit', cloth: [165, 20, 30],
    why: 'An old figure holding up a lantern. Books for thinking things through.' },
  { category: 'Investing & Finance', short: 'Money', card: '10-WheelOfFortune', num: 'X', name: 'Wheel of Fortune', cloth: [42, 52, 36],
    why: 'The great wheel of cycles and chance. Books on money and markets.' },
  { category: 'Math & Logic', short: 'Logic', card: '11-Justice', num: 'XI', name: 'Justice', cloth: [200, 22, 36],
    why: 'Scales in one hand, a sword in the other. Books on reasoning clearly.' },
  { category: 'Science & Cosmology', short: 'Cosmos', card: '17-TheStar', num: 'XVII', name: 'The Star', cloth: [226, 42, 29],
    why: 'One great star and seven small ones. Books about the universe.' },
  { category: 'Fiction & Literature', short: 'Fiction', card: '18-TheMoon', num: 'XVIII', name: 'The Moon', cloth: [244, 22, 26],
    why: 'A dreamlike path between two towers under the moon. Novels and stories.' },
  { category: 'Technology & Future', short: 'The future', card: '20-Judgement', num: 'XX', name: 'Judgement', cloth: [186, 32, 30],
    why: 'An angel’s trumpet wakes the world to what comes next. Books on technology and the future.' },
];

export const statusText = {
  reading: 'Reading now',
  next: 'Up next',
  read: 'Read',
  toread: 'On my reading list',
  quit: 'Put down, unfinished',
};
