<template>
  <div class="sec-title">
    <img class="icon" src="@/assets/screen/imgs/second-title.png" />
    <div class="label">{{ props.title }}</div>
  </div>
</template>

<script setup lang="ts">
  import { defineProps } from 'vue';

  // 定义组件参数
  const props = defineProps({
    // 标题文本
    title: {
      type: String,
      default: '报警统计',
    },
  });
</script>

<style scoped lang="less">
  .sec-title {
    position: relative;
    margin-top: 12px;

    .icon {
      position: absolute;
      top: 0;
      left: -4;
      width: 27px;
      height: 24px;
      opacity: 1;
    }

    .label {
      display: inline-block;
      padding-left: 34px;
      color: #e7f0ff;
      font-weight: bold;
      font-size: 16px;
      font-family: AlibabaPuHuiTi, 'PingFang SC', sans-serif;
      line-height: normal;
      letter-spacing: 0;
      font-variation-settings: 'opsz' auto;
      font-feature-settings: 'kern' on;
    }
  }
</style>
