module.exports = function(eleventyConfig) {
    // Define layouts
    eleventyConfig.addLayoutAlias('post', 'layouts/layout.njk');
    eleventyConfig.addLayoutAlias('readme', 'layouts/layout.njk');
    // run, runner, quest, monster, location, weapon
  
    // Define custom collections
    eleventyConfig.addCollection("myCollectionName", function(collection) {
        return collection.getAll();
    });

    eleventyConfig.addCollection("keyMustExistInData", function(collection) {
        return collection.getAll()
            .filter((item) => "myCustomDataKey" in item.data)
            .sort((a, b) => b.date - a.date)
        ;
    });

    eleventyConfig.addCollection("monsters", (collection) => collection.getFilteredByGlob("monster/*.md"));
    eleventyConfig.addCollection("locations", (collection) => collection.getFilteredByGlob("location/*.md"));
    eleventyConfig.addCollection("weapons", (collection) => collection.getFilteredByGlob("weapon/*.md"));
    eleventyConfig.addCollection("quests", (collection) => collection.getFilteredByGlob("quest/*.md"));
    eleventyConfig.addCollection("runs", (collection) => collection.getFilteredByGlob("run/*.md"));
    eleventyConfig.addCollection("runners", (collection) => collection.getFilteredByGlob("runner/*.md"));

    // Copy the `img/` directory 
    eleventyConfig.addPassthroughCopy("img");

    // Copy the `css/fonts/` directory
    // If you use a subdirectory, it’ll copy using the same directory structure.
    eleventyConfig.addPassthroughCopy("css/fonts");

    // https://www.11ty.io/docs/filters/
    eleventyConfig.addFilter("makeUppercase", function(value) {
        return value.toUpperCase();
    });

    // Shortcodes for re-usable content
    // https://www.11ty.io/docs/shortcodes/

    return {
        passthroughFileCopy: true
    };
};
