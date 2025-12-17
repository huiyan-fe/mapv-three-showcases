const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, 'heatmap.csv');
const output = path.join(__dirname, 'heatmap_gz.csv');

// 广州百度墨卡托边界（用户指定）
const minX = 12575327.54;
const maxX = 12697882.78;
const minY = 2557645.79;
const maxY = 2728559.07;

const content = fs.readFileSync(input, 'utf-8');
const points = content.split('\n');
const filtered = points.filter(row => {
    const [x, y] = row.split(',').map(Number);
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
});
fs.writeFileSync(output, filtered.join('\n'), 'utf-8');
console.log(`过滤后广州范围内点数: ${filtered.length}`);