<template>
  <div class="title-common">
    <div class="monitoring-section-title">
      <!-- 动态标题 -->
      <div class="section-title">
        <img class="img1" src="@/assets/imgs/screen/title1.png" />
        <img class="img2" src="@/assets/imgs/screen/title2.png" />
        <div class="text" >{{ title }}</div>
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
  // 可选标签数组
  tabs: {
    type: Array as () => any[],
    default: () => [
      {
        label: '当天',
        value: 'daily'
      },
      {
        label: '本月',
        value: 'monthly'
      },
      {
        label: '本年',
        value: 'yearly'
      }
    ]
  },
  src: {
    type: String,
    default: ''
  },
  // 初始选中的标签
  initialTab: {
    type: String,
    default: 'daily'
  }
})

// 定义组件事件
const emit = defineEmits(['tab-change'])

// 当前选中标签
const activeTab = ref(props.initialTab)

// 监听初始标签的变化
watch(
  () => props.initialTab,
  (newVal) => {
    activeTab.value = newVal
  }
)

// 标签点击处理函数
const handleTabClick = (tab: string) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  // 触发事件并传递当前选中的标签
  emit('tab-change', tab)
}

// 提供可选的函数接口用于外部切换当前标签
const setActiveTab = (tab: string) => {
  if (props.tabs.includes(tab)) {
    activeTab.value = tab
  }
}

// 暴露方法给父组件
defineExpose({
  setActiveTab
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
      height: 35px;
      box-sizing: border-box;
      border: 1px solid;
      border-image: radial-gradient(10% 29% at 30% 100%, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%) 1;

      .img1 {
        position: absolute;
        height: 35px;
        width: 100%;
      }
      .img2  {
        position: absolute;
        width: 310px;
        height: 35px;
      }
      .text {
        position: absolute;
        left: 25px;
        height: 35px;
        line-height: 35px;
        font-weight: bold;
        color: #fff
      }
    }

    .time-tabs {
      display: flex;

      .time-tab {
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        color: #666;
        transition: all 0.3s ease;
        border-radius: 6px;

        &:hover {
          color: #409eff;
          background-color: rgba(64, 158, 255, 0.1);
        }

        &.active {
          color: #fff;
          background-color: #409eff;
          font-weight: 500;
        }

        & + .time-tab {
          margin-left: 4px;
        }
      }
    }
  }
  .border-line {
    width: 100%;
  }
}
</style>