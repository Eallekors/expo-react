module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      [
        'module-resolver',
        {
          root: ['./'], 
          alias: {
            '@components': './components', 
            '@constants': './constants',
            '@screens': './screens',
            '@lib': './lib',
            '@context': './context',
            '@assets': './assets',
          },
        },
      ],
    ],
  };
};