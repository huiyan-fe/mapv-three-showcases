/* eslint-disable max-len */
import React from 'react';
import ReactDOM from 'react-dom';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import 'antd/dist/reset.css';
import * as mapvthree from '@baidumap/mapv-three';

mapvthree.BaiduMapConfig.ak = import.meta.env.VITE_BAIDU_MAP_AK;
mapvthree.CesiumConfig.accessToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;
mapvthree.MapboxConfig.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

window.React = React;
window.ReactDOM = ReactDOM;

createRoot(document.getElementById('root')).render(
    <App />
);
