// import * as mapvthree from '@baidumap/mapv-three';
// import * as THREE from 'three';
// import buildingSide2 from '../assets/textures/building_side_2.png';
// import buildingSide1 from '../assets/textures/building_side_1.png';


// /* eslint-disable max-len */
// export default class MaterialManager extends mapvthree.Default3DTilesMaterialManager {

//     onInit() {
//         const buildingRoofMaterial = new THREE.MeshBasicMaterial({
//             color: new THREE.Color('rgb(6, 8, 18)'),
//         });

//         const textureLoader = new THREE.TextureLoader();
//         const map = textureLoader.load(buildingSide2);
//         map.wrapS = map.wrapT = THREE.RepeatWrapping;

//         const glowMap = textureLoader.load(buildingSide1);
//         glowMap.wrapS = glowMap.wrapT = THREE.RepeatWrapping;

//         const buildingSideMaterial = new mapvthree.ExtendMeshStandardMaterial({
//             map,
//             uniforms: {
//                 glowMap: {
//                     value: null,
//                 },
//                 wallColor: {
//                     value: null,
//                 },
//                 glowColor: {
//                     value: null,
//                 },
//                 glowRange: {
//                     value: 24,
//                 },
//             },
//             vertexShaderChunks: {
//                 pars: `
//                     attribute float _mt;
//                     varying float vMt;
//                 `,
//                 main_before: `
//                     vMt = _mt;
//                 `,
//             },
//             fragmentShaderChunks: {
//                 pars: `
//                     #define USE_CUSTOM_MAP
//                     #define MVT_EMISSIVE_SHADER
//                     uniform sampler2D glowMap;
//                     uniform vec3 wallColor;
//                     uniform vec3 glowColor;
//                     uniform float glowRange;
//                     varying float vMt;
//                 `,
//                 main_before: `
//                     // uv.x *= 0.02;
//                     // uv.y *= 0.01;
//                 `,
//                 custom_map: `
//                     vec4 sampledDiffuseColor;
//                     vec4 out_emissive;
//                     vec2 mappedUV = vec2(uv.x * 0.02, uv.y * 0.01);
//                     float t1Color = pow(texture2D( map, 1.0 - mappedUV + 0.0).x, 2.0);

//                     float t2Color = uv.y < glowRange ? (1.0 - uv.y / glowRange) * 0.8 : 0.0;
                    
//                     if (vMt < 4.0) {
//                         sampledDiffuseColor = vec4(
//                             wallColor * (1.0 + t1Color) + glowColor * t2Color * 1.5,
//                             1.0
//                         );
//                         if (vMt <= 1.0) {
//                             // sampledDiffuseColor.rgb += 0.2;
//                         }
//                         out_emissive = vec4(glowColor * t2Color * 0.05, 1.0);
//                     }
//                     else if (vMt >= 4.0 && vMt <= 7.0) {
//                         sampledDiffuseColor = vec4(wallColor * (1.0 + t1Color * 3.0), 1.0);
//                         out_emissive =  vec4(glowColor * (t1Color) * 0.2, 1.0);
//                     }
//                     // else if (vMt < 12.0) {
//                     //     sampledDiffuseColor = vec4(wallColor, 1.0);
//                     //     out_emissive = vec4(glowColor * t2Color * 0.05, 1.0);
//                     // }
//                     else {
//                         sampledDiffuseColor = vec4(wallColor, 1.0);
//                     }
//                     // vec3 basePartColor = wallColor * (1.0 + t1Color);
//                     // vec3 glowPartColor = glowColor * t2Color;

//                     // if (vMt >= 4.0 && vMt <= 7.0) {
//                     //     // glowPartColor = basePartColor;
//                     // }

//                     // // sampledDiffuseColor
//                     // = vec4(wallColor * (wallBaseColorScale + t1Color * 1.0 + t2Color * 1.0), 1.0);
//                     // sampledDiffuseColor = vec4(basePartColor + glowPartColor, 1.0);
//                     // // vec4 out_emissive = vec4(glowColor * (t1Color * 0.0 + t2Color * 0.2) * 0.004, 0.5);
//                     // vec4 out_emissive = vec4(glowPartColor * 0.05, 1.0);
//                     // if (vMt == 4.0 || vMt == 5.0) {
//                     //     out_emissive.rgb = wallColor * t1Color * 0.8;
//                     //     sampledDiffuseColor.rgb = basePartColor;
//                     // }
//                     // // sampledDiffuseColor += out_emissive;
//                     // // sampledDiffuseColor = vec4(uv.y / 100.0, 0.0, 0.0, 1.0);
//                 `,
//             },
//         });
//         buildingSideMaterial.uniforms.glowMap.value = glowMap;
//         buildingSideMaterial.uniforms.wallColor.value = new THREE.Color(0x121620);
//         buildingSideMaterial.uniforms.glowColor.value = new THREE.Color(128 / 255, 132 / 255, 175 / 255);
//         buildingSideMaterial.uniforms.glowRange.value = 9;

//         this._materrialMap.set('buildingRoof', buildingRoofMaterial);
//         this._materrialMap.set('buildingSide', buildingSideMaterial);
//     }
// }