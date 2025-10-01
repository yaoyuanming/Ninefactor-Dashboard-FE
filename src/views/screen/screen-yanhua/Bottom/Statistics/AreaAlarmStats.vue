<template>
  <div class="content-section">
    <div class="stats-placeholder">
      <icon-location style="color: rgb(255 255 255 / 30%); font-size: 48px" />
      <p>区域报警统计数据</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { IconLocation } from '@arco-design/web-vue/es/icon';
</script>

<style scoped lang="less">
  .content-section {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 20px;
    overflow: auto;

    .stats-placeholder {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: rgb(255 255 255 / 30%);

      p {
        margin-top: 16px;
        font-size: 14px;
      }
    }
  }
</style>
