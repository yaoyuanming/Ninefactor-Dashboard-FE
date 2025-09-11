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
          <span class="ml-10px text-16px truncate"> 录入隐患 </span>
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
                <el-timeline style="max-width: 600px">
                  <el-timeline-item color="blue">
                    <div>
                      <el-form-item label="">
                        <template #label>
                          <div
                            style="
                              border-left: 5px solid blue;
                              padding-left: 10px;
                              font-weight: bold;
                            "
                          >
                            录入隐患信息
                          </div>
                        </template>
                      </el-form-item>
                      <el-form-item label="隐患图片" required>
                        <UploadImgs v-model="formData.dangerUrl" :fileSize="100" />
                      </el-form-item>
                      <el-form-item label="隐患描述" prop="dangerDesc">
                        <el-input v-model="formData.dangerDesc" placeholder="请输入隐患描述" />
                      </el-form-item>
                      <el-form-item label="隐患位置" prop="dangerAddress">
                        <el-input
                          v-model="formData.dangerAddress"
                          placeholder="请输入隐患位置"
                        />
                      </el-form-item>
                      <el-form-item label="隐患等级" prop="dangerLevel">
                        <el-segmented v-model="formData.dangerLevel" :options="locationOptions">
                          <template #default="scope">
                            <div>{{ getdangerLevel(scope.item) }}</div>
                          </template>
                        </el-segmented>
                      </el-form-item>
                      <el-form-item label="隐患来源" prop="dangerSource">
                        <el-select v-model="formData.dangerSource">
                          <el-option
                            :value="item.value"
                            :label="item.label"
                            v-for="(item, key) in getIntDictOptions(DICT_TYPE.DANGER_SOURCE)"
                            :key="key"
                          />
                        </el-select>
                      </el-form-item>
                    </div>
                  </el-timeline-item>
                  <el-timeline-item color="blue">
                    <div>
                      <el-form-item label="">
                        <template #label>
                          <div
                            style="
                              border-left: 5px solid blue;
                              padding-left: 10px;
                              font-weight: bold;
                            "
                          >
                            录入检查与整改信息
                          </div>
                        </template>
                      </el-form-item>
                      <el-form-item label="检查日期" prop="inspectTime">
                        <el-date-picker
                          style="width: 100%"
                          v-model="formData.inspectTime"
                          type="date"
                          value-format="x"
                          placeholder="选择日期"
                        />
                      </el-form-item>
                      <el-form-item label="检查人" prop="inspectUserId">
                        <el-select
                          v-model="formData.inspectUserId"
                          placeholder="请选择检查人"
                          @change="setRespUserName"
                        >
                          <el-option
                            v-for="item in userList"
                            :key="item.id"
                            :label="item.nickname"
                            :value="item.id"
                          />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="责任部门" prop="respDeptId">
                        <el-tree-select
                          @node-click="respDeptIdChange"
                          check-strictly="true"
                          v-model="formData.respDeptId"
                          :data="treelist"
                          :render-after-expand="false"
                          style="width: 100%"
                          node-key="id"
                          :props="defaultProps"
                        />
                      </el-form-item>
                      <el-form-item label="整改责任人" prop="rectChargeUserId">
                        <el-select
                          v-model="formData.rectChargeUserId"
                          placeholder="请选择整改责任人"
                          @change="setRectChargeUserName"
                        >
                          <el-option
                            v-for="item in userList"
                            :key="item.id"
                            :label="item.nickname"
                            :value="item.id"
                          />
                        </el-select>
                      </el-form-item>
                      <el-form-item>
                        <el-button @click="handleBack">取 消</el-button>
                        <el-button :disabled="formLoading" type="primary" @click="submitForm"
                          >确 定
                        </el-button>
                      </el-form-item>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </el-form>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </ContentWrap>
</template>
<script lang="ts" setup>
import * as ClientApi from '@/api/system/oauth2/client'

defineOptions({ name: 'SystemOAuth2ClientForm' })
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('整改完成录入') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const locationOptions = ['5', '10']
interface formDataApi {
  dangerUrl:string
  dangerDesc:string
  dangerAddress:string
  dangerLevel:string
  dangerSource:string
  inspectTime:string
  inspectUserId:string
  respDeptId:string
  rectChargeUserId:string
  respDeptName:string
  respUserName:string
  rectChargeUserName:string
}
const formData = ref<formDataApi>({
  dangerUrl:"",
  dangerDesc:'',
  dangerAddress:'',
  dangerLevel:'',
  dangerSource:'',
  inspectTime:'',
  inspectUserId:'',
  respDeptId:'',
  rectChargeUserId:'',
  respDeptName:'',
  respUserName:'',
  rectChargeUserName:'',

})
const formRules = reactive({
  dangerUrl: [{ required: true, message: '请上传', trigger: 'change' }],
  dangerDesc: [{ required: true, message: '请输入', trigger: 'change' }],
  dangerAddress: [{ required: true, message: '请输入', trigger: 'change' }],
  dangerLevel: [{ required: true, message: '请选择', trigger: 'change' }],
  inspectTime: [{ required: true, message: '请选择', trigger: 'change' }],
  dangerSource: [{ required: true, message: '请选择', trigger: 'change' }],
  inspectUserId: [{ required: true, message: '请选择', trigger: 'change' }],
  respDeptId: [{ required: true, message: '请选择', trigger: 'change' }],
  rectChargeUserId: [{ required: true, message: '请选择', trigger: 'change' }]
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
const getdangerLevel = (val) => {
  if (val == 5) {
    return '一般隐患'
  } else if (val == 10) {
    return '重大隐患'
  }
}
/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = JSON.parse(JSON.stringify(formData.value))
    data.dangerUrl = data.dangerUrl.join(',')
    data.processDefinitionKey = route.query.baseProcessDefinitionKey
    if (route.query.id != null) {
      await DangerRectApi.updateDangerRect(data)
      message.success(t('common.updateSuccess'))
      handleBack()
    } else {
      await DangerRectApi.createDangerRect(data)
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
  formData.value = {} as formDataApi
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
let userList = ref([])

const getUserLIst = async () => {
  userList.value = await UserApi.getSimpleUserList(queryParams)
}
import { DangerRectApi } from '@/api/prt/dangerRect'

/** 初始化 */
onMounted(async () => {
  try {
    formLoading.value = true
    await getUserLIst()
    await getList()
    if (route.query.id != null) {
      formData.value = await DangerRectApi.getDangerRect((route.query.id))
    } else {
    }
  } finally {
    formLoading.value = false
  }
})
const route = useRoute() // 路由
import { handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'

const defaultProps = {
  children: 'children',
  label: 'name'
}
const respDeptIdChange = (val) => {
  formData.value.respDeptName = val.name
}
const setRespUserName = (val) => {
  userList.value.forEach((i) => {
    if (i.id == val) {
      formData.value.respUserName = i.nickname
    }
  })
}
const setRectChargeUserName = (val) => {
  userList.value.forEach((i) => {
    if (i.id == val) {
      formData.value.rectChargeUserName = i.nickname
    }
  })
}
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
// const route = useRoute() // 路由
const router = useRouter() // 路由
/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.go(-1)
}
</script>
