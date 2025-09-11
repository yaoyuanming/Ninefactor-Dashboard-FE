<template>
  <el-form
    v-show="getShow"
    ref="formLogin"
    :model="loginData.loginForm"
    :rules="LoginRules"
    class="login-form"
    label-position="top"
    label-width="120px"
    size="large"
  >
    <el-row style="margin-right: -10px; margin-left: -10px">
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item>
          <LoginFormTitle style="width: 100%" />
        </el-form-item>
      </el-col>
      <!-- <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item v-if="loginData.tenantEnable === 'true'" prop="tenantName">
          <el-input
            v-model="loginData.loginForm.tenantName"
            :placeholder="t('login.tenantNamePlaceholder')"
            :prefix-icon="iconHouse"
            link
            type="primary"
          />
        </el-form-item>
      </el-col> -->
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item prop="username">
          <el-input
            v-model="loginData.loginForm.username"
            :placeholder="t('login.usernamePlaceholder')"
            :prefix-icon="iconAvatar"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item prop="password">
          <el-input
            v-model="loginData.loginForm.password"
            :placeholder="t('login.passwordPlaceholder')"
            :prefix-icon="iconLock"
            show-password
            type="password"
            @keyup.enter="getCode()"
          />
        </el-form-item>
      </el-col>
      <el-col
        :span="24"
        style="padding-right: 10px; padding-left: 10px; margin-top: -20px; margin-bottom: -20px"
      >
        <el-form-item>
          <el-row justify="space-between" style="width: 100%">
            <el-col :span="6">
              <el-checkbox v-model="loginData.loginForm.rememberMe">
                {{ t('login.remember') }}
              </el-checkbox>
            </el-col>
            <el-col :offset="6" :span="12">
              <el-link
                style="float: right"
                type="primary"
                @click="setLoginState(LoginStateEnum.RESET_PASSWORD)"
              >
                {{ t('login.forgetPassword') }}
              </el-link>
            </el-col>
          </el-row>
        </el-form-item>
      </el-col>
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item>
          <XButton
            :loading="loginLoading"
            :title="t('login.login')"
            class="w-[100%] login-btn-gradient"
            type="primary"
            @click="getCode()"
          />
        </el-form-item>
      </el-col>
      <Verify
        v-if="loginData.captchaEnable === 'true'"
        ref="verify"
        :captchaType="captchaType"
        :imgSize="{ width: '400px', height: '200px' }"
        mode="pop"
        @success="handleLogin"
      />
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px" v-if="false">
        <el-form-item>
          <el-row :gutter="5" justify="space-between" style="width: 100%">
            <el-col :span="8">
              <XButton
                :title="t('login.btnMobile')"
                class="w-[100%]"
                @click="setLoginState(LoginStateEnum.MOBILE)"
              />
            </el-col>
            <el-col :span="8">
              <XButton
                :title="t('login.btnQRCode')"
                class="w-[100%]"
                @click="setLoginState(LoginStateEnum.QR_CODE)"
              />
            </el-col>
            <el-col :span="8">
              <XButton
                :title="t('login.btnRegister')"
                class="w-[100%]"
                @click="setLoginState(LoginStateEnum.REGISTER)"
              />
            </el-col>
          </el-row>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import { ElLoading } from 'element-plus'
// import LoginFormTitle from './LoginFormTitle.vue'
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router'

import { useIcon } from '@/hooks/web/useIcon'

import * as authUtil from '@/utils/auth'
import { usePermissionStore } from '@/store/modules/permission'
import * as LoginApi from '@/api/login'
import { LoginStateEnum, useFormValid, useLoginState } from './useLogin'

import { useClipboard, useCssVar } from '@vueuse/core'
import { colorIsDark, hexToRGB, lighten } from '@/utils/color'
import { useAppStore } from '@/store/modules/app'

defineOptions({ name: 'LoginForm' })

const { t } = useI18n()
const message = useMessage()
// const iconHouse = useIcon({ icon: 'ep:house' })
const iconAvatar = useIcon({ icon: 'ep:avatar' })
const iconLock = useIcon({ icon: 'ep:lock' })
const formLogin = ref()
const { validForm } = useFormValid(formLogin)
const { setLoginState, getLoginState } = useLoginState()
const { currentRoute, push } = useRouter()
const permissionStore = usePermissionStore()
const redirect = ref<string>('')
const loginLoading = ref(false)
const verify = ref()
const captchaType = ref('blockPuzzle') // blockPuzzle 滑块 clickWord 点击文字

