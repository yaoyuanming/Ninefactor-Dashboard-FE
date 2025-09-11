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
          <span class="ml-10px text-16px truncate"> 新增企业项目检查清单 </span>
        </div>
        <div class="flex items-center gap-2"></div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px">
        <el-row>
          <el-col :span="12" :offset="6">
            <div>
              <el-form
                label-position="top"
                ref="formRef"
                v-loading="formLoading"
                :model="formData"
                :rules="formRules"
                label-width="160px"
              >
                <el-form-item label="检查清单名称" prop="inspectName">
                  <el-input v-model="formData.inspectName" placeholder="请输入检查清单名称" />
                </el-form-item>
                <el-form-item label="检查目标" prop="inspectTarget">
                  <el-input
                    v-model="formData.inspectTarget"
                    placeholder="请输入检查目标"
                    :rows="5"
                    type="textarea"
                  />
                </el-form-item>
                <el-form-item label="检查类型" prop="inspectionType">
                  <el-segmented v-model="formData.inspectionType" :options="inspectionTypeOptions">
                    <template #default="scope">
                      <div>{{ getDictLabel(DICT_TYPE.INSPECTION_TYPE, scope.item) }}</div>
                    </template>
                  </el-segmented>
                </el-form-item>
                <el-form-item label="下发日期" prop="listDate">
                  <el-date-picker
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                    v-model="formData.listDate"
                    type="date"
                    placeholder="选择日期"
                  />
                </el-form-item>
                <el-form-item>
                  <div class="grid-container">
                    <div style="padding: 5px">
                      <p style="background: #bfcbf7; width: 80px; padding-left: 10px">检查内容</p>
                    </div>
                    <div style="text-align: right; padding: 5px">
                      <el-button @click="triggerUpload()">批量导入</el-button>
                      <el-button type="primary" plain @click="openDialog">添加检查项目</el-button>
                    </div>
                  </div>
                  <div style="width: 100%">
                    <el-table
                      :data="formData.riskFactorsList"
                      :stripe="true"
                      :show-overflow-tooltip="true"
                      style="overflow-x: auto; width: 100%; height: 200px"
                    >
                      <el-table-column label="序号" align="center" prop="id">
                        <template #default="scope">
                          {{ scope.$index + 1 }}
                        </template>
                      </el-table-column>
                      <el-table-column label="检查项目" align="center" prop="inspectItemName" />
                      <el-table-column label="检查标准" align="center" prop="inspectStandard" />
                      <el-table-column label="操作" align="center" min-width="220px" fixed="right">
                        <template #default="scope">
                          <el-button link type="primary" @click="openForm(scope.row, scope.$index)">
                            编辑
                          </el-button>
                          <el-button link type="danger" @click="handleDelete(scope.$index)">
                            删除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </el-form-item>
                <el-form-item>
                  <el-button @click="handleBack">取 消</el-button>
                  <el-button :disabled="formLoading" type="primary" @click="submitForm"
                    >确 定
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </ContentWrap>
  <el-dialog v-model="dialogVisible" @close="closeDialog">
    <el-form :model="dialogFormData" ref="dialogForm" :rules="rules">
      <el-form-item label="检查项目" prop="inspectItemName">
        <el-input v-model="dialogFormData.inspectItemName" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="检查标准" prop="inspectStandard">
        <el-input
          v-model="dialogFormData.inspectStandard"
          type="textarea"
          :rows="5"
          placeholder="请输入"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog()">取 消</el-button>
        <el-button type="primary" @click="handleSubmit(dialogForm)">确 定</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="importVisible" title="批量导入">
    <Import v-if="importVisible" @submit="handleImport" />
  </el-dialog>
</template>
<script lang="ts" setup>
import Import from './component/Import.vue'
import { DICT_TYPE, getDictLabel, getIntDictOptions } from '@/utils/dict'
import * as ClientApi from '@/api/system/oauth2/client'

