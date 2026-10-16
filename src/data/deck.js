// The eight cards of the deck, in the order they sit around the ring.
// `path` is the room each card opens; `story` describes what the card shows
// in plain words so nobody needs to know tarot to enjoy it.
export const deck = [
  {
    id: 'fool', file: '00-TheFool', num: '0', name: 'The Fool', inside: 'About me', path: 'about',
    story: 'A traveller steps off a cliff with a small bag and a smile, a dog at their heels. Every story starts with a leap like this one. Here is mine.',
  },
  {
    id: 'magician', file: '01-TheMagician', num: 'I', name: 'The Magician', inside: 'Work', path: 'work',
    story: 'Every tool laid out on the table, one hand pointing up and one pointing down. This is the card for making things real: the work I have built and shipped.',
  },
  {
    id: 'priestess', file: '02-TheHighPriestess', num: 'II', name: 'The High Priestess', inside: 'Books', path: 'books',
    story: 'She sits between two pillars, a scroll half hidden in her lap. Quiet knowing, kept in pages. These are the books that rearranged my head.',
  },
  {
    id: 'star', file: '17-TheStar', num: 'XVII', name: 'The Star', inside: 'Songs on repeat', path: 'songs',
    story: 'She pours water onto the land and into the pool, under one great star and seven small ones. Calm after a storm. The songs I keep coming back to.',
  },
  {
    id: 'hermit', file: '09-TheHermit', num: 'IX', name: 'The Hermit', inside: 'Notes and essays', path: 'blog',
    story: 'An old figure on a snowy peak, holding up a lantern to see a little further. Thinking things through, alone and out loud. This is my writing.',
  },
  {
    id: 'empress', file: '03-TheEmpress', num: 'III', name: 'The Empress', inside: 'Life outside work', path: 'otherwise',
    story: 'Wheat at her feet, a forest behind her, a waterfall nearby. Everything that grows when you leave it room. The rest of my life lives here.',
  },
  {
    id: 'wheel', file: '10-WheelOfFortune', num: 'X', name: 'Wheel of Fortune', inside: 'Surprise me', path: 'surprise',
    story: 'A great wheel that never stops turning, with winged creatures reading in the clouds at each corner. Step inside and it lands you somewhere random on this site.',
  },
  {
    id: 'world', file: '21-TheWorld', num: 'XXI', name: 'The World', inside: 'Say hello', path: 'hello', finale: true,
    story: 'A dancer inside a wreath, the journey complete. You have seen the whole deck. Come and say hello.',
  },
];

export const cardById = Object.fromEntries(deck.map((c) => [c.id, c]));
