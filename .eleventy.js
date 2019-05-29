module.exports = function(eleventyConfig) {
    // Define layouts
    // eleventyConfig.addLayoutAlias('readme'   , 'layouts/layout.njk');
    eleventyConfig.addLayoutAlias('post'     , 'templates/post.njk');
    eleventyConfig.addLayoutAlias('monster'  , 'templates/monster.njk');
    eleventyConfig.addLayoutAlias('location' , 'templates/location.njk');
    eleventyConfig.addLayoutAlias('weapon'   , 'templates/weapon.njk');
    eleventyConfig.addLayoutAlias('quest'    , 'templates/quest.njk');
    eleventyConfig.addLayoutAlias('run'      , 'templates/run.njk');
    eleventyConfig.addLayoutAlias('runner'   , 'templates/runner.njk');

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

    // run__by_weapon
    // run__by_runner
    // run__by_quest
    // run__by_monster
    // ???

    // runners__by_weapon
    // ???

    // Define lookup table for accessing content via (unique) slugs
    eleventyConfig.addCollection("lookup", collection => {
        let lookup = {};

		collection.getAll().forEach(item => {
            let type = item.data.type;
            let slug = item.fileSlug;

            if (!lookup[type]) {
                lookup[type] = [];
            }

            lookup[type][slug] = item;
        });

		return lookup;
	});

    // Copy the `assets/` directory
    eleventyConfig.addPassthroughCopy("assets");

    // Copy the `css/fonts/` directory
    // If you use a subdirectory, it’ll copy using the same directory structure.
    //eleventyConfig.addPassthroughCopy("css/fonts");

    // https://www.11ty.io/docs/filters/
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

        // Gracefully handle hours, but don't handle days or whatever
        if (h > 0) {
            return `${h}:${result}`;
        }
        return result;
    });

    // Shortcodes for re-usable content
    // https://www.11ty.io/docs/shortcodes/

    return {
        passthroughFileCopy: true
    };
};
