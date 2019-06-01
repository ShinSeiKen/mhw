module.exports = function(eleventyConfig) {

    // --------------------------------------------------------------------------------
    // Layouts
    // --------------------------------------------------------------------------------

    eleventyConfig.addLayoutAlias('post'     , 'templates/post.njk');
    eleventyConfig.addLayoutAlias('monster'  , 'templates/monster.njk');
    eleventyConfig.addLayoutAlias('location' , 'templates/location.njk');
    eleventyConfig.addLayoutAlias('weapon'   , 'templates/weapon.njk');
    eleventyConfig.addLayoutAlias('quest'    , 'templates/quest.njk');
    eleventyConfig.addLayoutAlias('run'      , 'templates/run.njk');
    eleventyConfig.addLayoutAlias('runner'   , 'templates/runner.njk');

    // eleventyConfig.addLayoutAlias('listing'  , 'layouts/listing.njk');
    // listing shits out a simple list of items, the sub-template selects which
    // component to tease and inject it!


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
    eleventyConfig.addCollection("monsters"  , collection => collection.getFilteredByGlob("monsters/*.md"));
    eleventyConfig.addCollection("locations" , collection => collection.getFilteredByGlob("locations/*.md"));
    eleventyConfig.addCollection("weapons"   , collection => collection.getFilteredByGlob("weapons/*.md"));
    eleventyConfig.addCollection("quests"    , collection => collection.getFilteredByGlob("quests/**/*.md").sort(byTitleAlphabetically));
    eleventyConfig.addCollection("runs"      , collection => collection.getFilteredByGlob("runs/**/*.md").reverse());
    eleventyConfig.addCollection("runners"   , collection => collection.getFilteredByGlob("runners/*.md").sort(byTitleAlphabetically));

    // Define sub-collections for quests
    eleventyConfig.addCollection("quests__arena"     , collection => collection.getFilteredByGlob("quests/arena-quest/*.md").sort(byTitleAlphabetically));
    eleventyConfig.addCollection("quests__challenge" , collection => collection.getFilteredByGlob("quests/challenge-quest/*.md").sort(byTitleAlphabetically));
    eleventyConfig.addCollection("quests__event"     , collection => collection.getFilteredByGlob("quests/event-quest/*.md").sort(byTitleAlphabetically));
    eleventyConfig.addCollection("quests__optional"  , collection => collection.getFilteredByGlob("quests/optional-quest/*.md").sort(byTitleAlphabetically));

    // Define a lookup table for accessing content via type and (unique) slugs
    eleventyConfig.addCollection("lookup", collection => {
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

    eleventyConfig.addCollection("quests__by_location", collection => {
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
        return result;
    });

    eleventyConfig.addCollection("quests__by_monster", collection => {
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

        // todo: sort every sub-array by title?

        return result;
    });

    // --------------------------------------------------------------------------------
    // Collections -- Locations <-> Quest <-> Monster
    // --------------------------------------------------------------------------------

    eleventyConfig.addCollection("locations__by_monster", collection => {
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

    eleventyConfig.addCollection("monsters__by_location", collection => {
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

    // quest__by_difficulty, as default sorting would be OK!
    // quest__by_quest_type

    // --------------------------------------------------------------------------------
    // Collections -- Runs
    //
    // Runs filtered by weapons, runners and monsters are only counted if there is
    // strictly one option. So multiplayer runs, runs with multiple weapons or weapon
    // switching, and multi-monster quests will not be featured on their specific pages.
    // --------------------------------------------------------------------------------

    eleventyConfig.addCollection("runs__by_weapon", collection => {
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

    eleventyConfig.addCollection("runs__by_runner", collection => {
        let result = [];
        collection.getAll().forEach(item => {
            if (item.data.type == 'run' && item.data.runners.length == 1) {
                let runner = item.data.runners[0];
                if (! result[runner]) {
                    result[runner] = [];
                }
                result[runner].push(item);
            }
        });
        return result;
    });

    eleventyConfig.addCollection("runs__by_quest", collection => {
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

    eleventyConfig.addCollection("runs__by_monster", collection => {
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

    eleventyConfig.addCollection("runners__by_country", collection => {
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
    eleventyConfig.addCollection("runners__by_weapon", collection => {
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
    // Assets
    // --------------------------------------------------------------------------------

    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("robots.txt");
    eleventyConfig.addPassthroughCopy("humans.txt");

    eleventyConfig.addPassthroughCopy("site.webmanifest");
    eleventyConfig.addPassthroughCopy("android-chrome-192x192.png");
    eleventyConfig.addPassthroughCopy("apple-touch-icon.png");
    eleventyConfig.addPassthroughCopy("browserconfig.xml");
    eleventyConfig.addPassthroughCopy("favicon.ico");
    eleventyConfig.addPassthroughCopy("favicon-16x16.png");
    eleventyConfig.addPassthroughCopy("favicon-32x32.png");
    eleventyConfig.addPassthroughCopy("mstile-150x150.png");
    eleventyConfig.addPassthroughCopy("safari-pinned-tab.svg");

    // -- todo: service worker

    // --------------------------------------------------------------------------------
    // Filters and Shortcodes
    //
    // - See: https://www.11ty.io/docs/filters/
    // - See: https://www.11ty.io/docs/shortcodes/
    // --------------------------------------------------------------------------------
    /**
     * Converts milliseconds to a Monster Hunter World timer, i.e.
     * 12'34"56
     *
     * This is an example filter if we ask for speedrun times to be
     * set in milliseconds, which makes it easier to calculate with,
     * e.g. sorting.
     */
    eleventyConfig.addFilter("millisFormatted", milliseconds => {
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
    eleventyConfig.addFilter("arrayAsPermalink", items => items.join('-') );

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

    eleventyConfig.addFilter("label", value => labelLookup[value] ? labelLookup[value] : `UNKNOWN LABEL: [${value}]`);


    let pad = number => number < 10 ? '0' + number : number;

    eleventyConfig.addFilter("dateTimeISO", date => date.toISOString());
    eleventyConfig.addFilter("dateOnly", date => `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())}`);
    eleventyConfig.addFilter("dateTime", date => `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`);

    eleventyConfig.addFilter("currentDateTimeISO", value => (new Date()).toISOString());
    eleventyConfig.addFilter("currentDateTime", value => {
        let date = new Date();

        /*
        return date.toLocaleDateString('en-GB', {
            hour12: false,
            day: '2-digit',
            year: 'numeric',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'long'
        });
        */

        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
    });

    /*
    eleventyConfig.addFilter("findAll", (collection, type, key, value) => {
        setTimeout(function() {
            return collection.filter(item => (item.data.type == type && item.data[key] == value));
        }, 100);
        //console.log(key, value);
        // console.log(collection);
        // return collection.filter(item => (item.data.type == type && item.data[key] == value));
    });
    //*/

    // --------------------------------------------------------------------------------
    // Transforms
    // --------------------------------------------------------------------------------
    const pretty = require("pretty");

    eleventyConfig.addTransform("pretty", function(content, outputPath) {
        if( outputPath.endsWith(".html") ) {
            return pretty(content, {ocd: true});
        }

        return content;
    });

    // todo: css
    // todo: js

    return {
        passthroughFileCopy: true
    };
};
