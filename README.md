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

## Editing your content

| What | Where |
| --- | --- |
| Name, email, social links | `src/data/site.js` |
| Card names and descriptions | `src/data/deck.js` |
| About me and timeline | `src/pages/about.astro` |
| Projects (one file each) | `src/content/work/*.md` |
| Books | `src/content/books.json` (`status`: `read`, `reading` or `quit`) |
| Songs | `src/content/songs.json` (add `link` for a direct Spotify link) |
| Blog posts (one file each) | `src/content/blog/*.md` |
| Life outside work | `src/pages/otherwise.astro` |

Everything shipped now is placeholder content marked to be replaced.

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
- Card art by Pamela Colman Smith from the 1909 Rider-Waite deck (public domain in the US)
