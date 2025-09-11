<template>
  <ContentWrap>
    <el-row :gutter="12" v-loading="loading">
      <el-col :span="10" style="height: 778px; overflow: auto">
        <el-card shadow="never">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <el-button class="back-btn" @click="handleBack" plain>
              <el-icon><ArrowLeft /></el-icon>
              <span class="back-text">返回</span>
            </el-button>
            <div style="padding-left: 5px; border-left: 4px solid blue;">企业基本信息</div>
          </div>
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
              <span> {{ formData?.nationalEconomyBack || getnationalEconomy(formData?.nationalEconomyBack) }}</span>
              <div> 职工总人数：</div>
              <span> {{ formData?.employeeNum }}</span>
              <div> 上一年营业收入（万元）：</div>
              <span> {{ formData?.lastYearIncome }}</span>
              <div> 企业规模：</div>
              <span> {{ formData?.compScale }}</span>
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
          <el-tabs v-model="activeTab" type="card">
            <el-tab-pane label="企业风险一张图" name="map">
          <mapPage :initialData="mapData" v-if="mapState" :key="mapState" />
            </el-tab-pane>
            <el-tab-pane label="风险点" name="risk">
              <riskPage :deptId="companyId" ref="riskPageRef" />
            </el-tab-pane>
            <el-tab-pane label="隐患治理" name="danger">
              <dangerPage :companyId="companyId" ref="dangerPageRef" />
            </el-tab-pane>
           
          </el-tabs>
        </el-card>
      </el-col>
      <!-- <el-col :span="10">
        <el-affix position="bottom" :offset="0">
          <el-card shadow="never">
            <el-button type="primary" @click="openForm">编辑企业基本信息</el-button>
          </el-card>
        </el-affix>
      </el-col> -->
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
import dangerPage from './danger.vue'
import riskPage from './risk.vue'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { getCompany, type CompanyDetailVO, getCompanyRiskMapById } from '@/api/enterpriseArchives'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { ArrowLeft } from '@element-plus/icons-vue'

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

/** 返回上一页 */
const handleBack = () => {
  router.back()
}

const formData = ref()
const mapData = ref({
  orgAreaLngLat: '[]',
  lowRiskAreaLngLat: [],
  generalRiskAreaLngLat: [],
  largeRiskAreaLngLat: [],
  seriousRiskAreaLngLat: []
})
const mapState = ref(false)
const loading = ref(false)

// Tab相关
const activeTab = ref('map')

// 获取路由参数中的企业ID
const companyId = computed(() => route.params.id as string)

// 监听URL查询参数，自动切换tab
watch(() => route.query.tab, (newTab) => {
  if (newTab && ['map', 'danger', 'risk'].includes(newTab)) {
    activeTab.value = newTab
    // 根据tab类型执行相应的初始化逻辑
    nextTick(() => {
      if (newTab === 'danger' && dangerPageRef.value) {
        // 切换到隐患治理tab时，调用组件方法获取数据
        dangerPageRef.value.fetchDangerOverview()
        dangerPageRef.value.fetchDangerList()
      } else if (newTab === 'map') {
        // 切换到企业风险一张图tab时，重新获取地图数据
        fetchMapData()
      } else if (newTab === 'risk' && riskPageRef.value) {
        // 切换到风险点tab时，调用组件方法获取数据
        riskPageRef.value.fetchRiskList()
      }
    })
  }
}, { immediate: true })

// 隐患治理组件引用
const dangerPageRef = ref()

// 风险点组件引用
const riskPageRef = ref()

// 监听tab切换
watch(activeTab, (newTab) => {
  if (newTab === 'danger' && dangerPageRef.value) {
    // 切换到隐患治理tab时，调用组件方法获取数据
    dangerPageRef.value.fetchDangerOverview()
    dangerPageRef.value.fetchDangerList()
  } else if (newTab === 'map') {
    // 切换到企业风险一张图tab时，每次都重新获取地图数据
    fetchMapData()
  } else if (newTab === 'risk' && riskPageRef.value) {
    // 切换到风险点tab时，调用组件方法获取数据
    riskPageRef.value.fetchRiskList()
  }
})

// 获取地图数据的方法
const fetchMapData = async () => {
  try {
    const riskMapResponse = await getCompanyRiskMapById(Number(companyId.value))
    console.log('企业风险一张图数据:', riskMapResponse)
    
    // 初始化地图数据
    mapData.value = {
      orgAreaLngLat: '[]', // 没有组织区域数据
      // 风险区域数据，直接使用后端返回的数据（已经是正确的字符串数组格式）
      lowRiskAreaLngLat: riskMapResponse?.lowRiskAreaLngLat || [],
      generalRiskAreaLngLat: riskMapResponse?.generalRiskAreaLngLat || [],
      largeRiskAreaLngLat: riskMapResponse?.largeRiskAreaLngLat || [],
      seriousRiskAreaLngLat: riskMapResponse?.seriousRiskAreaLngLat || []
    }
    
    mapState.value = true
    console.log('地图数据已设置:', mapData.value)
    console.log('地图状态:', mapState.value)
  } catch (error) {
    console.error('获取企业风险一张图失败:', error)
    
    // 如果获取风险地图失败，设置空数据
    mapData.value = {
      orgAreaLngLat: '[]',
      lowRiskAreaLngLat: [],
      generalRiskAreaLngLat: [],
      largeRiskAreaLngLat: [],
      seriousRiskAreaLngLat: []
    }
    
    mapState.value = true
  }
}

