import {useEffect, useRef, useState} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import * as THREE from 'three';
import * as mapvthree from '@baidumap/mapv-three';
import {setMapStyle} from '../../utils/setMapStyle';
import originData from './result.txt';
import './MassivePoints.less';

// 配置百度地图 AK
mapvthree.BaiduMapConfig.ak = import.meta.env.VITE_BAIDU_MAP_AK;
let engine;

function MassivePoints() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        engine = window.engine = new mapvthree.Engine(containerRef.current, {
            map: {
                center: [25.863740882108072, 27.24960922780763, 0],
                range: 30000000,
                pitch: 0,
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

        let data = [[], [], []];
        let _pointScratch = [];
        fetch(originData).then(res => res.text()).then(res => {
            let rs = res.split('\n');
            for (let i = 0, len = rs.length - 1; i < len; i++) {
                let item = rs[i].split('|');
                let layer = item[0].substring(item[0].length - 1);
                let lng = item[0].substring(0, item[0].length - 1) * 3000;
                let dots = item[1].split(';');
                let lat = 0;
                for (let j = 0; j < dots.length; j++) {
                    lat = lat + ~~dots[j];
                    // data[layer].push([lng, lat * 3000]);
                    _pointScratch = engine.map.unprojectArrayCoordinate([lng, lat * 3000]);
                    data[layer].push(new mapvthree.DataItem(_pointScratch));
                }
            }

            const base = engine.add(new mapvthree.SimplePoint({
                color: new THREE.Color(0.2, 0.4, 0.6),
                transparent: true,
                opacity: 0.5,
                depthTest: false,
                size: 0.5,
            }));
            const baseDataSource = new mapvthree.DataSource();
            baseDataSource.add(data[0]);
            base.dataSource = baseDataSource;

            const light = engine.add(new mapvthree.SimplePoint({
                color: new THREE.Color(0.8, 5, 10),
                transparent: true,
                opacity: 0.7,
                depthTest: false,
                size: 0.5,
            }));
            const lightDataSource = new mapvthree.DataSource();
            lightDataSource.add(data[1]);
            light.dataSource = lightDataSource;

            const lighter = engine.add(new mapvthree.SimplePoint({
                color: new THREE.Color(0.8, 10, 20),
                transparent: true,
                opacity: 0.9,
                depthTest: false,
                size: 0.5,
            }));
            const lighterDataSource = new mapvthree.DataSource();
            lighterDataSource.add(data[2]);
            lighter.dataSource = lighterDataSource;

            base.material.blending = THREE.AdditiveBlending;
            light.material.blending = THREE.AdditiveBlending;
            lighter.material.blending = THREE.AdditiveBlending;

            base.raycast = () => {};
            light.raycast = () => {};
            lighter.raycast = () => {};
        });


        // 清理函数
        return () => {
            if (engine) {
                engine.dispose();
            }
        };
    }, []);

    return (
        <div className="showcase" ref={containerRef}>
            <div className="showcase-title">
                <h1>某App全球用户数据分布打点（157万+）</h1>
                <h3>App users distributed data tagging (Over 1.57M points)</h3>
            </div>
        </div>
    );
}

export default withSourceCode(MassivePoints);