# SGportfolio

Srushti G's personal website: a deck of Rider-Waite tarot cards you play through.

The home page is a 3D ring of eight cards floating in morning mist. Drag to spin it, tap a card to turn it over, and step into the room it opens. Nobody needs to know tarot: each card says in plain words what it shows and what is inside.

| Card | Room |
| --- | --- |
| 0 The Fool | About me (`/about`) |
| I The Magician | Work (`/work`) |
| II The High Priestess | Books (`/books`) |
| XVII The Star | Songs (`/songs`) |
| IX The Hermit | Blog (`/blog`) |
| III The Empress | Life outside work (`/otherwise`) |
| X Wheel of Fortune | Surprise me (`/surprise`) |
| XXI The World | Say hello (`/hello`). It turns last, once the other seven are turned. |

Turned cards are remembered in the visitor's browser. The Index menu in the corner links straight to every room for anyone who'd rather not play.

### Living details

- **Toss a card.** Swipe fast across a card and it spins and tumbles through the air, then springs back to its place.
- **Holographic foil.** The gold linework on the card backs shifts through the spectrum as cards turn.
- **The sky follows the clock.** The mist is pale gold at dawn, pearl by day, rose at dusk and deep blue with stars at night, on the visitor's local time. Text switches to moonlight at night. Preview any time of day by adding `?sky=dawn`, `?sky=day`, `?sky=dusk` or `?sky=night` to a URL.
- **Sound** (off by default, the moon icon in the corner): a paper flick when a card turns, a chime when one is collected, a whoosh for a tossed card, page turns, the wheel's ticking, and wind in the mist. Everything is synthesised in the browser, so there are no audio files.
- **A star for a cursor**, trailing sparks, on devices with a mouse.
- **Books you can open.** Pull a book off the shelf and it flies to the table and opens. Drag pages by their edge to turn them, or use the buttons or arrow keys.
- **Work as its own suit.** Each project gets a card face drawn in the Rider-Waite style and a "how it played out" spread of story beats.

## Editing your content

| What | Where |
| --- | --- |
| Name, email, social links | `src/data/site.js` |
| Card names and descriptions | `src/data/deck.js` |
| About me and timeline | `src/pages/about.astro` |
| Projects (one file each) | `src/content/work/*.md` (`tarot` tags a project with a real card, as Balcony Buddies has The Empress; `image` adds a screenshot; `card` sets its card face: `name`, `emblem` = sun, tower, bridge, key, sprout or lantern, `sky` = yellow, blue, grey or dawn; `timeline` lists the story beats) |
| Books | Your **Books** Google Sheet. The site reads it on every build and once a day, so new rows appear on their own. See below. |
| Which tarot card keeps each shelf | `src/data/shelves.js` (new categories get a card automatically) |
| Songs | `src/content/songs.json` (add `link` for a direct Spotify link) |
| Blog posts (one file each) | `src/content/blog/*.md` |
| Life outside work | `src/pages/otherwise.astro` |

Everything shipped now is placeholder content marked to be replaced.

## The bookshelf and the Books sheet

`scripts/sync-books.mjs` runs before every build (`npm run build`, or `npm run sync:books` on its own) and turns the sheet into `src/content/books.json`:

- **Master List** tab: Title, Author, Description, Category, Status.
- **Read** tab: Book Name, Author, and a ✅ (read), 📖 (reading) or 📚 (up next) mark. A row holding only a year marks the books below it as read that year. Add a **Category** column here to shelve books that aren't on the Master List; until then they sit on the "Not yet sorted" shelf.
- Optional columns on either tab: **Note**, **Favourite line**, **Thoughts**.

Shelves are your categories, exactly as written in the sheet. A new category gets its own shelf and the next free tarot card. The sheet must be shared as **Anyone with the link can view**; if it can't be read, the last saved bookshelf is kept and the build carries on. The deploy workflow also runs daily, so sheet edits show up within a day without a push.

## Running it

```sh
npm install
npm run dev       # http://localhost:4321/SGportfolio/
npm run build     # static site in dist/
```

## Publishing

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`. Turn it on once under **Settings → Pages → Source: GitHub Actions**. The site will be at `https://srushtigpm.github.io/SGportfolio/`. For a custom domain, update `site` and remove `base` in `astro.config.mjs`.

## Built with

- [Astro](https://astro.build) for the static site and Markdown content
- [three.js](https://threejs.org) for the 3D deck; the room pages use a small plain-WebGL mist and no three.js
- Card art by Pamela Colman Smith from the 1909 Rider-Waite deck (public domain in the US), from the scans published by [Steve-P.org](https://steve-p.org/cards/RWSa.html) via [mixvlad/TarotCards](https://github.com/mixvlad/TarotCards)
