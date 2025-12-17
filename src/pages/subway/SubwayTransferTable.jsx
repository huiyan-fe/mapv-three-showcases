import React, {useEffect, useState} from 'react';
import './SubwayTransferTable.less';
import shanghai_subway_station from './data/shanghai_subway_station3.geojson';

export default function SubwayTransferTable() {
    const [transferStations, setTransferStations] = useState([]);
    const [stationGeoMap, setStationGeoMap] = useState({});
    useEffect(() => {
        let isMounted = true;
        fetch(shanghai_subway_station)
            .then(res => res.json())
            .then(data => {
                const geoMap = {};
                const stations = data.features
                    .filter(f => Number(f.properties.railway) > 2)
                    .map(f => {
                        geoMap[f.properties.name] = f.geometry.coordinates;
                        return {
                            name: f.properties.name,
                            count: Math.round(f.properties.railway / 2),
                        };
                    })
                    .sort((a, b) => b.count - a.count);
                if (isMounted) {
                    setTransferStations(stations);
                    setStationGeoMap(geoMap);
                }
            });
        return () => {
            isMounted = false;
        };
    }, []);

    const handleRowClick = station => {
        const coord = stationGeoMap[station.name];
        if (coord && window.engineRef && window.engineRef.current && window.engineRef.current.map) {
            window.engineRef.current.map.flyTo(coord, {
                duration: 1000,
                range: 5000,
            });
        }
    };

    return (
        <div className="subway-transfer-table-wrap subway-transfer-table-dark">
            <div className="subway-legend-table-title">换乘站（按换乘线路数排序）</div>
            <div className="subway-transfer-table-scroll">
                <table className="subway-legend-table subway-legend-table-dark">
                    <thead>
                        <tr><th>站名</th><th>换乘线路数</th></tr>
                    </thead>
                    <tbody>
                        {transferStations.map(station => (
                            <tr key={station.name} onClick={() => handleRowClick(station)} style={{cursor: 'pointer'}}>
                                <td>{station.name}</td>
                                <td>{station.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}