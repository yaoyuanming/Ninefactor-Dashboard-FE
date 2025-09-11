<template>
  <ContentWrap>
    <div class="mx-auto">
      <!-- 头部导航栏 -->
      <div
        class="absolute top-0 left-0 right-0 h-50px bg-white border-bottom z-10 flex items-center justify-between px-20px"
      >
        <!-- 左侧标题 -->
        <div class="flex items-center overflow-hidden">
          <Icon icon="ep:arrow-left" class="cursor-pointer flex-shrink-0" @click="handleBack" />
          <span class="ml-10px text-16px truncate">
            {{ ruleForm.deptId ? '编辑企业基本信息' : '新增企业基本信息' }}
          </span>
        </div>
        <!-- 右侧按钮 -->
        <div class="flex items-center gap-2">
          <el-button
            type="primary"
            @click="submitForm(ruleFormRef)"
            v-loading="saveloading"
            :disabled="saveloading"
            >保存
          </el-button>
        </div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px">
        <el-row :gutter="20">
          <el-col :span="12" :offset="6">
            <el-form
              label-position="top"
              ref="ruleFormRef"
              :model="ruleForm"
              :rules="rules"
              v-loading="loading"
            >
              <el-form-item label="企业（单位）名称" prop="certificationCompName">
                <el-input
                  v-model="ruleForm.certificationCompName"
                  placeholder="请输入企业（单位）名称"
                />
              </el-form-item>
              <el-form-item label="统一社会信用代码" prop="socialCode">
                <el-input v-model="ruleForm.socialCode" placeholder="请输入统一社会信用代码" />
              </el-form-item>
              <el-form-item label="属地" prop="areaCode">
                <el-cascader
                  style="width: 100%"
                  v-model="ruleForm.areaCode"
                  :options="fullAreaTree"
                  :props="areaCodeProps"
                  placeholder="请选择地址"
                />
              </el-form-item>
              <el-form-item label="企业（单位）注册地址" prop="address">
                <el-input v-model="ruleForm.address" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="企业（单位）生产运营地址" prop="actualAddress">
                <el-input v-model="ruleForm.actualAddress" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="企业（单位）定位-经度" prop="compLng">
                <el-input v-model="ruleForm.compLng" placeholder="请选择" readonly>
                  <template #append>
                    <el-button @click="handleOpenMap(1)" style="background: #0f40f5; color: white">
                      地图获取
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="企业（单位）单位-纬度" prop="compLat">
                <el-input v-model="ruleForm.compLat" placeholder="请选择" readonly>
                  <template #append>
                    <el-button @click="handleOpenMap(1)" style="background: #0f40f5; color: white">
                      地图获取
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="国民经济类型" prop="nationalEconomy">
                <el-cascader
                  placeholder="请选择国民经济类型"
                  style="width: 100%"
                  :props="props1"
                  v-model="ruleForm.nationalEconomy"
                  :options="categoryData"
                />
              </el-form-item>
              <el-form-item label="职工总人数" prop="employeeNum">
                <el-input-number
                  style="width: 100%"
                  v-model="ruleForm.employeeNum"
                  placeholder="请输入公司职工总人数"
                  controls-position="right"
                  :min="0"
                />
              </el-form-item>
              <el-form-item label="上一年营业收入（万元）" prop="lastYearIncome">
                <el-input v-model="ruleForm.lastYearIncome" placeholder="请输入上一年营业收入" />
              </el-form-item>
              <el-form-item label="企业规模" prop="compScale">
                <el-select
                  v-model="ruleForm.compScale"
                  placeholder="请选择企业规模"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in scaleOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="主要负责人姓名" prop="leaderUserId">
                <el-input
                  v-model="ruleForm.leaderName"
                  placeholder="请选择主要负责人姓名"
                  @click="openStartUserSelect"
                  readonly
                />
              </el-form-item>
              <el-form-item label="主要负责人电话" prop="phone">
                <el-input
                  v-model="ruleForm.phone"
                  placeholder="请输入主要负责人电话"
                  :show-word-limit="true"
                  maxlength="11"
                />
              </el-form-item>
              <!--              其他行业  显示是否涉及高危环境相关-->
              <div v-if="!isChemicalIndustry(ruleForm.nationalEconomy)">
                <el-form-item label="是否涉及高危环境" prop="hasRiskEnv">
                  <el-segmented v-model="ruleForm.hasRiskEnv" :options="locationOptions">
                    <template #default="scope">
                      <div style="width: 50px">{{ scope.item == 1 ? '是' : '否' }}</div>
                    </template>
                  </el-segmented>
                </el-form-item>
                <div v-if="ruleForm.hasRiskEnv == '1'">
                  <el-form-item label="选择所涉及高危环境类型（可多选）" prop="riskEnvTypesBack">
                    <el-checkbox-group v-model="ruleForm.riskEnvTypesBack">
                      <el-checkbox label="有限空间" value="1" />
                      <el-checkbox label="粉尘涉爆" value="2" />
                      <el-checkbox label="涉氮制冷" value="3" />
                    </el-checkbox-group>
                  </el-form-item>
                  <el-form-item
                    label="选择粉尘类别"
                    prop="riskEnvTypesBack"
                    v-if="ruleForm.riskEnvTypesBack?.includes('2') ?? false"
                  >
                    <el-checkbox-group v-model="ruleForm.dustTypeBack">
                      <el-checkbox
                        style="display: block; margin-bottom: 10px"
                        :label="item.label"
                        :value="item.value"
                        v-for="(item, index) in getIntDictOptions(DICT_TYPE.DUST_TYPE)"
                        :key="index"
                      />
                    </el-checkbox-group>
                  </el-form-item>
                  <el-form-item
                    style="margin-bottom: -10px"
                    label="涉氨制冷环境是否构成重大危险源"
                    v-if="ruleForm.riskEnvTypesBack?.includes('3') ?? false"
                  />
                  <el-form-item
                    label="是否构成重大危险源"
                    v-if="ruleForm.riskEnvTypesBack?.includes('3') ?? false"
                  >
                    <el-radio-group v-model="ruleForm.nitrogenHasRisk">
                      <el-radio label="0">否</el-radio>
                      <el-radio label="1">是</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <div v-if="ruleForm.nitrogenHasRisk == 1">
                    <el-form-item label="重大危险源储量" prop="riskReserves">
                      <el-input v-model="ruleForm.riskReserves" placeholder="请输入" />
                    </el-form-item>
                    <el-form-item label="危险等级" prop="riskLevel">
                      <el-select v-model="ruleForm.riskLevel">
                        <el-option label="1" value="1" />
                        <el-option label="2" value="2" />
                        <el-option label="3" value="3" />
                      </el-select>
                      <!--                      <el-input v-model="ruleForm.riskReserves3" placeholder="请输入" />-->
                    </el-form-item>
                  </div>
                </div>
              </div>
              <!--              危化企业  显示是否构成重大危险源-->
              <div v-else>
                <el-form-item
                  label="是否构成重大危险源"
                  prop="hasRiskEnv"
                  v-if="isChemicalIndustry(ruleForm.nationalEconomy)"
                >
                  <el-radio-group v-model="ruleForm.nitrogenHasRisk">
                    <el-radio label="0">否</el-radio>
                    <el-radio label="1">是</el-radio>
                  </el-radio-group>
                </el-form-item>
                <div v-if="ruleForm.nitrogenHasRisk == '1'">
                  <el-form-item label="重大危险源储量" prop="riskReserves">
                    <el-input v-model="ruleForm.riskReserves" placeholder="请输入" />
                  </el-form-item>
                  <el-form-item
                    label="危险等级"
                    prop="hasRiskEnv"
                    v-if="ruleForm.nitrogenHasRisk == '1'"
                  >
                    <el-select v-model="ruleForm.riskLevel">
                      <el-option label="1" value="1" />
                      <el-option label="2" value="2" />
                      <el-option label="3" value="3" />
                    </el-select>
                  </el-form-item>
                </div>
                <!--                如果是烟花爆竹类的则显示-->
                <div v-if="isFirecrackers">
                  <el-form-item label="存储地址">
                    <el-input v-model="ruleForm.storageAddress" placeholder="请输入" />
                  </el-form-item>
                  <el-form-item label="经度">
                    <el-input v-model="ruleForm.storageLng" placeholder="请选择" readonly>
                      <template #append>
                        <el-button
                          @click="handleOpenMap(2)"
                          style="background: #0f40f5; color: white"
                        >
                          地图获取
                        </el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="纬度">
                    <el-input v-model="ruleForm.storageLat" placeholder="请选择" readonly>
                      <template #append>
                        <el-button
                          @click="handleOpenMap(2)"
                          style="background: #0f40f5; color: white"
                        >
                          地图获取
                        </el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="核定药量">
                    <el-input v-model="ruleForm.approvedDosage" placeholder="请输入" disabled>
                      <template #append>
                        <div>千克</div>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="库房面积">
                    <el-input v-model="ruleForm.shedArea" placeholder="请输入" disabled>
                      <template #append>
                        <div>㎡</div>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="库区面积">
                    <el-input v-model="ruleForm.reservoirArea" placeholder="请输入" disabled>
                      <template #append>
                        <div>㎡</div>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="许可证编号">
                    <el-input v-model="ruleForm.licenceNo" placeholder="请输入" />
                  </el-form-item>
                  <el-form-item label="许可证有效期">
                    <!--                    选择开始结束日期-->
                    <el-date-picker
                      style="width: 100%"
                      v-model="ruleForm.licenceData"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      value-format="YYYY-MM-DD"
                    />
                  </el-form-item>
                  <el-form-item label="发证日期">
                    <!--                    选择开始结束日期-->
                    <el-date-picker
                      placeholder="请选择"
                      style="width: 100%"
                      v-model="ruleForm.issueDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                    />
                  </el-form-item>
                  <el-form-item label="发证机关">
                    <el-input v-model="ruleForm.licenceIssuingAuthority" placeholder="请输入" />
                  </el-form-item>
                  <el-form-item label="许可证范围">
                    <el-checkbox-group v-model="ruleForm.licenceRange">
                      <!-- 渲染父复选框 -->
                      <div v-for="parent in MyData" :key="parent.value">
                        <el-checkbox :label="parent.label" :value="parent.value" />
                        <el-checkbox
                          :disabled="!ruleForm.licenceRange?.includes(parent.value)"
                          v-for="child in parent.children"
                          :key="child.value"
                          :label="child.label"
                          :value="child.value"
                        />
                      </div>
                    </el-checkbox-group>
                  </el-form-item>
                  <el-form-item label="许可证附件">
                    <UploadImgs v-model="ruleForm.licenseAnnex" />
                  </el-form-item>
                </div>
              </div>
            </el-form>
          </el-col>
        </el-row>
      </div>
    </div>
  </ContentWrap>
  <Address ref="AddressRef" @clickMapInfo="getClickMapInfo" />
  <!-- 用户选择弹窗 -->
  <OneSelect ref="userSelectFormRef" @confirm="handleUserSelectConfirm" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { transformSelected, reverseTransform, getMyData, buildAreaTree } from './code'

