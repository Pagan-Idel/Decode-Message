import axios from 'axios';
import { JSDOM } from 'jsdom';

interface GridItem {
    x: number;
    y: number;
    char: string;
}

async function decodeMessage(url: string): Promise<void> {
    try {
        // Fetch the data from the URL
        const response = await axios.get(url);
        const html: string = response.data;

        // Parse the HTML content and extract the table rows
        const dom = new JSDOM(html);
        const rows = dom.window.document.querySelectorAll('table tr');

        // Extract grid data from the table
        const gridData: GridItem[] = Array.from(rows).slice(1).map((row) => {
            const cells = row.querySelectorAll('td');
            const x = parseInt(cells[0]?.textContent?.trim() || '', 10);
            const char = cells[1]?.textContent?.trim() || '';
            const y = parseInt(cells[2]?.textContent?.trim() || '', 10);

            if (isNaN(x) || isNaN(y) || !char) {
                throw new Error(`Invalid table row: ${row.textContent}`);
            }

            return { x, y, char };
        });

        // Determine the dimensions of the grid
        const maxX: number = Math.max(...gridData.map((item: GridItem) => item.x));
        const maxY: number = Math.max(...gridData.map((item: GridItem) => item.y));

        // Create an empty grid filled with spaces
        const grid: string[][] = Array.from({ length: maxY + 1 }, () =>
            Array(maxX + 1).fill(' ')
        );

        // Populate the grid with the characters
        gridData.forEach(({ x, y, char }: GridItem) => {
            if (grid[y] && grid[y][x] !== undefined) {
                grid[y][x] = char;
            } else {
                throw new Error(`Coordinates out of bounds: x=${x}, y=${y}`);
            }
        });

        // Print the grid row by row
        grid.forEach((row: string[]) => {
            console.log(row.join(''));
        });
    } catch (error) {
        console.error('Error fetching or processing data:', error);
    }
}

// Example usage
decodeMessage('https://docs.google.com/document/d/e/2PACX-1vQGUck9HIFCyezsrBSnmENk5ieJuYwpt7YHYEzeNJkIb9OSDdx-ov2nRNReKQyey-cwJOoEKUhLmN9z/pub');
