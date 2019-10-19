const { DateTime } = require("luxon");

module.exports = function(config) {

    // let env = process.env.ELEVENTY_ENV

    /**
     * Every runner slug lookup needs to be converted from halfwidth to fullwidth
     * characters. Otherwise they can not be matched. H-how troublesome!
     *
     * See: `src/site/_data/troublesomeSlugs.json`
     * See: `src/site/_includes/templates/runner.njk`
     * See: `src/site/pages/runners.njk`
     */
    const troublesomeSlugs = require('./src/site/_data/troublesomeSlugs.json');
    const labels           = require('./src/site/_data/labels.json');


    // --------------------------------------------------------------------------------
    // Layouts
    // --------------------------------------------------------------------------------

    config.addLayoutAlias('news'        , 'templates/news.njk');
    config.addLayoutAlias('monster'     , 'templates/monster.njk');
    config.addLayoutAlias('location'    , 'templates/location.njk');
    config.addLayoutAlias('weapon'      , 'templates/weapon.njk');
    config.addLayoutAlias('quest'       , 'templates/quest.njk');
    config.addLayoutAlias('run'         , 'templates/run.njk');
    config.addLayoutAlias('runner'      , 'templates/runner.njk');
    config.addLayoutAlias('leaderboard' , 'templates/leaderboard.njk');


    // --------------------------------------------------------------------------------
    // Collections -- General
    // --------------------------------------------------------------------------------

    let byTitleAlphabetically = (a, b) => {
        let valueA = a.data.title.toLowerCase();
        let valueB = b.data.title.toLowerCase();
        return valueA.localeCompare(valueB);
    };

    let byTimeAscending = (a, b) => {
        let valueA = a.data.time;
        let valueB = b.data.time;
        return valueA.localeCompare(valueB);
    };

    /**
     * Potential bug: Using a Glob with `**` breaks when using sub-directories.
     *                Without it, `monsters/*.md` was sufficient.
     */

    // Define collections
    config.addCollection("monsters"  , collection => collection.getFilteredByGlob("src/site/monsters/*.md"));
    config.addCollection("locations" , collection => collection.getFilteredByGlob("src/site/locations/*.md"));
    config.addCollection("weapons"   , collection => collection.getFilteredByGlob("src/site/weapons/*.md"));
    config.addCollection("quests"    , collection => collection.getFilteredByGlob("src/site/quests/**/*.md").sort(byTitleAlphabetically));
    config.addCollection("runs"      , collection => collection.getFilteredByGlob("src/site/runs/**/*.md").reverse());
    config.addCollection("runners"   , collection => collection.getFilteredByGlob("src/site/runners/*.md").sort(byTitleAlphabetically));

    // Define sub-collections for quests
    config.addCollection("quests__arena"     , collection => collection.getFilteredByGlob("src/site/quests/arena-quest/*.md").sort(byTitleAlphabetically));
    config.addCollection("quests__challenge" , collection => collection.getFilteredByGlob("src/site/quests/challenge-quest/*.md").sort(byTitleAlphabetically));
    config.addCollection("quests__event"     , collection => collection.getFilteredByGlob("src/site/quests/event-quest/*.md").sort(byTitleAlphabetically));
    config.addCollection("quests__optional"  , collection => collection.getFilteredByGlob("src/site/quests/optional-quest/*.md").sort(byTitleAlphabetically));
    config.addCollection("quests__custom"    , collection => collection.getFilteredByGlob("src/site/quests/custom-quest/*.md").sort(byTitleAlphabetically));

    // Define a lookup table for accessing content via type and (unique) slugs
    config.addCollection("lookup", collection => {
        let lookup = [];

		collection.getAll().forEach(item => {
            let type = item.data.type;
            let slug = item.fileSlug;

            if (! lookup[type]) {
                lookup[type] = [];
            }

            if (type == 'runner') {
                // console.log(slug);
            }

            // troublesome
            if (troublesomeSlugs[ slug ]) {
                slug = troublesomeSlugs[ slug ];
            }

            lookup[type][slug] = item;
        });

		return lookup;
	});

    // --------------------------------------------------------------------------------
    // Collections -- Quests
    // --------------------------------------------------------------------------------

    config.addCollection("quests__by_location", collection => {
        let result = [];
        collection.getAll().forEach(item => {
            if (item.data.type == 'quest') {
                let location = item.data.location;
                if (! result[location]) {
                    result[location] = [];
                }
                result[location].push(item);
            }
        });

        Object.keys(result).forEach(key =>{
            result[key].sort(byTitleAlphabetically);
        });

        return result;
    });

    config.addCollection("quests__by_monster", collection => {
        let result = [];
        collection.getAll().forEach(item => {
            if (item.data.type == 'quest') {
                item.data.monsters.forEach(monster => {
                    if (! result[monster]) {
                        result[monster] = [];
                    }
                    result[monster].push(item);
                });
            }
        });

        Object.keys(result).forEach(key => {
            result[key].sort(byTitleAlphabetically);
        });

        return result;
    });

    // --------------------------------------------------------------------------------
    // Collections -- Locations <-> Quest <-> Monster
    // --------------------------------------------------------------------------------

    config.addCollection("locations__by_monster", collection => {
        let result    = [];
        let monsters  = [];
        let locations = [];

        collection.getAll().forEach(item => {
            if (item.data.type == 'quest') {
                item.data.monsters.forEach(monster => {
                    if (! monsters[monster]) {
                        monsters[monster] = new Set();
                    }
                    monsters[monster].add(item.data.location);
                });
            }
            else if (item.data.type == 'location') {
                locations[item.fileSlug] = item;
            }
        });

        Object.keys(monsters).forEach(slug => {
            let locationSlugs = monsters[slug];
            result[slug] = [...locationSlugs].map(locationSlug => locations[locationSlug]);
        });

        return result;
    });

    config.addCollection("monsters__by_location", collection => {
        let result    = [];
        let monsters  = [];
        let locations = [];

        collection.getAll().forEach(item => {
            if (item.data.type == 'quest') {
                if (! locations[item.data.location]) {
                    locations[item.data.location] = new Set();
                }
                item.data.monsters.forEach(monsterSlug => locations[item.data.location].add(monsterSlug))

            }
            else if (item.data.type == 'monster') {
                monsters[item.fileSlug] = item;
            }
        });

        Object.keys(locations).forEach(slug => {
            let monsterSlugs = locations[slug];
            result[slug] = [...monsterSlugs].map(monsterSlug => monsters[monsterSlug]);
        });

        return result;
    });

    // --------------------------------------------------------------------------------
    // Collections -- Runs
    //
    // Runs filtered by weapons, runners and monsters are only counted if there is
    // strictly one option. So multiplayer runs, runs with multiple weapons or weapon
    // switching, and multi-monster quests will not be featured on their specific pages.
    //
    // [2019-06-02] Allowing multiplayer runs to show up on runners' pages
    //              `runs__by_weapon` and `runs__by_monster` feel a bit out of place
    //              as of now, so they are not used at the moment.
    // --------------------------------------------------------------------------------

    config.addCollection("runs__by_weapon", collection => {
        let result = [];
        collection.getAll().forEach(item => {
            if (item.data.type == 'run' && item.data.weapons.length == 1) {
                let weapon = item.data.weapons[0];
                if (! result[weapon]) {
                    result[weapon] = [];
                }
                result[weapon].push(item);
            }
        });
        return result;
    });

    config.addCollection("runs__by_runner", collection => {
        let result = [];
        collection.getAll().forEach(item => {
            if (item.data.type == 'run'/* && item.data.runners.length == 1*/) {
                item.data.runners.forEach(runner => {
                    if (! result[runner]) {
                        result[runner] = [];
                    }
                    result[runner].push(item);
                });
            }
        });

        // Sort by quest on runner's page
        for (let runner in result) {
            let runs = result[runner];
            runs.sort((a,b) => {
                let valueA = a.data.runners.length;
                let valueB = b.data.runners.length;
                let compare = valueA - valueB;

                if (compare == 0) {
                    valueA = a.data.quest;
                    valueB = b.data.quest;
                    compare = valueA.localeCompare(valueB);
                }
                if (compare == 0) {
                    valueA = a.data.weapons[0];
                    valueB = b.data.weapons[0];
                    compare = valueA.localeCompare(valueB);
                }
                if (compare == 0) {
                    valueA = a.data.time;
                    valueB = b.data.time;
                    compare = valueA.localeCompare(valueB);
                }
                return compare;
            });
        }

        return result;
    });

    config.addCollection("runs__by_quest", collection => {
        let result = [];
        collection.getAll().forEach(item => {
            if (item.data.type == 'run') {
                let quest = item.data.quest;
                if (! result[quest]) {
                    result[quest] = [];
                }
                result[quest].push(item);
            }
        });
        return result.sort(byTimeAscending);
    });

    config.addCollection("runs__by_monster", collection => {
        let result = [];
        collection.getAll().forEach(item => {
            // TODO: run -> quest -> monster
            if (item.data.type == 'run' && item.data.monsters.length == 1) {
                let monster = item.data.monsters[0];
                if (! result[monster]) {
                    result[monster] = [];
                }
                result[monster].push(item);
            }
        });
        return result;
    });

    // --------------------------------------------------------------------------------
    // Runners
    // --------------------------------------------------------------------------------

    config.addCollection("runners__by_country", collection => {
        let result = [];
        collection.getAll().forEach(item => {
            if (item.data.type == 'runner' && item.data.country) {
                if (! result[item.data.country]) {
                    result[item.data.country] = [];
                }
                result[item.data.country].push(item);
            }
        });
        return result;
    });

    // Theoretically, we could derive runners' weapons preferences
    // by looking at the weapons they use in their (best) speedruns.
    config.addCollection("runners__by_weapon", collection => {
        let result = [];
        collection.getAll().forEach(item => {
            if (item.data.type == 'runner') {
                item.data.weapons.forEach(weapon => {
                    if (! result[weapon]) {
                        result[weapon] = [];
                    }
                    result[weapon].push(item);
                });
            }
        });
        return result.sort(byTitleAlphabetically);
    });

    // --------------------------------------------------------------------------------
    // Collections: Leaderboards
    // --------------------------------------------------------------------------------

    let top_3_runs    = [];
    let top_3_runs_ta = [];

    /**
     * Track single-player leaderboards only!
     */
    config.addCollection('xxx', collection => {
        let all = collection.getAll();

        // ARCH-TEMPERED LEADERBOARDS!
        let archTemperedLeague = [
            '9★-a-whisper-of-white-mane',
            '9★-the-deathly-quiet-curtain',
            '9★-like-a-moth-to-the-flame',
            '9★-the-eye-of-the-storm',
            '9★-the-heralds-of-destruction-cry',
            '9★-the-scorn-of-the-sun',
            // '9★-undying-alpenglow',
            '9★-when-blue-dust-surpasses-red-lust'

            ,'9★-a-visitor-from-eorzea'
            ,'9★-a-visitor-from-eorzea-extreme'
        ];

        // lookup
        let runners = [];
        let runs    = [];
        let quests  = [];
        let weapons = [];

        // leaderboard data
        let top_runs__by_quest = [];
        let top_runs__by_weapon__by_quest  = [];
        let top_runs__by_runner__by_weapon = [];
        let top_runs__by_runner = [];
        let top_runners = [];
        let top_runners_flat = [];

        all.forEach(item => {

            // (1) Collect all items for lookup first
            switch (item.data.type) {
                case 'runner':
                    slug = item.fileSlug
                    // troublesome
                    if (troublesomeSlugs[ slug ]) {
                        slug = troublesomeSlugs[ slug ];
                    }
                    runners[slug] = item;
                    break;
                case 'run':
                    // Only count runs that have one runner, and a single weapon
                    if (item.data.runners.length == 1 && item.data.weapons.length == 1) {
                        // NOTE: FILESLUG IS NOT UNIQUE
                        if (archTemperedLeague.includes(item.data.quest)) {
                            runs.push(item);
                        }
                    }
                    break;
                case 'quest':
                    /*
                    // todo: don't count all quests, or do we?
                    if (item.data.track_for_leaderboards == 1) {
                        quests[item.fileSlug] = item;
                    }
                    //*/
                    if (archTemperedLeague.includes(item.fileSlug)) {
                        quests[item.fileSlug] = item;
                    }
                    break;
                case 'weapon':
                    weapons[item.fileSlug] = item;
                    break;
            }

        });

        // (2) Prepare relationships between runs and quests
        runs.forEach(item => {
            let quest = item.data.quest;
            // Check if the quest the run belongs to is eligible
            if (quests[quest]) {
                if (! top_runs__by_quest[quest]) {
                    top_runs__by_quest[quest] = [];
                }
                top_runs__by_quest[quest].push(item);
            }
        });

        // (3) Group runs per weapon per quest
        Object.keys(top_runs__by_quest).forEach(questSlug => {
            let runs = top_runs__by_quest[questSlug].sort(byTimeAscending);
            top_runs__by_weapon__by_quest[questSlug] = [];

            runs.forEach(run => {
                let weaponSlug = run.data.weapons[0];
                if (! top_runs__by_weapon__by_quest[questSlug][weaponSlug]) {
                    top_runs__by_weapon__by_quest[questSlug][weaponSlug] = [];
                }
                top_runs__by_weapon__by_quest[questSlug][weaponSlug].push(run);
            });
        });

        // AAA top_runs__by_weapon__by_quest

        // (4) Group ranked runs (trophies) per runner per weapon
        Object.keys(top_runs__by_weapon__by_quest).forEach(questSlug => {
            let weapons = top_runs__by_weapon__by_quest[questSlug];
            let weaponRunnerLookup = [];

            Object.keys(weapons).forEach(weaponSlug => {
                let runs = weapons[weaponSlug];
                weaponRunnerLookup[weaponSlug] = new Set();

                if (! top_runs__by_runner__by_weapon[weaponSlug]) {
                    top_runs__by_runner__by_weapon[weaponSlug] = [];
                }

                let rank = 1;
                runs.forEach((run) => {
                    let runner = run.data.runners[0];

                    if (! top_runs__by_runner__by_weapon[weaponSlug][runner]) {
                        top_runs__by_runner__by_weapon[weaponSlug][runner] = []
                    }

                    // A person should not hold multiple trophies within the
                    // the same category, that is, only the best run is counted.
                    // Using `weaponRunnerLookup` for checking duplicates.

                    if (! weaponRunnerLookup[weaponSlug].has(runner)) {
                        top_runs__by_runner__by_weapon[weaponSlug][runner].push({
                            // This is a trophy
                            rank: rank,
                            run: run,
                            quest: quests[questSlug]
                        });
                        weaponRunnerLookup[weaponSlug].add(runner);
                        rank++;
                    }
                })
            });
        });

        // BBB: top_runs__by_runner__by_weapon

        // (5) Group ranked runs (trophies) per runner
        Object.keys(top_runs__by_runner__by_weapon).forEach(weaponSlug => {
            let runners = top_runs__by_runner__by_weapon[weaponSlug];

            Object.keys(runners).forEach(runnerSlug => {
                let trophies = runners[runnerSlug];
                trophies.forEach(trophy => {
                    if (! top_runs__by_runner[runnerSlug]) {
                        top_runs__by_runner[runnerSlug] = [];
                    }
                    top_runs__by_runner[runnerSlug].push(trophy);
                });
            });
        });

        // CCC: top_runs__by_runner

        // (6) Calculate overall score
        // For now, count the number of gold trophies
        Object.keys(top_runs__by_runner).forEach(runnerSlug => {
            let trophies = top_runs__by_runner[runnerSlug];
            let gold   = 0;
            let silver = 0;
            let bronze = 0;

            trophies.forEach(trophy => {
                switch (trophy.rank) {
                    case 1:
                        gold++;
                        break;
                    case 2:
                        silver++;
                        break;
                    case 3:
                        bronze++;
                        break;
                }
            });

            top_runners[runnerSlug] = [];
            top_runners[runnerSlug].push({
                gold: gold,
                silver: silver,
                bronze: bronze,
                trophies: trophies
            });
            top_runners_flat.push({
                runner: runners[runnerSlug],
                gold: gold,
                silver: silver,
                bronze: bronze,
                trophies: trophies
            });
        });

        // DDD: top_runners // doesn't work when looping in templates
        // DDD: top_runners_flat

        return top_runners_flat.sort((a, b) => {
            if (a.gold === b.gold && a.silver === b.silver && a.bronze === b.bronze) {
                return 0;
            }
            if (a.gold === b.gold && a.silver === b.silver) {
                return b.bronze - a.bronze;
            }
            if (a.gold === b.gold) {
                return b.silver - a.silver;
            }
            return b.gold - a.gold;
        });
    });

    /**
     * Track single-player leaderboards only "TA Wiki Rules"
     */
    config.addCollection('xxxta', collection => {
        let all = collection.getAll();

        // ARCH-TEMPERED LEADERBOARDS!
        let archTemperedLeague = [
            '9★-a-whisper-of-white-mane',
            '9★-the-deathly-quiet-curtain',
            '9★-like-a-moth-to-the-flame',
            '9★-the-eye-of-the-storm',
            '9★-the-heralds-of-destruction-cry',
            '9★-the-scorn-of-the-sun',
            // '9★-undying-alpenglow',
            '9★-when-blue-dust-surpasses-red-lust'

            ,'9★-a-visitor-from-eorzea'
            ,'9★-a-visitor-from-eorzea-extreme'
        ];

        // lookup
        let runners = [];
        let runs    = [];
        let quests  = [];
        let weapons = [];

        // leaderboard data
        let top_runs__by_quest = [];
        let top_runs__by_weapon__by_quest  = [];
        let top_runs__by_runner__by_weapon = [];
        let top_runs__by_runner = [];
        let top_runners = [];
        let top_runners_flat = [];

        all.forEach(item => {

            // (1) Collect all items for lookup first
            switch (item.data.type) {
                case 'runner':
                    slug = item.fileSlug
                    // troublesome
                    if (troublesomeSlugs[ slug ]) {
                        slug = troublesomeSlugs[ slug ];
                    }
                    runners[slug] = item;
                    break;
                case 'run':
                    // Only count runs that have one runner, and a single weapon
                    if (item.data.runners.length == 1 && item.data.weapons.length == 1 && item.data.run_type == 'ta-wiki-rules') {
                        // NOTE: FILESLUG IS NOT UNIQUE
                        if (archTemperedLeague.includes(item.data.quest)) {
                            runs.push(item);
                        }
                    }
                    break;
                case 'quest':
                    /*
                    // todo: don't count all quests, or do we?
                    if (item.data.track_for_leaderboards == 1) {
                        quests[item.fileSlug] = item;
                    }
                    //*/
                    if (archTemperedLeague.includes(item.fileSlug)) {
                        quests[item.fileSlug] = item;
                    }
                    break;
                case 'weapon':
                    weapons[item.fileSlug] = item;
                    break;
            }

        });

        // (2) Prepare relationships between runs and quests
        runs.forEach(item => {
            let quest = item.data.quest;
            // Check if the quest the run belongs to is eligible
            if (quests[quest]) {
                if (! top_runs__by_quest[quest]) {
                    top_runs__by_quest[quest] = [];
                }
                top_runs__by_quest[quest].push(item);
            }
        });

        // (3) Group runs per weapon per quest
        Object.keys(top_runs__by_quest).forEach(questSlug => {
            let runs = top_runs__by_quest[questSlug].sort(byTimeAscending);
            top_runs__by_weapon__by_quest[questSlug] = [];

            runs.forEach(run => {
                let weaponSlug = run.data.weapons[0];
                if (! top_runs__by_weapon__by_quest[questSlug][weaponSlug]) {
                    top_runs__by_weapon__by_quest[questSlug][weaponSlug] = [];
                }
                top_runs__by_weapon__by_quest[questSlug][weaponSlug].push(run);
            });
        });

        // AAA top_runs__by_weapon__by_quest

        // (4) Group ranked runs (trophies) per runner per weapon
        Object.keys(top_runs__by_weapon__by_quest).forEach(questSlug => {
            let weapons = top_runs__by_weapon__by_quest[questSlug];
            let weaponRunnerLookup = [];

            Object.keys(weapons).forEach(weaponSlug => {
                let runs = weapons[weaponSlug];
                weaponRunnerLookup[weaponSlug] = new Set();

                if (! top_runs__by_runner__by_weapon[weaponSlug]) {
                    top_runs__by_runner__by_weapon[weaponSlug] = [];
                }

                let rank = 1;
                runs.forEach((run) => {
                    let runner = run.data.runners[0];

                    if (! top_runs__by_runner__by_weapon[weaponSlug][runner]) {
                        top_runs__by_runner__by_weapon[weaponSlug][runner] = []
                    }

                    // A person should not hold multiple trophies within the
                    // the same category, that is, only the best run is counted.
                    // Using `weaponRunnerLookup` for checking duplicates.

                    if (! weaponRunnerLookup[weaponSlug].has(runner)) {
                        top_runs__by_runner__by_weapon[weaponSlug][runner].push({
                            // This is a trophy
                            rank: rank,
                            run: run,
                            quest: quests[questSlug]
                        });
                        weaponRunnerLookup[weaponSlug].add(runner);
                        rank++;
                    }
                })
            });
        });

        // BBB: top_runs__by_runner__by_weapon

        // (5) Group ranked runs (trophies) per runner
        Object.keys(top_runs__by_runner__by_weapon).forEach(weaponSlug => {
            let runners = top_runs__by_runner__by_weapon[weaponSlug];

            Object.keys(runners).forEach(runnerSlug => {
                let trophies = runners[runnerSlug];
                trophies.forEach(trophy => {
                    if (! top_runs__by_runner[runnerSlug]) {
                        top_runs__by_runner[runnerSlug] = [];
                    }
                    top_runs__by_runner[runnerSlug].push(trophy);
                });
            });
        });

        // CCC: top_runs__by_runner

        // (6) Calculate overall score
        // For now, count the number of gold trophies
        Object.keys(top_runs__by_runner).forEach(runnerSlug => {
            let trophies = top_runs__by_runner[runnerSlug];
            let gold   = 0;
            let silver = 0;
            let bronze = 0;

            trophies.forEach(trophy => {
                switch (trophy.rank) {
                    case 1:
                        gold++;
                        break;
                    case 2:
                        silver++;
                        break;
                    case 3:
                        bronze++;
                        break;
                }
            });

            top_runners[runnerSlug] = [];
            top_runners[runnerSlug].push({
                gold: gold,
                silver: silver,
                bronze: bronze,
                trophies: trophies
            });
            top_runners_flat.push({
                runner: runners[runnerSlug],
                gold: gold,
                silver: silver,
                bronze: bronze,
                trophies: trophies
            });
        });

        // DDD: top_runners // doesn't work when looping in templates
        // DDD: top_runners_flat

        return top_runners_flat.sort((a, b) => {
            if (a.gold === b.gold && a.silver === b.silver && a.bronze === b.bronze) {
                return 0;
            }
            if (a.gold === b.gold && a.silver === b.silver) {
                return b.bronze - a.bronze;
            }
            if (a.gold === b.gold) {
                return b.silver - a.silver;
            }
            return b.gold - a.gold;
        });
    });

    /**
     * Top 3 quests summaries
     */
    config.addCollection('xxx2', collection => {
        let all = collection.getAll();

        // lookup
        let runners = [];
        let runs    = [];
        let quests  = [];
        let weapons = [];

        // leaderboard data
        let top_runs__by_quest = [];
        let top_runs__by_weapon__by_quest  = [];

        all.forEach(item => {

            // (1) Collect all items for lookup first
            switch (item.data.type) {
                case 'runner':
                    slug = item.fileSlug
                    // troublesome
                    if (troublesomeSlugs[ slug ]) {
                        slug = troublesomeSlugs[ slug ];
                    }
                    runners[slug] = item;
                    break;
                case 'run':
                    // Only count runs that have one runner, and a single weapon
                    if (item.data.runners.length == 1 && item.data.weapons.length == 1) {
                        runs.push(item);
                    }
                    break;
                case 'quest':
                    /*
                    // todo: don't count all quests, or do we?
                    if (item.data.track_for_leaderboards == 1) {
                        quests[item.fileSlug] = item;
                    }
                    //*/
                    quests[item.fileSlug] = item;
                    break;
                case 'weapon':
                    weapons[item.fileSlug] = item;
                    break;
            }

        });

        // (2) Prepare relationships between runs and quests
        runs.forEach(item => {
            let quest = item.data.quest;
            // Check if the quest the run belongs to is eligible
            if (quests[quest]) {
                if (! top_runs__by_quest[quest]) {
                    top_runs__by_quest[quest] = [];
                }
                top_runs__by_quest[quest].push(item);
            }
        });

        // (3) Group runs per weapon per quest
        Object.keys(top_runs__by_quest).forEach(questSlug => {
            let runs = top_runs__by_quest[questSlug].sort(byTimeAscending);
            top_runs__by_weapon__by_quest[questSlug] = [];

            // ----- EXTRA for this function: extract duplicate runs here -----
            let duplicateCheck = [];
            // ----- /EXTRA -----

            runs.forEach(run => {
                let weaponSlug = run.data.weapons[0];
                let runnerSlug = run.data.runners[0];

                if (! duplicateCheck[weaponSlug]) {
                    duplicateCheck[weaponSlug] = [];
                }
                if (! duplicateCheck[weaponSlug][runnerSlug]) {

                    if (! top_runs__by_weapon__by_quest[questSlug][weaponSlug]) {
                        top_runs__by_weapon__by_quest[questSlug][weaponSlug] = [];
                    }
                    top_runs__by_weapon__by_quest[questSlug][weaponSlug].push(run);

                }

                duplicateCheck[weaponSlug][runnerSlug] = true;
            });
        });

        // Extra lookup table for showing trophies on other pages
        for (const questSlug in top_runs__by_weapon__by_quest) {
            for (const weaponSlug in top_runs__by_weapon__by_quest[questSlug]) {
                let runs = top_runs__by_weapon__by_quest[questSlug][weaponSlug]
                    for (let i = 0; i < runs.length; i++) {
                        top_3_runs[runs[i].url] = (i + 1);
                }
            }
        }

        return top_runs__by_weapon__by_quest
    });

    /**
     * Top 3 quests summaries "TA Wiki Rules"
     */
    config.addCollection('xxx3', collection => {
        let all = collection.getAll();

        // lookup
        let runners = [];
        let runs    = [];
        let quests  = [];
        let weapons = [];

        // leaderboard data
        let top_runs__by_quest = [];
        let top_runs__by_weapon__by_quest  = [];

        all.forEach(item => {

            // (1) Collect all items for lookup first
            switch (item.data.type) {
                case 'runner':
                    slug = item.fileSlug
                    // troublesome
                    if (troublesomeSlugs[ slug ]) {
                        slug = troublesomeSlugs[ slug ];
                    }
                    runners[slug] = item;
                    break;
                case 'run':
                    // Only count runs that have one runner, and a single weapon
                    if (item.data.runners.length == 1 && item.data.weapons.length == 1 && item.data.run_type == 'ta-wiki-rules') {
                        runs.push(item);
                    }
                    break;
                case 'quest':
                    /*
                    // todo: don't count all quests, or do we?
                    if (item.data.track_for_leaderboards == 1) {
                        quests[item.fileSlug] = item;
                    }
                    //*/
                    quests[item.fileSlug] = item;
                    break;
                case 'weapon':
                    weapons[item.fileSlug] = item;
                    break;
            }

        });

        // (2) Prepare relationships between runs and quests
        runs.forEach(item => {
            let quest = item.data.quest;
            // Check if the quest the run belongs to is eligible
            if (quests[quest]) {
                if (! top_runs__by_quest[quest]) {
                    top_runs__by_quest[quest] = [];
                }
                top_runs__by_quest[quest].push(item);
            }
        });

        // (3) Group runs per weapon per quest
        Object.keys(top_runs__by_quest).forEach(questSlug => {
            let runs = top_runs__by_quest[questSlug].sort(byTimeAscending);
            top_runs__by_weapon__by_quest[questSlug] = [];

            // ----- EXTRA for this function: extract duplicate runs here -----
            let duplicateCheck = [];
            // ----- /EXTRA -----

            runs.forEach(run => {
                let weaponSlug = run.data.weapons[0];
                let runnerSlug = run.data.runners[0];

                if (! duplicateCheck[weaponSlug]) {
                    duplicateCheck[weaponSlug] = [];
                }
                if (! duplicateCheck[weaponSlug][runnerSlug]) {

                    if (! top_runs__by_weapon__by_quest[questSlug][weaponSlug]) {
                        top_runs__by_weapon__by_quest[questSlug][weaponSlug] = [];
                    }
                    top_runs__by_weapon__by_quest[questSlug][weaponSlug].push(run);

                }

                duplicateCheck[weaponSlug][runnerSlug] = true;
            });
        });

        // Extra lookup table for showing trophies on other pages
        for (const questSlug in top_runs__by_weapon__by_quest) {
            for (const weaponSlug in top_runs__by_weapon__by_quest[questSlug]) {
                let runs = top_runs__by_weapon__by_quest[questSlug][weaponSlug]
                    for (let i = 0; i < runs.length; i++) {
                        top_3_runs_ta[runs[i].url] = (i + 1);
                }
            }
        }

        return top_runs__by_weapon__by_quest
    });

    /**
     * Weapon Tier List Example
     */
    config.addCollection('xxx4', collection => {
        let all = collection.getAll();

        // lookup
        let runners = [];
        let runs    = [];
        let quests  = [];
        let weapons = [];

        // leaderboard data
        let top_runs__by_quest = [];
        let top_runs__by_weapon__by_quest  = [];

        all.forEach(item => {

            // (1) Collect all items for lookup first
            switch (item.data.type) {
                case 'runner':
                    slug = item.fileSlug
                    // troublesome
                    if (troublesomeSlugs[ slug ]) {
                        slug = troublesomeSlugs[ slug ];
                    }
                    runners[slug] = item;
                    break;
                case 'run':
                    // Only count runs that have one runner, and a single weapon
                    if (item.data.runners.length == 1 && item.data.weapons.length == 1) {
                        runs.push(item);
                    }
                    break;
                case 'quest':
                    /*
                    // todo: don't count all quests, or do we?
                    if (item.data.track_for_leaderboards == 1) {
                        quests[item.fileSlug] = item;
                    }
                    //*/
                    quests[item.fileSlug] = item;
                    break;
                case 'weapon':
                    weapons[item.fileSlug] = item;
                    break;
            }

        });

        // (2) Prepare relationships between runs and quests
        runs.forEach(item => {
            let quest = item.data.quest;
            // Check if the quest the run belongs to is eligible
            if (quests[quest]) {
                if (! top_runs__by_quest[quest]) {
                    top_runs__by_quest[quest] = [];
                }
                top_runs__by_quest[quest].push(item);
            }
        });

        // (3) Group runs per weapon per quest
        Object.keys(top_runs__by_quest).forEach(questSlug => {
            let runs = top_runs__by_quest[questSlug].sort(byTimeAscending);
            top_runs__by_weapon__by_quest[questSlug] = [];

            // ----- EXTRA for this function: extract duplicate runs here -----
            let duplicateCheck = [];
            // ----- /EXTRA -----

            runs.forEach(run => {
                let weaponSlug = run.data.weapons[0];
                let runnerSlug = run.data.runners[0];

                if (! duplicateCheck[weaponSlug]) {
                    duplicateCheck[weaponSlug] = [];
                }
                if (! duplicateCheck[weaponSlug][runnerSlug]) {

                    if (! top_runs__by_weapon__by_quest[questSlug][weaponSlug]) {
                        top_runs__by_weapon__by_quest[questSlug][weaponSlug] = [];
                    }
                    top_runs__by_weapon__by_quest[questSlug][weaponSlug].push(run);

                }

                duplicateCheck[weaponSlug][runnerSlug] = true;
            });
        });

        ///////

        let tiers__by_weapon__by_quest = [];

        Object.keys(top_runs__by_weapon__by_quest).forEach(questSlug => {
            let runs__by_weapon = top_runs__by_weapon__by_quest[questSlug];
            Object.keys(runs__by_weapon).forEach(weaponSlug => {
                if (! tiers__by_weapon__by_quest[questSlug]) {
                    tiers__by_weapon__by_quest[questSlug] = [];
                }
                tiers__by_weapon__by_quest[questSlug].push(runs__by_weapon[weaponSlug][0]);
            });
            tiers__by_weapon__by_quest[questSlug].sort(byTimeAscending);
        })

        ///////

        return tiers__by_weapon__by_quest;
    });

    config.addFilter("tierIndexOfWeapon", (runs, weaponSlug) => {
        for (let i = 0; i < runs.length; i++) {
            if (runs[i].data.weapons[0] === weaponSlug) {
                return {
                    rank: (i + 1),
                    run: runs[i]
                }
            }
        }
        return {
            rank: 14,
            run: false
        }
    });

    config.addFilter("sortByScore", list => {
        return list.sort((a,b) => {
            let valueA = a.score;
            let valueB = b.score;
            return valueB - valueA;
        });
    });

    config.addFilter("freestyleRank", run => {

        if (! top_3_runs[run.url]) {
            return 0;
        }

        return top_3_runs[run.url];
    })

    config.addFilter("taWikiRank", run => {
        if (! top_3_runs_ta[run.url]) {
            return 0;
        }

        return top_3_runs_ta[run.url];
    })

    // --------------------------------------------------------------------------------
    // Filters and Shortcodes
    // --------------------------------------------------------------------------------

    /**
     * Using {{ ... | join('-') }} in the permalink breaks as it will always use a
     * a space as a separator. Somehow making our own works!
     */
    config.addFilter("arrayAsPermalink", items => items.join('-') );

    config.addFilter("label", value => labels[value] ? labels[value] : `UNKNOWN LABEL: [${value}]`);

    let pad = number => number < 10 ? '0' + number : number;
    let formatDate = date => `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())}`
    let formatDateTime = date => `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;

    config.addFilter("dateTimeISO" , date => date.toISOString());
    config.addFilter("dateOnly"    , date => formatDate(date));
    config.addFilter("dateTime"    , date => formatDateTime(date));

    config.addFilter("currentDateTimeISO" , value => (new Date()).toISOString());
    config.addFilter("currentDateTime"    , value => formatDateTime(new Date()));

    config.addFilter("dateDisplay", (dateObj, format = "LLL d, y") => {
        return DateTime.fromJSDate(dateObj, {
          zone: "utc"
        }).toFormat(format);
    });

    // --------------------------------------------------------------------------------
    // Transforms
    // --------------------------------------------------------------------------------
    const htmlmin = require("html-minifier");

    config.addTransform("htmlmin", (content, outputPath) => {
        if( outputPath.endsWith(".html") ) {
            let minified = htmlmin.minify(content, {
              useShortDoctype    : true,
              removeComments     : true,
              collapseWhitespace : true
            });
            return minified;
          }
          return content;
    });

    /*
    const pretty = require("pretty");
    config.addTransform("pretty", function(content, outputPath) {
        if (outputPath.endsWith(".html")) {
            return pretty(content, { ocd: true });
        }
        return content;
    });
    //*/

    // --------------------------------------------------------------------------------
    // Assets
    // --------------------------------------------------------------------------------

    [
        "assets",
        "robots.txt",
        "humans.txt",
        "site.webmanifest",
        "android-chrome-192x192.png",
        "apple-touch-icon.png",
        "browserconfig.xml",
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "mstile-150x150.png",
        "safari-pinned-tab.svg",
        "serviceworker.js"
    ].forEach(asset => config.addPassthroughCopy(`src/site/${asset}`));


    return {
        dir: {
            input: "src/site",
            output: "_site"
        },
        templateFormats : ["njk", "md"],
        // htmlTemplateEngine : "njk",
        // markdownTemplateEngine : "njk",
        passthroughFileCopy: true
    };
};
