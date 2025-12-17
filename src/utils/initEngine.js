import * as mapvthree from '@baidumap/mapv-three';

export default (pageParams, overrideRenderingFeatures = {}) => {

    const params = {
        center: [0, 0],
        heading: 0,
        pitch: 80,
        zoom: 21,
        range: 100,
        enableAnimationLoop: false,
        logarithmicDepthBuffer: true,
        skyType: 'dynamic',
        tilesets: null,
        projection: 'EPSG:3857',
        bindMapClickEvent: true,
        showStats: false,
        showBuffer: false,
        documentId: 'showcase',
    };

    for (const key of Object.keys(params)) {
        let value = params[key];
        if (pageParams[key] !== undefined) {
            value = pageParams[key];
        }
        params[key] = value;
    }

    let renderingFeatures = {
        stats: {
            enabled: params.showStats,
        },
        buffer: {
            enabled: params.showBuffer,
        },
    };
    mapvthree.objectUtils.deepMerge(renderingFeatures, overrideRenderingFeatures);
    console.log('initEngine params', params);
    console.log('renderingFeatures', renderingFeatures);
    let center = params.center;
    if (typeof center === 'string') {
        const centerArray = center.split(',');
        center = [];
        if (centerArray.length >= 2) {
            center[0] = parseFloat(centerArray[0]);
            center[1] = parseFloat(centerArray[1]);
            center[2] = parseFloat(centerArray[2]) || 0;
        }
    }
    let sky = null;
    const skyType = params.skyType;
    if (skyType === 'empty') {
        sky = new mapvthree.EmptySky();
    }
    else if (skyType === 'dynamic') {
        sky = new mapvthree.DynamicSky();
    }
    else if (skyType === 'static') {
        sky = new mapvthree.StaticSky();
    }
    else if (skyType === 'gradient') {
        sky = new mapvthree.DefaultSky();
    }
    const usedProjection = params.projection;
    const engine = window.engine = new mapvthree.Engine(document.getElementById(params.documentId), {
        map: {
            projection: usedProjection,
            provider: params.provider ?? null,
            is3DControl: true, // usedProjection === 'EPSG:3857',
        },
        rendering: {
            forceWebGL: !!params.forceWebGL,
            logarithmicDepthBuffer: params.logarithmicDepthBuffer,
            features: renderingFeatures,
            enableAnimationLoop: params.enableAnimationLoop,
            sky: null,
        },
    });

    if (sky) {
        engine.clock._setTimeLegacy(15.5 * 3600);
    }
    engine.add(sky);

    const usedRange = parseFloat(params.range, 10);
    const usedZoom = parseFloat(params.zoom, 10);
    const usedPitch = parseFloat(params.pitch, 10);
    const usedHeading = parseFloat(params.heading, 10);
    engine.map.lookAt(center, {
        heading: usedHeading,
        pitch: usedPitch,
        range: usedRange,
        zoom: usedZoom,
    });

    const position = engine.map.projectArrayCoordinate(center);
    if (position[2] === undefined) {
        position[2] = 0;
    }

    let tiles = [];
    let urlString = params.tilesets;
    if (urlString) {
        const urls = urlString.split(',');
        for (let i = 0, last = urls.length; i < last; ++i) {
            const url = urls[i];
            const urlParts = url.split('|');
            // TODO:
            const type = urlParts[1];
            const constructorParams = {
                url: urlParts[0],
                errorTarget: 16,
            };
            const tilesetObject = engine.add(new mapvthree.Default3DTiles(constructorParams));
            tiles.push(tilesetObject);
            if (i === 0) {
                document.addEventListener('keydown', e => {
                    if (e.keyCode === 70) {
                        engine.map.zoomTo(tilesetObject);
                    }
                });
            }
        }

    }

    if (params.bindMapClickEvent) {
        engine.map.addEventListener('click', e => {
            console.log('map clicked', e);
        });
    }

    return {
        engine,
        params,
        center,
        position,
        sky,
        tiles,
    };
};
