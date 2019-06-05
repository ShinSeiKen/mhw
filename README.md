# Monster Hunter World Leadboards Concept

This is a concept for shits and giggles. You 'avin' a giggle, mate?

## Getting Started

```
git clone <repo> <folder>
cd <folder>
npm install
```

### Development

```
npm run dev
```

### Production

```
npm run build
```

## TODO

- Extract some variables to separate files in `.eleventy.js`
- Add a Community page with Discords and shit, maybe some Youtube channels to follow
- Add some nice Social icons and weapon icons
- Filtering runs, leaderboards, etc.
- Minify assets
    - Images (resize properly and compress)
- Additional Monster data (e.g. descriptions from Hunting)
- Additional Location data
- Additional (Top) Event Quests
- Leaderboards
- Foolproof way for people to add runs
- Distinguish Tempered, Arch-Tempered, Extreme, Ancient variants
- Distinguish between single-player runs and 2P/3P/4P runs
- See if we need a separate list of runners
    - who are known to be good at their weapons ("Weapon Masters")
    - who just happen to have one or two runs with that weapon
- Translations of Quests, Weapons, Monsters, Locations (at least go for Japanese)
- Add automatic Edit links
- Add special link for Adding new Runners/Runs
- Create Feature Requests/Bugs/Issues/etc.
- Comments??
- Add more custom fields for Runs/Runners
- If there's enough demand, add other quests too.
- In the future, differentiate between MHW and MHWI runs (separate leaderboards too)
- etc.


## Links and Resources

- Many Assets and Resources by [Capcom](http://www.capcom.co.jp/)
- [Monster Hunter World: Iceborne in Japanese](http://www.capcom.co.jp/monsterhunter/world-iceborne/)
- [Monster Hunter World: Iceborne in English](https://www.monsterhunter.com/world-iceborne/)
- [Videos by Capcom on Youtube](https://www.youtube.com/user/CapcomChannel/videos)
- [Melee Weapon descriptions from Game Manual](http://game.capcom.com/manual/MHW_PC/en/steam/page/8/1)
- [Ranged Weapon descriptions from Game Manual](http://game.capcom.com/manual/MHW_PC/en/steam/page/9/1)
- [Parallax Depth Cards by Andy Merskin](https://codepen.io/andymerskin/pen/XNMWvQ)
- [EleventyOne by Phil Hawksworth](https://github.com/philhawksworth/eleventyone)
- Inspired by [GOV.UK](https://www.gov.uk)

## Notes

### Monsters

- Zorah Magdaros
- Lavasioth
- Uragaan
- Azure Rathalos
- Bazelgeuse
- Black Diablos
- Kirin
- Pink Rathian
- Xeno'jiiva

Plus Tempered, Arch-Tempered, Extreme Behemoth and Ancient Leshen.

### Quests

Marking Tempered, Arch-Tempered, Extreme Behemoth and Ancient Leshen Quests.

#### Optional

|Quest | Notes |
|:---|:---|
| 9★ A Summons from Below            | `tempered-vaal-hazak` + `tempered-odogaron` |
| 9★ New World Sky, New World Flower | `tempered-pink-rathian` + `tempered-azure-rathalos` |
| 9★ Showdown: the Muck and the Maul | `tempered-barroth` + `tempered-radobaan` |
| 9★ The Sapphire Star's Guidance    | `tempered-kushala-daora` + `tempered-teostra` + `tempered-nergigante` |

The same?

- Hellfire's Stronghold
- The Fires of Hell Bite Deep

The same?

- The Winds of Wrath Bite Deep
- Master of the Gale


#### Challenge

|Quest | Notes |
|:---|:---|
| 9★ Challenge Quest 1: Expert | Tempered Bazelgeuse + Tempered Uragaan |


#### Event

|Quest | Notes |
|:---|:---|
| 9★ The Heralds of Destruction Cry | `arch-tempered-nergigante` |
| 9★ The Fury of El Dorado | `arch-tempered-kulve-taroth` |
| 9★ Like a Moth to the Flame | `arch-tempered-xeno-jiiva` |
| 9★ Undying Alpenglow | `arch-tempered-zorah-magdaros` Location is officialy `everstream` |
| 9★ When Blue Dust Surpasses Red Lust | `arch-tempered-lunastra` |
| 9★ The Eye of the Storm | `arch-tempered-kushala-daora` |
| 9★ The Scorn of the Sun | `arch-tempered-teostra` |
| 9★ The Deathly Quiet Curtain | `arch-tempered-vaal-hazak` |
| 9★ A Whisper of White Mane | `arch-tempered-kirin>` |
| 9★ A Visitor from Eorzea (Extreme) | Extreme Behemoth |
| 9★ Contract: Woodland Spirit | Ancient Leshen |

Missing a bunch like Greatest Jagras, Thronetaker, etc.


## Removed from `monsters.json`

```
"tempered-deviljho",
"arch-tempered-kirin",
"arch-tempered-vaal-hazak",
"arch-tempered-teostra",
"arch-tempered-kushala-daora",
"arch-tempered-zorah-magdaros",
"arch-tempered-xeno-jiiva",
"arch-tempered-kulve-taroth",
"arch-tempered-lunastra",
"arch-tempered-nergigante",
"extreme-behemoth",
"ancient-leshen",
```
