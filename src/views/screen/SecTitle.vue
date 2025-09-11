<template>
  <div class="title-common">
    <div class="monitoring-section-title">
      <!-- 动态标题 -->
      <div class="section-title">
        <img class="icon" src="@/assets/imgs/screen/clear.png" />
        <div class="text">{{ title }}</div>
      </div>
    </div>
    <!-- <img class="border-line" src="@/assets/imgs/screen/line.png" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 定义组件参数
const props = defineProps({
  // 标题文本
  title: {
    type: String,
    default: '报警统计'
  },
  src: {
    type: String,
    default: ''
  }
})
</script>

<style scoped lang="scss">
.title-common {
  width: 100%;

  .monitoring-section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .section-title {
      position: relative;
      width: 100%;
      height: 22px;
      box-sizing: border-box;

      .icon {
        position: absolute;
        left: -4;
        top: 2px;
        width: 27px;
        height: 24px;
        opacity: 1;
      }
      .text {
        position: absolute;
        left: 40px;
        height: 22px;
        font-family: AlibabaPuHuiTi;
        font-size: 16px;
        font-weight: bold;
        line-height: normal;
        letter-spacing: 0em;
        color: #e7f0ff;
      }
    }
  }
}
</style>