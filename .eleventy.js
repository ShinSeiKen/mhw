module.exports = function(eleventyConfig) {
    // Define layouts
    eleventyConfig.addLayoutAlias('post', 'layouts/layout.njk');
    eleventyConfig.addLayoutAlias('readme', 'layouts/layout.njk');
  
    // Define custom collections
    eleventyConfig.addCollection("myCollectionName", function(collection) {
        // get unsorted items
        return collection.getAll();
    });

    eleventyConfig.addCollection("keyMustExistInData", function(collection) {
        return collection.getAll()
            .filter(function(item) {
                return "myCustomDataKey" in item.data;
            })
            .sort(function(a, b) {
                return b.date - a.date;
            });
        });

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
