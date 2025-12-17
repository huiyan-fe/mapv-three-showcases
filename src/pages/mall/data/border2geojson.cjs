const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, 'border.txt');
const output = path.join(__dirname, 'border.geojson');

const content = fs.readFileSync(input, 'utf-8').trim();
const arr = content.split(',').map(Number);
const coords = [];
for (let i = 0; i < arr.length; i += 2) {
    coords.push([arr[i], arr[i + 1]]);
}
// GeoJSON Polygon 要闭合
if (coords.length && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
    coords.push(coords[0]);
}
const geojson = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [coords],
            },
            properties: {},
        },
    ],
};
fs.writeFileSync(output, JSON.stringify(geojson, null, 2), 'utf-8');
console.log('已生成 border.geojson');