module.exports = {
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();

    svgRule.delete('type');
    svgRule.delete('generator');

    svgRule.use('vue-loader').loader('vue-loader');
    svgRule.use('vue-svg-loader').loader('vue-svg-loader');

    config.optimization.minimizer('terser').tap((args) => {
      args[0].terserOptions.output = { ...args[0].terserOptions.output, comments: false };
      return args;
    });
  },
};