const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN)

const LoginRules = {
  tenantName: [required],
  username: [required],
  password: [required]
}
const loginData = reactive({
  isShowPassword: false,
  captchaEnable: import.meta.env.VITE_APP_CAPTCHA_ENABLE,
  tenantEnable: import.meta.env.VITE_APP_TENANT_ENABLE,
  loginForm: {
    tenantName: import.meta.env.VITE_APP_DEFAULT_LOGIN_TENANT || '',
    username: import.meta.env.VITE_APP_DEFAULT_LOGIN_USERNAME || '',
    password: import.meta.env.VITE_APP_DEFAULT_LOGIN_PASSWORD || '',
    captchaVerification: '',
    rememberMe: true // 默认记录我。如果不需要，可手动修改
  }
})

const socialList = [
  { icon: 'ant-design:wechat-filled', type: 30 },
  { icon: 'ant-design:dingtalk-circle-filled', type: 20 },
  { icon: 'ant-design:github-filled', type: 0 },
  { icon: 'ant-design:alipay-circle-filled', type: 0 }
]

// 获取验证码
const getCode = async () => {
  // 情况一，未开启：则直接登录
  if (loginData.captchaEnable === 'false') {
    await handleLogin({})
  } else {
    // 情况二，已开启：则展示验证码；只有完成验证码的情况，才进行登录
    // 弹出验证码
    verify.value.show()
  }
}
// 获取租户 ID
const getTenantId = async () => {
  if (loginData.tenantEnable === 'true') {
    const res = await LoginApi.getTenantIdByName(loginData.loginForm.tenantName)
    authUtil.setTenantId(res)
  }
}
// 记住我
const getLoginFormCache = () => {
  const loginForm = authUtil.getLoginForm()
  if (loginForm) {
    loginData.loginForm = {
      ...loginData.loginForm,
      username: loginForm.username ? loginForm.username : loginData.loginForm.username,
      password: loginForm.password ? loginForm.password : loginData.loginForm.password,
      rememberMe: loginForm.rememberMe,
      tenantName: loginForm.tenantName ? loginForm.tenantName : loginData.loginForm.tenantName
    }
  }
}
// 根据域名，获得租户信息
const getTenantByWebsite = async () => {
  const website = location.host
  const res = await LoginApi.getTenantByWebsite(website)
  if (res) {
    loginData.loginForm.tenantName = res.name
    authUtil.setTenantId(res.id)
  }
}
const loading = ref() // ElLoading.service 返回的实例
// 登录
// 获取第一个可访问的菜单路径
const getFirstMenuPath = (routers) => {
  for (const router of routers) {
    // 如果是叶子节点且不是外链，直接返回
    if (!router.children && !router.meta?.isExternal) {
      return router.path
    }
    // 如果有子路由，递归查找第一个叶子节点
    if (router.children && router.children.length > 0) {
      const childPath = getFirstMenuPath(router.children)
      if (childPath) {
        return router.path + '/' + childPath
      }
    }
  }
  return null
}

