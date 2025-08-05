const fs = require('fs');
const path = require('path');

module.exports = function() {
  try {
    // Read the burial list file
    const filePath = path.join(__dirname, '../../assets/list/burial-list.txt');
    const data = fs.readFileSync(filePath, 'utf8');
    
    // Split into lines and remove header and empty lines
    const lines = data.split('\n').filter(line => line.trim() && !line.startsWith('Code'));
    
    // Parse each line and extract names
    const burials = lines.map((line, index) => {
      const columns = line.split('\t');
      
      // Extract data from columns
      const code = columns[0] ? columns[0].trim() : `B${String(index + 1).padStart(3, '0')}`;
      const row = columns[1] ? columns[1].trim() : '';
      const location = columns[2] ? columns[2].trim() : '';
      const deathDate = columns[3] ? columns[3].trim() : '';
      const names = columns[4] ? columns[4].trim() : '';
      const age = columns[5] ? columns[5].trim() : '';
      const inscription = columns[6] ? columns[6].trim() : '';
      
      // Skip empty entries
      if (!names || names === 'Unknown') {
        return null;
      }
      
      return {
        code,
        row,
        location,
        deathDate,
        names,
        age,
        inscription,
        // Create a slug for potential future detail pages
        slug: names.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50)
      };
    }).filter(Boolean); // Remove null entries
    
    return burials;
    
  } catch (error) {
    console.error('Error reading burial list:', error);
    return [];
  }
};