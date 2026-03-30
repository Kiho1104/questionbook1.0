/** @type {import('tailwindcss').Config} */
module.exports = {
  // 这里指定所有包含 Tailwind 类名的文件路径
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
      }
    },
  },
  plugins: [],
  corePlugins: {
    // 小程序不需要 preflight，因为它会重置一些基础样式导致问题
    preflight: false,
  },
}