const handleLogin = async (params: any) => {
  loginLoading.value = true
  try {
    await getTenantId() // 获取租户 ID
    const data = await validForm()
    if (!data) {
      return
    }
    const loginDataLoginForm = { ...loginData.loginForm }
    loginDataLoginForm.captchaVerification = params.captchaVerification
    const res = await LoginApi.login(loginDataLoginForm)
    if (!res) {
      return
    }
    loading.value = ElLoading.service({
      lock: true,
      text: '正在加载系统中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    if (loginDataLoginForm.rememberMe) {
      authUtil.setLoginForm(loginDataLoginForm)
    } else {
      authUtil.removeLoginForm()
    }
    authUtil.setToken(res)
    if (!redirect.value) {
      redirect.value = '/'
    }
    // 判断是否为SSO登录
    if (redirect.value.indexOf('sso') !== -1) {
      window.location.href = window.location.href.replace('/login?redirect=', '')
    } else {
      // 获取第一个真实菜单路径
      const firstMenuPath = getFirstMenuPath(permissionStore.getRouters)
      // console.info("firstMenuPath：", firstMenuPath)
      // await push({ path:redirect.value || '/' })
      await push({ path: firstMenuPath || redirect.value || '/' })
    }
  } finally {
    loginLoading.value = false
    loading.value.close()
  }
}

const appStore = useAppStore()
// const setMenuTheme = (color: string) => {
//   const primaryColor = useCssVar('--el-color-primary', document.documentElement)
//   const isDarkColor = colorIsDark(color)
//   const theme: Recordable = {
//     // 左侧菜单边框颜色
//     leftMenuBorderColor: isDarkColor ? 'inherit' : '#fff',
//     // 左侧菜单背景颜色
//     leftMenuBgColor: color,
//     // 左侧菜单浅色背景颜色
//     leftMenuBgLightColor: isDarkColor ? lighten(color!, 6) : color,
//     // 左侧菜单选中背景颜色
//     leftMenuBgActiveColor: isDarkColor
//       ? 'var(--el-color-primary)'
//       : hexToRGB(unref(primaryColor), 0.1),
//     // 左侧菜单收起选中背景颜色
//     leftMenuCollapseBgActiveColor: isDarkColor
//       ? 'var(--el-color-primary)'
//       : hexToRGB(unref(primaryColor), 0.1),
//     // 左侧菜单字体颜色
//     leftMenuTextColor: isDarkColor ? '#bfcbd9' : '#333',
//     // 左侧菜单选中字体颜色
//     leftMenuTextActiveColor: isDarkColor ? '#fff' : 'var(--el-color-primary)',
//     // logo字体颜色
//     logoTitleTextColor: isDarkColor ? '#fff' : 'inherit',
//     // logo边框颜色
//     logoBorderColor: isDarkColor ? color : '#eee',
//     // 头部菜单背景颜色
//     topMenuBgColor: '#ffffff',
//     // 头部菜单选中背景颜色
//     topMenuBgActiveColor: isDarkColor
//       ? 'var(--el-color-primary)'
//       : hexToRGB(unref(primaryColor), 0.1),
//     // 头部菜单字体颜色
//     topMenuTextColor: isDarkColor ? '#bfcbd9' : '#333',
//     // 头部菜单选中字体颜色
//     topMenuTextActiveColor: isDarkColor ? '#fff' : 'var(--el-color-primary)'
//   }
//   appStore.setTheme(theme)
//   appStore.setCssVarTheme()
// }
watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)
const route = useRoute() // 路由
import { PlatformApi } from '@/api/system/platform'
import { setCssVar, trim } from '@/utils'
import { useWatermark } from '@/hooks/web/useWatermark'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

