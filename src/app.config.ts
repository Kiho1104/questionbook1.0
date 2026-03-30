export default defineAppConfig({
  pages: [
    'pages/index/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '错题本',
    navigationBarTextStyle: 'black'
  },
  // 启用微信云开发
  cloud: true
} as any)
