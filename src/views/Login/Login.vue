<template>
  <div :class="prefixCls" class="login-container">
    <!-- 左上角 Logo 和标题 -->
    <div class="logo-container">
      <div class="logo-section">
        <img src="/logo1.png" alt="logo" class="logo" />
        <div class="logo-text">
          <h1 class="system-title">漳州台商投资区安全生产监管平台</h1>
          <p class="system-subtitle">Taizhou Bay Area Safety Production Supervision Platform</p>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧登录表单区域 -->
      <div class="left-panel">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">欢迎登录系统监管端</h2>
            <p class="form-subtitle">请输入您的登录信息</p>
          </div>

          <!-- 登录表单 -->
          <div class="form-content">
            <LoginForm v-if="getLoginState === LoginStateEnum.LOGIN" />
            <MobileForm v-if="getLoginState === LoginStateEnum.MOBILE" />
            <QrCodeForm v-if="getLoginState === LoginStateEnum.QR_CODE" />
            <RegisterForm v-if="getLoginState === LoginStateEnum.REGISTER" />
            <SSOLoginVue v-if="getLoginState === LoginStateEnum.SSO" />
            <ForgetPasswordForm v-if="getLoginState === LoginStateEnum.RESET_PASSWORD" />
          </div>
        </div>
      </div>

      <!-- 中间透明渐变层 -->
      <div class="gradient-overlay"></div>

      <!-- 右侧背景图区域 -->
      <div class="right-panel">
        <div class="bg-image"></div>
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
import { LoginStateEnum, useLoginState } from './components/useLogin'

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
const { getLoginState } = useLoginState()
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-login;

.#{$prefix-cls} {
  &.login-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #f5f7fa;
  }
}

// 左上角 Logo 和标题
.logo-container {
  position: absolute;
  top: 40px;
  left: 40px;
  z-index: 10;

  .logo-section {
    display: flex;
    align-items: center;
    gap: 16px;

    .logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }

    .logo-text {
      .system-title {
        font-size: 24px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 4px 0;
        line-height: 1.2;
      }

      .system-subtitle {
        font-size: 12px;
        color: #666;
        margin: 0;
        line-height: 1.2;
      }
    }
  }
}

// 主要内容区域
.main-content {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

// 左侧登录表单区域 (40% 宽度)
.left-panel {
  flex: 0 0 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  position: relative;
  z-index: 2;

  .form-container {
    width: 400px;
    padding: 40px;

    .form-header {
      text-align: center;
      margin-bottom: 40px;

      .form-title {
        font-size: 28px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 8px;
        line-height: 1.2;
      }

      .form-subtitle {
        font-size: 14px;
        color: #666;
        margin: 0;
      }
    }

    .form-content {
      width: 100%;
    }
  }
}

// 中间透明渐变层
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 40%;
  width: 300px;
  height: 100%;
  background: linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 30%,
    rgba(255, 255, 255, 0.6) 60%,
    rgba(255, 255, 255, 0.8) 80%,
    rgba(255, 255, 255, 1) 100%
  );
  z-index: 1;
  pointer-events: none;
}

// 右侧背景图区域 (60% 宽度)
.right-panel {
  flex: 0 0 60%;
  position: relative;

  .bg-image {
    width: 100%;
    height: 100%;
    background-image: url('/bg.jpg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }

  .left-panel {
    flex: none;
    height: 100%;
  }

  .right-panel {
    display: none;
  }

  .gradient-overlay {
    display: none;
  }

  .logo-container {
    position: relative;
    top: 20px;
    left: 20px;
    margin-bottom: 20px;
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
