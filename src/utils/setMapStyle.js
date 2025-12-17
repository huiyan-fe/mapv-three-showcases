import * as THREE from 'three';
import gray from './mapStyles/gray.json';
import yanmou from './mapStyles/yanmou.json';
const MAP_STYLE_CONFIG = {
    gray: {
        sky: {
            time: 3600 * 14.5,
            color: [79 / 255, 84 / 255, 100 / 255],
            highColor: [79 / 255 / 2, 84 / 255 / 2, 100 / 255 / 2],
        },
        backgroundColor: 'rgb(66, 73, 89)',
        borderColor: 'rgb(43, 46, 58)',
        styleJson: gray,
    },
    yanmou: {
        sky: {
            time: 3600 * 14.5,
            color: [82 / 255 / 2, 122 / 255 / 2, 182 / 255 / 2],
            highColor: [82 / 255 / 3, 122 / 255 / 3, 182 / 255 / 3],
        },
        backgroundColor: 'rgb(13, 22, 34)',
        borderColor: 'rgb(43, 46, 58)',
        styleJson: yanmou,
    },
};

/**
 * 设置地图主题样式
 * @param {object} engine mapvthree.Engine实例
 * @param {object} mapView mapvthree.MapView实例
 * @param {string} theme 主题名称，目前支持'gray'、'yanmou'
 */
export function setMapStyle(engine, mapView, theme = 'gray') {
    const config = MAP_STYLE_CONFIG[theme];
    if (!config) {
        return;
    }
    // 设置天空颜色
    const sky = engine.rendering.sky;
    if (sky && config.sky) {
        engine.clock._setTimeLegacy(config.sky.time);
        sky.color = new THREE.Color(...config.sky.color);
        sky.highColor = new THREE.Color(...config.sky.highColor);
    }
    // 设置地图背景色
    if (mapView.vectorSurface && mapView.vectorSurface.placeholder) {
        mapView.vectorSurface.placeholder.backgroundColor = new THREE.Color(config.backgroundColor);
        mapView.vectorSurface.placeholder.borderColor = new THREE.Color(config.borderColor);
    }
    // 设置地图样式
    if (mapView.vectorSurface && mapView.vectorSurface.tileProvider && mapView.vectorSurface.tileProvider.setMapStyle) {
        mapView.vectorSurface.tileProvider.setMapStyle({
            styleJson: config.styleJson,
        });
    }
};