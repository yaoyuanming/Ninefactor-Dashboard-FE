<template>
  <div>
    <table style="width: 100% !important; text-align: center; border-collapse: collapse !important;" border="1" cellspacing="0">
      <tr style="height: 40px;">
        <td colspan="12">安全风险告知卡</td>
      </tr>
      <tr style="height: 40px;">
        <td>风险点名称：</td>
        <td colspan="3" style="min-width: 100px">{{ formData.riskName }}</td>
        <td colspan="4" style="min-width: 200px">责任岗位： {{ formData.respPostName }}</td>
<!--        <td colspan="3" style="min-width: 100px">{{ formData.respPostName }}</td>-->
        <td  colspan="4" style="min-width: 200px">责任人：{{ formData.respUserName }}</td>
<!--        <td colspan="3" style="min-width: 100px">{{ formData.respUserName }}</td>-->
      </tr>
      <tr style="height: 40px;">
        <td colspan="2">风险等级</td>
        <td colspan="2">风险二维码</td>
        <td colspan="8">安全警示标识</td>
      </tr>
      <tr style="height: 100px">
        <td colspan="2" style="padding: 10px">
          <div
            v-if="formData.riskLevel == 2"
            style="background: #1f7aff; height: 70px; line-height: 70px; color: white"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, formData.riskLevel) }}
          </div>
          <div
            v-if="formData.riskLevel == 5"
            style="background: #fefa83; height: 70px; line-height: 70px"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, formData.riskLevel) }}
          </div>
          <div
            v-if="formData.riskLevel == 8"
            style="background: #e99d42; height: 70px; line-height: 70px; color: white"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, formData.riskLevel) }}
          </div>
          <div
            v-if="formData.riskLevel == 10"
            style="background: #f00808; height: 70px; line-height: 70px; color: white"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, formData.riskLevel) }}
          </div>
        </td>
        <td colspan="2">
          <div style="padding-top: 3px;font-weight: bold;">
            {{ formData.idd }}
          </div>
          <div>
            <el-image
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="[qrCodeData]"
              show-progress
              :initial-index="0"
              fit="cover"
              style="width: 100px; height: 100px; margin-right: 5px"
              :src="qrCodeData"
            />
          </div>
        </td>
        <td colspan="8" style="text-align: left; padding: 5px">
          <el-image
            crossorigin="anonymous"
            v-for="(item,key) in warnsignWarn"
            :key="key"
            style="width: 50px; height: 50px; margin-right: 5px"
            :src="item"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="warnsignWarn"
            show-progress
            :initial-index="key"
            fit="cover"
          />
        </td>
      </tr>
      <tr style="height: 40px;">
        <td style="background-color: red; color: white">重要提示</td>
        <td
          colspan="11"
          style="color: red; font-weight: bold; text-align: left; padding-left: 10px"
        >
          {{ formData?.importantNote }}
        </td>
      </tr>
      <tr style="height: 40px;">
        <td colspan="4">主要事故诱因</td>
        <td colspan="4">主要事故类型</td>
        <td colspan="4">风险控制措施及应急处置措施</td>
      </tr>
      <tr style="height: 100px">
        <td colspan="4" v-html="formatText(formData?.accidentTrigger)" style="text-align: left;padding-left: 5px;"></td>
        <td colspan="4" v-html="formatText(formData?.accidentType)" style="text-align: left;padding-left: 5px;"></td>
        <td colspan="4" v-html="formatText(formData?.measure)" style="text-align: left;padding-left: 5px;"></td>
      </tr>
      <tr style="height: 40px;">
        <td colspan="12">
          <el-row>
            <el-col :span="6"> 公安电话：{{ formData.publicPhone }}</el-col>
            <el-col :span="6"> 消防救援：{{ formData.fireRescue }}</el-col>
            <el-col :span="6"> 医疗救护：{{ formData.medical }}</el-col>
            <el-col :span="6"> 应急救援电话：{{ formData.rescuePhone }}</el-col>
          </el-row>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, defineProps, defineEmits, withDefaults } from 'vue'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'

interface FormData {
  id: number
  idd: number
  riskName: string
  respPostName: string
  respUserName: string
  riskLevel: number
  accidentTrigger: string
  accidentType: string
  measure: boolean
  publicPhone: string
  fireRescue: string
  medical: string
  rescuePhone: string
}

interface Props {
  modelValue?: Partial<FormData>
  postlist?: []
  userlist?: []
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({})
})

const emit = defineEmits(['submit', 'reset', 'update:modelValue'])
// 使用计算属性或 watch 来处理数据同步
const formData = reactive<FormData>({
  ...props.modelValue
})
let qrCodeData = ref('')
import QRCode from 'qrcode'

const generateQRCode = (text) => {
  if (!text) {
    console.warn('二维码内容不能为空')
    return
  }
  QRCode.toDataURL(
    String(text),
    {
      // 强制转为字符串
      width: 200,
      errorCorrectionLevel: 'H' // 容错级别提高
    },
    (err, url) => {
      if (err) {
        console.error('生成失败:', err)
        return
      }
      qrCodeData.value = url
    }
  )
}
import * as FileApi from '@/api/infra/file'

const warnsignWarnList = ref([]) //警告 warnsign_warn
const warnsignForbidList = ref([]) //禁止 warnsign_forbid
const warnsignInstructList = ref([]) //指令 warnsign_instruct
let warnsignWarn = ref([])//警告
const getImageList = async () => {
  warnsignWarnList.value = await FileApi.getFileList({
    bizType: 'infra_file_biz_warnsign',
    bizTypeSec: 'warnsign_warn'
  })
  warnsignForbidList.value = await FileApi.getFileList({
    bizType: 'infra_file_biz_warnsign',
    bizTypeSec: 'warnsign_forbid'
  })
  warnsignInstructList.value = await FileApi.getFileList({
    bizType: 'infra_file_biz_warnsign',
    bizTypeSec: 'warnsign_instruct'
  })
  // 1 警告
  // 2 禁止
  // 3 指令
//   匹配图片
  try{
    if(formData?.warnSigns != null){
      formData?.warnSigns.forEach(i=>{
        warnsignWarnList.value.forEach(j=>{
          if(i==j.path){
            warnsignWarn.value.push(j.url)
          }
        })
      })
    }
  }catch (e) {

  }
  try{

    if(formData?.prohibitSigns != null){
      formData?.prohibitSigns.forEach(i=>{
        warnsignForbidList.value.forEach(j=>{
          if(i==j.path){
            warnsignWarn.value.push(j.url)
          }
        })
      })
    }

  }catch (e) {

  }
  try{
    if(formData?.instructionSigns != null){
      formData?.instructionSigns.forEach(i=>{
        warnsignInstructList.value.forEach(j=>{
          if(i==j.path){
            warnsignWarn.value.push(j.url)
          }
        })
      })
    }
  }catch (e) {

  }


}

/** 初始化 **/
onMounted(() => {
  getImageList()
  console.log("formData.idd",formData)
  generateQRCode(formData.idd)
})
// 当 formData 变化时触发更新
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)

const formatText = (text) => {
  return text.replace(/\n/g, '<br>')
}
</script>
<style scoped>
.td{
  width: 200px;
}
</style>
