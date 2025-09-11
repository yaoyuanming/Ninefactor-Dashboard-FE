<template>
  <ContentWrap>
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="部门" name="dept"/>
      <el-tab-pane label="组织架构图" name="picture"/>
    </el-tabs>
  </ContentWrap>
  <Dept v-if="activeName == 'dept'"/>
  <PicTure v-if="activeName == 'picture'"/>
</template>
<script lang="ts" setup>
const activeName = ref("dept")
import Dept from "./DeptConponent/index.vue"
import PicTure from "./picture.vue"
</script>
