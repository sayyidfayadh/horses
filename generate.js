// Generated horses for the accepted-horses feed. Each one is derived from its
// Horse_Id through a seeded PRNG, so id 37 is the same horse on every request
// and after every restart — the backend upserts by Horse_Id, and a horse that
// changed between syncs would read as an edit nobody made.

// The race numbers db.json already uses; a generated horse joins one of them.
const RACES = [
  'Longines Dubai Sheema Classic',
  'Dubai World Cup',
  'Dubai Turf',
  'Godolphin Mile',
  'UAE Derby',
  'Al Quoz Sprint',
  'Dubai Gold Cup',
  'Dubai Golden Shaheen',
  'Dubai Kahayla Classic',
];

// Japan, Hong Kong and UAE are listed twice so they come up most often.
const COUNTRIES = [
  { name: 'Japan', code: 'JPN', phone: '+81312345' },
  { name: 'Japan', code: 'JPN', phone: '+81312345' },
  { name: 'Hong Kong', code: 'HK', phone: '+8522345' },
  { name: 'Hong Kong', code: 'HK', phone: '+8522345' },
  { name: 'UAE', code: 'UAE', phone: '+97143222' },
  { name: 'UAE', code: 'UAE', phone: '+97143222' },
  { name: 'Ireland', code: 'IRE', phone: '+35312345' },
  { name: 'Great Britain', code: 'GB', phone: '+4420712345' },
  { name: 'United States', code: 'USA', phone: '+121212345' },
  { name: 'France', code: 'FR', phone: '+3314512345' },
  { name: 'Australia', code: 'AUS', phone: '+6129123' },
];

// The only countries whose horses may be submitted by an agent.
const AGENT_COUNTRIES = new Set(['Japan', 'Hong Kong']);

const FIRST = ['Desert', 'Golden', 'Silver', 'Royal', 'Midnight', 'Storm', 'Crimson', 'Northern', 'Sakura', 'Jade', 'Falcon', 'Ocean', 'Thunder', 'Velvet', 'Iron', 'Lucky', 'Noble', 'Wild', 'Shadow', 'Amber'];
const SECOND = ['Emperor', 'Mirage', 'Runner', 'Spirit', 'Dancer', 'Warrior', 'Legend', 'Arrow', 'Crown', 'Comet', 'Breeze', 'Prince', 'Queen', 'Flame', 'Star', 'Glory', 'Quest', 'Echo', 'Dream', 'Blaze'];
const TRAINERS = ['Yoshito Yahagi', 'Hideaki Fujiwara', 'Mitsuru Hashida', 'Francis Lui', 'Danny Shum', 'John Size', 'Salem bin Ghadayer', 'Bhupat Seemar', 'Doug Watson', 'Charlie Appleby', 'Aidan O’Brien', 'Bob Baffert', 'Andre Fabre', 'Chris Waller'];
const OWNERS = ['Sunday Racing', 'Nagoya Bloodstock', 'Stanley Chan', 'Peter Lau', 'Zabeel Racing', 'Al Rashid Stables', 'Godolphin', 'Coolmore', 'Juddmonte', 'Yulong Investments'];
const AGENTS = ['Katsumi Yoshida', 'Ryo Nakamura', 'Asia Racing Agency', 'Gulf Bloodstock', 'Blandford Bloodstock', 'BSW Bloodstock'];
const GENDERS = ['Colt', 'Filly', 'Mare', 'Gelding', 'Stallion'];
const COLOURS = ['Bay', 'Grey', 'Chestnut', 'Dark Bay', 'Db/Br', 'Black'];

// mulberry32 — small, fast and good enough to vary sample data.
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');

const generateHorse = (id) => {
  const r = rng(id * 2654435761);
  const pick = (list) => list[Math.floor(r() * list.length)];

  const country = pick(COUNTRIES);
  const raceIndex = Math.floor(r() * RACES.length);
  const race = RACES[raceIndex];
  const trainer = pick(TRAINERS);
  // Only Japanese and Hong Kong horses come in through an agent; every other
  // country is submitted by its trainer.
  const by = r() >= 0.5 && AGENT_COUNTRIES.has(country.name) ? 'Agent' : 'Trainer';
  const nominee = by === 'Agent' ? pick(AGENTS) : '';
  // The id is in the name so two generated horses can never share one.
  const name = `${pick(FIRST)} ${pick(SECOND)} ${id}`;
  // Submitted on some day between 2026-07-01 and 2026-09-28.
  const submitted = new Date(Date.UTC(2026, 6, 1) + Math.floor(r() * 90) * 86400000).toISOString().slice(0, 10);

  const horse = {
    referenceno: `DWC2026/${String(id).padStart(3, '0')}`,
    Trainer_Name: trainer,
    Trainer_Email: `${slug(trainer)}@stables.example`,
    Trainer_Phonenumber: `${country.phone}${String(id).padStart(4, '0')}`,
    CountryLicense: country.name,
    Application_Submittedby: by,
    Nominee_Name: nominee,
    Nominee_Email: nominee ? `${slug(nominee)}@agents.example` : '',
    Travel_status: country.name === 'UAE' ? 'Local' : 'International',
    horsename: `${name} (${country.code})`,
    Horse_Id: String(id),
    Yearofbirth: String(2015 + Math.floor(r() * 7)),
    Gender: pick(GENDERS),
    color: pick(COLOURS),
    horsecountry: country.name,
    country_code: country.code,
    Rating: String(100 + Math.floor(r() * 26)),
    ERA_Rating: '0',
    horsestatus: '1',
    Horse_Status_Label: 'Invite',
    Invitation_Status: '2',
    Invitation_Status_Label: 'Accepted',
    owner: pick(OWNERS),
    shippingcountry: country.name,
    Race_No: String(raceIndex + 1),
    Race_Name: race,
    Race: `race-${raceIndex + 1}-dwc2627-${race}`,
    Dwc_priority: String(1 + Math.floor(r() * 3)),
    Created_at: `${submitted} 08:26:04`,
    submissiondate: submitted,
  };

  // Half of agent-submitted horses have no trainer on file. Drawn last so it
  // leaves every other field of an existing id unchanged.
  if (by === 'Agent' && r() < 0.5) {
    horse.Trainer_Name = '';
    horse.Trainer_Email = '';
    horse.Trainer_Phonenumber = '';
  }

  return horse;
};

module.exports = { generateHorse };
