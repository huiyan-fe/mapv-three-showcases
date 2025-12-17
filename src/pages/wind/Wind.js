import {WindCore, assign, defaultOptions, Field, formatData, isArray, removeDomNode} from 'wind-core';
import {Matrix4, Vector2, Vector3} from 'three';
import * as mapvthree from '@baidumap/mapv-three';

const _tempVector3 = new Vector3();
const _tempMatrix4 = new Matrix4();


class MapvThreeWind {
    constructor(data, options = {}) {
        this.canvas = null;
        this.wind = null;
        this.options = assign({}, options);
        this.pickWindOptions();

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute; left:0; top:0;user-select:none;pointer-events: none;z-index:10000';
        canvas.className = 'mapv-three-wind';
        this.canvas = canvas;

        if (data) {
            this.setData(data);
        }
    }

    addTo(engine) {
        this.engine = engine;

        const simplePoint = engine.add(new mapvthree.SimplePoint({
            depthTest: false,
            transparent: true,
        }));
        simplePoint.material.renderOrder = 10000;
        simplePoint.dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON([]);
        this.simplePoint = simplePoint;
        this.appendCanvas();
        this.render(this.canvas);
    }

    removeLayer() {
        this.remove();
    }

    remove() {
        if (!this.engine) {
            return;
        }

        if (this.wind) {
            this.wind.stop();
        }

        if (this.canvas) {
            removeDomNode(this.canvas);
        }

        delete this.canvas;
    }

    getWindOptions() {
        return this.options.windOptions || {};
    }

    pickWindOptions() {
        Object.keys(defaultOptions).forEach(key => {
            if (key in this.options) {
                if (this.options.windOptions === undefined) {
                    this.options.windOptions = {};
                }
                this.options.windOptions[key] = this.options[key];
            }
        });
    }

    getData() {
        return this.field;
    }

    setData(data) {
        if (data && data.checkFields && data.checkFields()) {
            this.field = data;
        }
        else if (isArray(data)) {
            this.field = formatData(data);
        }
        else {
            console.error('Illegal data');
        }

        if (this.engine && this.canvas && this.field) {
            // this.wind.updateData(this.field);
            // this.appendCanvas();
            // this.render(this.canvas);
        }

        return this;
    }

    getContext() {
        if (this.canvas === null) {
            return;
        }
        return this.canvas.getContext('2d');
    }

    appendCanvas() {
        if (!this.engine || !this.canvas) {
            return;
        }
        if (document.querySelector('.mapv-three-wind')) {
            return;
        }
        this.adjustSize();
        const container = this.engine.map.map.canvas.parentNode;
        container.appendChild(this.canvas);
    }

    adjustSize() {
        const engine = this.engine;
        const canvas = this.canvas;
        const engineCanvas = engine.map.map.canvas;
        const {width, height} = engineCanvas;
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
    }

    render() {
        // TODO
        console.log('render');
        if (!this.getData() || !this.engine) {
            return this;
        }

        const opt = this.getWindOptions();
        if (this.canvas && !this.wind) {
            const data = this.getData();
            const ctx = this.getContext();

            if (ctx) {
                this.wind = new WindCore(ctx, opt, data);

                this.wind.project = this.project.bind(this);
                this.wind.unproject = this.unproject.bind(this);
                this.wind.intersectsCoordinate = this.intersectsCoordinate.bind(this);
                this.wind.postrender = () => {
                };
            }
        }

        if (this.wind) {
            this.wind.prerender();
            this.wind.render();
        }
    }

    project(coordinates) {

        const position = this.engine.map.projectArrayCoordinate(coordinates);
        const camera = this.engine.camera;
        const renderer = this.engine.renderer;

        _tempMatrix4.multiplyMatrices(
            camera.projectionMatrix, camera.matrixWorldInverse);

        _tempVector3.set(position[0], position[1], position[2]).applyMatrix4(_tempMatrix4);
        const ndc = _tempVector3;

        // console.log(ndc);

        // 如果需要，可检查点是否在相机前方、是否在可视锥内
        // （z 分量在 -1 到 +1 之间表示在近截面到远截面之间）
        if (ndc.z < -1 || ndc.z > 1) {
            // 点在相机后面或超出可视范围，可以返回 null 或者做其他处理
            return null;
        }

        // 2. 计算画布尺寸（像素级）
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        // 3. NDC 转屏幕坐标
        const screenX = (ndc.x + 1) * 0.5 * width;
        // 注意：浏览器 y 轴向下为正，所以要做一次翻转
        const screenY = (1 - (ndc.y + 1) * 0.5) * height;

        // 返回屏幕像素坐标
        return [screenX, screenY];

    }

    unproject(pixel) {
        // const engine = this.engine;
        // const pick = new Vector2(pixel.x, pixel.y);
        // _tempVector3.copy(engine.rendering.picking.pickSeaLevelWorldPosition(pick));

        // // 没有交点
        // if (_tempVector3.x === 0 && _tempVector3.y === 0 && _tempVector3.z === 0) {
        //     return null;
        // }

        // const point = engine.map.unprojectArrayCoordinate(_tempVector3.toArray());
        // return [point[0], point[1]];
        return null;

    }

    intersectsCoordinate(coordinate) {
        const map = this.engine.map;
        const occluder = map.map.occluder;
        if (occluder) {
            _tempVector3.fromArray(map.projectArrayCoordinate(coordinate));
            return occluder.isPointVisible(_tempVector3);
        }

        return true;
    }
}

export {MapvThreeWind};