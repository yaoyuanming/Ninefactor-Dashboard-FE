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
    <!-- 工作台 -->
    <el-button class="work-home" @click="openModal('home')">
      <img class="img" src="@/assets/screen/top/work-home.png" />
    </el-button>
  </div>
</template>

<script lang="ts" setup>
  import { onBeforeUnmount, onMounted, ref } from 'vue';
  import dayjs from 'dayjs';
  import { baseConfig } from '../config';

  const timeRef = ref();
  const utcDate = ref(dayjs().format('YYYY-MM-DD'));
  const utcTime = ref(dayjs().format('HH:mm:ss'));

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
      top: 12px;
      width: 1920px;
      color: #fff;
      font-weight: bold;
      font-size: 32px;
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
      width: 130px;
      height: 40px;
      background: #0000;
      border: none;
      pointer-events: fill;

      .img {
        width: 160px;
      }
    }
  }
</style>