defineOptions({ name: 'SystemOAuth2ClientForm' })
let list = ref([])
let importVisible = ref(false)
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const dialogForm = ref()
let dialogFormData = ref({
  inspectItemName: '',
  index: '',
  inspectStandard: ''
})

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('整改完成录入') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const getValues = (item) => {
  let str = []
  item.forEach((i) => {
    str.push(i.value)
  })
  return str
}
const inspectionTypeOptions = getValues(getIntDictOptions(DICT_TYPE.INSPECTION_TYPE))
const formData = ref({
  id: undefined,
  deptId: undefined,
  inspectCode: undefined,
  inspectName: undefined,
  inspectListCat: undefined,
  validType: undefined,
  startTime: undefined,
  endTime: undefined,
  inspectItemType: undefined,
  inspectTarget: undefined,
  listDate: undefined,
  listSource: undefined,
  inspectionLevel: undefined,
  inspectionType: undefined,
  govInspectListType: undefined,
  govAgencyName: undefined,
  govAgencyCode: undefined,
  uploadTime: undefined,
  riskFactorsList: [],
  inspectFrequency: {}
})
const formRules = reactive({
  inspectName: [{ required: true, message: '请输入', trigger: 'change' }],
  inspectTarget: [{ required: true, message: '请输入', trigger: 'change' }],
  inspectionType: [{ required: true, message: '请选择', trigger: 'change' }],
  listDate: [{ required: true, message: '请选择', trigger: 'change' }]
})
const rules = reactive({
  inspectStandard: [{ required: true, message: '请输入', trigger: 'change' }],
  inspectItemName: [{ required: true, message: '请输入', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ClientApi.getOAuth2Client(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
import { InspectRespAPI } from '@/api/prt/inspect'

const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = JSON.parse(JSON.stringify(formData.value))
    data.inspectListCat = 5
    // 获取路由数据
    if (route.query.id != null) {
      await InspectRespAPI.updateInspect(data)
      message.success(t('common.updateSuccess'))
      handleBack()
    } else {
      await InspectRespAPI.createInspect(data)
      message.success(t('common.createSuccess'))
      handleBack()
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    deptId: undefined,
    inspectCode: undefined,
    inspectName: undefined,
    inspectListCat: undefined,
    validType: undefined,
    startTime: undefined,
    endTime: undefined,
    inspectItemType: undefined,
    inspectTarget: undefined,
    listDate: undefined,
    listSource: undefined,
    inspectionLevel: undefined,
    inspectionType: undefined,
    govInspectListType: undefined,
    govAgencyName: undefined,
    govAgencyCode: undefined,
    uploadTime: undefined,
    riskFactorsList: [],
    inspectFrequency: {}
  }
  formRef.value?.resetFields()
}
import * as UserApi from '@/api/system/user'

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
  formLoading.value = true
  getList()
  try {
    const data = await UserApi.getUserPage(queryParams)
    list.value = data.list
    //   获取详情
    if (route.query.id != null) {
      formData.value = await InspectRespAPI.getInspect(route.query.id)
    }
  } finally {
    formLoading.value = false
  }
})
import { handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'

let treelist = ref()
/** 查询部门列表 */
const getList = async () => {
  try {
    const data = await DeptApi.getDeptPage(queryParams)
    treelist.value = handleTree(data)
  } finally {
  }
}
const { delView } = useTagsViewStore() // 视图操作
const route = useRoute() // 路由
const router = useRouter() // 路由
/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.go(-1)
  // router.push({ name: 'EnterpriseInspectionList' })
}
const closeDialog = () => {
  dialogForm.value?.resetFields()
  dialogVisible.value = false
}
const openDialog = () => {
  dialogVisible.value = true
  editFlag.value = false
}
const handleSubmit = async (formEl) => {
  if (!formEl) return
  let valid = await formEl.validate()
  if (valid) {
    if (editFlag.value) {
      formData.value.riskFactorsList[dialogFormData.value.index] = JSON.parse(
        JSON.stringify(dialogFormData.value)
      )
    } else {
      if (formData.value.riskFactorsList == undefined) {
        formData.value.riskFactorsList = []
      }
      formData.value.riskFactorsList.push(JSON.parse(JSON.stringify(dialogFormData.value)))
    }
    dialogVisible.value = false
  } else {
  }
}
let editFlag = ref() //是否编辑
const openForm = (row, index) => {
  dialogFormData.value = JSON.parse(JSON.stringify(row))
  dialogFormData.value.index = index
  editFlag.value = true
  dialogVisible.value = true
}
const handleDelete = (index) => {
  // 根据索引删除
  formData.value.riskFactorsList.splice(index, 1)
}
// 触发文件选择对话框
const triggerUpload = () => {
  importVisible.value = true
}
const handleImport = (val) => {
  if (formData.value.riskFactorsList == undefined) {
    formData.value.riskFactorsList = []
  }
  val.forEach((i) => {
    formData.value.riskFactorsList.push({
      inspectStandard: i.检查标准,
      inspectItemName: i.检查项目
    })
  })
  importVisible.value = false
}
</script>
<style scoped>
.grid-container {
  background: #f9f9f9;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
</style>
