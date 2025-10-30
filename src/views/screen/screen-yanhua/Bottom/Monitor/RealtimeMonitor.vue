<template>
  <div class="realtime-monitor">
    <!-- 大华播放器 -->
    <div
      v-show="activeVendor !== 'HIKVISION'"
      id="ws-real-player"
      class="player-host"
    ></div>

    <!-- 海康播放器 -->
    <div
      v-show="activeVendor === 'HIKVISION'"
      class="player-host"
      style="position: relative"
    >
      <div id="play_window" class="player-host"></div>
      <button
        v-for="idx in hkPlayingList"
        :key="idx"
        title="关闭该窗口"
        class="hk-close-wnd"
        :style="hkWndStyle(idx)"
        @click="hkStopAt(idx)"
      >
        ×
      </button>
      <div class="hk-controls">
        <button class="hk-btn" @click="hkSetSplit(1)">1</button>
        <button class="hk-btn" @click="hkSetSplit(2)">4</button>
        <button class="hk-btn" @click="hkSetSplit(3)">9</button>
        <button class="hk-btn" @click="hkSetSplit(4)">16</button>
        <button class="hk-btn" @click="hkFullScreenDisplay(true)">全屏</button>
        <button class="hk-btn" @click="hkStopCurrent">关闭</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    ref,
    watch,
    onMounted,
    nextTick,
    onBeforeUnmount,
    computed,
  } from 'vue';
  import { getCameraStreamPreview } from '@/api/camera';
  // @ts-ignore
  import DahuaPlayerManager from './icc/PlayerManager';

  interface Props {
    selectedNode?: any;
  }

  const props = defineProps<Props>();

  // @ts-ignore 声明全局 JSPlugin (海康)
  declare const JSPlugin: any;

  let realPlayer: any = null;
  let hkPlugin: any = null;
  const activeVendor = ref<'DAHUA' | 'HIKVISION'>('DAHUA');
  let hkCurIndex = 0;
  const hkTotalWindows = ref(9);
  let hkNextIndex = 0;
  const hkPlaying = ref<Set<number>>(new Set());
  const hkPlayingList = computed(() => Array.from(hkPlaying.value));
  const currentWindowIndex = ref(0);
  const maxWindows = ref(9);

  const addPlaying = (i: number) => {
    const s = new Set(hkPlaying.value);
    s.add(i);
    hkPlaying.value = s;
  };

  const removePlaying = (i: number) => {
    const s = new Set(hkPlaying.value);
    s.delete(i);
    hkPlaying.value = s;
  };

  // 初始化大华播放器
  const initDahuaPlayer = async () => {
    await nextTick();
    if (typeof DahuaPlayerManager === 'undefined') {
      return;
    }

    realPlayer = new DahuaPlayerManager({
      el: 'ws-real-player',
      type: 'real',
      maxNum: 25,
      num: maxWindows.value,
      showControl: true,
      showIcons: {
        streamChangeSelect: true,
        ivsIcon: true,
        talkIcon: true,
        localRecordIcon: true,
        audioIcon: true,
        snapshotIcon: true,
        closeIcon: true,
      },
      openIvs: true,
      ivsTypeArr: [1, 2],
      showRecordProgressBar: true,
      useH265MSE: true,
      picCapCb: true,
      importLoad: false,
      prefixUrl: 'static/dhPro',
      isRTPStream: true,
      receiveMessageFromWSPlayer: (methods: string, data: any) => {
        switch (methods) {
          case 'initializationCompleted':
            // 大华播放器初始化完成
            break;
          case 'realSuccess':
            // 实时预览成功
            break;
          case 'realError':
            // 实时预览失败
            break;
          case 'errorInfo':
            // 播放器错误信息
            break;
          case 'windowNumChanged':
            if (data && typeof data === 'number') {
              maxWindows.value = data;
              currentWindowIndex.value = 0;
            }
            break;
          default:
            break;
        }
      },
    });
  };

  // 初始化海康播放器
  const ensureInitHK = async () => {
    if (hkPlugin) return;
    await nextTick();
    if (typeof JSPlugin === 'undefined') {
      return;
    }

    try {
      hkPlugin = new JSPlugin({
        szId: 'play_window',
        szBasePath: '/bin',
        mseWorkerEnable: false,
        bSupporDoubleClickFull: true,
        iMaxSplit: 4,
        iCurrentSplit: 3,
      });

      if (hkPlugin && hkPlugin.JS_SetWindowControlCallback) {
        hkPlugin.JS_SetWindowControlCallback({
          windowEventSelect(index: number) {
            hkCurIndex = index;
          },
          pluginErrorHandler(index: number, iErrorCode: number, oError: any) {
            // 处理插件错误
            if (index >= 0 && iErrorCode >= 0 && oError) {
              // 错误处理逻辑
            }
          },
          InterruptStream(iWndIndex: number, interruptTime: number) {
            // 流中断
            if (iWndIndex >= 0 && interruptTime >= 0) {
              // 处理流中断
            }
          },
        });
      }

      // 强制设置为3x3分屏
      if (hkPlugin && hkPlugin.JS_ArrangeWindow) {
        try {
          await hkPlugin.JS_ArrangeWindow(3);
        } catch (error) {
          // 设置分屏失败
        }
      }
      hkTotalWindows.value = 9;
    } catch (e) {
      // 初始化海康播放器失败
    }
  };

  // 海康控制函数
  const hkSetSplit = async (num: 1 | 2 | 3 | 4) => {
    await ensureInitHK();
    if (!hkPlugin || !hkPlugin.JS_ArrangeWindow) return;
    try {
      await hkPlugin.JS_ArrangeWindow(num);
      // 设置窗口数量
      if (num === 1) {
        hkTotalWindows.value = 1;
      } else if (num === 2) {
        hkTotalWindows.value = 4;
      } else if (num === 3) {
        hkTotalWindows.value = 9;
      } else {
        hkTotalWindows.value = 16;
      }
    } catch (e) {
      // HK JS_ArrangeWindow failed
    }
  };

  const hkFullScreenDisplay = async (isFull: boolean) => {
    await ensureInitHK();
    if (!hkPlugin || !hkPlugin.JS_FullScreenDisplay) return;
    try {
      await hkPlugin.JS_FullScreenDisplay(isFull);
    } catch (e) {
      // HK JS_FullScreenDisplay failed
    }
  };

  const hkSelectWindow = async (index: number) => {
    if (hkPlugin && hkPlugin.JS_SelectWnd) {
      try {
        await hkPlugin.JS_SelectWnd(index);
        // 等待选择生效
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 120);
        });
      } catch (error) {
        // 选择窗口失败
      }
    }
  };

  const hkStopCurrent = async () => {
    await ensureInitHK();
    if (!hkPlugin) return;
    try {
      if (hkPlugin.JS_Stop) {
        await hkPlugin.JS_Stop(hkCurIndex);
        removePlaying(hkCurIndex);
        return;
      }
      if ((hkPlugin as any).JS_StopRealPlay) {
        await (hkPlugin as any).JS_StopRealPlay(hkCurIndex);
        removePlaying(hkCurIndex);
        return;
      }
      if ((hkPlugin as any).JS_StopAll) {
        await (hkPlugin as any).JS_StopAll();
        hkPlaying.value = new Set();
      }
    } catch (e) {
      // HK stop failed
    }
  };

  const hkStopAt = async (index: number) => {
    await ensureInitHK();
    if (!hkPlugin) return;
    try {
      if (hkPlugin.JS_Stop) {
        await hkPlugin.JS_Stop(index);
        removePlaying(index);
        return;
      }
      if ((hkPlugin as any).JS_StopRealPlay) {
        await (hkPlugin as any).JS_StopRealPlay(index);
        removePlaying(index);
      }
    } catch (e) {
      // HK stop at failed
    }
  };

  const gridSize = computed(() => {
    const total = hkTotalWindows.value;
    if (total === 1) return 1;
    if (total === 4) return 2;
    if (total === 9) return 3;
    return 4;
  });

  const hkWndStyle = (index: number) => {
    const g = gridSize.value;
    const row = Math.floor(index / g);
    const col = index % g;
    return {
      top: `calc(${row * (100 / g)}% + 8px)`,
      left: `calc(${(col + 1) * (100 / g)}% - 28px)`,
    };
  };

  // 播放视频
  const playVideo = async (node: any) => {
    if (!node || node.nodeType !== 'camera') {
      return;
    }

    const deviceCode = node.id;
    const vendorType = node.vendorType || 'DAHUA';

    if (vendorType === 'HIKVISION') {
      activeVendor.value = 'HIKVISION';
      try {
        await ensureInitHK();
        const response: any = await getCameraStreamPreview({
          id: deviceCode,
          vendorType: 'HIKVISION',
        });
        // 处理响应数据，提取 data 字段
        const vi = response?.data || response;
        const url = vi.url || '';
        const playConfig: any = {
          playURL: url,
          mode: 0,
          PlayBackMode: 1,
          keepDecoder: 0,
        };

        const preIndex = hkNextIndex % hkTotalWindows.value;
        await hkSelectWindow(preIndex);
        await hkPlugin.JS_Play(url, playConfig, preIndex);
        addPlaying(preIndex);
        hkNextIndex = (preIndex + 1) % hkTotalWindows.value;
      } catch (e) {
        // HIKVISION 播放失败
      }
      return;
    }

    // DAHUA 播放
    activeVendor.value = 'DAHUA';
    try {
      const response: any = await getCameraStreamPreview({
        id: deviceCode,
        vendorType: 'DAHUA',
      });
      // 处理响应数据，提取 data 字段
      const vi = response?.data || response;
      let rtspURL = vi.url || '';
      if (vi.token) {
        rtspURL = `${vi.url}?token=${vi.token}`;
      }

      let wsURL = '';
      try {
        const u = new URL(vi.url);
        const isHttps = window.location.protocol === 'https:';
        if (isHttps) {
          wsURL = 'wss://srmi-icc.di-digo.com:9102';
        } else {
          wsURL = `ws://${u.host}/`;
        }
      } catch (e) {
        const isHttps = window.location.protocol === 'https:';
        if (isHttps) {
          wsURL = 'wss://srmi-icc.di-digo.com:9102';
        } else {
          wsURL = 'ws://27.156.116.46:9100/';
        }
      }

      if (!realPlayer) {
        return;
      }

      realPlayer?.realByUrl({
        wsURL,
        rtspURL,
        channelId: deviceCode,
        selectIndex: currentWindowIndex.value,
        streamType: 1,
        playerAdapter: 'stretching',
        channelData: {},
      });

      currentWindowIndex.value =
        (currentWindowIndex.value + 1) % maxWindows.value;
    } catch (error) {
      // 播放失败
    }
  };

  // 监听选中节点变化
  watch(
    () => props.selectedNode,
    (newNode) => {
      if (newNode) {
        playVideo(newNode);
      }
    },
    { deep: true }
  );

  onMounted(async () => {
    await initDahuaPlayer();
  });

  onBeforeUnmount(() => {
    realPlayer = null;
    hkPlugin = null;
  });
</script>

<style scoped lang="less">
  .realtime-monitor {
    width: 100%;
    height: 100%;

    .player-host {
      width: 100%;
      height: 100%;
      background: #000;
    }

    .hk-controls {
      position: absolute;
      right: 12px;
      bottom: 12px;
      display: flex;
      gap: 8px;
      padding: 6px 8px;
      background: rgb(0 0 0 / 35%);
      border-radius: 6px;
    }

    .hk-btn {
      padding: 2px 6px;
      color: #fff;
      background: transparent;
      border: 1px solid #666;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: rgb(255 255 255 / 15%);
        border-color: #1796fa;
      }
    }

    .hk-close-wnd {
      position: absolute;
      z-index: 2;
      width: 20px;
      height: 20px;
      color: #fff;
      line-height: 18px;
      text-align: center;
      background: rgb(0 0 0 / 45%);
      border: 1px solid #666;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: rgb(255 0 0 / 70%);
        border-color: #f00;
      }
    }

    :deep(#play_window) {
      width: 100% !important;
      height: 100% !important;
    }
  }
</style>
