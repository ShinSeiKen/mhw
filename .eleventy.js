//
// Note: Using lots of manual groupBy functions, we can reduce this by using the
//       array's reduce function.
// See https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-a-array-of-objects
//
// -- todo: extract some variables to separate files, this file is getting huge
//
// --- Not necessary, but whatever:
// quest__by_difficulty, as default sorting would be OK!
// quest__by_quest_type
//

const { DateTime } = require("luxon");

module.exports = function(config) {

    // let env = process.env.ELEVENTY_ENV

    // --------------------------------------------------------------------------------
    // Layouts
    // --------------------------------------------------------------------------------

    config.addLayoutAlias('post'     , 'templates/post.njk');
    config.addLayoutAlias('monster'  , 'templates/monster.njk');
    config.addLayoutAlias('location' , 'templates/location.njk');
    config.addLayoutAlias('weapon'   , 'templates/weapon.njk');
    config.addLayoutAlias('quest'    , 'templates/quest.njk');
    config.addLayoutAlias('run'      , 'templates/run.njk');
    config.addLayoutAlias('runner'   , 'templates/runner.njk');


    // --------------------------------------------------------------------------------
    // Collections -- General
    // --------------------------------------------------------------------------------

    let byTitleAlphabetically = (a, b) => {
        let valueA = a.data.title;
        let valueB = b.data.title;
        return valueA.localeCompare(valueB);
    };

    let byTimeAscending = (a, b) => {
        let valueA = a.data.time;
        let valueB = b.data.time;
        return valueA.localeCompare(valueB);
    };

    // Define collections
    config.addCollection("monsters"  , collection => collection.getFilteredByGlob("monsters/*.md"));
    config.addCollection("locations" , collection => collection.getFilteredByGlob("locations/*.md"));
    config.addCollection("weapons"   , collection => collection.getFilteredByGlob("weapons/*.md"));
    config.addCollection("quests"    , collection => collection.getFilteredByGlob("quests/**/*.md").sort(byTitleAlphabetically));
    config.addCollection("runs"      , collection => collection.getFilteredByGlob("runs/**/*.md").reverse());
    config.addCollection("runners"   , collection => collection.getFilteredByGlob("runners/*.md").sort(byTitleAlphabetically));

    // Define sub-collections for quests
    config.addCollection("quests__arena"     , collection => collection.getFilteredByGlob("quests/arena-quest/*.md").sort(byTitleAlphabetically));
    config.addCollection("quests__challenge" , collection => collection.getFilteredByGlob("quests/challenge-quest/*.md").sort(byTitleAlphabetically));
    config.addCollection("quests__event"     , collection => collection.getFilteredByGlob("quests/event-quest/*.md").sort(byTitleAlphabetically));
    config.addCollection("quests__optional"  , collection => collection.getFilteredByGlob("quests/optional-quest/*.md").sort(byTitleAlphabetically));

    // Define a lookup table for accessing content via type and (unique) slugs
    config.addCollection("lookup", collection => {
        let lookup = [];

		collection.getAll().forEach(item => {
            let type = item.data.type;
            let slug = item.fileSlug;

            if (! lookup[type]) {
                lookup[type] = [];
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

        Object.keys(result).forEach(key =>{
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

    // runs by rules type (freestyle|arenastyle|restricted)
    // runs by platform (xbox|ps4|pc)
    // etc...

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
        return result;
    });

    // --------------------------------------------------------------------------------
    // Collections: Leaderboards
    // --------------------------------------------------------------------------------

    /**
     * Track single-player leaderboards only!
     */
    config.addCollection('xxx', collection => {
        let all = collection.getAll();

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
                    runners[item.fileSlug] = item;
                    break;
                case 'run':
                    // Only count runs that have one runner, and a single weapon
                    if (item.data.runners.length == 1 && item.data.weapons.length == 1) {
                        runs[item.fileSlug] = item;
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
        all.forEach(item => {
            if (item.data.type == 'run') {
                let quest = item.data.quest;
                // Check if the quest the run belongs to is eligible
                if (quests[quest]) {
                    if (! top_runs__by_quest[quest]) {
                        top_runs__by_quest[quest] = [];
                    }
                    top_runs__by_quest[quest].push(item);
                }
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
            Object.keys(weapons).forEach(weaponSlug => {
                let runs = weapons[weaponSlug];

                if (! top_runs__by_runner__by_weapon[weaponSlug]) {
                    top_runs__by_runner__by_weapon[weaponSlug] = [];
                }
                runs.forEach((run, index) => {
                    let runner = run.data.runners[0];

                    if (! top_runs__by_runner__by_weapon[weaponSlug][runner]) {
                        top_runs__by_runner__by_weapon[weaponSlug][runner] = []
                    }
                    top_runs__by_runner__by_weapon[weaponSlug][runner].push({
                        // This is a trophy
                        rank: index + 1,
                        run: run,
                        quest: quests[questSlug]
                    });
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

            // TEST WITH SOME RANDOM VALUES
            /*
            top_runners_flat.push({
                runner: runners[runnerSlug],
                gold: gold + 1,
                silver: silver,
                bronze: bronze,
                trophies: trophies
            });
            top_runners_flat.push({
                runner: runners[runnerSlug],
                gold: gold,
                silver: silver + 1,
                bronze: bronze,
                trophies: trophies
            });
            top_runners_flat.push({
                runner: runners[runnerSlug],
                gold: gold,
                silver: silver,
                bronze: bronze + 3,
                trophies: trophies
            });
            top_runners_flat.push({
                runner: runners[runnerSlug],
                gold: gold,
                silver: silver + 1,
                bronze: bronze + 1,
                trophies: trophies
            });
            //*/

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
    ].forEach(asset => config.addPassthroughCopy(asset));


    // --------------------------------------------------------------------------------
    // Filters and Shortcodes
    // --------------------------------------------------------------------------------

    /**
     * Converts milliseconds to a Monster Hunter World timer, i.e.
     * 12'34"56
     *
     * This is an example filter if we ask for speedrun times to be
     * set in milliseconds, which makes it easier to calculate with,
     * e.g. sorting.
     */
    config.addFilter("millisFormatted", milliseconds => {
        let pad = (number) => {
            let s = String(number);
            let size = 2;
            while (s.length < size) {
                s = "0" + s;
            }
            return s;
        };
        let date = new Date(milliseconds);

        let h = date.getUTCHours();
        let m = date.getUTCMinutes();
        let s = date.getUTCSeconds();
        let z = date.getUTCMilliseconds();

        // Standard Monster Hunter Word time-format: mm'ss"zz
        let result = `${pad(m)}'${pad(s)}"${pad(Math.floor(z/10))}`;

        // Gracefully handle hours, but don't handle days or whatever.
        if (h > 0) {
            return `${h}:${result}`;
        }
        return result;
    });

    /**
     * Using {{ ... | join('-') }} in the permalink breaks as it will always use a
     * a space as a separator. Somehow making our own works!
     */
    config.addFilter("arrayAsPermalink", items => items.join('-') );

    /**
     * Convert labels to proper text.
     * todo: Move to external file.
     */
    let labelLookup = {
        // Platforms:
        "ps4"  : "PS4",
        "xbox" : "XBOX",
        "pc"   : "PC",

        // Rulesets:
        "freestyle"     : "Freestyle",
        "arena-style"   : "Arena-style",
        "restricted"    : "Restricted",
        "ta-wiki-rules" : "TA Wiki Rules",

        // Quest Types:
        "optional-quest"  : "Optional Quest",
        "arena-quest"     : "Arena Quest",
        "challenge-quest" : "Challenge Quest",
        "event-quest"     : "Event Quest",
        "special-quest"   : "Special Quest",


        // Misc:
        "foo" : "bar"
    };

    config.addFilter("label", value => labelLookup[value] ? labelLookup[value] : `UNKNOWN LABEL: [${value}]`);


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
    */

    return {
        passthroughFileCopy: true
    };
};
