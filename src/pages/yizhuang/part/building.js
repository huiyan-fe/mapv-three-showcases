/* eslint-disable quotes */
/* eslint-disable no-use-before-define */
import * as THREE from 'three';
import * as mapvthree from '@baidumap/mapv-three';
import {getPageResourceUrl} from '@/utils/getResourceUrl';

const excludeIds = [
    "86bf474b63cf402a9b0d032756318c9b",
    "5343dd749c9f4025914aa22c961a2ab7",
    "bcaf1d3b95d1444883cb2faad0b1eee3",
    "a884a83fc93a454cabd7ffa49d08a29e",
    "22c1422597764acbbdc2a03866c4e115",
    "8abce1ce3a374ddfa7f0b69e87422fd0",
    "6bd65c0edebf453f9ae32ee4d58ce584",
    "b50fc44252284df987332d24e8243862",
    "09e5eb4154a64cc4918940d556e391ad",
    "616af03a6fe94109a46e3bdbcf0c59af",
    "5dab2b724261419eb08e7c662dab2552",
    "d107c397eea440a1a18dcec6d4b87790",
    "9a85393ba2974731be67633c48e440e7",
    "29bdc83594a441cf904ec755ccfc8005",
    "6eed6bfccfd149cf8977158b205b0fb7",
    "cc8324c612cd48018fbf48db8e1a10ee",
    "219de483a96a413bb16a1460a6d10ecd",
    "73f57694c6e4453788756737b25818e3",
    "9d1046fbd87c4183a19c892f4923383e",
    "e4e6ee4b19dc407d9e76a20888c72894",
    "e703f74d6ea544c6a76c8f1da04f5c21",
    "b74aae7af46942c4bfdd6c01697f0c6e",
    "44f41b90e7d64a1eafc64294715e5b10",
    "e6a68bb07b2e451bbf4753bf5ab3877e",
    "e490e69519ac4977a7fde6095e46912d",
    "73f57694c6e4453788756737b25818e3",
    "399e6ccfd2384817b0e6d64164a5ea80",
    "910bcb51575f4a1c9f5b6192be630960",
    "7171cd4612af4a9a8b598aab3afcc9c5",
    "e703f74d6ea544c6a76c8f1da04f5c21",
    "27a9307e87d349bb9a1cbbf6e1f9b664",
    "3b593a366cfc4ac5a1a30740f9b739b4",
    "35cc300e52a545d8b6fbfcc2385758fc",
    "4b528889336342efbab3b520e1124c21",
    "7e9a47ca37ea4ed1b1178e0a33747e1b",
    "a0e66baaa66f49d1b6af510f186a36be",
    "e490e69519ac4977a7fde6095e46912d",
    "98d515ff65fe40b6934fa4bc1566f17e",
    "c7cc8d27fb0b4793a20706362581910e",
    "dc17f696f4ef4715aa427fd5225a8ff0",
    "f6954daea674453caff66a742cd27c00",
];
export const addBuilding = async engine => {
    const buildingData = getPageResourceUrl('yizhuang', 'data/geojson/yizhuang_building09.geojson');
    const allJSON = await fetch(buildingData).then(rsp => rsp.json());
    const allFeatures = allJSON.features;

    const highFeatures = [];
    const lowFeatures = [];

    const hospital = [];
    const school = [];
    const mall = [];
    for (const feature of allFeatures) {
        if (excludeIds.includes(feature.properties.struct_id)) {
            continue;
        }
        feature.properties.height *= 1.3;
        const height = feature.properties.height;
        // if (height > 15) {
        //     highFeatures.push(feature);
        // }
        if (feature.properties.std_tag.includes('医院')) {
            hospital.push(feature);
        }
        else if (feature.properties.std_tag.includes('中学')
            || feature.properties.std_tag.includes('小学')
            || feature.properties.std_tag.includes('幼儿园')) {
            school.push(feature);
        }
        else if (feature.properties.std_tag.includes('购物中心')
            || feature.properties.struct_id === '20dd06ee57bb4d27a9761a478822306a') {
            mall.push(feature);
        }
        else {
            lowFeatures.push(feature);
        }

    }

    // console.log(highFeatures, lowFeatures);
    addHighBuilding(engine, highFeatures);
    addLowBuilding(engine, lowFeatures);
    addHospitalBuilding(engine, hospital);
    addSchoolBuilding(engine, school);
    addMallBuilding(engine, mall);
    // let dataSourceSec = await mapvthree.GeoJSONDataSource.fromURL();
};

