#!/usr/bin/env python3
"""
Script to identify potential duplicate records between register (row_code="X") 
and stones (row_code != "X") datasets in templecurraheen_stones_and_registers.csv

Matching criteria:
- Same first name and last name (case-insensitive)
- One row_code is "X" and the other is not
- Year matches
- Age at death matches
"""

import csv
import re
from datetime import datetime
from typing import List, Dict, Tuple, Optional
from pathlib import Path

def normalize_name(name: str) -> str:
    """Normalize name for comparison (lowercase, strip whitespace)"""
    if not name:
        return ""
    return name.strip().lower()

def extract_year(date_str: str) -> Optional[int]:
    """Extract year from various date formats"""
    if not date_str or date_str.strip() == "":
        return None
    
    date_str = date_str.strip()
    
    # Try to parse as full date first (e.g., "1962-01-19 00:00:00")
    try:
        dt = datetime.strptime(date_str.split()[0], "%Y-%m-%d")
        return dt.year
    except:
        pass
    
    # Try format like "14-Feb-62" or "18-Jul-37"
    # Note: Python's %y interprets 00-68 as 2000-2068, 69-99 as 1969-1999
    # For historical records, we need to adjust: if result > 2000, subtract 100
    try:
        dt = datetime.strptime(date_str, "%d-%b-%y")
        year = dt.year
        # If parsed year is in the future (2000+), likely should be 1900s for historical records
        if year > 2000:
            year = year - 100
        return year
    except:
        pass
    
    # Try format like "14-Feb-1962"
    try:
        dt = datetime.strptime(date_str, "%d-%b-%Y")
        return dt.year
    except:
        pass
    
    # Try format like "25/2/1877"
    try:
        dt = datetime.strptime(date_str, "%d/%m/%Y")
        return dt.year
    except:
        pass
    
    # Try format like "25/2/77"
    try:
        dt = datetime.strptime(date_str, "%d/%m/%y")
        year = dt.year
        # Adjust for historical records
        if year > 2000:
            year = year - 100
        return year
    except:
        pass
    
    # Try format like "5-3-1800"
    try:
        dt = datetime.strptime(date_str, "%d-%m-%Y")
        return dt.year
    except:
        pass
    
    # Try just a 4-digit year
    if re.match(r'^\d{4}$', date_str):
        return int(date_str)
    
    # Try to extract 4-digit year from string
    year_match = re.search(r'\b(19|20)\d{2}\b', date_str)
    if year_match:
        return int(year_match.group())
    
    return None

def normalize_age(age_str: str) -> Optional[float]:
    """Normalize age to a numeric value for comparison"""
    if not age_str or age_str.strip() == "":
        return None
    
    age_str = age_str.strip()
    
    # Try to extract numeric value
    # Handle "75.0", "75 years", "75", etc.
    age_match = re.search(r'(\d+\.?\d*)', age_str)
    if age_match:
        try:
            return float(age_match.group(1))
        except:
            pass
    
    return None

def parse_csv(file_path: str) -> Tuple[List[Dict], List[Dict]]:
    """Parse CSV and separate register and stone records"""
    register_records = []
    stone_records = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row_code = row.get('row_code', '').strip()
            if row_code == 'X':
                register_records.append(row)
            else:
                stone_records.append(row)
    
    return register_records, stone_records

def find_matches(register_records: List[Dict], stone_records: List[Dict]) -> List[Dict]:
    """Find potential duplicate matches between register and stone records"""
    matches = []
    
    for reg_record in register_records:
        reg_first_name = normalize_name(reg_record.get('first_name', ''))
        reg_last_name = normalize_name(reg_record.get('last_name', ''))
        
        # Skip if missing critical matching fields
        if not reg_first_name or not reg_last_name:
            continue
        
        for stone_record in stone_records:
            stone_first_name = normalize_name(stone_record.get('first_name', ''))
            stone_last_name = normalize_name(stone_record.get('last_name', ''))
            
            # Check name match
            if reg_first_name != stone_first_name or reg_last_name != stone_last_name:
                continue
            
            # Found a match!
            matches.append({
                'register': reg_record,
                'stone': stone_record
            })
    
    return matches