const MyData = ref(getMyData())
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import type { FormInstance, FormRules } from 'element-plus'
import { categoryData, CodeToText, TextToCode } from 'element-china-category-data'

const props1 = {
  checkStrictly: true
}

interface IndustryCodeObject {
  [key: number]: string
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
const scaleOptions = [
  {
    value: '2',
    label: '规上企业'
  },
  {
    value: '5',
    label: '中等企业'
  },
  {
    value: '7',
    label: '小型企业'
  },
  {
    value: '9',
    label: '小微企业'
  }
]
const locationOptions = ['0', '1']
const fullAreaTree = ref(buildAreaTree())
let areaCodeProps = {
  value: 'code',
  label: 'name'
}
const { delView } = useTagsViewStore() // 视图操作
const route = useRoute() // 路由
const router = useRouter() // 路由

const ruleFormRef = ref<FormInstance>()
let ruleForm = ref<compInfoSaveReqVO>({
  riskEnvTypesBack: [],
  childSelections: [],
  licenceRange: [], // 存储选中的父选项
  dustTypeBack: [],
  deptId: route.query.id,
  socialCode: '',
  industryId: '',
  nationalEconomy: '',
  compScale: '',
  leaderUserId: '',
  phone: '',
  city: '',
  address: [],
  areaCode: '',
  compLng: '',
  compLat: '',
  compAreaLngLat: '',
  actualAreaCode: '',
  actualAddress: '',
  businessScope: '',
  certificationCompName: '',
  description: '',
  employeeNum: '',
  lastYearIncome: '',
  hasRiskEnv: '',
  riskEnvTypes: '',
  dustType: [],
  nitrogenHasRisk: '',
  riskReserves: '',
  riskLevel: '',
  remark: ''
})

const rules = reactive<FormRules<compInfoSaveReqVO>>({
  certificationCompName: [{ required: true, message: '请输入', trigger: 'blur' }],
  socialCode: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    }
  ],
  address: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  nationalEconomy: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  employeeNum: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    },
    {
      pattern: /^(0|[1-9]\d*)$/, // 匹配 0 或正整数
      message: '员工人数必须为正整数',
      trigger: ['blur', 'change']
    }
  ],
  lastYearIncome: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    },
    {
      pattern: /^-?\d+(\.\d+)?$/, // 允许正负号、整数或小数
      message: '请输入有效的数字',
      trigger: ['blur', 'change']
    }
  ],
  compScale: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  hasRiskEnv: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  riskEnvTypesBack: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  leaderUserId: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  phone: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    },
    {
      pattern: /^[0-9]{11}$/, // 正则：严格匹配 11 位数字
      message: '手机号必须为纯数字',
      trigger: ['blur', 'change']
    }
  ]
})