const addHighBuilding = async (engine, features) => {
    const polygon = engine.add(
        new mapvthree.Polygon({
            vertexHeights: true,
            extrude: true,
        })
    );

    polygon.geometry.useUV = true;
    polygon.geometry.useNormal = true;
    polygon.geometry.sideUVUseHeight = true;

    const buildingSide = getPageResourceUrl('yizhuang', 'assets/textures/building_side_2.png');
    const map = new THREE.TextureLoader().load(buildingSide);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    const sideMaterial = new mapvthree.ExtendMeshStandardMaterial({
        uniforms: {
            bottomColor: {
                value: null,
            },
            topColor: {
                value: null,
            },
        },
        transparent: false,
        map: map,
        vertexShaderChunks: {
            pars: `
                varying float vZ;
            `,
            main_after: `
                vZ = (modelMatrix * vec4(transformed, 1.0)).z;
            `,
        },
        fragmentShaderChunks: {
            pars: `
                #define USE_CUSTOM_MAP
                #define MVT_EMISSIVE_SHADER
                varying float vZ;
                uniform vec3 bottomColor;
                uniform vec3 topColor;
            `,
            custom_map: `
                vec4 sampledDiffuseColor = vec4(0.0, 0.0, 0.0, 1.0);
                float distanceToTop = uv.y - vZ;
                float brightPart = uv.y > 100. ? 15.0 : 9.0;
                if (distanceToTop < brightPart) {
                    sampledDiffuseColor.xyz = topColor;
                }
                else {
                    float glowRange = (uv.y > 100. ? 36.0 : 9.0);
                    float glowPart = brightPart + glowRange;
                    if (distanceToTop < glowPart) {
                        float glowRatio = (distanceToTop - brightPart) / glowRange;
                        // glowRatio = sqrt(sqrt(glowRatio));
                        sampledDiffuseColor.xyz = mix(topColor, bottomColor, glowRatio);
                    }
                    else {
                        sampledDiffuseColor = vec4(bottomColor, 1.0);
                    }
                }
                float emssinveColor = texture2D(map, vec2(uv.x * 0.02, distanceToTop * 0.01)).x;
                emssinveColor *= clamp(1.0 - distanceToTop / uv.y * 2.0, 0.0, 1.0);
                sampledDiffuseColor.xyz += topColor * emssinveColor;
                vec4 out_emissive = vec4(topColor * emssinveColor * 0.2, 1.0);
            `,
        },
    });
    sideMaterial.uniforms.bottomColor.value = new THREE.Color('rgb(15,26,53)');
    sideMaterial.uniforms.topColor.value = new THREE.Color('rgb(30,45,79)');

    polygon.material = [
        // sideMaterial,
        new THREE.MeshStandardMaterial({
            color: new THREE.Color('rgb(28,35,58)'),
            roughness: 0.4,
            metalness: 0,
        }),
        new THREE.MeshStandardMaterial({
            color: new THREE.Color('rgb(46,58,95)'),
            roughness: 0.5,
            metalness: 0,
        }),
    ];

    let dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(features);
    dataSource.defineAttribute('height', 'height');
    polygon.dataSource = dataSource;
    polygon.raycast = () => {};

    // console.log(polygon);
    // const box = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), sideMaterial);
    // const position = engine.map.projectArrayCoordinate([116.50394787655826, 39.791648486523044]);
    // box.position.set(position[0], position[1], 25);
    // // console.log(box);
    // engine.add(box);
};

