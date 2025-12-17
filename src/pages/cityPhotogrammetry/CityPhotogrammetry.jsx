import {useEffect, useRef} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import * as mapvthree from '@baidumap/mapv-three';
import * as THREE from 'three';

function CityPhotogrammetry() {
    const containerRef = useRef(null);

    useEffect(() => {
        const engine = window.engine = new mapvthree.Engine(containerRef.current, {
            rendering: {
                sky: new mapvthree.DynamicSky(),
                enableAnimationLoop: true,
            },
            map: {
                // 等测试数据好了以后，把 projection 设置为 ECEF
                projection: 'ECEF',
                center: [105.93519502297347, 29.34493922241942, 280],
                range: 150,
                pitch: 83,
                provider: null,
            },
        });

        const mapView = engine.add(new mapvthree.MapView({
            terrainProvider: new mapvthree.CesiumTerrainTileProvider({

            }),
            imageryProvider: new mapvthree.BingImageryTileProvider({

            }),
        }));

        const tileset = engine.add(new mapvthree.Default3DTiles({
            url: import.meta.env.VITE_YONGCHUAN_OBLIQUE_TILESET,
            errorTarget: 16,
            forceUnlit: true,
        }));

        tileset.addEventListener('rootloaded', e => {
            // translateZ(tileset, 10);
        });


        function translateZ(object, offsetZ) {
            if (!engine.map.isGlobe) {
                object.position.z += offsetZ;
                return;
            }
            const quad = {
                heading: 0,
                pitch: 0,
                roll: Math.PI / 2,
            };

            let bounds = object.getBounds();
            if (!bounds) {
                return;
            }

            const center = bounds.min.add(bounds.max).multiplyScalar(.5);
            const position = center.toArray();
            console.log('tiles position', position);
            const orientation = mapvthree.Transforms.headingPitchRollToFixedFrame(
                new THREE.Vector3(...position),
                quad
            );

            const elements = orientation.elements;
            const actualZ = new THREE.Vector3(
                elements[4],
                elements[5],
                elements[6]
            );

            object.position.add(actualZ.multiplyScalar(offsetZ));
        }

        // 清理函数
        return () => {
            if (engine) {
                engine.dispose();
            }
        };
    }, []);

    return (
        <div className="showcase" id="showcase" ref={containerRef}></div>
    );
}

export default withSourceCode(CityPhotogrammetry);
