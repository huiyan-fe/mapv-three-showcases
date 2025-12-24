import {useEffect, useRef} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import * as THREE from 'three';
import * as mapvthree from '@baidumap/mapv-three';
// import MaterialManager from './style/MaterialManager';
import {
    addRoadDataModelType,
    addWaterDataModelType,
    addModalData,
    addGreenDataModelType,
    addCrossData,
    addRoadData,
    addTextData,
} from './part/events';

const styleDefault = {
    roadMain: 'rgb(62, 64, 74)',
    roadOther: 'rgb(23, 28, 38)',
    green: 'rgb(10,43,49)',
    water: 'rgb(10, 37, 81)',
};
const style1 = {
    roadMain: 'rgb(84,97,128)',
    roadOther: 'rgb(32,44,70)',
    green: 'rgb(26,68,67)',
};
const style = Object.assign({}, styleDefault, style1);

const center = [116.5163443534827, 39.79913123605543];
function Yizhuang() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        const engine = window.engine = new mapvthree.Engine(containerRef.current, {
            map: {
                projection: 'EPSG:3857',
                center: center,
                pitch: 70,
                range: 3000,
                provider: null,
                // provider: new mapvthree.BaiduVectorTileProvider(),
            },
            rendering: {
                sky: null,
                enableAnimationLoop: true,
            },
        });

        engine.rendering.features.bloom.enabled = true;
        // engine.rendering.picking.useDepthPicking = true;

        engine.clock._setTimeLegacy(14.5 * 3600);

        // 添加天空
        const sky = engine.add(new mapvthree.DefaultSky());
        sky.color = new THREE.Color(31 / 255 / 2, 43 / 255 / 2, 93 / 255 / 2);
        sky.highColor = new THREE.Color(31 / 255 / 3, 43 / 255 / 3, 93 / 255 / 3);
        sky.skyLightIntensity = 1.5;
        sky.sunIntensityScale = 0.5;

        const tilesetUrl = import.meta.env.VITE_YIZHUANG_HDROAD_TILESET; // 1011
        const tiles = engine.add(new mapvthree.Default3DTiles({
            url: tilesetUrl,
        }));
        // tiles.materialManager = new MaterialManager();
        tiles.errorTarget = 16;

        const config = {style};
        addRoadDataModelType(engine, config);
        addWaterDataModelType(engine, config);
        addGreenDataModelType(engine, config);

        addCrossData(engine);

        addModalData(engine, 'dazu_guangchang_new.glb', [116.51980896, 39.79954436, 0]);
        addModalData(engine, 'beijing_jingji_kaifaqu.glb', [116.51340201, 39.80125603, 0]);
        addModalData(engine, 'beikai_dianqi.glb', [116.53511065, 39.78406848, 0]);
        addModalData(engine, 'yizhuang_jiaojing.glb', [116.54177537, 39.81618427, 0]);
        addModalData(engine, 'jingdong.glb', [116.56962673, 39.79265129, 0]);
        addModalData(engine, 'yonghui_dasha.glb', [116.52519582, 39.79439936, 0]);
        addModalData(engine, 't1.glb', [116.52306802381277, 39.77939756602759, 0]);
        addRoadData(engine);
        addTextData(engine);

        // 清理函数
        return () => {
            if (engine) {
                engine.dispose();
            }
        };
    }, []);

    return (
        <div className="showcase" ref={containerRef}></div>
    );
}



export default withSourceCode(Yizhuang);