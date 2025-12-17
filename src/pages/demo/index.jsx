import {useEffect, useRef} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import * as THREE from 'three';
import * as mapvthree from '@baidumap/mapv-three';

function Demo() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const engine = new mapvthree.Engine(containerRef.current);

        const marker = engine.add(new mapvthree.Marker({
            point: [114.34, 30.57],
            icon: mapvthree.urlUtils.getAssetUrl('assets/images/bdImg.png'),
        }));

        // 清理函数
        return () => {
            if (engine) {
                engine.dispose();
            }
        };
    }, []);

    return (
        <div className="showcase" ref={containerRef}>
        </div>
    );
}

export default withSourceCode(Demo);