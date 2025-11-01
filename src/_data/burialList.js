const fs = require('fs');
const path = require('path');

// Color mapping for row codes
const rowCodeColors = {
  'A': 'rgb(255, 255, 153)',
  'B': 'rgb(255, 153, 255)',
  'C': 'rgb(97, 203, 243)',
  'D': 'rgb(0, 176, 240)',
  'E': 'rgb(255, 192, 0)',
  'F': 'rgb(0, 204, 102)',
  'G': 'rgb(255, 0, 0)',
  'H': 'rgb(153, 153, 255)',
  'I': 'rgb(0, 204, 0)',
  'J': 'rgb(255, 153, 51)',
  'K': 'rgb(112, 168, 224)',
  'L': 'rgb(255, 204, 255)',
  'M': 'rgb(255, 255, 0)',
  'N': 'rgb(146, 208, 80)',
  'O': 'rgb(153, 102, 255)',
  'P': 'rgb(0, 176, 240)',
  'Q': 'rgb(60, 125, 34)',
  'R': 'rgb(153, 102, 255)',
  'S': 'rgb(146, 208, 80)',
  'T': 'rgb(255, 51, 153)',
  'U': 'rgb(255, 153, 51)',
  'V': 'rgb(0, 176, 240)'
};

// Simple CSV parser
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Read and parse CSV data
let cachedData = null;

function loadBurialData() {
  if (cachedData !== null) {
    return cachedData;
  }
  
  try {
    // Read the CSV file
    const filePath = path.join(__dirname, '../../assets/list/templecurraheen_stones_and_registers.csv');
    const data = fs.readFileSync(filePath, 'utf8');
    
    // Split into lines
    const lines = data.split('\n').filter(line => line.trim());
    
    // Skip header row
    if (lines.length === 0) {
      cachedData = [];
      return cachedData;
    }
    
    const headers = parseCSVLine(lines[0]);
    const headerMap = {};
    headers.forEach((header, index) => {
      headerMap[header.trim()] = index;
    });
    
    // Parse each data line
    const burials = lines.slice(1).map((line, index) => {
      const columns = parseCSVLine(line);
      
      // Extract required fields
      const rowCode = columns[headerMap['row_code']] ? columns[headerMap['row_code']].trim().toUpperCase() : '';
      const lastName = columns[headerMap['last_name']] ? columns[headerMap['last_name']].trim() : '';
      const firstName = columns[headerMap['first_name']] ? columns[headerMap['first_name']].trim() : '';
      const deathDate = columns[headerMap['death_date']] ? columns[headerMap['death_date']].trim() : '';
      const fileName = columns[headerMap['file_name']] ? columns[headerMap['file_name']].trim() : '';
      
      // Skip entries without at least a last name or first name
      if (!lastName && !firstName) {
        return null;
      }
      
      // Format death date (remove time portion if present)
      let formattedDate = deathDate;
      if (deathDate && deathDate.includes(' 00:00:00')) {
        formattedDate = deathDate.replace(' 00:00:00', '');
        // Format as DD/MM/YYYY if it's in YYYY-MM-DD format
        const dateMatch = formattedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (dateMatch) {
          formattedDate = `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;
        }
      }
      
      // Get color for row code
      const rowCodeColor = rowCodeColors[rowCode] || null;
      
      // Combine first and last name
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || lastName || firstName || 'Unknown';
      
      return {
        rowCode,
        rowCodeColor,
        lastName,
        firstName,
        fullName,
        deathDate: formattedDate,
        fileName,
        // Keep some fields for backward compatibility with modal
        names: fullName,
        slug: fullName.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50)
      };
    }).filter(Boolean); // Remove null entries
    
    cachedData = burials;
    return burials;
    
  } catch (error) {
    console.error('Error reading burial list:', error);
    cachedData = [];
    return [];
  }
}

// Export as both function and direct property for Eleventy compatibility
const data = loadBurialData();
module.exports = data;
module.exports.load = loadBurialData;