const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(__dirname, 'polygon.txt');
const outputPath = path.resolve(__dirname, 'polygon.wkt');

const txt = fs.readFileSync(inputPath, 'utf-8').trim();

// 解析为数字数组
const arr = txt.split(',').map(Number);

if (arr.length % 2 !== 0) {
    throw new Error('经纬度数量不是偶数！');
}

const coords = [];
for (let i = 0; i < arr.length; i += 2) {
    coords.push(`${arr[i]} ${arr[i + 1]}`);
}

const wkt = `POLYGON((${coords.join(', ')}))`;

fs.writeFileSync(outputPath, wkt, 'utf-8');
console.log('转换完成，结果已写入：', outputPath);