module.exports = {
    extends: [
        '@ecomfe/eslint-config',
        '@ecomfe/eslint-config/react',
    ],
    parserOptions: {
        babelOptions: {
            parserOpts: {
                plugins: ['jsx'],
            },
        },
    },
    globals: {
        lbsModuleSDK: true,
    },
};