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

    // --------------------------------------------------------------------------------
    // Collections -- General
    // --------------------------------------------------------------------------------

    let byTitleAlphabetically = (a, b) => {
        let valueA = a.data.title;
        let valueB = b.data.title;
        return valueA.localeCompare(valueB);
    };

    // Define collections
    eleventyConfig.addCollection("monsters"  , collection => collection.getFilteredByGlob("monsters/*.md"));
    eleventyConfig.addCollection("locations" , collection => collection.getFilteredByGlob("locations/*.md"));
    eleventyConfig.addCollection("weapons"   , collection => collection.getFilteredByGlob("weapons/*.md"));
    eleventyConfig.addCollection("quests"    , collection => collection.getFilteredByGlob("quests/**/*.md"));
    eleventyConfig.addCollection("runs"      , collection => collection.getFilteredByGlob("runs/*.md").reverse());
    eleventyConfig.addCollection("runners"   , collection => collection.getFilteredByGlob("runners/*.md").sort(byTitleAlphabetically));

    // Define sub-collections for quests
    eleventyConfig.addCollection("quests__arena"     , collection => collection.getFilteredByGlob("quests/arena-quest/*.md"));
    eleventyConfig.addCollection("quests__challenge" , collection => collection.getFilteredByGlob("quests/challenge-quest/*.md"));
    eleventyConfig.addCollection("quests__event"     , collection => collection.getFilteredByGlob("quests/event-quest/*.md"));
    eleventyConfig.addCollection("quests__optional"  , collection => collection.getFilteredByGlob("quests/optional-quest/*.md"));

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

    // quest__by_location
    // quest__by_monster
    // quest__by_difficulty
    // quest__by_quest_type
    // ???

    // --------------------------------------------------------------------------------
    // Collections -- Runs
    // --------------------------------------------------------------------------------

    // run__by_weapon
    // run__by_runner
    // run__by_quest
    // run__by_monster
    // ???

    // --------------------------------------------------------------------------------
    // Runners
    // --------------------------------------------------------------------------------

    eleventyConfig.addCollection("runners__by_country", collection => {
        let result = [];
        collection.getAll().forEach(item => {
            if (item.data.country) {
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

    // --------------------------------------------------------------------------------
    // Filters and Shortcodes
    //
    // - See: https://www.11ty.io/docs/filters/
    // - See: https://www.11ty.io/docs/shortcodes/
    // --------------------------------------------------------------------------------

    eleventyConfig.addFilter("uppercase", value => value.toUpperCase());

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
     * Simple filter to find all items in a collection.
     */
    eleventyConfig.addFilter("findAll", (collection, type, key, value) => {
        //*
        setTimeout(function() {
            return collection.filter(item => (item.data.type == type && item.data[key] == value));
        }, 100);
        //*/
        //console.log(key, value);
        // console.log(collection);
        // return collection.filter(item => (item.data.type == type && item.data[key] == value));
    });

    // --------------------------------------------------------------------------------

    return {
        passthroughFileCopy: true
    };
};
