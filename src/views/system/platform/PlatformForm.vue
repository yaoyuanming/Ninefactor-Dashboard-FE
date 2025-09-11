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
            {{ route.query.id == null ? '新增' : '编辑' }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="submitForm" :disabled="formLoading" type="primary">保存</el-button>
        </div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px">
        <el-row :gutter="12">
          <el-col :span="12" :offset="6">
            <el-form
              label-position="top"
              ref="formRef"
              :model="formData"
              :rules="formRules"
              label-width="100px"
              v-loading="formLoading"
            >
              <div style="border-left: 4px solid blue; padding-left: 5px"> 基本信息</div>
              <el-form-item label="平台logo" prop="logoUrl">
                <upload-img v-model="formData.logoUrl" placeholder="请选择平台logo" />
              </el-form-item>
              <el-form-item label="子平台名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入平台名称" />
              </el-form-item>
              <el-form-item label="英文名称" prop="enName">
                <el-input v-model="formData.enName" placeholder="请输入平台英文名称" />
              </el-form-item>
              <el-form-item label="子平台编号" prop="code">
                <el-select v-model="formData.code" placeholder="请选择子平台编号" filterable>
                  <el-option
                    v-for="item in getStrDictOptions(DICT_TYPE.SYSTEM_PLATFORM_CODE)"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="访问地址" prop="website">
                <el-input v-model="formData.website" placeholder="请输入访问地址" />
              </el-form-item>
              <el-form-item label="平台页面框架配置" prop="loginBgUrl">
                <Upload-img-sys v-model="formData.loginBgUrl" placeholder="请输入登录页背景图片" />
              </el-form-item>
              <el-form-item label="布局">
                <LayoutRadioPicker v-model="formData.layout" />
              </el-form-item>
              <el-form-item label="系统主题">
                <ColorRadioPicker
                  v-model="formData.systemTheme"
                  :schema="[
                    '#409eff',
                    '#009688',
                    '#536dfe',
                    '#ff5c93',
                    '#ee4f12',
                    '#0096c7',
                    '#9c27b0',
                    '#ff9800'
                  ]"
                  @change="setSystemTheme"
                />
              </el-form-item>
              <el-form-item label="头部主题">
                <ColorRadioPicker
                  v-model="formData.headerTheme"
                  :schema="[
                    '#fff',
                    '#383f45',
                    '#151515',
                    '#24292e',
                    '#409eff',
                    '#5172dc',
                    '#0096c7',
                    '#394664',
                    '#273352',
                    '#e74c3c',
                    '#009688'
                  ]"
                  @change="setHeaderTheme"
                />
              </el-form-item>
              <el-form-item label="菜单主题">
                <ColorRadioPicker
                  v-model="formData.menuTheme"
                  :schema="[
                    '#e9ecef',
                    '#fff',
                    '#383f45',
                    '#151515',
                    '#24292e',
                    '#409eff',
                    '#5172dc',
                    '#0096c7',
                    '#394664',
                    '#273352',
                    '#e74c3c',
                    '#009688'
                  ]"
                  @change="setMenuTheme"
                />
              </el-form-item>
              <el-form-item label="全屏图标">
                <ElSwitch v-model="formData.screenfull" />
              </el-form-item>
              <el-form-item label="标签页">
                <ElSwitch v-model="formData.tagsView" />
              </el-form-item>
              <el-form-item label="标签页图标">
                <ElSwitch v-model="formData.tagsViewIcon" />
              </el-form-item>
              <el-form-item label="标志">
                <ElSwitch v-model="formData.logoChange" />
              </el-form-item>
              <el-form-item label="固定头部">
                <ElSwitch v-model="formData.fixedHeader" />
              </el-form-item>
              <el-form-item label="页脚">
                <ElSwitch v-model="formData.footer" />
              </el-form-item>
              <el-form-item label="灰色模式">
                <ElSwitch v-model="formData.greyMode" />
              </el-form-item>
              <el-form-item label="固定菜单">
                <ElSwitch v-model="formData.fixedMenu" />
              </el-form-item>
              <el-form-item label="水印">
                <el-input v-model="formData.water" />
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="formData.remark"
                  placeholder="请输入备注"
                  type="textarea"
                  :rows="3"
                />
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </div>
    </div>
  </ContentWrap>
