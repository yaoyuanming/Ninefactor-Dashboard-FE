<template>
  <div class="content-top" :style="`z-index: ${baseConfig.topConfig.zIndex}`">
    <img class="top-image" src="@/assets/screen/top/top-header.png" />
    <div class="top-text">{{ baseConfig.title }}</div>
    <!-- 时间 -->
    <div class="time-modal">
      <div class="time">{{ utcTime }}</div>
      <div class="day">{{ utcDate }}</div>
    </div>
    <!-- 天气 -->
    <div class="work-weather">
      <iframe
        width="200"
        scrolling="no"
        height="20"
        frameborder="0"
        allowtransparency="true"
        src="https://i.tianqi.com?c=code&id=53&color=%23ffffff&icon=1&site=12&lang=cn"
      ></iframe>
    </div>
    <!-- 系统设置 -->
    <a-button class="work-home" @click="goToSystem">
      <img class="img" src="@/assets/screen/top/setting.png" />
    </a-button>

    <!-- 操作按钮 -->
    <div class="action-button">
      <div
        v-for="(tab, index) in operationTabs"
        :key="index"
        class="operation-tab"
        @click="() => actionChange(index)"
      >
        <img
          :src="currentTab === index ? tab.iconA : tab.icon"
          alt="tab icon"
          class="tab-icon"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onBeforeUnmount, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import { baseConfig } from '../config';
  import zha from '../../../../assets/screen/top/zh-a.png';
  import zh from '../../../../assets/screen/top/zh.png';
  import yja from '../../../../assets/screen/top/yj-a.png';
  import yj from '../../../../assets/screen/top/yj.png';
  import jka from '../../../../assets/screen/top/jk-a.png';
  import jk from '../../../../assets/screen/top/jk.png';
  import fxa from '../../../../assets/screen/top/fx-a.png';
  import fx from '../../../../assets/screen/top/fx.png';
  import tja from '../../../../assets/screen/top/tj-a.png';
  import tj from '../../../../assets/screen/top/tj.png';
  import spa from '../../../../assets/screen/top/sp-a.png';
  import sp from '../../../../assets/screen/top/sp.png';

  const router = useRouter();
  const timeRef = ref();
  const utcDate = ref(dayjs().format('YYYY-MM-DD'));
  const utcTime = ref(dayjs().format('HH:mm:ss'));

  // 顶部操作列
  const emit = defineEmits(['action']);
  const currentTab = ref(0);
  const operationTabs = ref([
    {
      icon: zh,
      iconA: zha,
    },
    {
      icon: yj,
      iconA: yja,
    },
    {
      icon: jk,
      iconA: jka,
    },
    {
      icon: fx,
      iconA: fxa,
    },
    {
      icon: tj,
      iconA: tja,
    },
    {
      icon: sp,
      iconA: spa,
    },
  ]);

  const actionChange = (index: number) => {
    currentTab.value = index;
    emit('action', index);
  };

  // 跳转到系统设置
  const goToSystem = () => {
    router.push('/system');
  };

  onMounted(async () => {
    timeRef.value = setInterval(() => {
      utcDate.value = dayjs().format('YYYY-MM-DD');
      utcTime.value = dayjs().format('HH:mm:ss');
    }, 1000);
  });
  onBeforeUnmount(() => {
    clearInterval(timeRef.value);
  });
</script>

<style lang="less" scoped>
  .content-top {
    position: absolute;
    top: 0;
    width: 100%;

    .top-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 1920px;
    }

    .top-text {
      position: absolute;
      top: 16px;
      width: 1920px;
      color: #fff;
      font-weight: bold;
      font-size: 24px;
      font-family: 'Helvetica Neue', Helvetica, 'PingFang SC',
        'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      line-height: normal;
      letter-spacing: 0;
      text-align: center;
      text-shadow: 0 3.29px 47.64px rgb(0 0 0 / 59%);
      font-variation-settings: 'opsz' auto;
    }

    .time-modal {
      position: absolute;
      top: 20px;
      left: 20px;
      pointer-events: fill;

      .time {
        display: inline-block;
        color: #fff;
        font-weight: bold;
        font-size: 20px;
        line-height: 32px;
        letter-spacing: 0.01em;
        text-shadow: 0.77px 0.77px 0 rgb(0 0 0 / 21%);
      }

      .day {
        display: inline-block;
        padding-left: 12px;
        color: #93bbff;
        font-size: 14px;
        line-height: 32px;
        letter-spacing: 0;
        text-shadow: 0.77px 0.77px 0 rgb(0 0 0 / 21%);
      }
    }

    .work-weather {
      position: absolute;
      top: 35px;
      right: 85px;
    }

    .work-home {
      position: absolute;
      top: 0;
      right: 20px;
      z-index: 10;
      width: 130px;
      height: 40px;
      background: transparent;
      border: none;
      cursor: pointer;
      pointer-events: all;

      .img {
        width: 160px;
      }
    }

    .action-button {
      position: absolute;
      top: 75px;
      right: 0;
      left: 0;
      display: flex;
      justify-content: center;
      width: 100%;
      cursor: pointer;
      pointer-events: none; // 默认不接收点击事件

      .operation-tab {
        width: 160.54px;
        cursor: pointer;
        pointer-events: all; // 只有tab按钮本身接收点击事件

        .tab-icon {
          width: 160.54px;
          cursor: pointer;
        }
      }
    }
  }
</style>
