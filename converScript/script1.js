const fs = require('fs');
const { JSDOM } = require('jsdom');

// Function to parse HTML table and extract data
function parseHTMLTable(htmlString) {
    console.log('Parsing HTML content...');
    console.log('HTML content:', htmlString);

    // Wrap the provided HTML rows in a complete table structure
    const completeHtmlString = `<table>${htmlString}</table>`;

    const dom = new JSDOM(completeHtmlString);
    const document = dom.window.document;
    const rows = document.querySelectorAll('tr');

    const data = Array.from(rows).map((row, rowIndex) => {
        console.log(`Processing row ${rowIndex + 1}...`);
        const cells = row.querySelectorAll('td');

        cells.forEach((cell, cellIndex) => {
            console.log(`Row ${rowIndex + 1}, Cell ${cellIndex + 1}:`, cell.innerHTML);
        });

        // Clean the details field to remove @unheard
        let details = cells[4].textContent.trim();
        details = details.replace('@unheard', '').trim();
        // Split details into an array of words
        const detailsArray = details.split(' ');

        // Ensure audioLink is HTTPS
        let audioLink = cells[5].textContent.trim();
        if (audioLink.startsWith('http://')) {
            audioLink = audioLink.replace('http://', 'https://');
        }

        // Extract the title from the anchor tag, removing button HTML
        let title = cells[1].querySelector('a').innerHTML;
        title = title.replace(/<button[^>]*>.*?<\/button>/, '').trim();

        // Extract the YouTube link if present and check if it exists
        let youtubeLink = '';
        const youtubeAnchor = row.querySelector('a[href*="youtube.com"]');
        if (youtubeAnchor) {
            youtubeLink = youtubeAnchor.href;
        }
        const youtubeLinkExists = youtubeLink !== '';

        const rowData = {
            Id: cells[6].textContent.trim(),
            title: title,
            duration: parseInt(cells[2].textContent.trim(), 10),
            date: cells[3].textContent.trim(),
            details: detailsArray, // Use the array of words for details
            audioLink: audioLink,
            sortId: cells[7].textContent.trim(),
            youtubeLink: youtubeLink,
            youtubeLinkExists: youtubeLinkExists,
            loading: false
        };

        console.log(`Row ${rowIndex + 1} data:`, rowData);
        return rowData;
    });

    console.log('Finished parsing HTML content.');
    return data;
}

// Main function to read input file, parse data, and write to output file
function processHTMLFile(inputFilePath, outputFilePath) {
    console.log('Reading input file:', inputFilePath);
    fs.readFile(inputFilePath, 'utf8', (err, htmlString) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        console.log('Input file read successfully.');
        console.log('Input file content:', htmlString);
        const data = parseHTMLTable(htmlString);

        console.log('Writing data to output file:', outputFilePath);
        fs.writeFile(outputFilePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('Data successfully written to', outputFilePath);
            }
        });
    });
}

// Example usage
const inputFilePath = 'index1.html'; // Path to the input HTML file
const outputFilePath = 'output.json'; // Path to the output JSON file

processHTMLFile(inputFilePath, outputFilePath);