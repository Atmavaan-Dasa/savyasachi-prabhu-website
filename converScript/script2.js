

const fs = require('fs');
const xlsx = require('node-xlsx');

// Function to replace &lt; with < and split the "Less Than" field
const processLessThanField = (lessThanStr) => {
    if (!lessThanStr) return [];
    return lessThanStr.split(/\s+/).map(str => str.replace(/&lt;/g, '<').trim());
};

// Load the Excel file
const workSheets = xlsx.parse(fs.readFileSync('input.xlsx'));

// Combine all sheets into one array
let combinedData = [];

// Read all sheets and combine data
workSheets.forEach(sheet => {
    const headers = sheet.data[0]; // First row contains headers
    const sheetData = sheet.data.slice(1); // Data without headers

    sheetData.forEach(row => {
        let rowData = {};
        row.forEach((cell, index) => {
            rowData[headers[index]] = cell;
        });
        combinedData.push(rowData);
    });
});

// Filter out rows where 'Link MP3' is null or undefined
combinedData = combinedData.filter(row => row['Link MP3'] !== null && row['Link MP3'] !== undefined);

console.log(combinedData.slice(0,10));

//Convert the combined data to the desired format
const output = combinedData.map(row => {
    const hindiTitle = row['Composer'];
    const englishTitle = row['Artist'];
    const duration = parseInt(row['Min'], 10);
    const lessThan = processLessThanField(row['Less Than']);

    const dateStr = `${row['YYYY']}-${row['MM']}-${row['DD']}`;

const tdate = new Date(dateStr);

// Check if date is valid
const isValidDate = !isNaN(tdate) && 
                    tdate.getFullYear() == row['YYYY'] && 
                    (tdate.getMonth() + 1) == row['MM'] && 
                    tdate.getDate() == row['DD'];

// If valid, keep the date string; if invalid, set to null
const date = isValidDate ? dateStr : null;
    let audioLink = row['Link MP3'] 

    if (audioLink.startsWith('http://')) {
        audioLink = audioLink.replace('http://', 'https://');
    }

    const shastra = row['Album'] || null;

    const chapter = row['Ch Num'] || null;
    const shloka = row['Slok Num'] || null;

    const canto = row['Canto Num'] || null

    const  location = row['Conductor'] != 'x' ? row['Conductor'] : null;

    const language = row['Genre'] || null;



    return {
        Id: row['Track'],
        title: `${hindiTitle || ''} ${englishTitle || ''}`,
        duration: duration,
        date: date,
        dateStr:`${row['Mon']} ${row['YYYY']}`,
        year: `${row['YYYY']}`,
        location: location,
        language: language,
        shastra: shastra,
        canto: canto,
        chapter: chapter,
        shloka: shloka,
        details: [
            ...(englishTitle ? englishTitle.split(' ') : []), // Spread the array elements
            ...(hindiTitle ? hindiTitle.split(' ') : []), // Spread the array elements
         row['Discnumber'],
           ( (chapter && shloka) && `${chapter}.${shloka}`),
          (chapter && `${chapter}`),
          (shloka && `${shloka}`),
          `${row['Mon']}`,
            `yr:${date}`,
            `ct:${shastra}`,
            `L:${row['Genre']}`,
            `cty:${row['Conductor']}` ,
            ...lessThan,
        ].filter(item => item),
        audioLink: audioLink,
        sortId: row['SortCode (AlbumArtist)'],
        youtubeLink: row['YT Link'] || "",
        youtubeLinkExists: !!row['YT Link'],
        loading: false
    };
});



// Write the output to a JS file
const outputString = ` export const data = ${JSON.stringify(output, null, 2)};`;

fs.writeFileSync('../src/lib/utils/output.js', outputString);

console.log('Data has been processed and saved to output.js');
