<template>
<!--  <ContentWrap>-->
<!--    &lt;!&ndash; 搜索工作栏 &ndash;&gt;-->
<!--    <el-tabs v-model="activeName" class="demo-tabs">-->
<!--      <el-tab-pane label="事项申请" name="1" />-->
<!--      <el-tab-pane label="待办事项" name="2" />-->
<!--      <el-tab-pane label="消息通知" name="3" />-->
<!--    </el-tabs>-->
<!--  </ContentWrap>-->
<!--  <div v-if="activeName == '2'">-->
    <MatterPage/>
<!--  </div>-->
</template>

<script setup lang="ts">
import MatterPage  from "./matterPage.vue";
// let activeName = ref('1')
</script>
