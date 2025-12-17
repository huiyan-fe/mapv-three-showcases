import {useEffect, useRef, useState} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import * as mapvthree from '@baidumap/mapv-three';
import {setMapStyle} from '../../utils/setMapStyle';
import './MallMap.less';
import HeatmapModule from './modules/HeatmapModule';
import SourceModule from './modules/SourceModule';
import IsochroneModule from './modules/IsochroneModule';
import FacilityModule from './modules/FacilityModule';

import border from './data/border.geojson';

const MODULES = [
    {key: 'heatmap', label: '客流热力', component: HeatmapModule},
    {key: 'source', label: '客流来源', component: SourceModule},
    {key: 'isochrone', label: '等时到达圈', component: IsochroneModule},
    {key: 'facility', label: '周边设施', component: FacilityModule},
];

/**
 * MallMap 只渲染空地图，后续各业务模块通过模块化方式挂载
 */
function MallMap() {
    const containerRef = useRef(null);
    const engineRef = useRef(null);
    const [activeModule, setActiveModule] = useState('source');

    // 通用边界FatLine
    useEffect(() => {
        if (!engineRef.current) {
            return;
        }
        let borderLine;
        mapvthree.GeoJSONDataSource.fromURL(border).then(dataSource => {
            borderLine = engineRef.current.add(new mapvthree.Polyline({
                flat: true,
                color: '#ff9800',
                lineWidth: 3,
                opacity: 0.8,
                transparent: true,
                dashed: true,
                keepSize: true,
            }));
            borderLine.material.depthTest = false;
            borderLine.dataSource = dataSource;
        });
        return () => {
            if (borderLine) {
                engineRef.current.remove(borderLine);
            }
        };
    }, [engineRef.current]);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        const engine = new mapvthree.Engine(containerRef.current, {
            map: {
                center: [113.33111353, 23.1367952],
                range: 1500,
                pitch: 60,
                provider: null,
                // projection: 'ECEF',
            },
            rendering: {
                enableAnimationLoop: true,
                features: {
                    bloom: {
                        enabled: true,
                    },
                },
            },
        });
        engineRef.current = engine;
        const mapView = engine.add(new mapvthree.MapView({
            terrainProvider: null,
            vectorProvider: new mapvthree.BaiduVectorTileProvider(),
        }));
        setMapStyle(engine, mapView, 'gray');

        engine.map.addEventListener('click', e => {
            console.log(e);
        });
        return () => {
            engine && engine.dispose();
        };
    }, []);

    const CurrentModule = MODULES.find(m => m.key === activeModule)?.component;

    return (
        <div className="mall-map-root">
            <div ref={containerRef} className="mall-map-container" />
            <div className="mall-ui-bar">
                <span className="mall-title__text">某购物中心数据可视化</span>
                <span className="mall-nav-bar">
                    {MODULES.map(m => (
                        <button
                            key={m.key}
                            className={`mall-nav-btn${activeModule === m.key ? ' mall-nav-btn--active' : ''}`}
                            onClick={e => {
                                e.stopPropagation();
                                setActiveModule(m.key);
                            }}
                        >
                            {m.label}
                        </button>
                    ))}
                </span>
            </div>
            <div className="mall-panel">
                {CurrentModule && <CurrentModule engine={engineRef.current} />}
            </div>
        </div>
    );
}

export default withSourceCode(MallMap);