<template>
  <section class="placeholder">
    <h2>预警监测</h2>
    <p>该区域用于展示预警监测内容，当前仅为占位。</p>
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
    background: linear-gradient(180deg, rgb(46 26 0 / 85%), rgb(19 8 0 / 93%));
    border: 1px solid rgb(255 178 84 / 35%);
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
