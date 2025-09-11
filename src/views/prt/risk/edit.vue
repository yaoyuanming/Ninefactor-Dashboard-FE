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
          <span class="ml-10px text-16px truncate" v-if="isEdit != 'copy'">
            {{ ruleForm.id ? '编辑风险点' : '新增风险点' }}
          </span>
          <span class="ml-10px text-16px truncate" v-if="isEdit == 'copy'"> 复制风险点 </span>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="generateStep(1)" v-if="active == 3 && !flag">生成风险告知卡</el-button>
          <el-button @click="generateStep(2)" v-if="active == 4 && flag">预览风险告知卡</el-button>
          <el-button @click="PreviewPage()" v-if="active == 3">预览风险分级管控清单</el-button>
          <el-button @click="previousPage()" v-if="active != 0 && active != 4 && !flag"
            >上一步
          </el-button>
          <el-button @click="previousPage()" v-if="active != 0 && active != 5 && flag"
            >上一步
          </el-button>
          <el-button @click="submitForm(ruleFormRef)" v-if="active == 3 && !flag">保存</el-button>
          <el-button @click="submitForm(ruleFormRef)" v-if="active == 4 && flag">保存</el-button>
          <el-button @click="next(ruleFormRef)" v-if="active < 3">下一步</el-button>
          <el-button @click="next(ruleFormRef)" v-if="active >= 3 && flag && active < 4"
            >下一步
          </el-button>
        </div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px">
        <!--        <el-button @click="myTest()">测试</el-button>-->
        <el-row>
          <el-col :span="6">
            <el-steps direction="vertical" :active="active" style="height: 50vh">
              <el-step title="填写基本信息" />
              <el-step title="风险定级评估" />
              <el-step title="危险有害因素辨识" />
              <el-step title="检查频次" />
              <el-step title="生成风险告知卡" v-if="flag" />
              <el-step title="完成" />
            </el-steps>
          </el-col>
          <el-col :span="18">
            <el-form
              v-loading="formLoading"
              :label-position="labelPosition"
              ref="ruleFormRef"
              :model="ruleForm"
              :rules="rules"
              label-width="auto"
              class="demo-ruleForm"
              :size="formSize"
              status-icon
            >
              <div v-if="active == 0">
                <el-form-item label="风险点名称" prop="riskName">
                  <el-input v-model="ruleForm.riskName" placeholder="请输入风险点名称" />
                </el-form-item>
                <el-form-item label="风险单元" prop="riskUnitId">
                  <el-select v-model="ruleForm.riskUnitId" placeholder="请选择">
                    <el-option
                      :label="item.riskUnitName"
                      :value="item.id"
                      v-for="(item, key) in RiskUnitList.list"
                      :key="key"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="风险点类型" prop="riskType">
                  <el-segmented v-model="ruleForm.riskType" :options="locationOptions">
                    <template #default="scope">
                      <div>{{ getDictLabel(DICT_TYPE.RISKTYPE, scope.item) }}</div>
                    </template>
                  </el-segmented>
                </el-form-item>
                <el-form-item label="责任部门" prop="respDeptId">
                  <el-tree-select
                    @node-click="respDeptIdChange"
                    :check-strictly="true"
                    node-key="id"
                    v-model="ruleForm.respDeptId"
                    :data="treeList"
                    :render-after-expand="false"
                    style="width: 100%"
                    :props="defaultProps"
                  />
                </el-form-item>
                <el-form-item label="责任岗位" prop="respPostId">
                  <el-select
                    v-model="ruleForm.respPostId"
                    placeholder="请选择"
                    @change="setRespPostName"
                  >
                    <el-option
                      :label="item.name"
                      :value="item.id"
                      v-for="(item, index) in postlist"
                      :key="index"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="管控责任人" prop="respUserId">
                  <el-select
                    multiple
                    v-model="ruleForm.respUserId"
                    placeholder="请选择"
                    @change="setRespUserName"
                  >
                    <el-option
                      :label="item.nickname"
                      :value="item.id"
                      v-for="(item, index) in userlist"
                      :key="index"
                    />
                  </el-select>
                </el-form-item>
              </div>
              <div v-if="active == 1">
                <el-tabs
                  v-model="ruleForm.gradingMethod"
                  class="demo-tabs"
                  @tab-click="handleClick"
                >
                  <el-tab-pane label="企业自主评估定级" name="1">
                    <div>
                      <el-form-item label="整体风险" prop="overallRisk">
                        <el-segmented
                          v-model="ruleForm.overallRisk"
                          :options="locationOptionsOverallRisk"
                        >
                          <template #default="scope">
                            <div>{{ getDictLabel(DICT_TYPE.OVERALLRISK, scope.item) }}</div>
                          </template>
                        </el-segmented>
                      </el-form-item>
                      <el-form-item label="管控层级" prop="controlLevel">
                        <el-select v-model="ruleForm.controlLevel" placeholder="请选择">
                          <el-option
                            :label="item.controlLevel"
                            :value="item.id"
                            v-for="(item, key) in RiskLeveList.list"
                            :key="key"
                          />
                        </el-select>
                      </el-form-item>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="LSR评估定级" name="2">
                    <div
                      >LSR风险矩阵法:按照风险矩阵法(LS)方法，
                      危险性R的计算公式为:R=LxS;其中，R为危险性(也称风险度)，R值越大，
                      说明危险性越大;L为事故发生的可能性;S为事故后果严重性。
                    </div>
                    <div>
                      请根据风险评估结果选择“事故发生的可能性(L)"与“事件后果严重性(S)”的判别准则等级:
                    </div>
                    <el-row :gutter="12">
                      <el-col :span="12">
                        <div>
                          <div>事故发生的可能性(L)判定准则</div>
                          <ContentWrap>
                            <el-table
                              :data="tableData1"
                              style="width: 100%"
                              :show-overflow-tooltip="true"
                            >
                              <el-table-column fixed prop="grade" label="等级" width="60" />
                              <el-table-column prop="standard" label="标准" width="470" />
                              <el-table-column fixed="right" label="操作" width="60">
                                <template #default="scope">
                                  <el-radio-group v-model="test01">
                                    <el-radio :value="scope.row.id" />
                                  </el-radio-group>
                                </template>
                              </el-table-column>
                            </el-table>
                          </ContentWrap>
                        </div>
                      </el-col>
                      <el-col :span="12">
                        <div>
                          <div>事件后果严重性(S)判别准则</div>
                          <ContentWrap>
                            <el-table
                              :data="tableData2"
                              style="width: 100%"
                              :show-overflow-tooltip="true"
                            >
                              <el-table-column fixed prop="grade" label="等级" width="60" />
                              <el-table-column prop="staff" label="人员" width="120" />
                              <el-table-column prop="economy" label="直接经济损失" width="120" />
                              <el-table-column prop="shutdown" label="停工" width="120" />
                              <el-table-column prop="image" label="企业形象" width="120" />
                              <el-table-column fixed="right" label="操作">
                                <template #default="scope">
                                  <el-radio-group v-model="test02">
                                    <el-radio :value="scope.row.id" />
                                  </el-radio-group>
                                </template>
                              </el-table-column>
                            </el-table>
                          </ContentWrap>
                        </div>
                      </el-col>
                    </el-row>
                    <div class="container">
                      <div class="grid">
                        <!-- 第1行 -->
                        <div class="cell" style="background-color: white">
                          <div class="label">可能性 (L)</div>
                          <div class="value">{{ test01 }}</div>
                        </div>
                        <div
                          class="cell"
                          style="line-height: 69px; font-size: 18px; border-color: #f9f9f9"
                        >
                          ×
                        </div>
                        <div class="cell" style="background-color: white">
                          <div class="label">严重性 (S)</div>
                          <div class="value">{{ test02 }}</div>
                        </div>
                        <div
                          class="cell"
                          style="line-height: 69px; font-size: 18px; border-color: #f9f9f9"
                        >
                          ＝
                        </div>
                        <div class="cell" style="background-color: white">
                          <div class="label">危险性 (R)</div>
                          <div class="value" v-if="(test02 * test01).toString() == 'NaN'"></div>
                          <div class="value" v-else>{{ test02 * test01 }}</div>
                        </div>
                      </div>
                    </div>
                    <el-row :gutter="12">
                      <el-col :span="6">
                        <el-select
                          v-model="ruleForm.overallRisk"
                          multiple
                          disabled
                          placeholder=" "
                          style="width: 100%"
                        >
                          <el-option
                            :label="item.label"
                            :value="item.value"
                            :class="`option-risk-${item.value}`"
                            v-for="(item, key) in getIntDictOptions(DICT_TYPE.OVERALLRISK)"
                            :key="key"
                          >
                            <div
                              class="flex items-center"
                              v-if="ruleForm.overallRisk == item.value"
                            >
                              <!--                              <el-tag style="margin-right: 8px" size="small" >dsd</el-tag>-->
                              <!--                              <span :style="{ color: item.value }">{{ item.label }}</span>-->
                            </div>
                          </el-option>
                          <template #tag>
                            <el-tag
                              v-if="ruleForm.overallRisk == 2"
                              style="
                                background: #c7d3f5;
                                border: 1px solid blue;
                                color: #434343;
                                width: 100%;
                              "
                            >
                              {{ getDictLabel(DICT_TYPE.RISKLEVEL, ruleForm.overallRisk) }}
                            </el-tag>
                            <el-tag
                              v-if="ruleForm.overallRisk == 5"
                              style="
                                background: #f0e68c;
                                border: 1px solid #bab25b;
                                color: #434343;
                                width: 100%;
                              "
                            >
                              {{ getDictLabel(DICT_TYPE.RISKLEVEL, ruleForm.overallRisk) }}
                            </el-tag>
                            <el-tag
                              v-if="ruleForm.overallRisk == 8"
                              style="
                                background: #fff0da;
                                border: 1px solid orange;
                                color: #434343;
                                width: 100%;
                              "
                            >
                              {{ getDictLabel(DICT_TYPE.RISKLEVEL, ruleForm.overallRisk) }}
                            </el-tag>
                            <el-tag
                              v-if="ruleForm.overallRisk == 10"
                              style="
                                background: #f6d4cd;
                                border: 1px solid red;
                                color: #434343;
                                width: 100%;
                              "
                            >
                              {{ getDictLabel(DICT_TYPE.RISKLEVEL, ruleForm.overallRisk) }}
                            </el-tag>
                          </template>
                        </el-select>
                        <el-form-item label="管控层级">
                          <el-select disabled v-model="ruleForm.controlLevel" placeholder="请选择">
                            <el-option
                              :label="item.controlLevel"
                              :value="item.id"
                              v-for="(item, key) in RiskLeveList.list"
                              :key="key"
                            />
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :span="18" style="display: none">
                        <div style="text-align: left">
                          安全风险等级判定准则（R）
                          <el-image
                            style="width: 100%; height: 250px; text-align: left; display: block"
                            :src="lsrImg"
                          />
                        </div>
                      </el-col>
                    </el-row>
                  </el-tab-pane>
                </el-tabs>
              </div>
              <div v-if="active == 2">
                <div>危险有害因素辨识</div>
                <div style="margin-top: 10px">
                  <el-space wrap>
                    <el-button type="primary" @click="dangerClick()">新增</el-button>
                    <el-button type="primary" @click="importClick()">批量导入</el-button>
                  </el-space>
                </div>
                <div style="margin-top: 10px">
                  <ContentWrap>
                    <el-table :data="ruleForm.riskFactorsList" style="width: 100%">
                      <el-table-column prop="date" label="序号" width="150">
                        <template #default="scope">
                          {{ scope.$index + 1 }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="riskFactorsName" label="危险有害因素" width="150" />
                      <el-table-column prop="accidentType" label="可能造成的事故类型" width="150">
                        <template #default="scope">
                          {{ getControlType(scope.row.accidentType) }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="controlType" label="管控措施类型" width="150">
                        <template #default="scope">
                          {{ getDictLabel(DICT_TYPE.CONTROL_TYPE, scope.row.controlType) }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="controlMeasures" label="管控措施" width="150" />
                      <el-table-column prop="inspectItemName" label="检查项目" width="150" />
                      <el-table-column prop="inspectStandard" label="检查标准" width="150" />
                      <el-table-column label="操作" width="120" fixed="right">
                        <template #default="scope">
                          <el-button
                            type="primary"
                            @click="dangerHandleClick(scope.$index, scope.row)"
                            >删除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </ContentWrap>
                </div>
              </div>
              <div v-if="active == 3">
                <ChecklistEdit
                  v-model="ruleForm.inspectFrequency"
                  ref="ChecklistEditRef"
                  :userlist="userlist"
                />
              </div>
              <div v-if="active == 4 && flag">
                <PreviewEdit
                  ref="PreviewEditRef"
                  v-model="ruleForm.riskInformCard"
                  :postlist="postlist"
                  :userlist="userlist"
                />
              </div>
              <div v-if="active == 5 && flag">
                <Success v-if="active == 5 && flag" @create-risk-point="createRiskPoint()" />
              </div>
              <div v-if="active == 4 && !flag">
                <Success v-if="active == 4 && !flag" @create-risk-point="createRiskPoint()" />
              </div>
            </el-form>
          </el-col>
        </el-row>
      </div>
    </div>
  </ContentWrap>
  <el-dialog
    center
    :lazy-render="false"
    v-model="dialogVisible"
    :title="dialogTitle"
    width="900"
    :before-close="handleClose"
  >
    <template #header>
      <div class="dialog-header-flex">
        <span class="dialog-title">{{ dialogTitle }}</span>
        <el-button
          size="small"
          class="download-btn"
          @click="handleDownload"
          v-if="tag == 2 && dialogVisible"
          >下载
        </el-button>
        <el-button
          size="small"
          class="download-btn"
          @click="handleExport"
          v-if="tag == 1 && dialogVisible"
          >导出
        </el-button>
      </div>
    </template>
    <div ref="NotificationCardRef" v-if="dialogVisible">
      <NotificationCard v-if="tag == 2" v-model="ruleForm.riskInformCard" />
    </div>
    <ControlList
      ref="ControlListRef"
      v-if="tag == 1 && dialogVisible"
      :initialData="ruleForm"
      :riskLeveList="RiskLeveList.list"
    />
    <Import v-if="tag == 3 && dialogVisible" v-model="ImportModel" @submit="importSubmit" />
  </el-dialog>
  <el-drawer v-model="dangerDrawer" title="新增" direction="rtl" :before-close="handleClose">
    <DangerEdit
      v-if="dangerDrawer"
      :initial-data="initialFormData"
      @submit="handleSubmit"
      @reset="handleReset"
    />
  </el-drawer>
  <ChoosePeopleDialog ref="choosePeople" v-model="mytest01" :state="false" />
</template>

<script lang="ts" setup>
import LSRIMG from '@/assets/imgs/prt/LSR.png'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'

import type { ComponentSize, FormInstance, FormRules, FormProps } from 'element-plus'

const value = ref<string[]>([])
const colors = [
  {
    value: '#E63415',
    label: 'red'
  },
  {
    value: '#FF6600',
    label: 'orange'
  },
  {
    value: '#FFDE0A',
    label: 'yellow'
  },
  {
    value: '#1EC79D',
    label: 'green'
  },
  {
    value: '#14CCCC',
    label: 'cyan'
  },
  {
    value: '#4167F0',
    label: 'blue'
  },
  {
    value: '#6222C9',
    label: 'purple'
  }
]
colors.forEach((color) => {
  value.value.push(color.value)
})
const mytest01 = ref([{ nickname: '1', username: '2', id: 146 }])
const { delView } = useTagsViewStore() // 视图操作
const route = useRoute() // 路由
const router = useRouter() // 路由
const lsrImg = ref(LSRIMG)
let dangerDrawer = ref(false)
const dialogVisible = ref(false) //风险分级管控清单
const handleClose = () => {
  dangerDrawer.value = false
  dialogVisible.value = false
}
const importSubmit = (val) => {
  if (ruleForm.value.riskFactorsList == null) {
    ruleForm.value.riskFactorsList = []
  }
  val.forEach((i) => {
    ruleForm.value.riskFactorsList.push(i)
  })
  dialogVisible.value = false
}
// 导入模块数据
let ImportModel = ref({
  url: '/prt/risk/get-import-template',
  uploadUrl: '/prt/risk/import',
  fileName: '危险有害因素辨识导入模板.xls',
  returnJson: null
})
//表单
const ChecklistEditRef = ref()
const PreviewEditRef = ref()
const test01 = ref()
const test02 = ref()

const tableData1 = ref([
  {
    id: '1',
    grade: '1',
    standard:
      '有充分、有效的防范、控制、检测、保护措施，或员工安全意识相当高，严格执行操作规程。极不可能发生事故或事件。'
  },
  {
    id: '2',
    grade: '2',
    standard:
      '危害一旦发生能及时发现，并定期进行监测，或现场有防范控制措施，并能有效执行，或过去偶尔发生事故或事件。'
  },
  {
    id: '3',
    grade: '3',
    standard:
      '没有保护措施(如没有保护装置、没有个人防护用品等)，或未严格按操作程序执行，或危害的发生容易被发现(现场有监测系统)，或曾经作过监测，或过去曾经发生类似事故或事件。'
  },
  {
    id: '4',
    grade: '4',
    standard:
      '危害的发生不容易被发现，现场没有检测系统，也未发生过任何监测，或在现场有控制措施，但未有效执行或控制措施不当，或危害发生或预期情况下发生。'
  },
  {
    id: '5',
    grade: '5',
    standard:
      '在现场没有采取防范、监测、保护、控制措施，或危害的发生不能被发现(没有监测系统)，或在正常情况下经常发生此类事故或事件。'
  }
])
const tableData2 = ref([
  {
    id: '1',
    grade: '1',
    staff: '无伤亡',
    economy: '无损失',
    shutdown: '没有停工',
    image: '形象没有受损'
  },
  {
    grade: '2',
    id: '2',
    staff: '轻微受伤、间歇不舒服',
    economy: '1万元以下',
    shutdown: '受影响不大，几乎不停工',
    image: '公司及周边范围'
  },
  {
    id: '3',
    grade: '3',
    staff: '截肢、骨折、听力丧失、慢性病',
    economy: '10万元以上',
    shutdown: '1套装置停工或设备',
    image: '地区影响'
  },
  {
    id: '4',
    grade: '4',
    staff: '丧失劳动能力',
    economy: '20万元以上',
    shutdown: '2套装置停工、或设备停工',
    image: '行业内、省内影响'
  },
  {
    id: '5',
    grade: '5',
    staff: '死亡',
    economy: '50万元以上',
    shutdown: '部分装置（>2套）停工或设备',
    image: '国内影响'
  }
])
let formLoading = ref(false)
const labelPosition = ref<FormProps['labelPosition']>('top')

interface RuleForm {
  id: number
  name: string
  region: string
  count: string
  date1: string
  date2: string
  delivery: boolean
  location: string
  type: string[]
  resource: string
  desc: string
  riskFactorsList: any[]
}

const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
let ruleForm = ref({
  id: '',
  gradingMethod: '1',
  deptId: '',
  riskUnitId: '',
  riskName: '',
  overallRisk: '',
  riskType: '',
  controlLevel: '',
  respDeptId: '',
  respDeptName: '',
  respPostId: '',
  respPostName: '',
  respUserId: '',
  respUserName: '',
  riskFactorsList: [],
  inspectFrequency: {},
  riskInformCard: {
    prohibitSigns: [],
    idd: '',
    instructionSigns: [],
    warnSigns: []
  }
})
const choosePeople = ref()
import ChoosePeopleDialog from './component/choosePeopleDialog.vue'

const active = ref(0)
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
// 风险点类型*（5：场所 10：设备设施 15：常规作业 20：特殊作业 25：管理）,示例值(2)
const getValues = (item) => {
  let str = []
  item.forEach((i) => {
    str.push(i.value)
  })
  return str
}
const locationOptions = getValues(getIntDictOptions(DICT_TYPE.RISKTYPE))
const locationOptionsOverallRisk = getValues(getIntDictOptions(DICT_TYPE.OVERALLRISK))
import * as PostApi from '@/api/system/post'

const postlist = ref([])
/** 查询岗位列表 */
const getPostList = async () => {
  try {
    const data = await PostApi.getSimplePostList()
    postlist.value = data
  } finally {
  }
}

const treeList = ref([])
import { defaultProps, handleTree } from '@/utils/tree'

let deptList = ref([])
/** 查询部门列表 */
const getList = async () => {
  try {
    const data = await DeptApi.getDeptPage(queryParams)
    deptList.value = JSON.parse(JSON.stringify(data))
    treeList.value = handleTree(data)
  } finally {
  }
}
let userlist = ref([])
import * as UserApi from '@/api/system/user'

const getUserLIst = async () => {
  const data = await UserApi.getSimpleUserList()
  userlist.value = data
}
const rules = reactive<FormRules<RuleForm>>({
  riskName: [{ required: true, message: '请输入', trigger: 'change' }],
  riskUnitId: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  riskType: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  respDeptId: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  respPostId: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  respUserId: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  overallRisk: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  controlLevel: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  resource: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  desc: [{ required: true, message: '请选择', trigger: 'change' }]
})

const next = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  let form = { state: false, data: null }
  if (ChecklistEditRef.value != null) {
    form = await ChecklistEditRef.value.validate()
  } else if (PreviewEditRef.value != null) {
    form = await PreviewEditRef.value.validate()
  }
  setriskInformCard()
  ruleForm.value.inspectFrequency.inspectUsers1 = ruleForm.value.respUserId
  ruleForm.value.inspectFrequency.respUserName1 = ruleForm.value.respUserName
  await formEl.validate((valid, fields) => {
    if (valid) {
      active.value = active.value + 1
    }
  })
}

const previousPage = async () => {
  let form = { state: false, data: null }
  if (ChecklistEditRef.value != null) {
    form = await ChecklistEditRef.value.validate()
  } else if (PreviewEditRef.value != null) {
    form = await PreviewEditRef.value.validate()
  }
  if (active.value-- < 0) {
    return
  }
}
const PreviewPage = () => {
  dialogVisible.value = true
  tag.value = 1
  dialogTitle.value = '风险分级管控清单'
}
const flag = ref(false)
const tag = ref(1)
const dialogTitle = ref('')
let ControlListRef = ref()
// 导出为excel
const handleExport = async () => {
 await ControlListRef.value.myExport()
}
// 保存网页为图片
let NotificationCardRef = ref()
import html2canvas from 'html2canvas'

const handleDownload = async () => {
  try {
    await nextTick()
    const canvas = await html2canvas(NotificationCardRef.value, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: false, // 改为 false 更安全
      logging: true, // 开启日志调试
      ignoreElements: (element) => {
        // 忽略可能引起问题的元素
        return element.classList.contains('ignore-export')
      },
      onclone: (clonedDoc) => {
        // 克隆文档时添加全局样式
        const style = document.createElement('style')
        style.textContent = `
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          td, tr {
            border: 1px solid black !important;
            height: 40px !important;
          }
        `
        clonedDoc.head.appendChild(style)
      }
    })

    const link = document.createElement('a')
    link.download = `${dialogTitle.value}_${new Date().toLocaleString()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('导出图片失败:', error)
    ElMessage.error('导出图片失败')
  }
}
const setriskInformCard = () => {
  if (ruleForm.value.riskInformCard == null) {
    ruleForm.value.riskInformCard = {
      prohibitSigns: [],
      instructionSigns: [],
      warnSigns: []
    }
  }
  ruleForm.value.riskInformCard.riskName = ruleForm.value.riskName
  ruleForm.value.riskInformCard.riskLevel = ruleForm.value.overallRisk
  ruleForm.value.riskInformCard.respPostId = ruleForm.value.respPostId
  ruleForm.value.riskInformCard.respPostName = ruleForm.value.respPostName
  ruleForm.value.riskInformCard.respUserId = ruleForm.value.respUserId
  if (typeof ruleForm.value.respUserId == 'string') {
    let userId = []
    ruleForm.value.respUserId.split(',').forEach((i) => {
      userId.push(Number(i))
    })
    ruleForm.value.riskInformCard.respUserId = userId
  }
  ruleForm.value.riskInformCard.respUserName = ruleForm.value.respUserName
  // ruleForm.value.riskInformCard.respUserPhone = ruleForm.value.respUserPhone
}
const generateStep = (type) => {
  setriskInformCard()
  if (type == 1) {
    flag.value = true
    active.value = active.value + 1
  } else {
    dialogVisible.value = true
    tag.value = 2
    dialogTitle.value = '风险告知卡'
  }
}
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  let form = { state: false, data: null }
  if (ChecklistEditRef.value != null) {
    form = await ChecklistEditRef.value.validate()
  } else if (PreviewEditRef.value != null) {
    form = await PreviewEditRef.value.validate()
  }
  let valid = await formEl.validate()
  if (valid) {
    if (!form.state) {
      return
    }
  }
  let postData = JSON.parse(JSON.stringify(ruleForm.value))
  if (postData?.inspectFrequency?.cycleFrqTimes != null) {
    postData.inspectFrequency.cycleFrqTimes = postData.inspectFrequency.cycleFrqTimes.toString()
  }
  if (postData?.inspectFrequency?.inspectUsers != null) {
    postData.inspectFrequency.inspectUsers = postData.inspectFrequency.inspectUsers.toString()
  }
  if (postData?.riskInformCard?.warnSignsUrl != null) {
    postData.riskInformCard.warnSignsUrl = postData.riskInformCard.warnSignsUrl.toString()
  }
  treeList.value.forEach((i) => {
    if (i.id == ruleForm.value.respDeptId) {
      postData.respDeptName = i.name
    }
  })
  postData.riskInformCard.instructionSigns = postData.riskInformCard.instructionSigns.toString() //指令
  postData.riskInformCard.warnSigns = postData.riskInformCard.warnSigns.toString() //警告
  postData.riskInformCard.prohibitSigns = postData.riskInformCard.prohibitSigns.toString() //禁止
  postData.inspectFrequency.inspectUsers = postData.inspectFrequency.inspectUsers.toString() // 检查人员
  postData.respUserId = postData.respUserId.toString() // 检查人员
  postData.riskInformCard.respUserId = postData.riskInformCard?.respUserId?.toString() // 检查人员
  let id = route.query.id
  console.log(isEdit.value)
  if (isEdit.value == 'copy') {
    id = null
    delete postData.riskInformCard.id
    delete postData.inspectFrequency.id
    postData.riskFactorsList.forEach((i) => {
      delete i.id
    })
  }

  if (id != null) {
    // 编辑
    await RiskApi.updateRisk(postData)
    active.value = active.value + 1
    message.success(t('common.updateSuccess'))
  } else {
    // 新增
    await RiskApi.createRisk(postData)
    active.value = active.value + 1
    message.success(t('common.createSuccess'))
  }
}
const handleClick = () => {
  ruleForm.value.controlLevel = ''
  ruleForm.value.overallRisk = ''
  test01.value = ''
  test02.value = ''
}

const dangerClick = () => {
  dangerDrawer.value = true
}
const importClick = () => {
  dialogVisible.value = true
  tag.value = 3
  dialogTitle.value = '批量导入'
}
const dangerHandleClick = (index: number) => {
  ruleForm.value.riskFactorsList.splice(index, 1)
}
const getControlType = (val) => {
  let str = []
  val.split(',').forEach((o) => {
    str.push(getDictLabel(DICT_TYPE.ACCIDENT_TYPE, o))
  })
  return str.toString()
}

import DangerEdit from './component/DangerEdit.vue'
import ChecklistEdit from './component/ChecklistEdit.vue'
import PreviewEdit from './component/PreviewEdit.vue'
import NotificationCard from './component/NotificationCard.vue'
import ControlList from './component/ControlList.vue'
import Import from './component/Import.vue'
import Success from './component/Success.vue'

const initialFormData = {
  inspectItemName: '',
  controlType: '',
  riskFactorsName: '',
  accidentType: [],
  controlMeasures: '',
  inspectStandard: ''
}
const handleSubmit = (formData) => {
  if (ruleForm.value.riskFactorsList == null) {
    ruleForm.value.riskFactorsList = []
  }
  formData.accidentType = formData.accidentType.toString()
  ruleForm.value.riskFactorsList.push(formData)
  dangerDrawer.value = false
}

const handleReset = () => {
  dangerDrawer.value = false
}

/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.push({ name: 'PrtRiskIndex' })
}

import { RiskApi, RiskVO } from '@/api/prt/risk'
import { RiskUnitApi, RiskUnitVO } from '@/api/prt/riskunit'

const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  username: undefined,
  mobile: undefined,
  status: undefined,
  deptId: undefined,
  createTime: []
})
const defaultProps = {
  children: 'children',
  label: 'name'
}
import * as DeptApi from '@/api/system/dept'
import * as RiskLevelApi from '@/api/prt/risklevel'
import { getSimplePostList } from '@/api/system/post'

let RiskLeveList = ref([])
// 获取管控层级
const getRiskLevel1 = async () => {
  RiskLeveList.value = await RiskLevelApi.RiskLevelApi.getRiskLevelPage(queryParams)
}
const respDeptIdChange = (val) => {
  ruleForm.value.respDeptName = val.name
}
const setRespUserName = (val) => {
  let nickname = []
  val.forEach((b) => {
    userlist.value.forEach((i) => {
      if (i.id == b) {
        nickname.push(i.nickname)
      }
    })
  })
  ruleForm.value.respUserName = nickname.toString()
}
const setRespPostName = (val) => {
  postlist.value.forEach((i) => {
    if (i.id == val) {
      ruleForm.value.respPostName = i.name
    }
  })
}
let isEdit = ref('')
let RiskUnitList = ref([])
/** 初始化 */
onMounted(async () => {
  try {
    formLoading.value = true
    // 用户列表
    await getUserLIst()
    // 岗位
    await getPostList()
    // 查询部门列表
    await getList()
    // 管控层级
    await getRiskLevel1()
    // 风险单元
    RiskUnitList.value = await RiskUnitApi.getRiskUnitPage(queryParams)
    ruleForm.value.id = route.query.id
    isEdit.value = route.query.flag
    formLoading.value = false
    if (route.query.id != null) {
      formLoading.value = true
      let test = await RiskApi.getRisk(route.query.id)
      ruleForm.value = JSON.parse(JSON.stringify(test))
      setriskInformCard()
      ruleForm.value.riskType = toNumber(ruleForm.value.riskType)
      ruleForm.value.gradingMethod = ruleForm.value.gradingMethod.toString()
      ruleForm.value.overallRisk = toNumber(ruleForm.value.overallRisk)
      ruleForm.value.controlLevel = toNumber(ruleForm.value.controlLevel)
      // 数据类型处理
      ruleForm.value.respDeptId = toNumber(ruleForm.value.respDeptId)
      console.log(
        '-----------------数据类型处理----------------------------------',
        ruleForm.value.riskInformCard
      )
      ruleForm.value.riskInformCard.respPostId = toNumber(
        ruleForm.value?.riskInformCard?.respPostId
      )
      ruleForm.value.respPostId = toNumber(ruleForm.value.respPostId)
      let respUserId = []
      if (ruleForm.value.respUserId != null) {
        ruleForm.value.respUserId?.split(',').forEach((i) => {
          respUserId.push(toNumber(i))
        }) // 管控责任人
      }
      ruleForm.value.respUserId = respUserId
      if (ruleForm.value.inspectFrequency != null) {
        let inspectUsers = []
        if (ruleForm.value.inspectFrequency.inspectUsers != null) {
          ruleForm.value.inspectFrequency.inspectUsers?.split(',').forEach((i) => {
            inspectUsers.push(toNumber(i))
          }) // 检查人员
        }
        ruleForm.value.inspectFrequency.inspectUsers = inspectUsers
        ruleForm.value.inspectFrequency.submitType =
          ruleForm.value.inspectFrequency.submitType?.toString()
        ruleForm.value.inspectFrequency.inspectFrqType =
          ruleForm.value.inspectFrequency.inspectFrqType?.toString()
        ruleForm.value.inspectFrequency.cycleFrqType =
          ruleForm.value.inspectFrequency?.cycleFrqType?.toString()
        ruleForm.value.inspectFrequency.cycleFrqTimeType =
          ruleForm.value.inspectFrequency.cycleFrqTimeType?.toString()
        ruleForm.value.inspectFrequency.cycleFrqTimes =
          ruleForm.value.inspectFrequency.cycleFrqTimes?.split(',')
        ruleForm.value.inspectFrequency.isImmediate =
          ruleForm.value.inspectFrequency.isImmediate?.toString()
        ruleForm.value.inspectFrequency.validType =
          ruleForm.value.inspectFrequency.validType?.toString()
      }
      if (ruleForm.value.riskInformCard == null) {
        ruleForm.value.riskInformCard = {}
        ruleForm.value.riskInformCard.warnSigns = []
        ruleForm.value.riskInformCard.instructionSigns = []
        ruleForm.value.riskInformCard.prohibitSigns = []
      }
      ruleForm.value.riskInformCard.idd = ruleForm.value.id
      flag.value = true
      if (ruleForm.value.riskInformCard.warnSigns == null) {
        ruleForm.value.riskInformCard.warnSigns = []
      }
      if (ruleForm.value.riskInformCard.instructionSigns == null) {
        ruleForm.value.riskInformCard.instructionSigns = []
      }
      if (ruleForm.value.riskInformCard.prohibitSigns == null) {
        ruleForm.value.riskInformCard.prohibitSigns = []
      }
      if(ruleForm.value.riskInformCard != null){
        ruleForm.value.riskInformCard.prohibitSigns =
          ruleForm.value.riskInformCard?.prohibitSigns?.split(',')
        ruleForm.value.riskInformCard.instructionSigns =
          ruleForm.value.riskInformCard.instructionSigns?.split(',')
        ruleForm.value.riskInformCard.warnSigns = ruleForm.value.riskInformCard.warnSigns?.split(',')
      }
      console.log('ruleForm.value.riskInformCard', ruleForm.value.riskInformCard)
      if (isEdit.value == 'copy') {
        delete ruleForm.value.id
      }
      if (isEdit.value == '1') {
        active.value = 1
      }
      if (isEdit.value == '2') {
        flag.value = true
        active.value = 4
      }
      if (isEdit.value == '3') {
        active.value = 3
        PreviewPage()
      }
    } else {
    }
  } finally {
    formLoading.value = false
  }
})
const toNumber = (val) => {
  if (val != null) {
    return Number(val)
  }
}
const createRiskPoint = () => {
  //   重置表单
  if (!ruleFormRef.value) return
  ruleFormRef.value.resetFields()
  ruleForm.value = {
    riskFactorsList: [],
    inspectFrequency: {},
    riskInformCard: {
      prohibitSigns: [],
      instructionSigns: [],
      warnSigns: []
    }
  }
  //   重置标签页
  active.value = 0
  //   重置其他状态
  flag.value = false
}
const computedValue = computed(() => {
  if (test01.value != null && test02.value != null) {
    return test01.value * test02.value
  }
})
const getLeve = (val) => {
  let str = ''
  RiskLeveList.value.list.forEach((i) => {
    if (val == i.riskLevel) {
      str = i.id
    }
  })
  return Number(str)
}
/** 添加组件卸载前的清理代码 */
onBeforeUnmount(() => {})
watch(computedValue, (newValue) => {
  // computedValue 的值发生变化时，会执行这里的操作
  if (newValue <= '8') {
    ruleForm.value.overallRisk = 2
  } else if (newValue <= '12') {
    ruleForm.value.overallRisk = 5
  } else if (newValue <= '16') {
    ruleForm.value.overallRisk = 8
  } else {
    ruleForm.value.overallRisk = 10
  }
  ruleForm.value.controlLevel = getLeve(ruleForm.value.overallRisk)
})
let riskFactorsName = ref([])
let accidentType = ref([])
let controlMeasures = ref([])
watch(
  () => ruleForm.value.riskFactorsList,
  () => {
    riskFactorsName.value = []
    accidentType.value = []
    controlMeasures.value = []
    ruleForm.value.riskFactorsList.forEach((i, index) => {
      riskFactorsName.value.push(index + 1 + '、' + i.riskFactorsName + ';' + '\n')
      i.accidentType.split(',').forEach((j) => {
        accidentType.value.push(j)
      })
      controlMeasures.value.push(index + 1 + '、' + i.controlMeasures + ';' + '\n')
    })
    if (ruleForm.value.riskInformCard == null) {
      ruleForm.value.riskInformCard = {}
    }
    let newaccidentType = []
    accidentType.value = [...new Set(accidentType.value)]
    accidentType.value.forEach((i, index) => {
      newaccidentType.push(index + 1 + '、' + getDictLabel(DICT_TYPE.ACCIDENT_TYPE, i) + ';' + '\n')
    })
    ruleForm.value.riskInformCard.accidentTrigger = riskFactorsName.value.join('')
    ruleForm.value.riskInformCard.accidentType = newaccidentType.join('')
    ruleForm.value.riskInformCard.measure = controlMeasures.value.join('')
  },
  { deep: true }
)

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
  margin-top: 10px;
}

.dialog-header-flex {
  display: flex;
  justify-content: center; /* 标题居中 */
  align-items: center; /* 垂直居中 */
  position: relative;
}

.dialog-title {
  flex: 1; /* 占据剩余空间，确保标题居中 */
  text-align: center;
}

.download-btn {
  position: absolute;
  right: 20px; /* 固定在右侧 */
}
</style>
