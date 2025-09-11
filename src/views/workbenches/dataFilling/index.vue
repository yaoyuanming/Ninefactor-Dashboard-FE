<template>
  <div class="p-4">
    <el-card class="max-w-300px">
      <template #header>
        <div class="flex items-center gap-2">
          <el-icon class="text-warning"><Warning /></el-icon>
          <span class="text-16px font-500">隐患排查治理</span>
        </div>
      </template>
      
      <div class="flex justify-around py-5">
        <div class="text-center">
          <div class="text-24px font-bold text-primary mb-2">100</div>
          <div class="text-14px text-gray-500">隐患总数</div>
        </div>
        <div class="text-center">
          <div class="text-24px font-bold text-primary mb-2">60</div>
          <div class="text-14px text-gray-500">已完成数</div>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-4">
        <el-button plain type="primary" @click="goPage">查看详情</el-button>
        <el-button type="primary">数据填报</el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { Warning } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const { push } = useRouter()

defineOptions({ name: 'WorkbenDatafilling' })

const goPage = () => {
  push({name:'WorkbenDatafillingDetail'})
}
</script>

<style scoped>

</style>