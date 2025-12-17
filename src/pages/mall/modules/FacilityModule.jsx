import React from 'react';
import * as THREE from 'three';
import * as mapvthree from '@baidumap/mapv-three';
import poiData from '../data/gz_poi.geojson';
import borderData from '../data/border.geojson';

import iconParking from '../assets/icons/parking.png';
import iconRestaurant from '../assets/icons/restaurant.png';
import iconCafe from '../assets/icons/cafe.png';
import iconToilet from '../assets/icons/toilet.png';
import iconMarker from '../assets/icons/marker.png';

import FloatingPanel from '../components/FloatingPanel';
import PanelLayout from '../components/PanelLayout';
import POITable from '../components/POITable';

function FacilityModule({engine}) {
    const [poiList, setPoiList] = React.useState({
        parking: [],
        restaurant: [],
        cafe: [],
        toilet: [],
    });

    React.useEffect(() => {
        if (!engine) {
            return;
        }
        engine.map.flyTo([113.33111353, 23.1367952], {
            range: 2500,
            pitch: 60,
            duration: 2000,
        });

        const iconLayer = engine.add(new mapvthree.Label({
            width: 32,
            height: 32,
            vertexIcons: true,
        }));

        mapvthree.GeoJSONDataSource.fromURL(poiData)
            .then(dataSource => {
                dataSource.defineAttribute('icon', p => {
                    const type = p.amenity;
                    if (type === 'parking') {
                        return iconParking;
                    }
                    else if (type === 'restaurant') {
                        return iconRestaurant;
                    }
                    else if (type === 'cafe') {
                        return iconCafe;
                    }
                    else if (type === 'toilet') {
                        return iconToilet;
                    }
                    return iconMarker;
                }).defineAttribute('iconSize', p => {
                    return [32, 32];
                });
                iconLayer.dataSource = dataSource;
            });

        let wallLayer = engine.add(new mapvthree.Wall({
            color: new THREE.Color(0.1, 4, 8),
            enableAnimation: true,
            opacity: 0.5,
            animationTailType: 4,
            transparent: true,
        }));

        mapvthree.GeoJSONDataSource.fromURL(borderData)
            .then(dataSource => {
                wallLayer.dataSource = dataSource;
            });

        return () => {
            engine.remove(iconLayer);
            engine.remove(wallLayer);
        };
    }, [engine]);

    React.useEffect(() => {
        fetch(poiData)
            .then(res => res.json())
            .then(data => {
                const categorizedPOIs = {
                    parking: [],
                    restaurant: [],
                    cafe: [],
                    toilet: [],
                };
                (data.features || []).forEach(feature => {
                    const type = feature.properties.amenity;
                    const name = feature.properties.name;
                    const id = feature.properties.id || `${type}_${Math.random()}`;
                    if (type in categorizedPOIs) {
                        categorizedPOIs[type].push({
                            id,
                            name,
                            type,
                        });
                    }
                });
                setPoiList(categorizedPOIs);
            });
    }, []);

    return (
        <>
            <PanelLayout side="left" width={280}>
                <FloatingPanel title="停车场">
                    <POITable
                        data={poiList.parking}
                        type="停车场"
                        maxItems={3}
                    />
                </FloatingPanel>
                <FloatingPanel title="餐饮">
                    <POITable
                        data={poiList.restaurant}
                        type="餐厅"
                        maxItems={3}
                    />
                </FloatingPanel>
            </PanelLayout>
            <PanelLayout side="right" width={280}>
                <FloatingPanel title="咖啡馆">
                    <POITable
                        data={poiList.cafe}
                        type="咖啡馆"
                        maxItems={5}
                    />
                </FloatingPanel>
                <FloatingPanel title="卫生间" height={200}>
                    <POITable
                        data={poiList.toilet}
                        type="卫生间"
                        maxItems={5}
                    />
                </FloatingPanel>
            </PanelLayout>
        </>
    );
}

export default FacilityModule;