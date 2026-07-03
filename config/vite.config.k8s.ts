import { mergeConfig } from 'vite';
import baseConfig from './vite.config.base';
import configCompressPlugin from './plugin/compress';
import configVisualizerPlugin from './plugin/visualizer';
import configArcoResolverPlugin from './plugin/arcoResolver';
import configStyleImportPlugin from './plugin/styleImport';
import configImageminPlugin from './plugin/imagemin';

// K8s 构建配置
// 使用 .env.k8s 文件中的环境变量占位符
export default mergeConfig(
  {
    mode: 'k8s',
    plugins: [
      configCompressPlugin('gzip'),
      configVisualizerPlugin(),
      configArcoResolverPlugin(),
      configStyleImportPlugin(),
      configImageminPlugin(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            arco: ['@arco-design/web-vue'],
            chart: ['echarts', 'vue-echarts'],
            vue: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'vue-i18n'],
          },
        },
      },
      chunkSizeWarningLimit: 2000,
    },
  },
  baseConfig
);
