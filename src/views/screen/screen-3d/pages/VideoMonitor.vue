<template>
  <section class="placeholder">
    <h2>视频监测</h2>
    <p>这里可以放置摄像头画面或播放组件，先展示占位说明。</p>
  </section>
</template>

<script lang="ts" setup>
  // 占位组件
</script>

<style scoped lang="less">
  .placeholder {
    position: relative;
    width: 100%;
    max-width: 1780px;
    min-height: 520px;
    margin: 160px auto 0;
    padding: 48px 56px;
    color: #fff;
    background: linear-gradient(180deg, rgb(23 8 46 / 82%), rgb(6 1 18 / 94%));
    border: 1px solid rgb(141 106 255 / 35%);
    border-radius: 24px;
    box-shadow: 0 24px 60px rgb(0 0 0 / 55%);
    backdrop-filter: blur(6px);
  }

  h2 {
    margin-bottom: 18px;
    font-size: 30px;
    letter-spacing: 0.2em;
  }

  p {
    font-size: 18px;
    line-height: 2;
    opacity: 0.9;
  }
</style>
