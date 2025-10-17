<template>
  <div class="search-box-container">
    <a-input
      v-model="searchKeyword"
      placeholder="请输入企业名称搜索"
      allow-clear
      @input="handleInputChange"
      @clear="handleClearSearch"
      @press-enter="handleSearchNow"
    >
      <template #prefix>
        <icon-search />
      </template>
    </a-input>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  // 定义事件
  const emit = defineEmits<{
    search: [keyword: string];
    clear: [];
  }>();

  // 搜索关键词
  const searchKeyword = ref('');

  // 防抖定时器
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // 立即搜索（按回车时）
  const handleSearchNow = () => {
    // 清除防抖定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    emit('search', searchKeyword.value);
  };

  // 输入变化时（使用防抖）
  const handleInputChange = () => {
    // 清除之前的定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // 设置新的定时器，500ms 后执行搜索
    debounceTimer = setTimeout(() => {
      emit('search', searchKeyword.value);
    }, 1000);
  };

  // 清除搜索
  const handleClearSearch = () => {
    // 清除防抖定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    searchKeyword.value = '';
    emit('clear');
  };

  // 暴露方法供外部调用
  defineExpose({
    getKeyword: () => searchKeyword.value,
    setKeyword: (keyword: string) => {
      searchKeyword.value = keyword;
    },
    clearSearch: () => {
      handleClearSearch();
    },
  });
</script>

<style scoped lang="less">
  .search-box-container {
    position: absolute;
    top: 140px; // 往上调整位置
    left: 520px; // 往左调整位置
    z-index: 100;
    width: 300px;
    height: 42px;
    pointer-events: auto;

    :deep(.arco-input-wrapper) {
      display: flex;
      align-items: center; // 垂直居中对齐
      width: 100%;
      height: 100%;
      background: rgb(11 36 62 / 85%);
      border: 1px solid rgb(155 204 255 / 30%);
      border-radius: 4px;
      backdrop-filter: blur(10px);
      transition: all 0.3s;

      .arco-input {
        height: 100%;
        color: #fff;
        font-size: 15px;
        line-height: 40px; // 设置行高使文字垂直居中
        background: transparent;

        &::placeholder {
          color: rgb(255 255 255 / 40%);
        }
      }

      .arco-input-prefix,
      .arco-input-clear-btn {
        display: flex;
        align-items: center; // 图标垂直居中
        color: rgb(255 255 255 / 60%);
      }

      &:hover {
        background: rgb(11 36 62 / 95%);
        border-color: rgb(155 204 255 / 50%);
      }

      &.arco-input-focus {
        background: rgb(11 36 62 / 95%);
        border-color: #1890ff;
        box-shadow: 0 0 10px rgb(24 144 255 / 30%);
      }
    }
  }
</style>
