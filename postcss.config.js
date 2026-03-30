// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // 关键插件：将 Tailwind 类名转换为小程序兼容的格式
    'weapp-tailwindcss/postcss': {
      // 这里的配置可以根据需要调整
    },
  },
}
