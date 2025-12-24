import * as mapvthree from '@baidumap/mapv-three';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
// import {getPbrTextureParams} from '../util/texture';
import {addBuilding} from './building';
import {getPageResourceUrl} from '@/utils/getResourceUrl';

function getModelPath() {
    return {
        'dazu_guangchang_new.glb': getPageResourceUrl('yizhuang', 'assets/model/dazu_guangchang_new.glb'),
        'beijing_jingji_kaifaqu.glb': getPageResourceUrl('yizhuang', 'assets/model/beijing_jingji_kaifaqu.glb'),
        'beikai_dianqi.glb': getPageResourceUrl('yizhuang', 'assets/model/beikai_dianqi.glb'),
        'yizhuang_jiaojing.glb': getPageResourceUrl('yizhuang', 'assets/model/yizhuang_jiaojing.glb'),
        'jingdong.glb': getPageResourceUrl('yizhuang', 'assets/model/jingdong.glb'),
        'yonghui_dasha.glb': getPageResourceUrl('yizhuang', 'assets/model/yonghui_dasha.glb'),
        't1.glb': getPageResourceUrl('yizhuang', 'assets/model/t1.glb'),
    };
}

export async function addCrossData(engine) {
    const loader = new GLTFLoader();
    const crossModelPath = getPageResourceUrl('yizhuang', 'assets/model/yizhuang_cross_1.glb');
    const centerCross0209 = getPageResourceUrl('yizhuang', 'data/geojson/yizhuang_center_cross0209.geojson');
    const centerCross09 = getPageResourceUrl('yizhuang', 'data/geojson/yizhuang_center_cross09.geojson');

    loader.load(crossModelPath, function (gltf) {
        const instancedMesh = engine.add(new mapvthree.EffectModelPoint({
            animationRotate: true,
            animationRotatePeriod: 8000,
            keepSize: false,
            size: 30,
        }));
        instancedMesh.model = gltf.scene;
        mapvthree.GeoJSONDataSource.fromURL(centerCross0209)
            .then(dataSource => {
                instancedMesh.dataSource = dataSource;
            });
        instancedMesh.position.z = 0.1;
    });
    const bubble = engine.add(new mapvthree.EffectPoint({
        color: 'rgba(6, 52, 30, 1.0)',
        size: 50,
        type: 'Wave',
        duration: 2000,
    }));
    bubble.material.keepSize = true;
    bubble.material.depthTest = true;
    bubble.position.z = 10;
    let dataSource = await mapvthree.GeoJSONDataSource.fromURL(centerCross09);
    dataSource.defineAttribute('size').defineAttribute('icon');
    bubble.position.z = -100;
    bubble.zooms = [16, 28];
    bubble.dataSource = dataSource;
}

// 车流轨迹
export async function addRoadData(engine) {
    const midline109 = getPageResourceUrl('yizhuang', 'data/geojson/yizhuang_midline_109.geojson');
    const lightline = engine.add(new mapvthree.Polyline({
        flat: true,
        // color: 'rgba(50, 150, 180, 0.8)',
        lineWidth: 2,
        keepSize: true,
        transparent: true,
        enableAnimation: true,
        enableAnimationChaos: true,
        animationSpeed: 1,
        animationTailType: 1,
        animationTailRatio: 0.2,
        animationIdle: 3000,
        height: 4,
        color: new THREE.Color(50 / 255, 300 / 255, 4000 / 255),
    }));
    let dataSource3 = await mapvthree.GeoJSONDataSource.fromURL(midline109);
    lightline.dataSource = dataSource3;
    setTimeout(() => {
        lightline.position.z += 1;
    }, 30);
}

// text文字
export async function addTextData(engine) {
    const centerCross0309 = getPageResourceUrl('yizhuang', 'data/geojson/yizhuang_center_cross0309.geojson');
    const text = engine.add(new mapvthree.Text({
        fillStyle: '#999',
        fontSize: 14,
        flat: false,
    }));
    let data = await mapvthree.GeoJSONDataSource.fromURL(centerCross0309);
    data.defineAttribute('text', p => p.Name);
    text.dataSource = data;
    text.renderOrder = 100;
}

// 模型
export async function addModalData(engine, name, positions) {
    const loader = new GLTFLoader();
    const position = engine.map.projectArrayCoordinate(positions);
    const modelPath = getModelPath();
    loader.load(modelPath[name], function (gltf) {
        const obj = gltf.scene;
        obj.rotateX(Math.PI / 2);
        obj.position.set(...position);
        obj.translateZ(10);
        engine.add(obj);
    });
}

