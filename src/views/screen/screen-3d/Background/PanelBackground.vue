<template>
  <div class="panel-bg">
    <div class="panel-bg__grid" />
    <div class="panel-bg__glow panel-bg__glow--left" />
    <div class="panel-bg__glow panel-bg__glow--right" />
  </div>
</template>

<script setup lang="ts">
  // 静态背景组件，无逻辑
</script>

<style scoped lang="less">
  .panel-bg {
    position: absolute;
    overflow: hidden;
    background: radial-gradient(
        circle at 20% 0%,
        rgb(59 121 255 / 25%),
        transparent 55%
      ),
      radial-gradient(circle at 80% 0%, rgb(50 184 255 / 20%), transparent 60%),
      #04142a;
    pointer-events: none;
    inset: 0;
  }

  .panel-bg__grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
        rgb(255 255 255 / 4%) 1px,
        transparent 1px
      ),
      linear-gradient(90deg, rgb(255 255 255 / 4%) 1px, transparent 1px);
    background-size: 120px 120px;
    opacity: 0.5;
  }

  .panel-bg__glow {
    position: absolute;
    top: 10%;
    width: 50%;
    height: 30%;
    opacity: 0.35;
    filter: blur(120px);

    &--left {
      left: -10%;
      background: #2fd9ff;
    }

    &--right {
      right: -10%;
      background: #9b7bff;
    }
  }
</style>
