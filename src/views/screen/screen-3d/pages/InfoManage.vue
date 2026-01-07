<template>
  <section class="placeholder">
    <h2>信息管理</h2>
    <p>信息管理、资料档案等内容后续可在此区域呈现。</p>
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
    background: linear-gradient(180deg, rgb(4 33 35 / 82%), rgb(0 15 16 / 94%));
    border: 1px solid rgb(84 255 190 / 35%);
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