def generate_csv_report(matches: List[Dict], output_path: str):
    """Generate a CSV report of potential duplicates - each record appears as a separate row"""
    
    fieldnames = [
        'Match_ID', 'Record_Type', 'Row_Code',
        'Grave_Code', 'Plot_Code', 'Last_Name', 'First_Name',
        'Death_Date', 'Death_Year', 'Age',
        'Burial_Date', 'Status', 'Occupation', 'Address', 'Witness', 'Comments',
        'Names_on_Headstone', 'File_Name', 'Stone_Inscription', 'Stone_Design', 'Headstone_Shape',
        'Matched_With_Grave_Code', 'Matched_With_Row_Code', 'Matched_With_Death_Year', 'Matched_With_Age',
        'Year_Match', 'Age_Match', 'Year_Difference', 'Age_Difference'
    ]
    
    with open(output_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for idx, match in enumerate(matches, 1):
            reg = match['register']
            stone = match['stone']
            
            # Extract years and ages for comparison
            reg_year = extract_year(reg.get('death_date', ''))
            stone_year = extract_year(stone.get('death_date', ''))
            reg_age = normalize_age(reg.get('age', ''))
            stone_age = normalize_age(stone.get('age', ''))
            
            # Determine matches
            year_match = ''
            age_match = ''
            year_diff = ''
            age_diff = ''
            
            if reg_year and stone_year:
                year_match = 'Yes' if reg_year == stone_year else 'No'
                year_diff = str(abs(reg_year - stone_year)) if reg_year != stone_year else '0'
            else:
                year_match = 'N/A'
            
            if reg_age is not None and stone_age is not None:
                age_diff_val = abs(reg_age - stone_age)
                age_match = 'Yes' if age_diff_val <= 1.0 else 'No'
                age_diff = str(age_diff_val)
            else:
                age_match = 'N/A'
            
            # Write register record row
            reg_row = {
                'Match_ID': idx,
                'Record_Type': 'Register',
                'Row_Code': reg.get('row_code', ''),
                'Grave_Code': reg.get('grave_code', ''),
                'Plot_Code': reg.get('plot_code', ''),
                'Last_Name': reg.get('last_name', ''),
                'First_Name': reg.get('first_name', ''),
                'Death_Date': reg.get('death_date', ''),
                'Death_Year': str(reg_year) if reg_year else '',
                'Age': reg.get('age', ''),
                'Burial_Date': reg.get('Burial_Date', ''),
                'Status': reg.get('Status', ''),
                'Occupation': reg.get('Occupation', ''),
                'Address': reg.get('Address', ''),
                'Witness': reg.get('Witness', ''),
                'Comments': reg.get('Comments', ''),
                'Names_on_Headstone': '',
                'File_Name': '',
                'Stone_Inscription': '',
                'Stone_Design': '',
                'Headstone_Shape': '',
                'Matched_With_Grave_Code': stone.get('grave_code', ''),
                'Matched_With_Row_Code': stone.get('row_code', ''),
                'Matched_With_Death_Year': str(stone_year) if stone_year else '',
                'Matched_With_Age': stone.get('age', ''),
                'Year_Match': year_match,
                'Age_Match': age_match,
                'Year_Difference': year_diff,
                'Age_Difference': age_diff
            }
            writer.writerow(reg_row)
            
            # Write stone record row
            stone_row = {
                'Match_ID': idx,
                'Record_Type': 'Stone',
                'Row_Code': stone.get('row_code', ''),
                'Grave_Code': stone.get('grave_code', ''),
                'Plot_Code': stone.get('plot_code', ''),
                'Last_Name': stone.get('last_name', ''),
                'First_Name': stone.get('first_name', ''),
                'Death_Date': stone.get('death_date', ''),
                'Death_Year': str(stone_year) if stone_year else '',
                'Age': stone.get('age', ''),
                'Burial_Date': '',
                'Status': '',
                'Occupation': '',
                'Address': '',
                'Witness': '',
                'Comments': '',
                'Names_on_Headstone': stone.get('names_on_headstone', ''),
                'File_Name': stone.get('file_name', ''),
                'Stone_Inscription': stone.get('stone_inscription', ''),
                'Stone_Design': stone.get('stone_design', ''),
                'Headstone_Shape': stone.get('headstone_shape', ''),
                'Matched_With_Grave_Code': reg.get('grave_code', ''),
                'Matched_With_Row_Code': reg.get('row_code', ''),
                'Matched_With_Death_Year': str(reg_year) if reg_year else '',
                'Matched_With_Age': reg.get('age', ''),
                'Year_Match': year_match,
                'Age_Match': age_match,
                'Year_Difference': year_diff,
                'Age_Difference': age_diff
            }
            writer.writerow(stone_row)

def main():
    """Main function"""
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    csv_path = project_root / 'assets' / 'list' / 'templecurraheen_stones_and_registers.csv'
    output_path = project_root / 'assets' / 'list' / 'potential_duplicates_report.csv'
    
    print(f"Reading CSV file: {csv_path}")
    register_records, stone_records = parse_csv(str(csv_path))
    
    print(f"Found {len(register_records)} register records (row_code='X')")
    print(f"Found {len(stone_records)} stone records (row_code != 'X')")
    
    print("\nSearching for potential matches...")
    matches = find_matches(register_records, stone_records)
    
    print(f"\nFound {len(matches)} potential duplicate matches")
    
    print(f"\nGenerating CSV report: {output_path}")
    generate_csv_report(matches, str(output_path))
    
    print("\nReport generation complete!")
    print(f"Report saved to: {output_path}")

if __name__ == '__main__':
    main()

