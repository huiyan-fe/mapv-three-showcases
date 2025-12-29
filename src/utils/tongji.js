if (import.meta.env.VITE_TONGJI_KEY && import.meta.env.MODE === 'production') {
    window._disable_hmt = true;
    window._hmt = window._hmt || [];
    (function () {
        let hm = document.createElement('script');
        hm.src = `https://hm.baidu.com/hm.js?${import.meta.env.VITE_TONGJI_KEY}`;
        let s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(hm, s);
    })();
}