import { compInfoSaveReqApi, compInfoSaveReqVO } from '@/api/workbenches/basicEnterprise'

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      saveloading.value = true
      let data = JSON.parse(JSON.stringify(ruleForm.value as compInfoSaveReqVO))
      console.log('transformSelected', transformSelected(data.licenceRange)) // 测试
      if (data.licenceData != null) {
        data.licenceStartDate = data?.licenceData[0]
        data.licenceEndDate = data?.licenceData[1]
      }
      data.licenceRange = JSON.stringify(transformSelected(data.licenceRange))
      data.licenseAnnex = data.licenseAnnex?.toString()
      data.leaderUserId = data.leaderUserId.toString()
      data.nationalEconomy = data.nationalEconomy.toString()
      if (data.riskEnvTypesBack != null) {
        data.riskEnvTypes = data.riskEnvTypesBack.toString()
      }
      if (data.dustTypeBack != null) {
        data.dustType = data.dustTypeBack.toString()
      }
      console.log('data.areaCode', typeof data.areaCode)
      if (typeof data.areaCode != 'string') {
        if (data.areaCode != null) {
          data.areaCode = data.areaCode[data.areaCode.length - 1]
        }
      }
      delete data.riskEnvTypesBack
      delete data.dustTypeBack
      await compInfoSaveReqApi.updateCompInfo(data)
      saveloading.value = false
      handleBack()
    } else {
      saveloading.value = false
      console.log('error submit!', fields)
    }
  })
}

