<template>
  <div class="history-playback">
    <!-- 大华播放器 -->
    <div
      v-show="activeVendor !== 'HIKVISION'"
      id="ws-record-player"
      class="player-host"
    ></div>

    <!-- 海康播放器 -->
    <div
      v-show="activeVendor === 'HIKVISION'"
      class="player-host"
      style="position: relative"
    >
      <div id="hk_playback_window" class="player-host"></div>
      <div class="hk-controls">
        <button class="hk-btn" :class="{ active: hkPaused }" @click="hkPause">
          暂停
        </button>
        <button class="hk-btn" :class="{ active: !hkPaused }" @click="hkResume">
          恢复
        </button>
        <button class="hk-btn" @click="hkSlow">慢放</button>
        <button
          class="hk-btn"
          :class="{ active: hkRate === 1 }"
          @click="() => hkSetRate(1)"
        >
          1x
        </button>
        <button class="hk-btn" @click="hkFast">快放</button>
        <span class="hk-rate">速率: {{ hkRate }}x</span>
        <button class="hk-btn" @click="hkStop">关闭</button>
        <button class="hk-btn" @click="hkFullScreen">全屏</button>
        <button class="hk-btn" @click="() => hkArrange(1)">1</button>
        <button class="hk-btn" @click="() => hkArrange(2)">4</button>
        <button class="hk-btn" @click="() => hkArrange(3)">9</button>
        <button class="hk-btn" @click="() => hkArrange(4)">16</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, onMounted, nextTick, onBeforeUnmount } from 'vue';
  import { getCameraStreamPlayback } from '@/api/camera';
  // @ts-ignore
  import DahuaPlayerManager from './icc/PlayerManager';

  interface Props {
    selectedCameras?: Record<string, any>;
    startTime?: string;
    endTime?: string;
    trigger?: number;
  }

  const props = defineProps<Props>();

  // @ts-ignore 声明全局 JSPlugin (海康)
  declare const JSPlugin: any;

  let dhPlayer: any = null;
  let hkPlugin: any = null;
  let hkCurIndex = 0;
  const activeVendor = ref<'DAHUA' | 'HIKVISION'>('DAHUA');
  const hkTotalWindows = ref(9);
  let hkNextIndex = 0;
  const currentWindowIndex = ref(0);
  const maxWindows = ref(9);

  const hkRate = ref(1);
  const hkPaused = ref(false);

  // 初始化海康播放器 - 提前定义避免 use-before-define
  const ensureInitHK = async () => {
    if (hkPlugin) return;
    await nextTick();
    if (typeof JSPlugin === 'undefined') {
      return;
    }

    try {
      hkPlugin = new JSPlugin({
        szId: 'hk_playback_window',
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
            if (index >= 0 && iErrorCode >= 0 && oError) {
              // 错误处理
            }
          },
        });
      }

      if (hkPlugin && hkPlugin.JS_ArrangeWindow) {
        try {
          await hkPlugin.JS_ArrangeWindow(3);
        } catch (error) {
          // 设置分屏失败
        }
      }
      hkTotalWindows.value = 9;
    } catch (e) {
      // 初始化失败
    }
  };

  // 处理拖拽进度条 - 提前定义避免 use-before-define
  const handleTimeSeek = async (data: any) => {
    try {
      const { timeStamp, channelData } = data;
      if (!timeStamp || !channelData) return;

      const seekTime = Math.floor(timeStamp / 1000).toString();

      const params = {
        id: channelData.id,
        vendorType: channelData.vendorType || 'DAHUA',
        startTime: seekTime,
        endTime: channelData.endTime,
      };

      const response: any = await getCameraStreamPlayback(params);

      if (response) {
        const { url, token, records } = response;
        let rtspURL = url || '';
        if (token) {
          rtspURL = `${url}?token=${token}`;
        }

        let wsURL = '';
        try {
          const u = new URL(url);
          const isHttps = window.location.protocol === 'https:';
          wsURL = isHttps
            ? 'wss://srmi-icc.di-digo.com:9322'
            : `ws://${u.host}/`;
        } catch (e) {
          const isHttps = window.location.protocol === 'https:';
          wsURL = isHttps
            ? 'wss://srmi-icc.di-digo.com:9322'
            : 'ws://27.156.116.46:9320/';
        }

        if (dhPlayer && records && records.length > 0) {
          dhPlayer.recordByUrl({
            wsURL,
            rtspURL,
            channelId: records[0]?.channelId || params.id,
            records,
            selectIndex: currentWindowIndex.value,
            startTime: parseInt(seekTime, 10),
            endTime: parseInt(params.endTime, 10),
            playRecordByTime: true,
            isSeekRecord: true,
            channelData: params,
          });
        }
      }
    } catch (error) {
      // seek failed
    }
  };

  // 海康控制函数
  const hkSetRate = async (rate: number) => {
    await ensureInitHK();
    const idx = hkCurIndex;
    try {
      if (hkPlugin?.JS_SetPlaybackRate) {
        await hkPlugin.JS_SetPlaybackRate(idx, rate);
        hkRate.value = rate;
        return;
      }
      if (hkPlugin?.JS_SetPlayRate) {
        await hkPlugin.JS_SetPlayRate(idx, rate);
        hkRate.value = rate;
      }
    } catch (e) {
      // set rate failed
    }
  };

  // 初始化大华播放器
  const initDahuaPlayer = async () => {
    await nextTick();
    if (typeof DahuaPlayerManager === 'undefined') {
      return;
    }

    dhPlayer = new DahuaPlayerManager({
      el: 'ws-record-player',
      type: 'record',
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
        if (methods === 'windowNumChanged') {
          if (data && typeof data === 'number') {
            maxWindows.value = data;
            currentWindowIndex.value = 0;
          }
        } else if (methods === 'switchStartTime') {
          // 处理拖拽时间轴
          handleTimeSeek(data);
        }
      },
    });
  };

  // 海康选择窗口
  const hkSelectWindow = async (index: number) => {
    if (hkPlugin && hkPlugin.JS_SelectWnd) {
      try {
        await hkPlugin.JS_SelectWnd(index);
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 120);
        });
      } catch (error) {
        // 选择窗口失败
      }
    }
  };

  const hkPause = async () => {
    await ensureInitHK();
    const idx = hkCurIndex;
    try {
      if (hkPlugin?.JS_PausePlayback) {
        await hkPlugin.JS_PausePlayback(idx, true);
        hkPaused.value = true;
        return;
      }
      if (hkPlugin?.JS_Pause) {
        await hkPlugin.JS_Pause(idx);
        hkPaused.value = true;
      }
    } catch (e) {
      // pause failed
    }
  };

  const hkResume = async () => {
    await ensureInitHK();
    const idx = hkCurIndex;
    try {
      if (hkPlugin?.JS_PausePlayback) {
        await hkPlugin.JS_PausePlayback(idx, false);
        hkPaused.value = false;
        return;
      }
      if (hkPlugin?.JS_Resume) {
        await hkPlugin.JS_Resume(idx);
        hkPaused.value = false;
      }
    } catch (e) {
      // resume failed
    }
  };

  const hkSlow = async () => {
    await ensureInitHK();
    const idx = hkCurIndex;
    try {
      if (hkPlugin?.JS_Slow) {
        const rate = await hkPlugin.JS_Slow(idx);
        if (typeof rate === 'number') hkRate.value = rate;
        return;
      }
      const next = Math.max(hkRate.value / 2, 0.125);
      await hkSetRate(next);
    } catch (e) {
      // slow failed
    }
  };

  const hkFast = async () => {
    await ensureInitHK();
    const idx = hkCurIndex;
    try {
      if (hkPlugin?.JS_Fast) {
        const rate = await hkPlugin.JS_Fast(idx);
        if (typeof rate === 'number') hkRate.value = rate;
        return;
      }
      const next = Math.min(hkRate.value * 2, 8);
      await hkSetRate(next);
    } catch (e) {
      // fast failed
    }
  };

  const hkFullScreen = async () => {
    await ensureInitHK();
    try {
      if (hkPlugin?.JS_FullScreenSingle) {
        await hkPlugin.JS_FullScreenSingle(hkCurIndex);
        return;
      }
      if (hkPlugin?.JS_FullScreenDisplay) {
        await hkPlugin.JS_FullScreenDisplay(true);
      }
    } catch (e) {
      // fullscreen failed
    }
  };

  const hkStop = async () => {
    await ensureInitHK();
    const idx = hkCurIndex;
    try {
      if (hkPlugin?.JS_Stop) {
        await hkPlugin.JS_Stop(idx);
        hkPaused.value = false;
        return;
      }
      if (hkPlugin?.JS_StopPlayback) {
        await hkPlugin.JS_StopPlayback(idx);
        hkPaused.value = false;
      }
    } catch (e) {
      // stop failed
    }
  };

  const hkArrange = async (num: 1 | 2 | 3 | 4) => {
    await ensureInitHK();
    try {
      if (hkPlugin?.JS_ArrangeWindow) {
        await hkPlugin.JS_ArrangeWindow(num);
        if (num === 1) {
          hkTotalWindows.value = 1;
        } else if (num === 2) {
          hkTotalWindows.value = 4;
        } else if (num === 3) {
          hkTotalWindows.value = 9;
        } else {
          hkTotalWindows.value = 16;
        }
      }
    } catch (e) {
      // arrange failed
    }
  };

  // 播放回放视频
  const playPlaybackVideos = async () => {
    if (
      !props.selectedCameras ||
      Object.keys(props.selectedCameras).length === 0
    ) {
      console.log('没有选中的摄像头');
      return;
    }
    if (!props.startTime || !props.endTime) {
      console.log('缺少时间参数');
      return;
    }

    console.log('开始播放历史回放:', {
      cameras: props.selectedCameras,
      startTime: props.startTime,
      endTime: props.endTime,
    });

    const startTimestamp = Math.floor(
      new Date(props.startTime).getTime() / 1000
    ).toString();
    const endTimestamp = Math.floor(
      new Date(props.endTime).getTime() / 1000
    ).toString();

    console.log('时间戳转换:', {
      startTimestamp,
      endTimestamp,
    });

    const cameraEntries = Object.entries(props.selectedCameras);
    console.log('准备播放摄像头数量:', cameraEntries.length);

    // 使用 Promise.all 替代 for...of 循环
    await Promise.all(
      cameraEntries.map(async ([id, camera]) => {
        const vendorType = camera.vendorType || 'DAHUA';
        console.log(
          `播放摄像头 [${camera.title}] (${id}), 厂商: ${vendorType}`
        );

        if (vendorType === 'HIKVISION') {
          activeVendor.value = 'HIKVISION';
          try {
            await ensureInitHK();
            console.log('调用海康回放接口:', {
              id,
              vendorType: 'HIKVISION',
              startTime: startTimestamp,
              endTime: endTimestamp,
            });

            const response: any = await getCameraStreamPlayback({
              id,
              vendorType: 'HIKVISION',
              startTime: startTimestamp,
              endTime: endTimestamp,
            });

            console.log('海康回放接口返回:', response);

            if (response) {
              const rawUrl = response.url || '';
              const originalUrl =
                typeof rawUrl === 'string' ? rawUrl : String(rawUrl ?? '');

              let startSec = Number.parseInt(startTimestamp, 10);
              let endSec = Number.parseInt(endTimestamp, 10);
              let playUrl = originalUrl;

              try {
                const u = new URL(originalUrl);
                const bt = u.searchParams.get('beginTime');
                const et = u.searchParams.get('endTime');

                const parseHikTimeToUnix = (t?: string | null) => {
                  if (!t) return undefined;
                  const y = Number(t.slice(0, 4));
                  const m = Number(t.slice(4, 6)) - 1;
                  const d = Number(t.slice(6, 8));
                  const hh = Number(t.slice(9, 11));
                  const mm = Number(t.slice(11, 13));
                  const ss = Number(t.slice(13, 15));
                  const ts = Date.UTC(y, m, d, hh, mm, ss) / 1000;
                  return Number.isFinite(ts) ? ts : undefined;
                };

                const s = parseHikTimeToUnix(bt);
                const e = parseHikTimeToUnix(et);
                if (typeof s === 'number') startSec = s;
                if (typeof e === 'number') endSec = e;

                u.searchParams.delete('beginTime');
                u.searchParams.delete('endTime');

                if (
                  window.location.protocol === 'https:' &&
                  u.protocol === 'ws:'
                ) {
                  u.protocol = 'wss:';
                }
                playUrl = u.toString();
              } catch (err) {
                playUrl = originalUrl;
              }

              const toIsoZ = (sec: number) =>
                new Date(sec * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
              const startTimeISO = toIsoZ(startSec);
              const endTimeISO = toIsoZ(endSec);

              const playConfig: any = {
                playURL: playUrl,
                mode: 0,
                PlayBackMode: 1,
                keepDecoder: 0,
              };

              const preIndex = hkNextIndex % hkTotalWindows.value;
              await hkSelectWindow(preIndex);
              await hkPlugin.JS_Play(
                playUrl,
                playConfig,
                preIndex,
                startTimeISO,
                endTimeISO
              );
              hkNextIndex = (preIndex + 1) % hkTotalWindows.value;
            }
          } catch (e) {
            // HIKVISION playback failed
          }
          return;
        }

        // DAHUA 回放
        console.log('调用大华回放接口:', {
          id,
          vendorType,
          startTime: startTimestamp,
          endTime: endTimestamp,
        });

        const response: any = await getCameraStreamPlayback({
          id,
          vendorType,
          startTime: startTimestamp,
          endTime: endTimestamp,
        });

        console.log('大华回放接口返回:', response);

        if (response) {
          const { url, token, records } = response;
          let rtspURL = url || '';
          if (token) {
            rtspURL = `${url}?token=${token}`;
          }

          let wsURL = '';
          try {
            const u = new URL(url);
            const isHttps = window.location.protocol === 'https:';
            wsURL = isHttps
              ? 'wss://srmi-icc.di-digo.com:9322'
              : `ws://${u.host}/`;
          } catch (e) {
            const isHttps = window.location.protocol === 'https:';
            wsURL = isHttps
              ? 'wss://srmi-icc.di-digo.com:9322'
              : 'ws://27.156.116.46:9320/';
          }

          if (dhPlayer && records && records.length > 0) {
            const channelId = records[0]?.channelId || id;
            console.log('调用大华播放器 recordByUrl:', {
              wsURL,
              rtspURL,
              channelId,
              recordsCount: records.length,
              selectIndex: currentWindowIndex.value,
            });

            dhPlayer.recordByUrl({
              wsURL,
              rtspURL,
              channelId,
              records,
              selectIndex: currentWindowIndex.value,
              startTime: parseInt(startTimestamp, 10),
              endTime: parseInt(endTimestamp, 10),
              playRecordByTime: true,
              isSeekRecord: false,
              channelData: {
                id,
                startTime: startTimestamp,
                endTime: endTimestamp,
                vendorType,
              },
            });
            currentWindowIndex.value =
              (currentWindowIndex.value + 1) % maxWindows.value;

            console.log(
              '大华播放器调用成功，窗口索引:',
              currentWindowIndex.value
            );
          } else {
            console.warn('播放器未初始化或无录像记录:', {
              dhPlayer: !!dhPlayer,
              recordsLength: records?.length || 0,
            });
          }
        }
      })
    );
  };

  // 监听查询参数变化和触发器
  watch(
    [
      () => props.selectedCameras,
      () => props.startTime,
      () => props.endTime,
      () => props.trigger,
    ],
    () => {
      // 只有当 trigger 有值时才播放（避免初始化时自动播放）
      if (props.trigger && props.trigger > 0) {
        console.log('触发历史回放:', props.trigger);
        playPlaybackVideos();
      }
    },
    { deep: true }
  );

  onMounted(async () => {
    await initDahuaPlayer();
  });

  onBeforeUnmount(() => {
    dhPlayer = null;
    hkPlugin = null;
  });
</script>

<style scoped lang="less">
  .history-playback {
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
      z-index: 10;
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 6px 8px;
      background: rgb(0 0 0 / 35%);
      border-radius: 6px;

      .hk-btn {
        padding: 4px 8px;
        color: #fff;
        font-size: 12px;
        background: transparent;
        border: 1px solid #666;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: rgb(58 132 255 / 15%);
          border-color: #3a84ff;
        }

        &.active {
          background: rgb(58 132 255 / 25%);
          border-color: #3a84ff;
          box-shadow: 0 0 0 1px #3a84ff inset;
        }
      }

      .hk-rate {
        margin: 0 6px;
        color: #fff;
        font-size: 12px;
      }
    }
  }
</style>
