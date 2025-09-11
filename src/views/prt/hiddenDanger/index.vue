<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-tabs v-model="activeName" class="demo-tabs">
      <el-tab-pane label="上报明细" name="1"/>
      <el-tab-pane label="上报排行" name="2"/>
    </el-tabs>
  </ContentWrap>
  <ContentWrap>
    <Details v-if="activeName == '1'"/>
    <Ranking v-if="activeName == '2'"/>
  </ContentWrap>

</template>

<script setup lang="ts">
import Details from "@/views/prt/hiddenDanger/details.vue"
import Ranking from "@/views/prt/hiddenDanger/ranking.vue"
let activeName = ref('1')

/** 初始化 **/
onMounted(() => {
})
</script>
