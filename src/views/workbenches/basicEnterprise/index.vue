<template>
  <ContentWrap>
    <el-row :gutter="12" v-loading="loading">
      <el-col :span="10" style="height: 778px; overflow: auto">
        <el-card shadow="never">
          <div style=" padding-left: 5px;border-left: 4px solid blue"> 企业基本信息</div>
          <div>
            <div class="container">
              <!-- 左边图片 -->
              <el-image :src="enterprise" alt="场所图片" class="image" />
              <!-- 右边文字 -->
              <div class="text-content">
                <div class="text-top">{{ formData?.certificationCompName }}</div>
                <div class="text-bottom"> 统一社会信用代码：{{ formData?.socialCode }} </div>
              </div>
            </div>
            <div class="myDiv grid-container">
              <div> 属地：</div>
              <span> {{ findNameByCode(fullAreaTree, formData?.areaCode) }}</span>
              <div> 企业（单位）注册地址：</div>
              <span> {{ formData?.address }}</span>
              <div> 企业（单位）生产经营地址：</div>
              <span> {{ formData?.actualAddress }}</span>
              <div> 企业（单位）定位纬度：</div>
              <span> {{ formData?.compLat }}</span>
              <div> 企业（单位）定位经度：</div>
              <span>{{ formData?.compLng }}</span>
              <div> 国民经济类型：</div>
              <span> {{ getnationalEconomy(formData?.nationalEconomyBack) }}</span>
              <div> 职工总人数：</div>
              <span> {{ formData?.employeeNum }}</span>
              <div> 上一年营业收入（万元）：</div>
              <span> {{ formData?.lastYearIncome }}</span>
              <div> 企业规模：</div>
              <span> {{ getDictLabel(DICT_TYPE.COMP_SCALE, formData?.compScale) }}</span>
            </div>
          </div>
        </el-card>
        <el-card shadow="never">
          <div class="myDiv grid-container">
            <div> 主要负责人（姓名）：</div>
            <span> {{ formData?.leaderName }}</span>
            <div> 主要负责人电话：</div>
            <span> {{ formData?.phone }}</span>
          </div>
        </el-card>
        <!--              其他行业  显示是否涉及高危环境相关-->
        <div v-if="!isChemicalIndustry(formData?.nationalEconomy)">
          <!-- <el-card shadow="never">
            <div class="myDiv grid-container">
              <div> 是否涉及高危环境：</div>
              <span> {{ formData?.hasRiskEnv == '1' ? '是' : '否' }}</span>
            </div>
          </el-card> -->
          <el-card shadow="never" v-if="formData?.nitrogenHasRisk == '1'">
            <div class="myDiv grid-container">
              <!-- <div> 是否涉及氨制冷：</div>
              <span> {{ formData?.nitrogenHasRisk == '1' ? '是' : '否' }}</span>
              <div> 是否构成重大危险源：</div>
              <span>{{ formData?.nitrogenHasRisk == '1' ? '是' : '否' }}</span> -->
              <div v-if="formData?.nitrogenHasRisk == '1'">重大危险源储量：</div>
              <span v-if="formData?.nitrogenHasRisk == '1'">{{ formData?.riskReserves }}</span>
              <div v-if="formData?.nitrogenHasRisk == '1'">等级：</div>
              <span v-if="formData?.nitrogenHasRisk == '1'">{{ formData?.riskLevel }}</span>
            </div>
          </el-card>
        </div>
        <!--              危化企业  显示是否构成重大危险源-->
        <div v-else>
          <el-card shadow="never">
            <div class="myDiv grid-container">
              <div> 是否构成重大危险源：</div>
              <span>{{ formData?.nitrogenHasRisk == '1' ? '是' : '否' }}</span>
              <div v-if="formData?.nitrogenHasRisk == '1'">重大危险源储量：</div>
              <span v-if="formData?.nitrogenHasRisk == '1'">{{ formData?.riskReserves }}</span>
              <div v-if="formData?.nitrogenHasRisk == '1'">等级：</div>
              <span v-if="formData?.nitrogenHasRisk == '1'">{{ formData?.riskLevel }}</span>
            </div>
          </el-card>
          <div v-if="isFirecrackers">
            <el-card shadow="never">
              <div style=" padding-left: 5px;border-left: 4px solid blue">仓储许可经营信息</div>
              <div class="myDiv grid-container">
                <div> 仓储地址：</div>
                <span>{{ formData?.storageAddress }}</span>
                <div>经度：</div>
                <span>{{ formData?.storageLng }}</span>
                <div>纬度：</div>
                <span>{{ formData?.storageLat }}</span>
                <div>核定药量：</div>
                <span>{{ formData?.approvedDosage }}千克</span>
                <div>库房面积：</div>
                <span>{{ formData?.shedArea }}㎡</span>
                <div>库区面积：</div>
                <span>{{ formData?.reservoirArea }}㎡</span>
                <div>许可证编号：</div>
                <span>{{ formData?.licenceNo }}</span>
                <div>许可证有效期：</div>
                <span>{{ formData?.licenceStartDate }} - {{ formData?.licenceEndDate }}</span>
                <div>发证日期：</div>
                <span>{{ formData?.issueDate }}</span>
                <div>发证机关：</div>
                <span>{{ formData?.licenceIssuingAuthority }}</span>
                <div>许可证范围：</div>
                <span>{{ formData?.licenceRangStr }}</span>
                <div>许可证附件：</div>
                <span v-if="formData?.licenseAnnex != null">
                  <el-image
                    style="width: 100px; height: 100px"
                    :src="formData?.licenseAnnex.split(',')[0]"
                    :zoom-rate="1.2"
                    :max-scale="7"
                    :min-scale="0.2"
                    :preview-src-list="formData?.licenseAnnex.split(',')"
                    show-progress
                    :initial-index="0"
                    fit="cover"
                  />
                </span>
              </div>
            </el-card>
          </div>
        </div>
      </el-col>
      <el-col :span="14">
        <el-card shadow="never">
          <div style=" padding-left: 5px;border-left: 4px solid blue"> 企业风险一张图</div>
          <mapPage :initialData="mapData" v-if="mapState" />
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-affix position="bottom" :offset="0">
          <el-card shadow="never">
            <el-button type="primary" @click="openForm">编辑企业基本信息</el-button>
          </el-card>
        </el-affix>
      </el-col>
    </el-row>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { transformSelected, reverseTransform,getMyData,buildAreaTree } from './code'
