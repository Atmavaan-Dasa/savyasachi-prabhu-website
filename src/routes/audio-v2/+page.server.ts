/** @type {import('./$types').PageLoad} */

export const ssr = false;
export async function load() {
	const response = await fetch('https://savyasachidas.com/output.json');

	const jsonData = await response.json();

	return {
		data: jsonData
	};
}
// import { readFileSync } from 'fs';

// export async function load() {
// 	const jsonData = readFileSync('static/output.json', 'utf8');
// 	const data = JSON.parse(jsonData);

// 	return {
// 		data
// 	};
// }