// dataType == 1
export async function addRoadDataModelType(engine, config) {
    const roadOther09 = getPageResourceUrl('yizhuang', 'data/geojson/yizhuang_road_other09.geojson');
    const roadMain09 = getPageResourceUrl('yizhuang', 'data/geojson/yizhuang_road_main09.geojson');
    // const polygonOther = engine.add(
    //     new mapvthree.Polygon({
    //         // vertexColors: true,
    //         // color: 'rgb(31, 59, 94)',
    //         color: new THREE.Color(config.style.roadOther),
    //         // opacity: 0.8,
    //         extrude: false,
    //         extrudeValue: 0,
    //     })
    // );
    // // polygon.emissive = new THREE.Color(35 / 255, 62 / 255, 98 / 255, 1.0);
    // let dataSourceOther = await mapvthree.GeoJSONDataSource.fromURL(roadOther09);
    // // dataSource.defineAttribute('color', p => Math.random() * 0xffffff);
    // polygonOther.position.z = -0.1;
    // polygonOther.dataSource = dataSourceOther;
    // polygonOther.renderOrder = -8;
    // polygonOther.material.transparent = false;
    // polygonOther.material.depthTest = false;
    // polygonOther.raycast = () => {};
    fetch(roadOther09).then(rsp => rsp.json()).then(data => {
        const roadOtherLayer = engine.add(new mapvthree.MapView({
            terrainProvider: null,
            vectorProvider: new mapvthree.GeoJSONVectorTileProvider({
                data: data,
                styleOptions: {
                    color: config.style.roadOther,
                    renderOrder: -8,
                },
            }),
        }));
        roadOtherLayer.position.z = -0.1;
        roadOtherLayer.vectorSurface.tileProvider.onSurfaceTileAdded = selectedTile => {
            if (selectedTile.object) {
                selectedTile.object.traverse(child => {
                    if (child.isMesh) {
                        child.raycast = () => {};
                    }
                });
            }
        };
    });

    // const polygon = engine.add(
    //     new mapvthree.Polygon({
    //         // vertexColors: true,
    //         // color: 'rgb(31, 59, 94)',
    //         color: new THREE.Color(config.style.roadMain),
    //         // opacity: 0.8,
    //         extrude: false,
    //         extrudeValue: 0,
    //     })
    // );
    // // polygon.emissive = new THREE.Color(35 / 255, 62 / 255, 98 / 255, 1.0);
    // let dataSource = await mapvthree.GeoJSONDataSource.fromURL(roadMain09);
    // // dataSource.defineAttribute('color', p => Math.random() * 0xffffff);
    // polygon.position.z = -0.1;
    // polygon.dataSource = dataSource;
    // polygon.renderOrder = -8;
    // polygon.material.transparent = false;
    // polygon.material.depthTest = false;
    // polygon.raycast = () => {};
    fetch(roadMain09).then(rsp => rsp.json()).then(data => {
        const roadMainLayer = engine.add(new mapvthree.MapView({
            terrainProvider: null,
            vectorProvider: new mapvthree.GeoJSONVectorTileProvider({
                data: data,
                styleOptions: {
                    color: config.style.roadMain,
                    renderOrder: -8,
                },
            }),
        }));
        roadMainLayer.position.z = -0.1;
        roadMainLayer.vectorSurface.tileProvider.onSurfaceTileAdded = selectedTile => {
            if (selectedTile.object) {
                selectedTile.object.traverse(child => {
                    if (child.isMesh) {
                        child.raycast = () => {};
                    }
                });
            }
        };
    });
}

export async function addWaterDataModelType(engine, config) {
    const water09 = getPageResourceUrl('yizhuang', 'data/geojson/yizhuang_water09.geojson');
    const polygon = engine.add(
        new mapvthree.Polygon({
        })
    );
    const waterMaterial = polygon.material = new mapvthree.WaterMaterial({
    });
    waterMaterial.waterColor = new THREE.Color(config.style.water);
    waterMaterial.sunColor = new THREE.Color(config.style.water);
    waterMaterial.reflectionColor = new THREE.Color(config.style.water);
    waterMaterial.timeScaleFactor = 0.002;
    engine.addBeforeRenderObject(waterMaterial);
    // polygon.emissive = new THREE.Color(35 / 255, 62 / 255, 98 / 255, 1.0);
    let dataSource = await mapvthree.GeoJSONDataSource.fromURL(water09);
    // dataSource.defineAttribute('color', p => Math.random() * 0xffffff);
    polygon.position.z = -0.1;
    polygon.dataSource = dataSource;
    polygon.renderOrder = -10;
    polygon.material.transparent = false;
    polygon.material.depthTest = false;
    polygon.raycast = () => {};
}

export async function addGreenDataModelType(engine, config) {
    const green09 = getPageResourceUrl('yizhuang', 'data/geojson/yizhuang_green09.geojson');
    const polygon = engine.add(
        new mapvthree.Polygon({
            // vertexColors: true,
            color: new THREE.Color(config.style.green),
        })
    );
    let dataSource = await mapvthree.GeoJSONDataSource.fromURL(green09);
    // dataSource.defineAttribute('color', p => Math.random() * 0xffffff);
    polygon.position.z = -0.1;
    polygon.dataSource = dataSource;
    polygon.renderOrder = -9;
    polygon.material.transparent = false;
    polygon.material.depthTest = false;
    polygon.raycast = () => {};

    addBuilding(engine);
}