import enterprise from '@/assets/imgs/workbenches/enterprise.png'
import { categoryData, CodeToText, TextToCode } from 'element-china-category-data'
import { provinceAndCityData, regionData, codeToText } from 'element-china-area-data'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import mapPage from './map.vue'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
/**
 * 在树形结构中根据 code 查找 name
 * @param {Array} tree - 树形结构数据
 * @param {string} targetCode - 要查找的 code
 * @returns {string|null} - 返回匹配的 name，未找到返回 null
 */
const findNameByCode = (tree, targetCode, currentPath = '') => {
  for (const node of tree) {
    const newPath = currentPath ? `${currentPath}${node.name}` : node.name
    if (node.code === targetCode) {
      return newPath // 找到目标，返回完整路径
    }
    if (node.children && node.children.length) {
      const foundPath = findNameByCode(node.children, targetCode, newPath)
      if (foundPath) return foundPath // 子节点中找到，直接返回
    }
  }
  return null // 未找到
}

const fullAreaTree = ref(buildAreaTree())
console.log('完整的行政区划树形结构:', fullAreaTree)
const { delView } = useTagsViewStore() // 视图操作
const route = useRoute() // 路由
const router = useRouter() // 路由

/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.push({ name: 'PrtRiskIndex' })
}
import { compInfoSaveReqApi, compInfoSaveReqVO } from '@/api/workbenches/basicEnterprise'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