/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.push({ name: 'basicEnterpriseIndex' })
}

import * as UserApi from '@/api/system/user'
import { UserVO } from '@/api/login/types'
import { getSimpleUserList } from '@/api/system/user'

let loading = ref(true)
let saveloading = ref(false)
let list = ref<UserVO[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  username: undefined,
  mobile: undefined,
  status: undefined,
  deptId: undefined,
  createTime: []
})
/** 初始化 */
onMounted(async () => {
  try {
    const data = await UserApi.getSimpleUserList()
    list.value = data
    loading.value = true
    ruleForm.value.deptId = route.query.id
    if (route.query.id != null) {
      try {
        ruleForm.value = await compInfoSaveReqApi.getCompInfo(Number(route.query.id))
        ruleForm.value.deptId = route.query.id
        if (ruleForm.value.licenceRange != null) {
          ruleForm.value.licenceRange = reverseTransform(JSON.parse(ruleForm.value?.licenceRange))
        } else {
          ruleForm.value.licenceRange = []
        }
        if (ruleForm.value.nitrogenHasRisk != null) {
          ruleForm.value.nitrogenHasRisk = ruleForm.value.nitrogenHasRisk.toString()
        }
        if (ruleForm.value.licenseAnnex != null) {
          ruleForm.value.licenseAnnex = ruleForm.value.licenseAnnex.split(',')
        }
        if (ruleForm.value.nationalEconomy != null) {
          ruleForm.value.nationalEconomy = ruleForm.value.nationalEconomy.split(',')
        }
        if (ruleForm.value.riskEnvTypes != null) {
          ruleForm.value.riskEnvTypesBack = ruleForm.value.riskEnvTypes.toString().split(',')
        }
        if (ruleForm.value.dustType != null) {
          ruleForm.value.dustTypeBack = ruleForm.value.dustType.toString().split(',')
        }
        if (ruleForm.value.hasRiskEnv != null) {
          ruleForm.value.hasRiskEnv = String(ruleForm.value.hasRiskEnv)
        }
        if (ruleForm.value.compScale != null) {
          ruleForm.value.compScale = ruleForm.value.compScale.toString()
        }
      } catch (apiError) {
        console.error('API调用失败:', apiError)
      }
    }
  } finally {
    loading.value = false
  }
})
import Address from './address.vue'