const addHospitalBuilding = async (engine, features) => {
    const polygon = engine.add(
        new mapvthree.Polygon({
            vertexHeights: true,
            extrude: true,
        })
    );

    polygon.geometry.useUV = true;
    polygon.geometry.useNormal = true;
    polygon.geometry.sideUVUseHeight = true;

    const sideMaterial = new mapvthree.ExtendMeshStandardMaterial({
        uniforms: {
            bottomColor: {
                value: null,
            },
            topColor: {
                value: null,
            },
        },
        roughness: 0.4,
        metalness: 0,
        transparent: false,
        map: new THREE.TextureLoader().load(''),
        vertexShaderChunks: {
            pars: `
                varying float vZ;
            `,
            main_after: `
                vZ = (modelMatrix * vec4(transformed, 1.0)).z;
            `,
        },
        fragmentShaderChunks: {
            pars: `
                #define USE_CUSTOM_MAP
                varying float vZ;
                uniform vec3 bottomColor;
                uniform vec3 topColor;
            `,
            custom_map: `
                vec4 sampledDiffuseColor = vec4(mix(bottomColor, topColor, vZ / 15.0), 0.4);
                // vec4 sampledDiffuseColor = vec4(vZ, 0.0, 0.0, 1.0);
            `,
        },
    });
    sideMaterial.uniforms.topColor.value = new THREE.Color('rgb(38,24,32)');
    sideMaterial.uniforms.bottomColor.value = new THREE.Color('rgb(22,13,19)');

    polygon.material = [
        // sideMaterial,
        new THREE.MeshStandardMaterial({
            color: new THREE.Color('rgb(38,24,32)'),
            roughness: 0.4,
            metalness: 0,
        }),
        new THREE.MeshStandardMaterial({
            color: new THREE.Color('rgb(84,43,54)'),
            roughness: 0.4,
            metalness: 0,
            transparent: false,
            opacity: 0.7,
        }),
    ];

    let dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(features);
    dataSource.defineAttribute('height', 'height');
    polygon.dataSource = dataSource;
    polygon.raycast = () => {};
};

const addSchoolBuilding = async (engine, features) => {
    const polygon = engine.add(
        new mapvthree.Polygon({
            vertexHeights: true,
            extrude: true,
        })
    );

    polygon.geometry.useUV = true;
    polygon.geometry.useNormal = true;
    polygon.geometry.sideUVUseHeight = true;

    const sideMaterial = new mapvthree.ExtendMeshStandardMaterial({
        uniforms: {
            bottomColor: {
                value: null,
            },
            topColor: {
                value: null,
            },
        },
        roughness: 0.4,
        metalness: 0,
        transparent: false,
        map: new THREE.TextureLoader().load(''),
        vertexShaderChunks: {
            pars: `
                varying float vZ;
            `,
            main_after: `
                vZ = (modelMatrix * vec4(transformed, 1.0)).z;
            `,
        },
        fragmentShaderChunks: {
            pars: `
                #define USE_CUSTOM_MAP
                varying float vZ;
                uniform vec3 bottomColor;
                uniform vec3 topColor;
            `,
            custom_map: `
                vec4 sampledDiffuseColor = vec4(mix(bottomColor, topColor, vZ / 15.0), 0.4);
                // vec4 sampledDiffuseColor = vec4(vZ, 0.0, 0.0, 1.0);
            `,
        },
    });
    sideMaterial.uniforms.topColor.value = new THREE.Color('rgb(23,46,77)');
    sideMaterial.uniforms.bottomColor.value = new THREE.Color('rgb(11,25,47)');

    polygon.material = [
        // sideMaterial,
        new THREE.MeshStandardMaterial({
            color: new THREE.Color('rgb(28,35,58)'),
            roughness: 0.4,
            metalness: 0,
        }),
        new THREE.MeshStandardMaterial({
            color: new THREE.Color('rgb(14,19,39)'),
            roughness: 0.4,
            metalness: 0,
            transparent: false,
            opacity: 0.7,
        }),
    ];

    let dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(features);
    dataSource.defineAttribute('height', 'height');
    polygon.dataSource = dataSource;
    polygon.raycast = () => {};
};