/** 初始化 */
onMounted(async () => {
  try {
    loading.value = true
    
    // 使用 getCompany 接口获取企业详细信息
    if (companyId.value) {
      const response = await getCompany(Number(companyId.value))
      console.log('企业详细信息响应:', response)
      
      if (response) {
        const companyData = response
        
        // 将企业数据映射到表单数据结构
        formData.value = {
          ...formData.value, // 保留原有结构
          certificationCompName: companyData.enterpriseName || '',
          socialCode: companyData.creditCode || '',
          areaCode: companyData.regionId || '',
          address: companyData.registerAddress || '',
          actualAddress: companyData.productionAddress || '',
          compLat: companyData.latitude?.toString() || '',
          compLng: companyData.longitude?.toString() || '',
          nationalEconomyBack: companyData.industryName || companyData.industryId || '', // 优先使用名称
          employeeNum: companyData.employeeCount?.toString() || '',
          lastYearIncome: companyData.lastYearRevenue?.toString() || '',
          compScale: companyData.enterpriseScale || '',
          leaderName: companyData.principal || '',
          phone: '', // API 中没有 phone 字段，需要从其他地方获取
          businessScope: companyData.businessScope || '',
          licenseAnnex: companyData.licenseAnnex || '',
          // 其他字段根据需要映射
        }
        
        // 处理国民经济类型数据 - 设置 nationalEconomy 用于判断企业类型
        if (companyData.industryId) {
          // 如果有行业ID，使用ID进行判断
          formData.value.nationalEconomy = companyData.industryId
        } else if (formData.value.nationalEconomyBack) {
          // 否则使用名称
          formData.value.nationalEconomy = formData.value.nationalEconomyBack
        }
        
        // 地图数据将在切换到地图tab时按需加载
      } else {
        console.error('获取企业信息失败:', response)
        message.error('获取企业信息失败，请稍后重试')
      }
    }
    
    // 由于默认显示地图tab，所以需要立即加载地图数据
    if (companyId.value) {
      await fetchMapData()
    }
    
  } catch (error) {
    console.error('获取企业信息失败:', error)
    message.error('获取企业信息失败，请稍后重试')
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
 * @param {string|array} industryCodes1 企业的行业代码（可能是字符串或数组）
 * @returns {boolean} true=化工企业，false=非化工企业
 */
const isChemicalIndustry = (industryCodes1): boolean => {
  console.log('isChemicalIndustry:', industryCodes1)
  isFirecrackers.value = false
  
  if (!industryCodes1) {
    return false
  }
  
  let industryCodes = []
  
  // 处理不同的数据类型
  if (Array.isArray(industryCodes1)) {
    // 如果是数组，直接使用
    industryCodes = industryCodes1
  } else if (typeof industryCodes1 === 'string') {
    // 如果是字符串，按逗号分割
    industryCodes = industryCodes1.split(',').filter(code => code.trim())
  } else if (typeof industryCodes1 === 'object') {
    // 如果是对象，提取值
    industryCodes = Object.values(industryCodes1)
  }
  
  if (!industryCodes || !Array.isArray(industryCodes) || industryCodes.length === 0) {
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
  
  // 检查是否是烟花爆竹企业
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
const getnationalEconomy = (val) => {
  let str = []
  if (val != undefined) {
    // 如果是字符串，尝试按逗号分割
    if (typeof val === 'string') {
    let arr = val.split(',')
    arr.forEach((i) => {
        if (CodeToText[i]) {
      str.push(CodeToText[i])
        } else {
          str.push(i) // 如果找不到对应的文本，直接使用原值
        }
      })
    } else {
      // 如果是单个值，直接处理
      if (CodeToText[val]) {
        str.push(CodeToText[val])
      } else {
        str.push(val) // 如果找不到对应的文本，直接使用原值
      }
    }
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
.back-btn {
  background: #f5f7fa !important;
  border: 1px solid #e5e7eb !important;
  color: #303133 !important;
  border-radius: 10px;
  padding: 6px 14px;
  display: inline-flex;
  align-items: center;
}
.back-btn:hover {
  background: #eef2f6 !important;
  border-color: #dcdfe6 !important;
}
.back-btn :deep(.el-icon) {
  margin-right: 6px;
}
</style>
