import React from 'react';
import './SubwayLegend.less';

// 上海地铁线路及配色
const subwayLines = [
    {name: '1号线', color: '#E4002B'},
    {name: '2号线', color: '#B3D465'},
    {name: '3号线', color: '#F7A600'},
    {name: '4号线', color: '#A05EB5'},
    {name: '5号线', color: '#8FC31F'},
    {name: '6号线', color: '#B9DDFF'},
    {name: '7号线', color: '#F26522'},
    {name: '8号线', color: '#009FE8'},
    {name: '9号线', color: '#B5B5B5'},
    {name: '10号线', color: '#9056A1'},
    {name: '11号线', color: '#C60C30'},
    {name: '12号线', color: '#007D65'},
    {name: '13号线', color: '#F2C100'},
    {name: '14号线', color: '#6DC8F1'},
    {name: '15号线', color: '#A98ABA'},
    {name: '16号线', color: '#D6C7A7'},
    {name: '17号线', color: '#FFD400'},
    {name: '18号线', color: '#00B488'},
    {name: '磁浮线', color: '#008ACD'},
    {name: '浦江线', color: '#A3D2A5'},
];

export default function SubwayLegend() {
    return (
        <div className="subway-legend subway-legend-dark">
            <div className="subway-legend-title">地铁线路图例</div>
            <ul>
                {subwayLines.map(line => (
                    <li key={line.name}>
                        <span
                            className="subway-legend-color subway-legend-color-dark"
                            style={{background: line.color}}
                        />
                        <span className="subway-legend-name">{line.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}