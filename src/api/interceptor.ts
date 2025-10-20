import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
import { clearToken, getToken } from '@/utils/auth';

// 定义响应数据结构
export interface HttpResponse<T = unknown> {
  status: number;
  message: string;
  code: number;
  success: boolean;
  data: T;
}

// 配置基础URL
if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

// 请求拦截器：添加token
axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `${token}`; // 按后端要求的格式添加（可能需要 Bearer 前缀）
    }
    return config;
  },
  (error) => {
    // 请求发送失败（如网络错误、参数错误），直接进入error处理
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理成功和错误
axios.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const res = response.data as any;
    console.log(res);

    // 后端返回的 success 为 false 时（业务错误），视为错误
    if (!res.success) {
      Message.error({
        content: res.message || '操作失败',
        duration: 5 * 1000,
      });
      if (res.errorCode === '11011') {
        clearToken(); // 清除无效token
        // 避免重复跳转登录页
        if (!window.location.href.includes('/#/login')) {
          window.open(`${window.location.origin}/#/login`, '_self');
        }
      }
      // 抛出错误，让调用方进入 catch 逻辑
      return Promise.reject(new Error(res.message || '业务错误'));
    }

    // 成功时返回数据
    return res;
  },
  (error: any) => {
    if (error.response?.status === 401 || error.errorCode === '11012') {
      clearToken(); // 清除无效token
      // 避免重复跳转登录页
      if (!window.location.href.includes('/#/index')) {
        Modal.error({
          title: '登录过期',
          content: '登录已过期，请重新登录',
          okText: '确定',
          onOk: () => {
            window.open(`${window.location.origin}/#/index`, '_self');
          },
        });
      }
      return Promise.reject(error); // 标记为错误
    }

    // 2. 处理额度不足（402状态码）
    if (error.response?.status === 402) {
      Modal.error({
        title: '额度不足',
        content: '您的额度不足，可以开通会员后使用',
        okText: '充值',
        onOk: () => {
          window.open(`${window.location.origin}/#/member-center`);
        },
      });
      return Promise.reject(error);
    }

    // 3. 处理服务器错误（500状态码）
    if (error.response?.status === 500) {
      Message.error({
        content: error.response.data?.message || '服务器内部错误',
        duration: 5 * 1000,
      });
      return Promise.reject(error);
    }

    // 4. 处理其他网络错误（如断网、超时等）
    if (!error.response) {
      Message.error({
        content: '网络异常，请检查网络连接',
        duration: 5 * 1000,
      });
      return Promise.reject(error);
    }

    // 5. 其他未覆盖的错误
    Message.error({
      content: error.message || '请求失败',
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);

export default axios;
