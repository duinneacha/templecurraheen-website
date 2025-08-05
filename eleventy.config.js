module.exports = function(eleventyConfig) {
  // Copy assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("assets");
  
  // Watch CSS files for changes
  eleventyConfig.addWatchTarget("./src/css/");
  
  // Create collections
  eleventyConfig.addCollection("graves", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/graves/*.md");
  });
  
  // Add filters
  eleventyConfig.addFilter("sortAlphabetical", function(collection) {
    return collection.sort((a, b) => {
      const nameA = a.data.name || a.data.title || '';
      const nameB = b.data.name || b.data.title || '';
      return nameA.localeCompare(nameB);
    });
  });
  
  eleventyConfig.addFilter("sortByDate", function(collection) {
    return collection.sort((a, b) => {
      const dateA = new Date(a.data.deathDate || '1900-01-01');
      const dateB = new Date(b.data.deathDate || '1900-01-01');
      return dateA - dateB;
    });
  });
  
  // Add date filter for formatting dates
  eleventyConfig.addFilter("date", function(dateObj, format) {
    if (!dateObj) return '';
    const date = new Date(dateObj);
    if (isNaN(date.getTime())) return dateObj;
    
    // Simple date formatting
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
  });
  
  // Add truncate filter
  eleventyConfig.addFilter("truncate", function(str, length = 100) {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + '...';
  });
  
  // Image optimization helper
  eleventyConfig.addShortcode("image", function(src, alt, className = "") {
    return `<img src="${src}" alt="${alt}" class="${className}" loading="lazy">`;
  });
  
  return {
    pathPrefix: "/templecurraheen-website/",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};