const addMallBuilding = async (engine, features) => {
    const polygon = engine.add(
        new mapvthree.Polygon({
            vertexHeights: true,
            extrude: true,
        })
    );

    polygon.geometry.useUV = true;
    polygon.geometry.useNormal = true;
    polygon.geometry.sideUVUseHeight = true;

    const sideMaterial = new mapvthree.ExtendMeshStandardMaterial({
        uniforms: {
            bottomColor: {
                value: null,
            },
            topColor: {
                value: null,
            },
        },
        roughness: 0.4,
        metalness: 0,
        transparent: false,
        map: new THREE.TextureLoader().load(''),
        vertexShaderChunks: {
            pars: `
                varying float vZ;
            `,
            main_after: `
                vZ = (modelMatrix * vec4(transformed, 1.0)).z;
            `,
        },
        fragmentShaderChunks: {
            pars: `
                #define USE_CUSTOM_MAP
                varying float vZ;
                uniform vec3 bottomColor;
                uniform vec3 topColor;
            `,
            custom_map: `
                vec4 sampledDiffuseColor = vec4(mix(bottomColor, topColor, vZ / 15.0), 0.4);
                // vec4 sampledDiffuseColor = vec4(vZ, 0.0, 0.0, 1.0);
            `,
        },
    });
    sideMaterial.uniforms.topColor.value = new THREE.Color('rgb(46,36,62)');
    sideMaterial.uniforms.bottomColor.value = new THREE.Color('rgb(21,15,26)');

    polygon.material = [
        // sideMaterial,
        new THREE.MeshStandardMaterial({
            color: new THREE.Color('rgb(46,36,62)'),
            roughness: 0.4,
            metalness: 0,
        }),
        new THREE.MeshStandardMaterial({
            color: new THREE.Color('rgb(91,74,109)'),
            roughness: 0.4,
            metalness: 0,
            transparent: false,
            opacity: 0.7,
        }),
    ];

    let dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(features);
    dataSource.defineAttribute('height', 'height');
    polygon.dataSource = dataSource;
    polygon.raycast = () => {};
};

const addLowBuilding = async (engine, features) => {
    const polygon = engine.add(
        new mapvthree.Polygon({
            vertexHeights: true,
            extrude: true,
        })
    );

    polygon.geometry.useUV = true;
    polygon.geometry.useNormal = true;
    polygon.geometry.sideUVUseHeight = true;

    const sideMaterial = new mapvthree.ExtendMeshStandardMaterial({
        uniforms: {
            bottomColor: {
                value: null,
            },
            topColor: {
                value: null,
            },
        },
        roughness: 0.4,
        metalness: 0,
        transparent: false,
        map: new THREE.TextureLoader().load(''),
        vertexShaderChunks: {
            pars: `
                varying float vZ;
            `,
            main_after: `
                vZ = (modelMatrix * vec4(transformed, 1.0)).z;
            `,
        },
        fragmentShaderChunks: {
            pars: `
                #define USE_CUSTOM_MAP
                varying float vZ;
                uniform vec3 bottomColor;
                uniform vec3 topColor;
            `,
            custom_map: `
                vec4 sampledDiffuseColor = vec4(mix(bottomColor, topColor, vZ / 12.0), 0.4);
                // vec4 sampledDiffuseColor = vec4(vZ, 0.0, 0.0, 1.0);
            `,
        },
    });
    sideMaterial.uniforms.topColor.value = new THREE.Color('rgb(28,35,58)');
    sideMaterial.uniforms.bottomColor.value = new THREE.Color('rgb(14,19,39)');

    polygon.material = [
        // sideMaterial,
        new THREE.MeshStandardMaterial({
            color: new THREE.Color('rgb(28,35,58)'),
            roughness: 0.4,
            metalness: 0,
        }),
        new THREE.MeshStandardMaterial({
            color: new THREE.Color('rgb(46,58,95)'),
            roughness: 0.5,
            metalness: 0,
        }),
    ];

    let dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(features);
    dataSource.defineAttribute('height', 'height');
    polygon.dataSource = dataSource;
    polygon.raycast = () => {};
};