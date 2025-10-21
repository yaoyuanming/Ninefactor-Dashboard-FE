<template>
  <div class="login-container">
    <!-- 左侧登录区域 -->
    <div class="login-left">
      <!-- 顶部Logo和标题 -->
      <div class="login-header">
        <div class="logo-section">
          <div class="logo-icon">🛡️</div>
          <h1 class="system-title"
            >福州市烟花爆竹企业安全风险监测预警监管平台</h1
          >
          <p class="system-subtitle">
            Taizhou Bay Area Safety Production Supervision Platform
          </p>
        </div>
      </div>

      <!-- 登录表单区域 -->
      <div class="login-form-section">
        <h2 class="welcome-title">欢迎登录系统监管端</h2>
        <p class="welcome-subtitle">请输入您的登录信息</p>

        <a-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
        >
          <a-form-item field="userName" hide-label>
            <a-input
              v-model="loginForm.userName"
              placeholder="admin"
              size="large"
              class="form-input"
            >
              <template #prefix>
                <icon-user />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item field="password" hide-label>
            <a-input-password
              v-model="loginForm.password"
              placeholder="••••••"
              size="large"
              class="form-input"
              @press-enter="handleLogin"
            >
              <template #prefix>
                <icon-lock />
              </template>
            </a-input-password>
          </a-form-item>

          <div class="form-options">
            <a-checkbox v-model="loginForm.rememberMe">记住我</a-checkbox>
            <a-link class="forgot-link">忘记密码?</a-link>
          </div>

          <a-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loginLoading"
            @click="handleLogin"
          >
            登录
          </a-button>
        </a-form>
      </div>
    </div>

    <!-- 右侧背景区域 -->
    <div class="login-right">
      <div class="background-content">
        <!-- 3D安全盾牌效果 -->
        <div class="shield-container">
          <div class="shield-main">🛡️</div>
          <div class="shield-glow"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import { IconUser, IconLock } from '@arco-design/web-vue/es/icon';
  import { userLogin, type LoginRequest } from '@/api/user';
  import { setToken } from '@/utils/auth';

  const router = useRouter();

  const loginForm = reactive({
    userName: 'admin',
    password: '',
    rememberMe: false,
  });

  const loginRules = {
    userName: [{ required: true, message: '请输入用户名' }],
    password: [{ required: true, message: '请输入密码' }],
  };

  const loginFormRef = ref();
  const loginLoading = ref(false);

  const handleLogin = async () => {
    try {
      // 检查表单引用
      if (!loginFormRef.value) {
        Message.error('表单初始化失败');
        return;
      }

      // 表单验证
      try {
        await loginFormRef.value.validate();
      } catch (error) {
        return;
      }

      loginLoading.value = true;

      // 调用登录API
      const response = await userLogin({
        userName: loginForm.userName,
        password: loginForm.password,
      });
      if (response.success && response.data) {
        Message.success('登录成功');
        setToken(response.data.token);
        localStorage.setItem(
          'userInfo',
          JSON.stringify(response.data.userInfo)
        );

        // 存储登录信息
        if (loginForm.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userName', loginForm.userName);
        }

        // 跳转到主页
        router.push('/index');
      } else {
        Message.error(response.message || '登录失败');
      }
    } catch (error: any) {
      console.error('登录错误:', error);
    } finally {
      loginLoading.value = false;
    }
  };
</script>

<style scoped lang="less">
  .login-container {
    display: flex;
    height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .login-left {
    display: flex;
    flex: 1;
    flex-direction: column;
    max-width: 500px;
    padding: 40px 60px;
    background: #fff;
  }

  .login-header {
    margin-bottom: 60px;

    .logo-section {
      .logo-icon {
        margin-bottom: 16px;
        color: #4f8fff;
        font-size: 32px;
      }

      .system-title {
        margin: 0 0 8px;
        color: #1d2129;
        font-weight: 600;
        font-size: 20px;
        line-height: 1.4;
      }

      .system-subtitle {
        margin: 0;
        color: #86909c;
        font-size: 12px;
      }
    }
  }

  .login-form-section {
    flex: 1;

    .welcome-title {
      margin: 0 0 8px;
      color: #1d2129;
      font-weight: 600;
      font-size: 24px;
    }

    .welcome-subtitle {
      margin: 0 0 32px;
      color: #86909c;
      font-size: 14px;
    }

    .login-form {
      .form-input {
        margin-bottom: 16px;
        border: 1px solid #e5e6eb;
        border-radius: 6px;

        &:focus-within {
          border-color: #4f8fff;
          box-shadow: 0 0 0 2px rgb(79 143 255 / 10%);
        }
      }

      .form-options {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;

        .forgot-link {
          color: #4f8fff;
          font-size: 14px;
        }
      }

      .login-btn {
        width: 100%;
        height: 44px;
        font-weight: 500;
        font-size: 16px;
        background: #4f8fff;
        border: none;
        border-radius: 6px;

        &:hover {
          background: #3c7eff;
        }
      }
    }
  }

  .login-right {
    position: relative;
    flex: 1;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .background-content {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;

      .shield-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;

        .shield-main {
          position: relative;
          z-index: 2;
          color: rgb(255 255 255 / 90%);
          font-size: 200px;
          text-shadow: 0 0 30px rgb(255 255 255 / 50%);
          animation: float 3s ease-in-out infinite;
        }

        .shield-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(
            circle,
            rgb(255 255 255 / 20%) 0%,
            rgb(255 255 255 / 10%) 30%,
            transparent 70%
          );
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
      }
    }

    &::before {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.05"><circle cx="30" cy="30" r="2"/></g></svg>');
      animation: drift 20s linear infinite;
      content: '';
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.7;
    }

    50% {
      transform: scale(1.1);
      opacity: 0.9;
    }
  }

  @keyframes drift {
    0% {
      transform: rotate(0deg) translate(-50%, -50%);
    }

    100% {
      transform: rotate(360deg) translate(-50%, -50%);
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .login-container {
      flex-direction: column;
    }

    .login-left {
      max-width: none;
      padding: 24px;
    }

    .login-right {
      height: 200px;

      .shield-container .shield-main {
        font-size: 80px;
      }
    }
  }
</style>
