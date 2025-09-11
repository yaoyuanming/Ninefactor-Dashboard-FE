<template>
  <el-form label-width="120px">
    <div style="font-weight: bold;font-size: 14px;margin-left: 39px;margin-bottom: 10px;"><span style="color: #0f40f5;">|</span> 基础信息</div>
    <el-form-item label="记录编号：">
      <div>{{items?.recordCode}}
        <Icon
        icon="ep:copy-document"
        class="mr-5px ml-5px"
        style="color: blue; cursor: pointer;"
        @click="copyRecordCode(items?.recordCode)"
      /></div>
    </el-form-item>
    <el-form-item label="状态：">
      <div>{{ getDictLabel(DICT_TYPE.DANGER_REPORT_STATE,items?.dangerReportState) }}</div>
    </el-form-item>
    <el-form-item label="隐患来源：">
      <div>隐患速记</div>
    </el-form-item>
    <el-form-item label="创建人：">
      <div>{{items?.reportUserName}}</div>
    </el-form-item>
    <el-form-item label="">
      <div>{{items?.reportUserDeptName}}|{{items?.reportUserMobile}}</div>
    </el-form-item>
    <el-form-item label="创建时间：">
      <div>{{dateFormatter2(null,null as any,items?.createTime)}}</div>
    </el-form-item>
    <div style="font-weight: bold;font-size: 14px;margin-left: 39px;margin-bottom: 10px;"><span style="color: #0f40f5;">|</span> 隐患信息</div>
    <el-form-item label="隐患描述：">
      <div>{{items?.dangerDesc}}</div>
    </el-form-item>
    <el-form-item label="隐患位置：">
      <div>{{items?.dangerAddress}}</div>
    </el-form-item>
    <el-form-item label="隐患图片：">
      <el-image
        style="width: 100px; height: 100px"
        :src="items?.dangerUrl.split(',')[0]"
        :zoom-rate="1.2"
        :max-scale="7"
        :min-scale="0.2"
        :preview-src-list="items?.dangerUrl.split(',')"
        show-progress
        :initial-index="0"
        fit="cover"
      />
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts">
import { dateFormatter2 } from '@/utils/formatTime'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
const props = defineProps({
  items: {
    type: Object,
    required: true
  }
})
const copyRecordCode = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('复制成功');
  } catch (err) {
    ElMessage.error('复制失败');
    console.error('复制失败:', err);
  }
};
</script>

<style scoped lang="scss"></style>
