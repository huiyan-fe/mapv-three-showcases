import {useEffect, useRef, useState} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import * as THREE from 'three';
import * as mapvthree from '@baidumap/mapv-three';
import {setMapStyle} from '../../utils/setMapStyle';
import geojson from './data/bj_park2.geojson';
import geojson_area from './data/bj_park_area3.geojson';
import './SceneryMap.less';
import icon11 from './assets/icons/split_1_1.png';
import icon12 from './assets/icons/split_1_2.png';
import icon13 from './assets/icons/split_1_3.png';
import icon14 from './assets/icons/split_1_4.png';
import icon21 from './assets/icons/split_2_1.png';
import icon22 from './assets/icons/split_2_2.png';
import icon23 from './assets/icons/split_2_3.png';
import icon24 from './assets/icons/split_2_4.png';
import icon31 from './assets/icons/split_3_1.png';
import icon32 from './assets/icons/split_3_2.png';
import icon33 from './assets/icons/split_3_3.png';
import icon34 from './assets/icons/split_3_4.png';
import icon41 from './assets/icons/split_4_1.png';
import icon42 from './assets/icons/split_4_2.png';
import icon43 from './assets/icons/split_4_3.png';
import icon44 from './assets/icons/split_4_4.png';
import SceneryPanel from './SceneryPanel';

const textIds = [
    'w33616744', // 奥林匹克森林公园
    'w14549539', // 奥林匹克公园
    'w24824550', // 天坛公园
    'w29228773', // 颐和园
    'w29222903', // 玉渊潭公园
    'w30725406', // 紫竹院公园
    'w29201967', // 景山公园
    'w233205070', // 朝阳公园
    'w312174169', // 南海子公园（大兴，南五环外，超大湿地公园）
    'w231113730', // 大运河森林公园（通州，东五环外，超大带状公园）
    'w839541310', // 沙河湿地公园（昌平，北五环外，超大湿地）
    'w755582017', // 东郊湿地公园（朝阳东北，五环外，面积很大）
    'w683654778', // 北京世园公园（延庆，远郊，举办过世园会）
];
function SceneryMap() {
    const containerRef = useRef(null);
    const [showType, setShowType] = useState('label'); // 'label' or 'polygon'
    const [tableData, setTableData] = useState([]);
    const polygonRef = useRef(null);
    const labelRef = useRef(null);
    const engineRef = useRef(null);

    // 初始化地图和图层，只执行一次
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const engine = new mapvthree.Engine(containerRef.current, {
            map: {
                center: [116.404, 39.915],
                range: 100000,
                pitch: 60,
                provider: null,
                projection: 'ECEF',
            },
            rendering: {
                enableAnimationLoop: true,
                sky: null,
            },
        });
        engineRef.current = engine;

        const mapView = engine.add(new mapvthree.MapView({
            terrainProvider: null,
            vectorProvider: new mapvthree.BaiduVectorTileProvider(),
        }));

        setMapStyle(engine, mapView, 'gray');

        const polygon = engine.add(
            new mapvthree.Polygon({
                type: 'polygon',
                opacity: 0.8,
                color: new THREE.Color(0.1, 0.2, 0.2),
            })
        );
        polygon.material.depthTest = false;
        polygon.material.transparent = true;
        polygon.renderOrder = 1;
        polygon.visible = showType === 'polygon';
        polygonRef.current = polygon;

        const line = engine.add(
            new mapvthree.Polyline({
                flat: true,
                lineWidth: 4,
                opacity: 0.1,
                color: new THREE.Color(0.5, 0.6, 0.6),
            })
        );
        line.renderOrder = 1;

        mapvthree.GeoJSONDataSource.fromURL(geojson_area).then(dataSource => {
            polygon.dataSource = dataSource;
        });

        const label = engine.add(
            new mapvthree.Label({
                type: 'icontext',
                vertexIcons: true,
                textSize: 14,
            })
        );
        label.renderOrder = 2;
        label.material.depthTest = false;
        label.material.transparent = true;
        label.visible = showType === 'label';
        labelRef.current = label;
        mapvthree.GeoJSONDataSource.fromURL(geojson).then(dataSource => {
            dataSource.defineAttribute('icon', properties => {
                if (properties.area3 > 5000000) {
                    return icon22;
                }
                else if (properties.area3 > 3000000) {
                    return icon24;
                }
                else if (properties.area3 > 1000000) {
                    return icon14;
                }
                else if (properties.area3 > 500000) {
                    return icon33;
                }
                return icon11;
            }).defineAttribute('iconSize', properties => {
                if (properties.area3 > 5000000) {
                    return [28, 32];
                }
                else if (properties.area3 > 3000000) {
                    return [20, 24];
                }
                else if (properties.area3 > 1000000) {
                    return [14, 16];
                }
                return [6, 6];
            }).defineAttribute('text', properties => {
                if (textIds.includes(properties.full_id)) {
                    return properties.name;
                }
                return '';
            }).defineAttribute('textOffset', () => {
                return [0, -80];
            }).defineAttribute('area3');
            label.dataSource = dataSource;
        });

        label.addEventListener('click', event => {
            console.log(event);
        });
        // 清理函数
        return () => {
            if (engine) {
                engine.dispose();
            }
        };
    }, []);

    // 只在showType变化时切换visible属性
    useEffect(() => {
        if (polygonRef.current) {
            polygonRef.current.visible = showType === 'polygon';
        }
        if (labelRef.current) {
            labelRef.current.visible = showType === 'label';
        }
    }, [showType]);

    // 新增：点击表格行时地图flyTo
    const handleRowClick = item => {
        console.log(item);
        if (!item || !item.center) {
            return;
        }
        // center为[经度, 纬度]，mapvthree的flyTo为[经度, 纬度, 高度?]
        if (engineRef.current) {
            // 兼容center为字符串或数组
            let center = item.center;
            if (typeof center === 'string') {
                center = center.split(',').map(Number);
            }
            if (Array.isArray(center) && center.length >= 2) {
                engineRef.current.map.flyTo(center, {
                    range: 4000,
                    duration: 1200,
                });
            }
        }
    };

    return (
        <>
            <div className="showcase" ref={containerRef}>
                <div className="showcase-title park-title">
                    <span style={{verticalAlign: 'middle', display: 'inline-block', marginRight: 10}}>
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 36 36"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{verticalAlign: 'middle'}}
                        >
                            <ellipse cx="18" cy="26" rx="10" ry="4" fill="#43e97b" fillOpacity="0.25" />
                            <circle cx="18" cy="16" r="8" fill="url(#treeGradient)" />
                            <rect x="16" y="20" width="4" height="8" rx="2" fill="#7c5c36" />
                            <defs>
                                <linearGradient
                                    id="treeGradient"
                                    x1="10"
                                    y1="8"
                                    x2="26"
                                    y2="24"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="#43e97b" />
                                    <stop offset="1" stopColor="#38f9d7" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </span>
                    北京市公园分布
                </div>
            </div>
            <SceneryPanel showType={showType} setShowType={setShowType} onRowClick={handleRowClick} />
        </>
    );
}

export default withSourceCode(SceneryMap);