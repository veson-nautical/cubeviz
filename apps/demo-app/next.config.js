const path = require('path');
/** @type {import('next').NextConfig} */
module.exports = {
  // reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@cubeviz/core', '@cubeviz/echarts'],
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
};
