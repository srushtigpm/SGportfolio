// Every shelf on the bookcase is one of your categories from the Books sheet, named exactly as you wrote it.
// Each shelf has a tarot card propped at its end as a bookend.
//
// The categories you have today are paired with a card below. A category added to the sheet later gets
// the next unused card automatically, so nothing here needs editing; add a line to `chosen` to pick one yourself.

// Books with no category in the sheet (keep in step with scripts/sync-books.mjs)
export const UNSORTED = 'Not yet sorted';

// All 22 Major Arcana, with what each picture shows in plain words
export const majors = {
  '00-TheFool': { num: '0', name: 'The Fool', shows: 'A traveller at the start of a long road.' },
  '01-TheMagician': { num: 'I', name: 'The Magician', shows: 'Every tool laid out on the table, ready to use.' },
  '02-TheHighPriestess': { num: 'II', name: 'The High Priestess', shows: 'She guards what lies beneath the surface.' },
  '03-TheEmpress': { num: 'III', name: 'The Empress', shows: 'A garden that grows because she tends it.' },
  '04-TheEmperor': { num: 'IV', name: 'The Emperor', shows: 'A king on a stone throne at the head of an empire.' },
  '05-TheHierophant': { num: 'V', name: 'The Hierophant', shows: 'A teacher handing down sacred traditions.' },
  '06-TheLovers': { num: 'VI', name: 'The Lovers', shows: 'Two people drawn together under an angel.' },
  '07-TheChariot': { num: 'VII', name: 'The Chariot', shows: 'A driver steering two sphinxes by will alone.' },
  '08-Strength': { num: 'VIII', name: 'Strength', shows: 'A woman calmly closing a lion’s jaws.' },
  '09-TheHermit': { num: 'IX', name: 'The Hermit', shows: 'An old figure holding up a lantern.' },
  '10-WheelOfFortune': { num: 'X', name: 'Wheel of Fortune', shows: 'The great wheel of cycles and chance.' },
  '11-Justice': { num: 'XI', name: 'Justice', shows: 'Scales in one hand, a sword in the other.' },
  '12-TheHangedMan': { num: 'XII', name: 'The Hanged Man', shows: 'A calm figure seeing the world upside down.' },
  '13-Death': { num: 'XIII', name: 'Death', shows: 'One chapter ending so another can begin.' },
  '14-Temperance': { num: 'XIV', name: 'Temperance', shows: 'An angel patiently mixing water between two cups.' },
  '15-TheDevil': { num: 'XV', name: 'The Devil', shows: 'Two figures held by chains they could slip off.' },
  '16-TheTower': { num: 'XVI', name: 'The Tower', shows: 'A tower struck by lightning: sudden change.' },
  '17-TheStar': { num: 'XVII', name: 'The Star', shows: 'One great star and seven small ones over still water.' },
  '18-TheMoon': { num: 'XVIII', name: 'The Moon', shows: 'A dreamlike path between two towers under the moon.' },
  '19-TheSun': { num: 'XIX', name: 'The Sun', shows: 'A child riding out under a bright sun.' },
  '20-Judgement': { num: 'XX', name: 'Judgement', shows: 'An angel’s trumpet waking the world to what comes next.' },
  '21-TheWorld': { num: 'XXI', name: 'The World', shows: 'A dancer inside a wreath, the journey complete.' },
};

// The card chosen for each of your categories
const chosen = {
  'Memoir & Biography': '00-TheFool',
  'Psychology': '02-TheHighPriestess',
  'Creativity & Art': '03-TheEmpress',
  'Business & Entrepreneurship': '04-TheEmperor',
  'Spirituality & Religion': '05-TheHierophant',
  'Marketing & Persuasion': '06-TheLovers',
  'Leadership & Management': '07-TheChariot',
  'Mindset & Self-Help': '08-Strength',
  'Philosophy': '09-TheHermit',
  'Investing & Finance': '10-WheelOfFortune',
  'Math & Logic': '11-Justice',
  'Science & Cosmology': '17-TheStar',
  'Fiction & Literature': '18-TheMoon',
  'Technology & Future': '20-Judgement',
  'Not yet sorted': '14-Temperance',
};

// Cards for categories added later, in the order they'll be used
const spare = ['19-TheSun', '01-TheMagician', '12-TheHangedMan', '16-TheTower', '21-TheWorld', '13-Death', '15-TheDevil'];

const hash = (s) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

/** Shelves for the given categories, in the order given (the sheet's order). */
export function shelvesFor(categories) {
  const used = new Set(categories.map((c) => chosen[c]).filter(Boolean));
  const free = spare.filter((c) => !used.has(c));
  let next = 0;
  return categories.map((category) => {
    const card = chosen[category] ?? free[next++ % Math.max(1, free.length)] ?? '21-TheWorld';
    const h = hash(category);
    // a cloth colour family for the spines on this shelf: [hue, saturation %, lightness %]
    return { category, card, ...majors[card], cloth: [h % 360, 22 + (h >>> 9) % 22, 26 + (h >>> 4) % 12] };
  });
}

export const statusText = {
  reading: 'Reading now',
  next: 'Up next',
  read: 'Read',
  toread: 'On my reading list',
  quit: 'Put down, unfinished',
};