const { setWatermark } = useWatermark()
const { wsCache } = useCache()
// 获取当前id或编码的背景信息
const initBackground = async () => {
  // 获取路由参数
  const id = route.query.platform
  if (id == null) {
    // setMenuTheme("#e9ecef")
    // 如果没有id，缓存又没有的话，使用默认的
    if (wsCache.get(CACHE_KEY.THEME) == null) {
      console.log("------------id == null--------------")
      setMenuTheme('#e9ecef')
      setHeaderTheme('#ffffff')
      setSystemTheme('#409eff')
      appStore.theme.elColorPrimary = '#409eff'
      appStore.theme.topHeaderBgColor = '#ffffff'
      appStore.theme.leftMenuBgColor = '#e9ecef'
    }
    return
  }
  let platform = await PlatformApi.getFindCode(id)
  // 主题相关
  let adminStyleConfig = JSON.parse(platform.adminStyleConfig)
  // 保存为平台缓存数据，如果用户自定义的配置为空则取平台缓存数据
  appStore.setThemePlatform(adminStyleConfig)
  // 如果用户缓存存在，则使用用户缓存数据
  console.log("==========使用缓存数据==============")
  if (wsCache.get(CACHE_KEY.THEME) != null) {
    console.log("==========使用用户缓存数据==============")
    //   使用用户的缓存数据
    // let userConfig = wsCache.get(CACHE_KEY.THEME)
    // appStore.setTheme(userConfig)
    // appStore.setScreenfull(userConfig.screenFull)
    // setCssVar('--tags-view-height', userConfig.tagsView ? '35px' : '0px')
    // appStore.setTagsView(userConfig.tagsView)
    // appStore.setTagsViewIcon(userConfig.tagsViewIcon)
    // appStore.setLogo(userConfig.logoChange)
    // appStore.setFixedHeader(userConfig.fixedHeader)
    // appStore.setFooter(userConfig.footer)
    // appStore.setGreyMode(userConfig.greyMode)
    // appStore.setFixedMenu(userConfig.fixedMenu)
    // if (userConfig.water != null) {
    //   setWatermark(userConfig.water)
    // }
    // // 设置颜色
    // // 设置头部主题颜色
    // setHeaderTheme(userConfig.headerTheme)
    // //设置系统主题颜色
    // setSystemTheme(userConfig.systemTheme)
    // // 设置菜单主题颜色
    // setMenuTheme(userConfig.menuTheme)
    // //   设置布局模式
    // appStore.setLayout(userConfig.layout)
  } else {
    console.log("==========使用平台的数据==============",adminStyleConfig)
    //   使用平台的数据
    appStore.setScreenfull(adminStyleConfig.screenfull)
    setCssVar('--tags-view-height', adminStyleConfig.tagsView ? '35px' : '0px')
    appStore.setTagsView(adminStyleConfig.tagsView)
    appStore.setTagsViewIcon(adminStyleConfig.tagsViewIcon)
    appStore.setLogo(adminStyleConfig.logoChange)
    appStore.setFixedHeader(adminStyleConfig.fixedHeader)
    appStore.setFooter(adminStyleConfig.footer)
    appStore.setGreyMode(adminStyleConfig.greyMode)
    appStore.setFixedMenu(adminStyleConfig.fixedMenu)
    if (adminStyleConfig.water != null) {
      setWatermark(adminStyleConfig.water)
    }
    // 设置颜色
    // 设置头部主题颜色
    setHeaderTheme(unref(adminStyleConfig.headerTheme))
    //设置系统主题颜色
    setSystemTheme(unref(adminStyleConfig.systemTheme))
    // 设置菜单主题颜色
    setMenuTheme(unref(adminStyleConfig.menuTheme))
    //   设置布局模式
    appStore.setLayout(adminStyleConfig.layout)
  }
  // 背景图片相关  添加个id，id变化的时候修改
  let backThemeConfig = {
    loginBgPath: platform.loginBgUrl,
    logoWhitePath: platform.logoUrl,
    title: platform.name,
    englishTitle: platform.enName,
    platformNumber: platform.code,
    id: id
  }
  appStore.setBackTheme(backThemeConfig)
}

const layout = computed(() => appStore.getLayout)

const setHeaderTheme = (color: string) => {
  const primaryColor = useCssVar('--el-color-primary', document.documentElement)
  const isDarkColor = colorIsDark(color)
  // 头部
  const textColor = isDarkColor ? '#fff' : 'inherit'
  const subTextColor = isDarkColor ? '#fff' : '#999999'
  const textHoverColor = isDarkColor ? lighten(color!, 6) : '#f6f6f6'
  const topToolBorderColor = isDarkColor ? color : '#eee'
  setCssVar('--top-header-bg-color', color)
  setCssVar('--top-header-text-color', textColor)
  setCssVar('--top-header-sub-text-color', subTextColor)
  setCssVar('--top-header-hover-color', textHoverColor)
  appStore.setTheme({
    topHeaderBgColor: color,
    topHeaderTextColor: textColor,
    topHeaderSubTextColor: subTextColor,
    topHeaderHoverColor: textHoverColor,
    topToolBorderColor: topToolBorderColor
  })
  // 头部菜单
  const topMenuBgActiveColor = isDarkColor
    ? 'var(--el-color-primary)'
    : hexToRGB(unref(primaryColor), 0.1)
  const topMenuTextColor = isDarkColor ? '#bfcbd9' : '#333'
  const topMenuTextActiveColor = isDarkColor ? '#fff' : 'var(--el-color-primary)'
  setCssVar('--top-menu-bg-color', color)
  setCssVar('--top-menu-bg-active-color', topMenuBgActiveColor)
  setCssVar('--top-menu-text-color', topMenuTextColor)
  setCssVar('--top-menu-text-active-color', topMenuTextActiveColor)
  appStore.setTheme({
    topMenuBgColor: color, // 头部菜单背景颜色
    topMenuBgActiveColor: isDarkColor
      ? 'var(--el-color-primary)'
      : hexToRGB(unref(primaryColor), 0.1), // 头部菜单选中背景颜色
    topMenuTextColor: isDarkColor ? '#bfcbd9' : '#333', // 头部菜单字体颜色
    topMenuTextActiveColor: isDarkColor ? '#fff' : 'var(--el-color-primary)' // 头部菜单选中字体颜色
  })
  if (unref(layout) === 'top') {
    setMenuTheme(color)
  }
}

