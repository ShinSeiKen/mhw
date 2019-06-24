# Monster Hunter World Leadboards Concept

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

- Refactoring
    - Extract some variables to separate files in `.eleventy.js`.
- Features:
    - Add some nice Social icons and weapon icons.
    - Additional Monster data (e.g. descriptions from Hunting Log).
    - Additional Location data.
    - Additional (Top) Event Quests (if enough demand).
    - Leaderboards.
    - Foolproof way for people to add runners/runs.
    - Distinguish Tempered, Arch-Tempered, Extreme, Ancient variants.
    - Distinguish between single-player runs and 2P/3P/4P runs.
    - See if we need a separate list of runners:
        - who are known to be good at their weapons ("Weapon Masters").
        - who just happen to have one or two runs with that weapon.
    - Translations of Quests, Weapons, Monsters, Locations (at least go for Japanese).
        - `{{ translations.jp.weapons['great-sword'] }}`
    - Add automatic Edit links.
    - Add comments feature (e.g. Disqus).
    - Add more custom fields for Runs/Runners.
    - In the future, differentiate between MHW and MHWI runs
        - Separate leaderboards
        - Add (community) leagues, such as Utakata Cup
    - Add a specialized Community Events/Leagues page.
    - Quality of Life changes for filtering runs:
        - by weapon
        - multiplayer runs
        - multiple weapons


## Links and Resources

- Many Assets and Resources by [Capcom](http://www.capcom.co.jp/)
    - [Monster Hunter World: Iceborne in Japanese](http://www.capcom.co.jp/monsterhunter/world-iceborne/)
    - [Monster Hunter World: Iceborne in English](https://www.monsterhunter.com/world-iceborne/)
    - [Videos by Capcom on Youtube](https://www.youtube.com/user/CapcomChannel/videos)
    - [Melee Weapon descriptions from Game Manual](http://game.capcom.com/manual/MHW_PC/en/steam/page/8/1)
    - [Ranged Weapon descriptions from Game Manual](http://game.capcom.com/manual/MHW_PC/en/steam/page/9/1)
- Data from [Monster Hunter World Wiki](https://monsterhunterworld.wiki.fextralife.com/)
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
| 9★ The Thronetaker | `tempered-nergigante`, `tempered-lunastra`, `tempered-teostra` |
| 9★ The Heralds of Destruction Cry | `arch-tempered-nergigante` |
| 9★ The Fury of El Dorado | `arch-tempered-kulve-taroth` |
| 9★ Like a Moth to the Flame | `arch-tempered-xeno-jiiva` |
| 9★ Undying Alpenglow | `arch-tempered-zorah-magdaros` Location is officialy `everstream` |
| 9★ When Blue Dust Surpasses Red Lust | `arch-tempered-lunastra` |
| 9★ The Eye of the Storm | `arch-tempered-kushala-daora` |
| 9★ The Scorn of the Sun | `arch-tempered-teostra` |
| 9★ The Deathly Quiet Curtain | `arch-tempered-vaal-hazak` |
| 9★ A Whisper of White Mane | `arch-tempered-kirin` |
| 9★ A Visitor from Eorzea (Extreme) | Extreme Behemoth |
| 9★ Contract: Woodland Spirit | Ancient Leshen |
| 9★ A Nose for an Eye | |
| 9★ Keeper of the Otherworld| |
| 9★ No Tomorrow for Usurpers| |
| 9★ Relish the Moment| |
| 9★ Snow & Cherry Blossoms | |
| 9★ The Greatest Jagras | |
| 9★ The Name's Lavasioth | |





#### Custom

|Quest | Notes |
|:---|:---|
| 9★ Iceborn Entry Exam | bunch of arch tempereds |


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