</template>
<script setup lang="ts">
import { PlatformApi, PlatformVO } from '@/api/system/platform'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import LayoutRadioPicker from './components/LayoutRadioPicker.vue'
import ColorRadioPicker from './components/ColorRadioPicker.vue'
import InterfaceDisplay from './components/InterfaceDisplay.vue'
import { setCssVar, trim } from '@/utils'
import { useCssVar } from '@vueuse/core'
import {getIntDictOptions, DICT_TYPE, getStrDictOptions} from '@/utils/dict'
const route = useRoute() // 路由
/** 子平台 表单 */
defineOptions({ name: 'PlatformForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  enName: undefined,
  logoUrl: undefined,
  code: undefined,
  status: undefined,
  website: undefined,
  loginBgUrl: undefined,
  remark: undefined,
  adminStyleConfig: undefined,
  fixedHeader: undefined,
  greyMode: undefined,
  headerTheme: undefined,
  layout: undefined,
  logoChange: undefined,
  tagsViewIcon: undefined,
  water: undefined,
  systemTheme: undefined,
  tagsView: undefined,
  fixedMenu: undefined,
  screenfull: undefined,
  footer: undefined,
  menuTheme: undefined,
  appStyleConfig: undefined
})
const formRules = reactive({
  name: [{ required: true, message: '平台名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '平台编号不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '平台状态（0正常 1停用）不能为空', trigger: 'blur' }]
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
      formData.value = await PlatformApi.getPlatform(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    let data = JSON.parse(JSON.stringify(formData.value))
    let id = route.query.id
    let adminStyleConfigBack = {
      layout: formData.value.layout,
      systemTheme: formData.value.systemTheme,
      headerTheme: formData.value.headerTheme,
      menuTheme: formData.value.menuTheme,
      screenfull: formData.value.screenfull,
      tagsView: formData.value.tagsView,
      tagsViewIcon: formData.value.tagsViewIcon,
      logoChange: formData.value.logoChange,
      fixedHeader: formData.value.fixedHeader,
      footer: formData.value.footer,
      greyMode: formData.value.greyMode,
      fixedMenu: formData.value.fixedMenu,
      water: formData.value.water
    }
    data.adminStyleConfig = JSON.stringify(adminStyleConfigBack)
    if (id != null) {
      // 更新
      await PlatformApi.updatePlatform(data)
      message.success(t('common.updateSuccess'))
    } else {
      // 新增
      await PlatformApi.createPlatform(data)
      message.success(t('common.createSuccess'))
    }
    handleBack()
    dialogVisible.value = false
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    enName: undefined,
    logoUrl: undefined,
    code: undefined,
    status: undefined,
    website: undefined,
    loginBgUrl: undefined,
    remark: undefined,
    adminStyleConfig: undefined,
    appStyleConfig: undefined
  }
  formRef.value?.resetFields()
}
const { delView } = useTagsViewStore() // 视图操作
const router = useRouter() // 路由
/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.go(-1)
}
const setSystemTheme = (color: string) => {
  console.log('color', color)
  // setCssVar('--el-color-primary', color)
  // appStore.setTheme({ elColorPrimary: color })
  // // const topMenuBgColor = useCssVar('--top-menu-bg-color', document.documentElement)
  // // setHeaderTheme(trim(unref(topMenuBgColor)))
  // const leftMenuBgColor = useCssVar('--left-menu-bg-color', document.documentElement)
  // setMenuTheme(trim(unref(leftMenuBgColor)))
}
const setHeaderTheme = (color: string) => {
  // setCssVar('--top-menu-bg-color', color)
  console.log('color', color)
}
const setMenuTheme = (color: string) => {
  // setCssVar('--left-menu-bg-color', color)
  console.log('color', color)
}
const getList = async () => {
  //   获取路由数据
  try {
    const id = route.query.id
    console.log('routeData', id)
    resetForm()
    // 修改时，设置数据
    if (id) {
      formLoading.value = true
      formData.value = await PlatformApi.getPlatform(id)
      let adminStyleConfigBack = JSON.parse(formData.value.adminStyleConfig)
      formData.value.fixedHeader = adminStyleConfigBack.fixedHeader
      formData.value.footer = adminStyleConfigBack.footer
      formData.value.greyMode = adminStyleConfigBack.greyMode
      formData.value.headerTheme = adminStyleConfigBack.headerTheme
      formData.value.layout = adminStyleConfigBack.layout
      formData.value.logoChange = adminStyleConfigBack.logoChange
      formData.value.menuTheme = adminStyleConfigBack.menuTheme
      formData.value.screenfull = adminStyleConfigBack.screenfull
      formData.value.systemTheme = adminStyleConfigBack.systemTheme
      formData.value.tagsView = adminStyleConfigBack.tagsView
      formData.value.fixedMenu = adminStyleConfigBack.fixedMenu
      formData.value.tagsViewIcon = adminStyleConfigBack.tagsViewIcon
      formData.value.water = adminStyleConfigBack.water
    }
  } finally {
    formLoading.value = false
  }
}
/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
