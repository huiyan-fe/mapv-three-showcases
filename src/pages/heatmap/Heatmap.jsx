import {useEffect, useRef, useState} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
// import * as THREE from 'three';
import * as mapvthree from '@baidumap/mapv-three';
import {setMapStyle} from '../../utils/setMapStyle';
import './Heatmap.less';
import mockData from './mock.json';

// 配置百度地图 AK
mapvthree.BaiduMapConfig.ak = import.meta.env.VITE_BAIDU_MAP_AK;

let engine;
let dataSource;

function Heatmap() {
    const containerRef = useRef(null);
    const [currentMode, setCurrentMode] = useState('heatmap');

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const initMap = () => {
            engine = window.engine = new mapvthree.Engine(containerRef.current, {
                map: {
                    center: [114.29661124393206, 30.5758323714401, 0],
                    range: 80000,
                    pitch: 60,
                    provider: null,
                    // projection: 'ECEF',
                },
                rendering: {
                    enableAnimationLoop: true,
                    features: {
                        antialias: {
                            method: 'msaa',
                            enabled: false,
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
            setMapStyle(engine, mapView, 'yanmou');

            dataSource = mapvthree.JSONDataSource.fromJSON(mockData, {
                parseCoordinates: item => {
                    return {
                        type: 'Point',
                        coordinates: [item.x, item.y],
                    };
                },
            });
            dataSource.defineAttribute('count', 'num')
                .defineAttribute('height', p => p.num * 50)
                .defineAttribute('size', p => Math.min(Math.max(p.num * 10, 50), 500));
        };

        initMap();

        // 清理函数
        return () => {
            if (engine) {
                engine.dispose();
            }
        };
    }, []);

    useEffect(() => {
        if (!engine || !dataSource) {
            return;
        }

        let heatmap;
        if (currentMode === 'heatmap') {
            heatmap = engine.add(new mapvthree.Heatmap({
                maxValue: 50,
                radius: 400,
                gradient: {
                    0.0: 'rgba(0, 32, 96, 0.8)',
                    0.25: 'rgba(0, 104, 201, 0.8)',
                    0.5: 'rgba(0, 200, 255, 0.8)',
                    0.75: 'rgba(255, 165, 0, 0.8)',
                    1.0: 'rgba(255, 69, 0, 0.9)',
                },
            }));
            heatmap.material.depthTest = false;
        }
        else if (currentMode === 'heatmap3d') {
            heatmap = engine.add(new mapvthree.Heatmap3D({
                maxValue: 150,
                radius: 250,
                heightRatio: 1500,
                opacity: 0.6,
                gradient: {
                    0.0: 'rgba(0, 32, 96, 0.8)',
                    0.25: 'rgba(0, 104, 201, 0.8)',
                    0.5: 'rgba(0, 200, 255, 0.8)',
                    0.75: 'rgba(255, 165, 0, 0.8)',
                    1.0: 'rgba(255, 69, 0, 0.9)',
                },
            }));
        }
        else if (currentMode === 'pillar') {
            heatmap = engine.add(new mapvthree.Pillar({
                radius: 100,
                vertexHeights: true,
                opacity: 0.6,
                gradient: {
                    0.0: 'rgba(0, 32, 96, 0.8)',
                    0.25: 'rgba(0, 104, 201, 0.8)',
                    0.5: 'rgba(0, 200, 255, 0.8)',
                    0.75: 'rgba(255, 165, 0, 0.8)',
                    1.0: 'rgba(255, 69, 0, 0.9)',
                },
            }));
        }
        else if (currentMode === 'cone') {
            heatmap = engine.add(new mapvthree.Pillar({
                shape: 'cone',
                radialSegments: 16,
                vertexSizes: true,
                vertexHeights: true,
                opacity: 0.7,
                gradient: {
                    0.0: 'rgba(0, 32, 96, 0.8)',
                    0.25: 'rgba(0, 104, 201, 0.8)',
                    0.5: 'rgba(0, 200, 255, 0.8)',
                    0.75: 'rgba(255, 165, 0, 0.8)',
                    1.0: 'rgba(255, 69, 0, 0.9)',
                },
            }));
        }

        heatmap.dataSource = dataSource;

        return () => {
            if (heatmap) {
                engine.remove(heatmap);
            }
        };
    }, [currentMode]);

    const handleModeChange = mode => {
        setCurrentMode(mode);
    };

    return (
        <div className="showcase" ref={containerRef}>
            <div className="heatmap-header">
                <h1 className="heatmap-title">武汉市人口热力</h1>
                <div className="mode-switcher">
                    <button
                        className={`mode-btn ${currentMode === 'heatmap' ? 'active' : ''}`}
                        onClick={() => handleModeChange('heatmap')}
                    >
                        2D热力
                    </button>
                    <button
                        className={`mode-btn ${currentMode === 'heatmap3d' ? 'active' : ''}`}
                        onClick={() => handleModeChange('heatmap3d')}
                    >
                        3D热力
                    </button>
                    <button
                        className={`mode-btn ${currentMode === 'pillar' ? 'active' : ''}`}
                        onClick={() => handleModeChange('pillar')}
                    >
                        热力柱
                    </button>
                    <button
                        className={`mode-btn ${currentMode === 'cone' ? 'active' : ''}`}
                        onClick={() => handleModeChange('cone')}
                    >
                        热力锥
                    </button>
                </div>
            </div>

            <div className="legend-container">
                <div className="legend-title">人口指数</div>
                <div className="legend-items">
                    <div className="legend-item">
                        <div className="legend-color" style={{backgroundColor: 'rgba(0, 32, 96, 0.8)'}}></div>
                        <span className="legend-label">极低</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{backgroundColor: 'rgba(0, 104, 201, 0.8)'}}></div>
                        <span className="legend-label">低</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{backgroundColor: 'rgba(0, 200, 255, 0.8)'}}></div>
                        <span className="legend-label">中</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{backgroundColor: 'rgba(255, 165, 0, 0.8)'}}></div>
                        <span className="legend-label">高</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color" style={{backgroundColor: 'rgba(255, 69, 0, 0.9)'}}></div>
                        <span className="legend-label">极高</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withSourceCode(Heatmap);