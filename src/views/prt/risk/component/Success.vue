<template>
  <div style="text-align: center">
    <el-image style="width: 100px; height: 100px" :src="url" />
    <div style="margin-top: 20px"> 创建成功</div>
    <div style="margin-top: 20px">
      <el-button @click="handleBack()">返回列表</el-button>
      <el-button @click="createRiskPoint()">创建风险点</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import url from '@/assets/imgs/prt/1.png'
import {useTagsViewStore} from "@/store/modules/tagsView";
import {useRouter} from "vue-router";
import {defineEmits} from "vue";
const router = useRouter() // 路由
const { delView } = useTagsViewStore() // 视图操作
/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.push({ name: 'PrtRiskIndex' })
}
const emit = defineEmits(['createRiskPoint'])
const createRiskPoint = () => {
  emit('createRiskPoint')
}
</script>

<style scoped>
.demo-formData {
  margin: 0 auto;
}

.image-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 20px;
  height: auto !important; /* 覆盖默认高度 */
  padding-left: 0 !important; /* 移除默认左边距 */
}

/* 图片样式 */
.checkbox-image {
  width: 100px;
  height: 100px;
  display: block;
  border: 1px solid #eee;
  border-radius: 4px;
}

/* 将默认复选框移到图片右上角 */
.image-checkbox :deep(.el-checkbox__input) {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 1;
}

/* 复选框选中样式 */
.image-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #409eff;
  border-color: #409eff;
}
</style>
