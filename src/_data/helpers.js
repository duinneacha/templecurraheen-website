module.exports = {
  year: () => new Date().getFullYear(),
  
  dateToFormat: (date, format) => {
    const options = {};
    
    switch(format) {
      case 'MMMM do, yyyy':
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'yyyy':
        return new Date(date).getFullYear();
      default:
        return new Date(date).toLocaleDateString();
    }
  },
  
  formatName: (firstName, lastName, maidenName) => {
    let name = `${firstName || ''} ${lastName || ''}`.trim();
    if (maidenName) {
      name += ` (née ${maidenName})`;
    }
    return name;
  },
  
  calculateAge: (birthDate, deathDate) => {
    if (!birthDate || !deathDate) return null;
    
    const birth = new Date(birthDate);
    const death = new Date(deathDate);
    const age = death.getFullYear() - birth.getFullYear();
    
    // Adjust for birthday not yet reached in death year
    const monthDiff = death.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
      return age - 1;
    }
    
    return age;
  }
};