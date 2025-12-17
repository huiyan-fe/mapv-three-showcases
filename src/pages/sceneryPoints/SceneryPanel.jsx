import React, {useEffect, useState} from 'react';
import './SceneryPanel.less';
import geojsonUrl from './data/bj_park2.geojson';

function SceneryPanel({showType, setShowType, onRowClick}) {
    const [tableData, setTableData] = useState([]);

    const handleRowClick = item => {
        if (onRowClick) {
            onRowClick(item);
        }
    };

    useEffect(() => {
        fetch(geojsonUrl)
            .then(res => res.json())
            .then(data => {
                const features = data.features || [];
                const sorted = features
                    .map(f => {
                        f.properties.center = f.geometry.coordinates;
                        return f;
                    })
                    .map(f => f.properties)
                    .filter(p => p && typeof p.area3 === 'number')
                    .sort((a, b) => b.area3 - a.area3)
                    .slice(0, 50);
                setTableData(sorted);
            });
    }, []);

    return (
        <div className="scenery-side-panel">
            <div className="scenery-side-panel-btns">
                <button
                    className={showType === 'label' ? 'active' : ''}
                    onClick={() => setShowType('label')}
                >
                    景点位置
                </button>
                <button
                    className={showType === 'polygon' ? 'active' : ''}
                    onClick={() => setShowType('polygon')}
                >
                    景点区域
                </button>
            </div>
            <div className="scenery-side-panel-table">
                <table>
                    <thead>
                        <tr>
                            <th>名称</th>
                            <th>面积(k㎡)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item, idx) => (
                            <tr
                                key={item.full_id || idx}
                                onClick={() => handleRowClick(item)}
                                style={{cursor: 'pointer'}}
                            >
                                <td title={item.name}>{item.name}</td>
                                <td>{(item.area3 / 1000000).toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SceneryPanel;