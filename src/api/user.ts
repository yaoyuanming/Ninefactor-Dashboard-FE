import axios from 'axios';

// 用户登录请求参数类型
export interface LoginRequest {
  userName: string;
  password: string;
}

/**
 * 用户登录接口
 * @param data 登录请求参数
 * @returns Promise<any>
 */
export function userLogin(data: LoginRequest): Promise<any> {
  return axios.post('/system/user/login', data);
}
