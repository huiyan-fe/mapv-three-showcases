import {twoline2satrec, propagate} from 'satellite.js';
import * as mapvthree from '@baidumap/mapv-three';


class SatelliteObject {

    constructor(tle = '', options = {}) {
        const [name, tleLine1, tleLine2] = this._checkTle(tle);
        let circle = tleLine2.slice(52, 64);

        this.name = name.trim();
        this.tleLine1 = tleLine1.trim();
        this.tleLine2 = tleLine2.trim();
        this.satrec = twoline2satrec(this.tleLine1, this.tleLine2);

        this.totalSeconds = 86400;// 24小时
        this.stepSeconds = 100;
        this.leadTime = parseInt(24 * 3600 / circle, 10);
        this.trailTime = 0;

        this._trackLine = null;

    }

    addTo(engine) {
        this.engine = engine;
    }

    _checkTle(tle) {
        let elements = tle.split('\n');
        if (elements.length !== 3) {
            throw new Error('tle data error');
        }
        return elements;
    }

    // 获取地心惯性坐标系坐标
    getPositionEci(time) {
        return propagate(this.satrec, time).position;
    }

    // 创建PositionProperty
    getPositions() {
        let now = Date.now();
        const points = [];
        for (let i = 0; i < this.totalSeconds / this.stepSeconds; i++) {
            let sateTime = new Date(now + i * this.stepSeconds * 1000);
            let sateCoord = this.getPositionEci(sateTime);
            if (!sateCoord) {
                continue;
            }
            const cesiumPosition = {x: sateCoord.x * 1000, y: sateCoord.y * 1000, z: sateCoord.z * 1000};
            points.push([sateTime, cesiumPosition]);
        }
        return points;
    }

    createSatelliteObject() {
        const positions = this.getPositions();
        if (!this._trackLine) {
            const line = this.engine.add(new mapvthree.Polyline({
                color: Math.random() * 0xffffff,
                lineWidth: 1,
            }));
            const dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON([]);
            line.dataSource = dataSource;
            this._trackLine = line;
        }
        this._satePath = positions;
        return positions;
    }

    /**
     * 根据给定时间获取插值后的卫星位置
     * @param {Date} dateTime - 需要计算位置的时间点
     * @returns {Object|null} - 插值计算后的位置 {x, y, z}
     */
    getCurrentPosition(dateTime) {
        // 确保已经计算了轨道路径
        if (!this._satePath || this._satePath.length < 2) {
            return null;
        }

        const targetTime = dateTime.getTime();

        // 获取第一个和最后一个点的时间
        const firstPoint = this._satePath[0];
        const lastPoint = this._satePath[this._satePath.length - 1];
        const firstTime = firstPoint[0].getTime();
        const lastTime = lastPoint[0].getTime();

        // 计算轨道总时长
        const orbitDuration = lastTime - firstTime;

        // 如果目标时间小于轨道起始时间，则做一个特殊处理
        if (targetTime < firstTime) {
            // 计算需要往前回溯多少个周期
            const cyclesBack = Math.ceil((firstTime - targetTime) / orbitDuration);
            // 调整时间，使其落在轨道范围内
            const adjustedTime = new Date(targetTime + cyclesBack * orbitDuration);
            return this.getCurrentPosition(adjustedTime);
        }

        // 计算时间相对于轨道的位置
        let normalizedTime = targetTime;

        // 如果目标时间超过了轨道结束时间
        if (targetTime > lastTime) {
            // 取模，使时间回到轨道范围内，实现循环
            normalizedTime = firstTime + (targetTime - firstTime) % orbitDuration;

            // 如果刚好结束，则需要特殊处理平滑过渡
            if (Math.abs(targetTime - lastTime) < this.stepSeconds * 1000 * 2) {
                // 计算过渡系数 (0-1)
                const transitionFactor = (targetTime - lastTime) / (this.stepSeconds * 1000 * 2);

                // 从最后一个点到第一个点的平滑插值
                return {
                    x: lastPoint[1].x + transitionFactor * (firstPoint[1].x - lastPoint[1].x),
                    y: lastPoint[1].y + transitionFactor * (firstPoint[1].y - lastPoint[1].y),
                    z: lastPoint[1].z + transitionFactor * (firstPoint[1].z - lastPoint[1].z),
                };
            }
        }

        // 以下是正常轨道范围内的插值逻辑

        // 找到目标时间所在的时间区间
        let beforeIndex = 0;
        for (let i = 0; i < this._satePath.length - 1; i++) {
            if (this._satePath[i][0].getTime() <= normalizedTime
                && this._satePath[i + 1][0].getTime() >= normalizedTime) {
                beforeIndex = i;
                break;
            }
        }

        // 获取前后两个时间点
        const beforePoint = this._satePath[beforeIndex];
        const afterPoint = this._satePath[beforeIndex + 1];

        // 计算时间插值系数 (0-1之间)
        const beforeTime = beforePoint[0].getTime();
        const afterTime = afterPoint[0].getTime();
        const fraction = (normalizedTime - beforeTime) / (afterTime - beforeTime);

        // 线性插值计算位置
        return {
            x: beforePoint[1].x + fraction * (afterPoint[1].x - beforePoint[1].x),
            y: beforePoint[1].y + fraction * (afterPoint[1].y - beforePoint[1].y),
            z: beforePoint[1].z + fraction * (afterPoint[1].z - beforePoint[1].z),
        };
    }
}

export default SatelliteObject;