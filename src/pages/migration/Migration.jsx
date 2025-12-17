import {useEffect, useRef, useState} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import * as THREE from 'three';
import * as mapvthree from '@baidumap/mapv-three';
import moveoutData from './data/moveout.json';
import moveinData from './data/movein.json';
import {getCenterByCityName} from './cityCenter';
import './Migration.less';
import {setMapStyle} from '../../utils/setMapStyle';

let engine;
let line;
let flyline;
let bubblePoint;
let text;
let bjLnglat = getCenterByCityName('北京');

function Migration() {
    const containerRef = useRef(null);
    const [activeTab, setActiveTab] = useState('moveout'); // 默认显示迁出
    const listRef = useRef(null);

    const handleTabClick = tab => {
        setActiveTab(tab);
        if (listRef.current) {
            listRef.current.scrollTop = 0;
        }
    };

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        engine = window.engine = new mapvthree.Engine(containerRef.current, {
            map: {
                center: [116.5707569881548, 37.63299835393271],
                range: 8000000,
                pitch: 40,
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

        const mapView = engine.add(new mapvthree.MapView({
            terrainProvider: null,
            vectorProvider: new mapvthree.BaiduVectorTileProvider(),
        }));

        // 设置地图主题相关的颜色，包含天空，地图背景，地图样式
        setMapStyle(engine, mapView, 'gray');

        line = engine.add(
            new mapvthree.Polyline({
                isCurve: true,
                color: new THREE.Color(0.1, 4, 5),
                transparent: true,
                opacity: 0.8,
                lineWidth: 2,
            })
        );
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
                animationSpeed: 1000,
                animationIdle: 0, // 拖尾动画间隔时间
            })
        );
        line.material.depthTest = false;
        line.material.side = THREE.DoubleSide;
        line.material.blending = THREE.AdditiveBlending;
        flyline.material.side = THREE.DoubleSide;
        flyline.material.blending = THREE.AdditiveBlending;

        text = engine.add(new mapvthree.Label({
            type: 'text',
            pixelOffset: [0, -30],
            // color: '#ccc',
            textSize: 12,
        }));

        bubblePoint = engine.add(new mapvthree.EffectPoint({
            opacity: 0.5,
            keepSize: true,
            size: 60,
            vertexColors: true,
            vertexSizes: true,
        }));
        bubblePoint.material.depthTest = false;

        const effectModelPoint = engine.add(new mapvthree.EffectModelPoint({
            size: 50,
            normalize: true,
            rotateToZUp: true,
            // keepSize: true,
            animationJump: true,
            animationRotate: true,
        }));
        const bjDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON([{
            geometry: {
                type: 'Point',
                coordinates: bjLnglat,
            },
        }]);
        effectModelPoint.dataSource = bjDataSource;

        // 清理函数
        return () => {
            if (engine) {
                engine.dispose();
            }
        };
    }, []);

    useEffect(() => {
        if (engine && line && flyline && bubblePoint && text) {
            flyline.color = activeTab === 'moveout' ? new THREE.Color(80, 10, 0.2) : new THREE.Color(80, 0.2, 10);
            const data = activeTab === 'moveout' ? moveoutData : moveinData;

            let points = [];
            let lines = [];
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                const lnglat = getCenterByCityName(item.province_name);
                points.push({
                    geometry: {
                        type: 'Point',
                        coordinates: lnglat,
                    },
                    properties: {
                        text: item.province_name,
                        value: item.value,
                    },
                });
                lines.push({
                    geometry: {
                        type: 'LineString',
                        coordinates: activeTab === 'moveout' ? [bjLnglat, lnglat] : [lnglat, bjLnglat],
                    },
                });
            }
            const pointDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(points);
            pointDataSource.defineAttribute('text', 'text');
            pointDataSource.defineAttribute('bubbleColor', properties => {
                const value = properties.value;
                if (value > 10) {
                    return '#ff3300';
                }
                else if (value > 5) {
                    return '#ff9900';
                }
                return '#00aa66';
            }).defineAttribute('size', properties => {
                if (properties.value > 10) {
                    return 80;
                }
                else if (properties.value > 5) {
                    return properties.value * 8;
                }
                return Math.max(properties.value * 12, 15);
            });
            bubblePoint.addAttributeRename('color', 'bubbleColor');
            bubblePoint.dataSource = pointDataSource;
            text.dataSource = pointDataSource;

            const lineDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(lines);
            line.dataSource = lineDataSource;
            flyline.dataSource = lineDataSource;
        }
    }, [activeTab]);

    return (
        <div className="showcase" ref={containerRef}>
            <div className="showcase-title">
                <h1>2025年除夕北京人口迁徙图</h1>
                <h3>Beijing Migration Trends on Lunar New Year&apos;s Eve 2025</h3>
            </div>
            {/* 右侧面板 */}
            <div className="migration-sidebar">
                <div className="migration-tabs">
                    <div
                        className={activeTab === 'moveout' ? 'tab active' : 'tab'}
                        onClick={() => handleTabClick('moveout')}
                    >
                        迁出
                    </div>
                    <div
                        className={activeTab === 'movein' ? 'tab active' : 'tab'}
                        onClick={() => handleTabClick('movein')}
                    >
                        迁入
                    </div>
                </div>
                <div className="migration-list-header">
                    <span className="province">省份</span>
                    <span className="value">迁徙指数</span>
                </div>
                <div className="migration-list" ref={listRef}>
                    {(activeTab === 'moveout' ? moveoutData : moveinData).map(item => (
                        <div className="migration-list-item" key={item.province_name}>
                            <span className="province">{item.province_name}</span>
                            <span className="value">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default withSourceCode(Migration);