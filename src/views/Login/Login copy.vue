<template>
  <div
    :class="prefixCls"
    class="relative h-[100%] lt-md:px-10px lt-sm:px-10px lt-xl:px-10px lt-xl:px-10px"
  >
    <div class="relative mx-auto h-full">
      <div
        :class="`${prefixCls}__left bg-opacity-20 p-30px lt-xl:hidden overflow-x-hidden overflow-y-auto`"
        :style="{'--login-bg-path': `url(${appStore.getBackTheme.loginBgPath})`}"
      >
        <!--      :style="`background-image: url(${appStore.getLoginBgPath}); background-size: cover;`"-->
        <!-- 左上角的 logo + 系统标题 -->
        <div class="relative flex items-center text-white">
          <!--          <img alt="" class="mr-10px h-48px w-48px" src="/logo.png" />-->
          <img alt="" class="mr-10px h-48px w-48px" :src="appStore.getBackLogoWhitePath" />
<!--          <span class="text-24px font-bold">{{ underlineToHump(appStore.getTitle) }}</span>-->
          <span class="text-24px font-bold">{{ appStore.getBackThemeTitle}}</span>
        </div>
      </div>
      <div
        :class="`${prefixCls}__right flex items-center justify-center`"
        class="absolute top-0 right-0 h-full w-full"
      >
        <!-- 登录界面 -->
        <div
          class="m-auto h-[calc(100%-60px)] w-[100%] p-50px flex items-center at-2xl:max-w-500px at-lg:max-w-200px at-md:max-w-500px at-xl:max-w-500px"
          style="height: auto; background-color: rgba(255, 255, 255, 0.75); border-radius: 15px"
        >
          <!-- 账号登录 -->
          <LoginForm class="m-auto h-auto p-20px lt-xl:(rounded-3xl light:bg-white)" />
          <!-- 手机登录 -->
          <!-- <MobileForm class="m-auto h-auto p-20px lt-xl:(rounded-3xl light:bg-white)" /> -->
          <!-- 二维码登录 -->
          <!-- <QrCodeForm class="m-auto h-auto p-20px lt-xl:(rounded-3xl light:bg-white)" /> -->
          <!-- 注册 -->
         <RegisterForm class="m-auto h-auto p-20px lt-xl:(rounded-3xl light:bg-white)" />
          <!-- 三方登录 -->
          <!-- <SSOLoginVue class="m-auto h-auto p-20px lt-xl:(rounded-3xl light:bg-white)" /> -->
          <!-- 忘记密码 -->
          <ForgetPasswordForm class="m-auto h-auto p-20px lt-xl:(rounded-3xl light:bg-white)" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { underlineToHump } from '@/utils'

import { useDesign } from '@/hooks/web/useDesign'
import { useAppStore } from '@/store/modules/app'
import { ThemeSwitch } from '@/layout/components/ThemeSwitch'
import { LocaleDropdown } from '@/layout/components/LocaleDropdown'

import {
  LoginForm,
  MobileForm,
  QrCodeForm,
  RegisterForm,
  SSOLoginVue,
  ForgetPasswordForm
} from './components'

defineOptions({ name: 'Login' })

const { t } = useI18n()
const appStore = useAppStore()
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('login')
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-login;

.#{$prefix-cls} {
  overflow: auto;

  &__left {
    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      //background-image: url('@/assets/svgs/login-bg.svg');
      //background-image: url('@/assets/imgs/login-bg.jpg');
      background-image: var(--login-bg-path);
      background-color: #8a8a8a;
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      content: '';
    }
  }
}
</style>

<style lang="scss">
.dark .login-form {
  .el-divider__text {
    background-color: var(--login-bg-color);
  }

  .el-card {
    background-color: var(--login-bg-color);
  }
}
</style>
