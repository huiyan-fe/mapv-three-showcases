import {useEffect} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import initEngine from '../../utils/initEngine';
import {MapvThreeWind} from './Wind';
import * as mapvthree from '@baidumap/mapv-three';
import winddata from './assets/wind.json';

const center = [116.5163443534827, 39.79913123605543];

const windOptions = {
    colorScale: [
        'rgb(36,104, 180)',
        'rgb(60,157, 194)',
        'rgb(128,205,193 )',
        'rgb(151,218,168 )',
        'rgb(198,231,181)',
        'rgb(238,247,217)',
        'rgb(255,238,159)',
        'rgb(252,217,125)',
        'rgb(255,182,100)',
        'rgb(252,150,75)',
        'rgb(250,112,52)',
        'rgb(245,64,32)',
        'rgb(237,45,28)',
        'rgb(220,24,32)',
        'rgb(180,0,35)',
    ],
    frameRate: 16,
    maxAge: 60,
    globalAlpha: 0.9,
    velocityScale: 1 / 30,
    paths: 40000,
};


function Wind() {

    useEffect(() => {
        const {
            engine,
        } = initEngine({
            skyType: 'dynamic',
            documentId: 'wind',
            center: center,
            pitch: 0,
            zoom: 18,
            range: 19000000,
            projection: 'ecef',
            enableAnimationLoop: true,
            provider: null,
        });

        const mapview = engine.add(new mapvthree.MapView({
            imageryProvider: new mapvthree.BingImageryTileProvider({}),
        }));

        const wind = new MapvThreeWind(winddata, windOptions);
        wind.addTo(engine);

        // const wind = new MapvThreeWind();

        return () => {
            if (engine) {
                engine.dispose();
            }
        };
    }, []);

    return (
        <div className="wind" id="wind"></div>
    );
}

export default withSourceCode(Wind);