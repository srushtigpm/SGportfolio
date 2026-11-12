// Pull the bookshelf straight from the "Books" Google Sheet before every build.
//
// Reads two tabs:
//   Master List: Title, Author, Description, Category, Status
//   Read:        Book Name, Author, a ✅ / 📖 / 📚 mark, and optional Category / Description columns.
//                A row holding only a year (e.g. "2025") marks the books below it as read that year.
// Optional columns on either tab, matched by header name: Note, Favourite line (or Quote), Thoughts.
//
// Categories come only from the sheet, exactly as written. A book with no category goes on the
// "Not yet sorted" shelf. New categories get a tarot card automatically (see src/data/shelves.js).
//
// If the sheet can't be reached (offline, or not shared), the last saved src/content/books.json is kept.
// The sheet must be shared as "Anyone with the link can view".
//
// Usage: node scripts/sync-books.mjs            fetch from Google Sheets
//        node scripts/sync-books.mjs --dir path  read "Master List.csv" and "Read.csv" from a folder (for testing)
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const SHEET_ID = process.env.BOOKS_SHEET_ID || '1Lptv_tgfFHgb7oiYSBLTaRdlCF7XHIjRuC55K4CN8TI';
const OUT = fileURLToPath(new URL('../src/content/books.json', import.meta.url));
const EXTRAS = fileURLToPath(new URL('../src/data/book-extras.json', import.meta.url));
export const UNSORTED = 'Not yet sorted';

// ---------- CSV ----------
export function parseCSV(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.map((r) => r.map((c) => c.trim()));
}

async function loadTab(name, dir) {
  if (dir) return readFile(`${dir}/${name}.csv`, 'utf8');
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(name)}`;
  const res = await fetch(url, { redirect: 'follow' });
  const text = await res.text();
  if (!res.ok || /^\s*<(!doctype|html)/i.test(text)) throw new Error(`could not read the "${name}" tab (HTTP ${res.status}). Is the sheet shared as "Anyone with the link can view"?`);
  return text;
}

// ---------- Helpers ----------
const clean = (s = '') => s.replace(/\s+/g, ' ').trim();
const key = (s = '') => clean(s).toLowerCase().replace(/[’']/g, '');
const slug = (s) => key(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const blank = (s) => !s || s === '—' || s === '-';
function statusFrom(v = '') {
  if (v.includes('✅') || /^(read|done|finished)$/i.test(v)) return 'read';
  if (v.includes('📖') || /reading/i.test(v)) return 'reading';
  if (v.includes('📚') || /next|pile/i.test(v)) return 'next';
  if (/quit|dnf|abandon/i.test(v)) return 'quit';
  return null;
}
// find a column by its header; returns -1 when the tab doesn't have it
const col = (header, ...patterns) => header.findIndex((h) => patterns.some((p) => p.test(h)));

function readTab(rows, { titleRe }) {
  const header = rows[0].map((h) => h.toLowerCase());
  const c = {
    title: col(header, titleRe), author: col(header, /author/), about: col(header, /description|summary|about/),
    category: col(header, /categor|genre|shelf/), status: col(header, /status/), note: col(header, /^note|my note/),
    line: col(header, /line|quote/), thoughts: col(header, /thought/),
  };
  if (c.title < 0) c.title = 0;
  if (c.author < 0) c.author = 1;
  return { rows: rows.slice(1), c };
}

export function buildBooks(masterCSV, readCSV, extras = {}) {
  const books = new Map();
  const get = (row, i) => (i >= 0 ? clean(row[i] ?? '') : '');

  // Master List: the reading list, with your categories and descriptions
  const M = readTab(parseCSV(masterCSV), { titleRe: /title|book/ });
  for (const row of M.rows) {
    const title = get(row, M.c.title);
    if (!title) continue;
    books.set(key(title), {
      title, author: get(row, M.c.author), category: get(row, M.c.category), about: get(row, M.c.about),
      note: get(row, M.c.note), line: get(row, M.c.line), thoughts: get(row, M.c.thoughts),
      status: statusFrom(get(row, M.c.status)) ?? 'toread',
    });
  }

  // Read tab: what you've read, are reading, and have lined up next
  const R = readTab(parseCSV(readCSV), { titleRe: /book|title/ });
  let year = '';
  for (const row of R.rows) {
    const title = get(row, R.c.title);
    if (!title) continue;
    if (/^\d{4}$/.test(title) && row.slice(1).every((v) => !clean(v))) { year = title; continue; }
    const mark = row.map((v) => statusFrom(v)).find(Boolean) ?? 'read';
    const b = books.get(key(title)) ?? { title, author: get(row, R.c.author), category: '', about: '', note: '', line: '', thoughts: '' };
    b.status = mark;
    if (mark === 'read' && year) b.year = year;
    for (const f of ['category', 'about', 'note', 'line', 'thoughts']) { const v = get(row, R.c[f]); if (v) b[f] = v; }
    books.set(key(title), b);
  }

  // Fill gaps (never categories) from src/data/book-extras.json, then tidy up
  return [...books.values()].map((b) => {
    const x = extras[key(b.title)] ?? {};
    const out = { id: slug(b.title), title: b.title, author: blank(b.author) ? (x.author ?? '') : b.author, category: b.category || UNSORTED, status: b.status };
    for (const f of ['about', 'note', 'line', 'thoughts']) { const v = b[f] || x[f]; if (v) out[f] = v; }
    if (b.year) out.year = b.year;
    return out;
  }).filter((b, i, all) => all.findIndex((o) => o.id === b.id) === i);
}

// ---------- Run ----------
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dirFlag = process.argv.indexOf('--dir'), dir = dirFlag > 0 ? process.argv[dirFlag + 1] : null;
  try {
    const extras = JSON.parse(await readFile(EXTRAS, 'utf8').catch(() => '{}'));
    const [master, read] = await Promise.all([loadTab('Master List', dir), loadTab('Read', dir)]);
    const books = buildBooks(master, read, extras);
    if (books.length === 0) throw new Error('the sheet came back empty');
    await writeFile(OUT, JSON.stringify(books, null, 2) + '\n');
    const cats = new Set(books.map((b) => b.category));
    console.log(`[books] synced ${books.length} books on ${cats.size} shelves from the sheet`);
  } catch (e) {
    console.warn(`[books] kept the last saved bookshelf: ${e.message}`);
  }
}