const formData = ref<compInfoSaveReqVO>()
const mapData = ref()
const mapState = ref(false)
const loading = ref(false)
/** 初始化 */
onMounted(async () => {
  let userInfo = wsCache.get(CACHE_KEY.USER)
  try {
    loading.value = true
    formData.value = await compInfoSaveReqApi.getCompInfo(userInfo.user.deptId)
    formData.value.nationalEconomyBack = formData.value.nationalEconomy
    if (formData.value.nationalEconomy != null) {
      formData.value.nationalEconomy = formData.value?.nationalEconomy?.split(',')
    }
    mapData.value = await compInfoSaveReqApi.getRiskMap(userInfo.user.deptId)
    mapState.value = true
  } finally {
    loading.value = false
  }
})
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const { wsCache } = useCache() // 缓存
//编辑风险点
const openForm = () => {
  let userInfo = wsCache.get(CACHE_KEY.USER)
  console.log(userInfo)
  router.push({
    name: 'basicEnterpriseEdit',
    query: { id: userInfo.user.deptId }
  })
}
let isFirecrackers = ref(false)
/**
 * 判断企业是否是化工企业
 * @param {IndustryCodeObject} industryCodes1 企业的行业代码对象（如 {0: 'C', 1: '26', ...}）
 * @returns {boolean} true=化工企业，false=非化工企业
 */
const isChemicalIndustry = (industryCodes1): boolean => {
  console.log('isChemicalIndustry:', industryCodes1)
  isFirecrackers.value = false
  if (industryCodes1 != null) {
    const industryCodes = Object.values(industryCodes1)
    if (!industryCodes || !Array.isArray(industryCodes)) {
      console.error('industryCodes 不是有效的数组！', industryCodes)
      return false
    }

    const finalCode = industryCodes.slice(0, 2).join('') + industryCodes[industryCodes.length - 1]
    if (!finalCode) {
      console.error('industryCodes 是空数组！', industryCodes)
      return false
    }

    const chemicalIndustryPrefixes = ['C26', 'C27', 'C28', 'C29']
    console.log('finalCode', finalCode)
    // if()  如果代码中存在 烟花爆竹的则isFirecrackers = true
    if (industryCodes[industryCodes.length - 1] == '2672') {
      isFirecrackers.value = true
    }
    console.log('~完整的行业代码链：', industryCodes)
    console.log(
      'true=化工企业，false=非化工企业：',
      chemicalIndustryPrefixes.some((prefix) => String(finalCode).startsWith(prefix))
    )
    return chemicalIndustryPrefixes.some((prefix) => String(finalCode).startsWith(prefix))
  }
  return false // 如果 industryCodes1 是 null，直接返回 false
}
const getnationalEconomy = (val) => {
  let str = []
  if (val != undefined) {
    let arr = val.split(',')
    arr.forEach((i) => {
      str.push(CodeToText[i])
    })
  }
  return str.toString()
}
/** 添加组件卸载前的清理代码 */
onBeforeUnmount(() => {})
onMounted(() => {})

/** 暴露方法给子组件使用 */
defineExpose({
  handleBack
})
</script>

<style lang="scss" scoped>
.border-bottom {
  border-bottom: 1px solid #dcdfe6;
}

.text-primary {
  color: #3473ff;
}

.bg-primary {
  background-color: #3473ff;
}

.border-primary {
  border-color: #3473ff;
}

.container {
  display: flex;
  max-width: 800px;
  padding: 5px;
  margin: 10px auto;
  margin-bottom: 5px;
  background: #cfd9fd;
  border: 1px solid #ddd; /* 可选边框 */
  align-items: center; /* 垂直居中对齐 */
  gap: 20px; /* 图片和文字之间的间距 */
}

.image {
  width: 50px; /* 图片宽度 */
  height: 50px; /* 图片高度 */
  object-fit: cover; /* 保持图片比例 */
  border: 1px solid #ccc; /* 图片边框 */
  border-radius: 10px;
}

.text-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.text-top {
  font-size: 15px;
  font-weight: bold;
}

.text-bottom {
  font-size: 14px;
  color: #666;
}

.myDiv div {
  margin-top: 10px;
  font-size: 14px;
  text-align: left;
}

.myDiv span {
  margin-top: 10px;
  font-size: 14px;
}

.grid-container {
  display: grid;
  grid-template-columns: 6fr 10fr;
}
</style>
