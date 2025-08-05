const fs = require('fs');
const path = require('path');

/**
 * Converts TSV burial data to individual markdown files
 * Usage: node scripts/convert-tsv-to-md.js
 */

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();
}

function parseTSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const headers = lines[0].split('\t');
  const rows = lines.slice(1).map(line => {
    const values = line.split('\t');
    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] ? values[index].trim() : '';
    });
    return row;
  });
  
  return rows;
}

function generateMarkdown(burial) {
  const name = burial.Name;
  const deathYear = burial['Death Date'] ? new Date(burial['Death Date']).getFullYear() : 'unknown';
  const slug = `${slugify(name)}-${deathYear}`;
  
  // Calculate age if both birth and death dates are available
  let calculatedAge = '';
  if (burial['Birth Date'] && burial['Death Date']) {
    const birthDate = new Date(burial['Birth Date']);
    const deathDate = new Date(burial['Death Date']);
    const age = deathDate.getFullYear() - birthDate.getFullYear();
    calculatedAge = age;
  }
  
  const frontMatter = {
    layout: 'grave.njk',
    name: name,
    birthDate: burial['Birth Date'] || '',
    deathDate: burial['Death Date'] || '',
    age: burial.Age || calculatedAge,
    plot: burial.Plot || '',
    headstoneType: burial['Headstone Type'] || '',
    inscription: burial.Inscription || '',
    hasPhoto: burial.Photos ? true : false
  };
  
  // Add photos if available
  if (burial.Photos) {
    frontMatter.photos = [{
      src: `/assets/imgs/graves/${burial.Photos}`,
      alt: `Headstone of ${name}`,
      caption: `Memorial for ${name}`,
      date: new Date().toISOString().split('T')[0]
    }];
  }
  
  let markdown = '---\n';
  Object.entries(frontMatter).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      markdown += `${key}:\n`;
      value.forEach(item => {
        markdown += `  - src: "${item.src}"\n`;
        markdown += `    alt: "${item.alt}"\n`;
        markdown += `    caption: "${item.caption}"\n`;
        markdown += `    date: "${item.date}"\n`;
      });
    } else if (typeof value === 'boolean') {
      markdown += `${key}: ${value}\n`;
    } else if (value) {
      markdown += `${key}: "${value}"\n`;
    }
  });
  markdown += '---\n\n';
  
  // Add content based on notes
  if (burial.Notes) {
    markdown += `${burial.Notes}\n\n`;
    markdown += `*This record was generated from burial registry data. If you have additional information about ${name}, please [contact us](/about/) to help improve this record.*`;
  } else {
    markdown += `*Information about ${name} is limited. If you have additional details about their life or family, please [contact us](/about/) to help expand this record.*`;
  }
  
  return { slug, markdown };
}

function main() {
  const tsvPath = path.join(__dirname, '..', 'src', '_data', 'burials.tsv');
  const outputDir = path.join(__dirname, '..', 'src', 'graves');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    const burials = parseTSV(tsvPath);
    console.log(`Found ${burials.length} burial records`);
    
    burials.forEach(burial => {
      if (burial.Name) {
        const { slug, markdown } = generateMarkdown(burial);
        const filePath = path.join(outputDir, `${slug}.md`);
        
        fs.writeFileSync(filePath, markdown);
        console.log(`Created: ${slug}.md`);
      }
    });
    
    console.log('✅ Conversion complete!');
  } catch (error) {
    console.error('❌ Error converting TSV to Markdown:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseTSV, generateMarkdown, slugify };