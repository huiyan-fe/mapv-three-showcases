/* eslint-disable */
const fs = require('fs');
const path = './shanghai_subway_line3.geojson';

// 上海地铁线路官方配色表（常见线路全）
const colorMap = {
  '上海地铁1号线': '#E4002B',
  '上海地铁2号线': '#B3D465',
  '上海地铁3号线': '#F7A600',
  '上海地铁4号线': '#A05EB5',
  '上海地铁5号线': '#8FC31F',
  '上海地铁6号线': '#B9DDFF',
  '上海地铁7号线': '#F26522',
  '上海地铁8号线': '#009FE8',
  '上海地铁9号线': '#B5B5B5',
  '上海地铁10号线': '#9056A1',
  '上海地铁11号线': '#C60C30',
  '上海地铁12号线': '#007D65',
  '上海地铁13号线': '#F2C100',
  '上海地铁14号线': '#6DC8F1',
  '上海地铁15号线': '#A98ABA',
  '上海轨道交通16号线': '#D6C7A7',
  '上海地铁17号线': '#FFD400',
  '上海地铁18号线': '#00B488',
  '上海磁浮线': '#008ACD',
  '上海浦江线': '#A3D2A5',
};

const geojson = JSON.parse(fs.readFileSync(path, 'utf8'));
geojson.features.forEach(f => {
  const name = f.properties.name;
  if (colorMap[name]) {
    f.properties.color = colorMap[name];
  }
});
fs.writeFileSync(path, JSON.stringify(geojson, null, 2), 'utf8');
console.log('done'); 