let userSelectFormRef = ref()
let currentSelectType = ref()
let modelData = ref()
/** 打开发起人选择 */
const openStartUserSelect = () => {
  currentSelectType.value = 'start'
  if (typeof ruleForm.value.leaderUserId == 'number') {
    userSelectFormRef.value.open(0, [{ id: ruleForm.value.leaderUserId }])
  } else {
    let ids = []
    ruleForm.value.leaderUserId.forEach((i) => {
      ids.push({ id: i })
    })
    userSelectFormRef.value.open(0, ids)
  }
}
/** 处理用户选择确认 */
const handleUserSelectConfirm = (_, users: UserVO[]) => {
  ruleForm.value.leaderName = users.map((u) => u.nickname)
  ruleForm.value.leaderUserId = users.map((u) => u.id)
}
let AddressRef = ref()
let mapFlag = 1
// 打开地图选择位置
const handleOpenMap = (val) => {
  // 打开地图
  mapFlag = val
  if (val == 1) {
    AddressRef.value.openMap({ lng: ruleForm.value.compLng, lat: ruleForm.value.compLat }, 2)
  } else if (val == 2) {
    AddressRef.value.openMap({ lng: ruleForm.value.storageLng, lat: ruleForm.value.storageLat }, 2)
  }
}
const getClickMapInfo = (val) => {
  if (mapFlag == 1) {
    ruleForm.value.compLng = val.position.lng
    ruleForm.value.compLat = val.position.lat
  } else if (mapFlag == 2) {
    ruleForm.value.storageLng = val.position.lng
    ruleForm.value.storageLat = val.position.lat
  }
}

/** 添加组件卸载前的清理代码 */
onBeforeUnmount(() => {})

/** 暴露方法给子组件使用 */
defineExpose({
  handleBack
})
</script>

<style lang="scss" scoped>
.container {
  background-color: #f9f9f9;
  font-family: Arial, sans-serif;
  width: 100%;
  margin: 20px auto;
}

.grid {
  display: grid;
  grid-template-columns: 3fr 1fr 3fr 1fr 3fr; /* 1、3、5列宽度相同，2、4列宽度是前者的2倍 */
  gap: 10px; /* 列间距 */
}

.cell {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: center;
}

.label {
  font-weight: bold;
  color: #333;
}

.value {
  font-size: 1.2em;
  color: #000;
}

:deep(.el-input__inner) {
  text-align: left;
}
</style>
