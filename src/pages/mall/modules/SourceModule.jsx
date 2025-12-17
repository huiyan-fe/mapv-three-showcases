import React from 'react';
import * as THREE from 'three';
import SourcePanel from '../panels/SourcePanel';
import * as mapvthree from '@baidumap/mapv-three';
import sourceData from '../data/source.json?url';
import FloatingPanel from '../components/FloatingPanel';
import PanelLayout from '../components/PanelLayout';
import SourceTable from '../components/SourceTable';

const mallCenter = [113.33111353, 23.1367952];
const mockLines = [
    {from: [113.20, 23.10], to: mallCenter},
    {from: [113.30, 23.18], to: mallCenter},
    {from: [113.25, 23.09], to: mallCenter},
    {from: [113.28, 23.13], to: mallCenter},
];

function SourceModule({engine}) {
    const [tableData, setTableData] = React.useState([]);

    React.useEffect(() => {
        if (!engine) {
            return;
        }
        // 切换视角到默认
        engine.map.flyTo([113.33111353, 23.1367952], {
            range: 80000,
            pitch: 60,
            duration: 2000,
        });

        let line = null;
        let flyline = null;
        let text = null;
        let bubblePoint = null;
        fetch(sourceData).then(res => res.json()). then(res => {
            const lineData = [];
            const pointData = [];
            res.forEach((l, i) => {
                const a = engine.map.unprojectArrayCoordinate(l.center);
                lineData.push({
                    type: 'Feature',
                    geometry: {type: 'LineString', coordinates: [a, mallCenter]},
                    properties: {
                        text: l.name,
                        value: l.rate,
                    },
                });
                pointData.push({
                    type: 'Feature',
                    geometry: {type: 'Point', coordinates: a},
                    properties: {
                        text: l.name,
                        value: l.rate,
                    },
                });
            });
            const dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON({
                type: 'FeatureCollection',
                features: lineData,
            });
            line = engine.add(new mapvthree.Polyline({
                flat: true,
                color: '#218822',
                lineWidth: 4,
                opacity: 0.7,
                isCurve: true,
                keepSize: true,
            }));
            line.material.depthTest = false;
            line.material.side = THREE.DoubleSide;
            line.material.blending = THREE.AdditiveBlending;
            line.dataSource = dataSource;

            flyline = engine.add(
                new mapvthree.Polyline({
                    flat: true,
                    isCurve: true,
                    color: new THREE.Color(80, 10, 0.2),
                    lineWidth: 3,
                    keepSize: true,
                    transparent: true,
                    opacity: 0.5,
                    enableAnimation: true, // 是否开启线动画
                    animationInterval: 2,
                    // enableAnimationChaos: true, // 是否开启不规则动画
                    animationTailType: 1, // 动画类型，1按线长度比例，需设置`animationTailRatio`属性，2按固定长度，需设置`animationTailLength`属性
                    animationSpeed: 50,
                    animationIdle: 0, // 拖尾动画间隔时间
                })
            );
            flyline.material.depthTest = false;
            flyline.material.side = THREE.DoubleSide;
            flyline.material.blending = THREE.AdditiveBlending;
            flyline.dataSource = dataSource;

            const pointDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON({
                type: 'FeatureCollection',
                features: pointData,
            });
            text = engine.add(new mapvthree.Label({
                type: 'text',
                pixelOffset: [0, -30],
                color: '#ccc',
            }));
            pointDataSource.defineAttribute('text', 'text');
            pointDataSource.defineAttribute('bubbleColor', properties => {
                const value = properties.value;
                if (value > 0.1) {
                    return '#ff3300';
                }
                else if (value > 0.03) {
                    return '#ff9900';
                }
                return '#0088cc';

            });
            text.dataSource = pointDataSource;

            bubblePoint = engine.add(new mapvthree.EffectPoint({
                color: '#ccc',
                opacity: 0.5,
                keepSize: true,
                size: 60,
                type: 'RadarSpread',
                vertexColors: true,
            }));
            bubblePoint.material.depthTest = false;
            bubblePoint.addAttributeRename('color', 'bubbleColor');
            bubblePoint.dataSource = pointDataSource;

        });
        return () => {
            engine.remove(line);
            engine.remove(flyline);
            engine.remove(text);
            engine.remove(bubblePoint);
        };
    }, [engine]);

    // 新增：单独 fetch 一遍 sourceData 用于表格
    React.useEffect(() => {
        fetch(sourceData)
            .then(res => res.json())
            .then(data => {
                setTableData(data);
            });
    }, []);

    return (
        <PanelLayout side="right" width={280} style={{height: '100%'}}>
            <FloatingPanel title="客流来源" contentStyle={{maxHeight: '70vh', overflowY: 'auto'}}>
                <SourceTable data={tableData} />
            </FloatingPanel>
        </PanelLayout>
    );
}
export default SourceModule;