module.exports = {
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule.delete('type');
    svgRule.delete('generator');
    svgRule
      .use('vue-loader')
      .loader('vue-loader-v16')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');

    config.optimization.minimizer('terser').tap((args) => {
      args[0].terserOptions.output = { // eslint-disable-line no-param-reassign
        ...args[0].terserOptions.output,
        comments: false,
      };
      return args;
    });
  },
};
