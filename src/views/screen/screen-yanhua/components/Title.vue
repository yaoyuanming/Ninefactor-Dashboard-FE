<template>
  <div class="title-common">
    <div class="monitoring-section-title">
      <!-- 动态标题 -->
      <div class="section-title">
        <img class="img1" src="@/assets/screen/imgs/title1.png" />
        <img class="img2" src="@/assets/screen/imgs/title2.png" />

        <div class="text">
          {{ title }}
          <span v-if="src" class="img-wrapper" @click.stop="handleImgClick">
            <img class="border-line" :src="src" @click.stop="handleImgClick" />
          </span>
        </div>
      </div>
      <!-- 可配置的时间切换标签 -->
      <div class="time-tabs">
        <span
          v-for="(tab, index) in tabs"
          :key="index"
          class="time-tab"
          :class="{ active: activeTab === tab?.value }"
          @click="handleTabClick(tab?.value)"
        >
          {{ tab?.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, defineEmits, onMounted } from 'vue';

  // 定义组件参数
  const props = defineProps({
    // 标题文本
    title: {
      type: String,
      default: '报警统计',
    },
    // 可选标签数组
    tabs: {
      type: Array as () => any[],
      default: () => [
        {
          label: '当天',
          value: 'daily',
        },
        {
          label: '本月',
          value: 'monthly',
        },
        {
          label: '本年',
          value: 'yearly',
        },
      ],
    },
    src: {
      type: String,
      default: '',
    },
    // 初始选中的标签
    initialTab: {
      type: String,
      default: 'daily',
    },
  });

  // 定义组件事件
  const emit = defineEmits(['tabChange', 'imgClick']);

  // 当前选中标签
  const activeTab = ref(props.initialTab);

  // 监听初始标签的变化
  watch(
    () => props.initialTab,
    (newVal) => {
      activeTab.value = newVal;
    }
  );

  // 标签点击处理函数
  const handleTabClick = (tab: string) => {
    if (activeTab.value === tab) return;
    activeTab.value = tab;
    // 触发事件并传递当前选中的标签
    emit('tabChange', tab);
  };

  // 图片点击处理函数
  const handleImgClick = () => {
    console.log('Title组件：图片被点击了');
    console.log('src prop值：', props.src);
    emit('imgClick');
  };

  // 组件挂载后检查
  onMounted(() => {
    console.log(`Title组件已挂载 - ${props.title}`);
    console.log('props.src:', props.src);
    console.log('src是否存在:', !!props.src);

    // 添加调试：检查图片元素
    setTimeout(() => {
      // 查找所有的标题文本元素
      const allTexts = document.querySelectorAll('.text');
      let targetElement = null;

      allTexts.forEach((el) => {
        if (el.textContent?.trim().includes(props.title)) {
          targetElement = el;
        }
      });

      if (targetElement) {
        const imgWrapper = targetElement.querySelector('.img-wrapper');
        const img = targetElement.querySelector('.border-line');
        console.log(`${props.title} - 找到目标元素`);
        console.log(`${props.title} - imgWrapper元素:`, imgWrapper);
        console.log(`${props.title} - img元素:`, img);
        if (img) {
          console.log(
            `${props.title} - img的src属性:`,
            (img as HTMLImageElement).src
          );
        }
      } else {
        console.log(`${props.title} - 未找到目标元素`);
      }
    }, 500);
  });

  // 提供可选的函数接口用于外部切换当前标签
  const setActiveTab = (tab: string) => {
    if (props.tabs.includes(tab)) {
      activeTab.value = tab;
    }
  };

  // 暴露方法给父组件
  defineExpose({
    setActiveTab,
  });
</script>

<style scoped lang="less">
  .title-common {
    position: relative;
    z-index: 100;
    width: 100%;
    pointer-events: auto !important;

    .monitoring-section-title {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .section-title {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 35px;
        border: 1px solid;
        border-image: radial-gradient(
            10% 29% at 30% 100%,
            #fff 0%,
            rgb(255 255 255 / 0%) 100%
          )
          1;

        .img1 {
          position: absolute;
          width: 100%;
          height: 35px;
        }

        .img2 {
          position: absolute;
          width: 310px;
          height: 35px;
        }

        .text {
          position: absolute;
          left: 25px;
          z-index: 2;
          display: flex;
          gap: 8px;
          align-items: center;
          height: 35px;
          font-weight: bold;
          font-size: 26px;
          font-family: YouSheBiaoTiHei, 'PingFang SC', sans-serif;
          line-height: 35px;
          letter-spacing: 0.05em;
          background: linear-gradient(
            180deg,
            #f8fcff 52%,
            rgb(255 255 255 / 66%) 100%
          );
          background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-variation-settings: 'opsz' auto;

          .img-wrapper {
            position: relative;
            z-index: 9999;
            display: inline-block;
            margin-left: 10px;
            cursor: pointer;
            pointer-events: auto !important;

            .border-line {
              width: 25px;
              height: 25px;
              vertical-align: middle;
              cursor: pointer;
              transition: opacity 0.3s ease;
              pointer-events: auto !important;
            }

            &:hover .border-line {
              opacity: 0.8;
            }
          }
        }
      }

      .time-tabs {
        display: flex;

        .time-tab {
          padding: 4px 8px;
          color: #666;
          font-size: 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            color: #409eff;
            background-color: rgb(64 158 255 / 10%);
          }

          &.active {
            color: #fff;
            font-weight: 500;
            background-color: #409eff;
          }

          & + .time-tab {
            margin-left: 4px;
          }
        }
      }
    }
  }
</style>
