import { mergeConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import baseConfig from './vite.config.base';

export default mergeConfig(
  {
    mode: 'development',
    server: {
      open: true,
      fs: {
        strict: true,
      },
      proxy: {
        '/api': {
          // 匹配请求路径，请讲一个故事
          target: 'http://8.138.193.115:86', // 代理的目标地址
          changeOrigin: true, // 开发模式，默认的origin是真实的 origin:localhost:3000 代理服务会把origin修改为目标地址
          // http://20.150.147.42/api/swagger-ui.html#/
          // secure: true, // 是否https接口
          // ws: true, // 是否代理websockets
          // rewrite target目标地址 + '/abc'，如果接口是这样的，那么不用重写
          // rewrite: (path) => path.replace(/^\/api/, ''), // 路径重写，本项目不需要重写
        },
      },
    },
    plugins: [
      eslint({
        cache: false,
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        exclude: ['node_modules'],
      }),
    ],
  },
  baseConfig
);