const setSystemTheme = (color: string) => {
  setCssVar('--el-color-primary', color)
  appStore.setTheme({ elColorPrimary: color })
  // const topMenuBgColor = useCssVar('--top-menu-bg-color', document.documentElement)
  // setHeaderTheme(trim(unref(topMenuBgColor)))
  const leftMenuBgColor = useCssVar('--left-menu-bg-color', document.documentElement)
  setMenuTheme(trim(unref(leftMenuBgColor)))
}

// 菜单主题 menuTheme
const setMenuTheme = (color: string) => {
  const primaryColor = useCssVar('--el-color-primary', document.documentElement)
  const isDarkColor = colorIsDark(color)
  const theme: Recordable = {
    // 左侧菜单边框颜色
    leftMenuBorderColor: isDarkColor ? 'inherit' : '#fff',
    // 左侧菜单背景颜色
    leftMenuBgColor: color,
    // 左侧菜单浅色背景颜色
    leftMenuBgLightColor: isDarkColor ? lighten(color!, 6) : color,
    // 左侧菜单选中背景颜色
    leftMenuBgActiveColor: isDarkColor
      ? 'var(--el-color-primary)'
      : hexToRGB(unref(primaryColor), 0.1),
    // 左侧菜单收起选中背景颜色
    leftMenuCollapseBgActiveColor: isDarkColor
      ? 'var(--el-color-primary)'
      : hexToRGB(unref(primaryColor), 0.1),
    // 左侧菜单字体颜色
    leftMenuTextColor: isDarkColor ? '#bfcbd9' : '#333',
    // 左侧菜单选中字体颜色
    leftMenuTextActiveColor: isDarkColor ? '#fff' : 'var(--el-color-primary)',
    // logo字体颜色
    logoTitleTextColor: isDarkColor ? '#fff' : 'inherit',
    // logo边框颜色
    logoBorderColor: isDarkColor ? color : '#eee'
  }
  appStore.setTheme(theme)
  appStore.setCssVarTheme()
}

onMounted(() => {
  getLoginFormCache()
  getTenantByWebsite()
  initBackground()
})
</script>

<style lang="scss" scoped>
:deep(.anticon) {
  &:hover {
    color: var(--el-color-primary) !important;
  }
}

// 登录按钮渐变样式
:deep(.login-btn-gradient) {
  background: linear-gradient(94deg, #3ABAFF 6%, #67B2FE 50%, #3F8DFE 100%) !important;
  border: none !important;

  &:hover {
    background: linear-gradient(94deg, #2AA9EE 6%, #56A1ED 50%, #2E7CED 100%) !important;
    box-shadow: 0 4px 12px rgba(58, 186, 255, 0.3) !important;
  }

  &:active {
    background: linear-gradient(94deg, #1A99DD 6%, #4590DC 50%, #1D6BDC 100%) !important;
  }

  &:focus {
    background: linear-gradient(94deg, #3ABAFF 6%, #67B2FE 50%, #3F8DFE 100%) !important;
    box-shadow: 0 0 0 2px rgba(58, 186, 255, 0.2) !important;
  }
}

.login-code {
  float: right;
  width: 100%;
  height: 38px;

  img {
    width: 100%;
    height: auto;
    max-width: 100px;
    vertical-align: middle;
    cursor: pointer;
  }
}
</style>
