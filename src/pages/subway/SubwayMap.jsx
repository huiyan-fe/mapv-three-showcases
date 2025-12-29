import {useEffect, useRef} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import * as THREE from 'three';
import * as mapvthree from '@baidumap/mapv-three';
import {setMapStyle} from '../../utils/setMapStyle';
import shanghai_subway_line from './data/shanghai_subway_line3.geojson';
import shanghai_subway_station from './data/shanghai_subway_station3.geojson';
import './SubwayMap.less';
import SubwayLegend from './SubwayLegend';
import SubwayTransferTable from './SubwayTransferTable';

import icon1 from './assets/icons/split_1_1.png';
import icon2 from './assets/icons/split_1_2.png';


// 配置百度地图 AK
mapvthree.BaiduMapConfig.ak = import.meta.env.VITE_BAIDU_MAP_AK;

function SubwayTitle() {
    return (
        <div className="subway-title subway-title-float" style={{display: 'flex', alignItems: 'center'}}>
            <span style={{display: 'inline-block', marginRight: 18, lineHeight: 0}}>
                <svg width="64" height="64" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="8" width="20" height="20" rx="8" fill="#1E90FF" fillOpacity="0.18" />
                    <rect x="12" y="12" width="12" height="12" rx="6" fill="#1E90FF" />
                    <rect x="16" y="22" width="4" height="6" rx="2" fill="#fff" />
                    <circle cx="15" cy="27" r="1.5" fill="#FFD400" />
                    <circle cx="21" cy="27" r="1.5" fill="#FFD400" />
                    <rect x="14" y="16" width="8" height="3" rx="1.5" fill="#fff" />
                </svg>
            </span>
            上海地铁线路地图
        </div>
    );
}

function SubwayPanels() {
    return (
        <div className="subway-panels-vertical">
            <div className="subway-panel-dark"><SubwayTransferTable /></div>
            <div className="subway-panel-dark"><SubwayLegend /></div>
        </div>
    );
}

function SubwayMap() {
    const containerRef = useRef(null);
    const engineRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const engine = new mapvthree.Engine(containerRef.current, {
            map: {
                center: [121.4737, 31.2304], // 上海市中心
                range: 15000,
                pitch: 70,
                provider: null,
                projection: 'ECEF',
            },
            rendering: {
                enableAnimationLoop: true,
                features: {
                    antialias: {
                        method: 'msaa',
                    },
                    bloom: {
                        enabled: true,
                    },
                },
            },
        });

        engineRef.current = engine;
        window.engineRef = engineRef;

        const mapView = engine.add(new mapvthree.MapView({
            terrainProvider: null,
            vectorProvider: new mapvthree.BaiduVectorTileProvider(),
        }));

        setMapStyle(engine, mapView, 'gray');

        // 添加地铁线路
        const line = engine.add(new mapvthree.Polyline({
            flat: true,
            lineWidth: 2,
            keepSize: true,
            color: '#1E90FF',
            vertexColors: true,
        }));
        line.material.depthTest = false;
        mapvthree.GeoJSONDataSource.fromURL(shanghai_subway_line).then(dataSource => {
            dataSource.defineAttribute('color', 'color');
            line.dataSource = dataSource;
        });

        // 添加地铁站点
        const label = engine.add(new mapvthree.Label({
            type: 'icon',
            vertexIcons: true,
        }));
        label.material.depthTest = false;
        mapvthree.GeoJSONDataSource.fromURL(shanghai_subway_station).then(dataSource => {
            dataSource.defineAttribute('icon', properties => {
                if (properties.railway > 2) {
                    return icon2;
                }
                return icon1;
            }).defineAttribute('iconSize', properties => {
                if (properties.railway > 2) {
                    return [18, 18];
                }
                return [12, 12];
            });
            label.dataSource = dataSource;
        });

        // EffectPoint 示例
        const bubble = engine.add(new mapvthree.EffectPoint({
            size: 40,
            color: '#1E90FF',
            opacity: 0.8,
            keepSize: true,
            vertexColors: true,
            vertexSize: true,
        }));
        bubble.material.depthTest = false;

        // EffectModelPoint 示例
        const effect = engine.add(new mapvthree.EffectModelPoint({
            size: 30,
            color: '#FFD400',
            opacity: 1,
            vertexColors: true,
            vertexSize: true,
            keepSize: true,
            animationRotate: true,
        }));

        effect.addEventListener('click', event => {
            engine.map.flyTo(event.entity.value.coordinates, {
                range: 10000,
                duration: 1000,
            });
        });

        mapvthree.GeoJSONDataSource.fromURL(shanghai_subway_station).then(dataSource => {
            dataSource.setFilter(item => {
                return item.attributes.railway > 2;
            });
            dataSource.defineAttribute('bubbleColor', properties => {
                if (properties.railway > 6) {
                    return '#FF0000';
                }
                if (properties.railway > 4) {
                    return '#FFD400';
                }
                return '#1E90FF';
            });
            dataSource.defineAttribute('bubbleSize', properties => {
                if (properties.railway > 4) {
                    return 60;
                }
                return 30;
            });
            dataSource.defineAttribute('effectColor', properties => {
                if (properties.railway > 6) {
                    return new THREE.Color(200, 0.5, 0.5);
                }
                if (properties.railway > 4) {
                    return new THREE.Color(10, 1, 0.5);
                }
                return new THREE.Color(5, 0.5, 1);
            });
            dataSource.defineAttribute('effectSize', properties => {
                if (properties.railway > 4) {
                    return 60;
                }
                return 30;
            });

            bubble.addAttributeRename('color', 'bubbleColor');
            bubble.addAttributeRename('size', 'bubbleSize');
            effect.addAttributeRename('color', 'effectColor');
            effect.addAttributeRename('size', 'effectSize');
            bubble.dataSource = dataSource;
            effect.dataSource = dataSource;
        });

        // // 示例点数据
        // const points = {
        //     type: 'FeatureCollection',
        //     features: [
        //         {
        //             type: 'Feature',
        //             geometry: {type: 'Point', coordinates: [121.4737, 31.2304]},
        //             properties: {size: 20, color: '#1E90FF'},
        //         },
        //         {
        //             type: 'Feature',
        //             geometry: {type: 'Point', coordinates: [121.4837, 31.2404]},
        //             properties: {size: 30, color: '#FFD400'},
        //         },
        //     ],
        // };
        // const dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(points);

        // // 支持根据属性动态设置颜色和大小
        // dataSource.defineAttribute('color', p => p.color || '#1E90FF');
        // dataSource.defineAttribute('size', p => p.size || 20);
        // pointGroup.dataSource = dataSource;

        // 清理函数
        return () => {
            if (engine) {
                engine.dispose();
            }
        };
    }, []);

    return (
        <div className="subway-root-full">
            <div className="showcase-full" ref={containerRef} />
            <SubwayTitle />
            <SubwayPanels />
        </div>
    );
}

export default withSourceCode(SubwayMap);