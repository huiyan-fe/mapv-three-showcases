import React from 'react';
import HeatmapPanel from '../panels/HeatmapPanel';
import * as mapvthree from '@baidumap/mapv-three';
import heatmapData from '../data/heatmap.csv';

function HeatmapModule({engine}) {
    React.useEffect(() => {
        if (!engine) {
            return;
        }
        // 切换视角到默认
        engine.map.flyTo([113.33111353, 23.1367952], {
            range: 2000,
            pitch: 60,
            duration: 2000,
        });
        // const dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(mockData);
        // dataSource.defineAttribute('count', 'value');
        const heatmap = engine.add(new mapvthree.Heatmap({
            radius: 800,
            maxValue: 1000,
            opacity: 0.6,
            gradient: {
                0.0: '#00f',
                0.5: '#0ff',
                0.7: '#ff0',
                1.0: '#f00',
            },
            keepSize: false,
        }));
        heatmap.material.depthTest = false;

        mapvthree.CSVDataSource.fromURL(heatmapData, {
            // parseCoordinates: item => {
            //     return [parseFloat(item.lon, 10), parseFloat(item.lat, 10)];
            // },
            parseFeature: item => {
                return new mapvthree.DataItem([parseFloat(item.lon, 10), parseFloat(item.lat, 10)], {
                    count: parseInt(item.count, 10),
                    crs: mapvthree.PROJECTION_BD_MERCATOR,
                });
            },
        }).then(dataSource => {
            dataSource.defineAttribute('count', properties => parseInt(properties.count, 10));
            console.log(dataSource);
            heatmap.dataSource = dataSource;
        });

        return () => {
            engine.remove(heatmap);
        };
    }, [engine]);
    return <HeatmapPanel />;
}
export default HeatmapModule;