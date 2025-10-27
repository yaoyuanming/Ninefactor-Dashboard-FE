import axios from 'axios';

// 用户信息 VO
export interface UserVO {
  /** 用户ID - 可选 */
  id?: number;

  /** 用户账号 - 必需，长度0-30字符 */
  userName: string;

  /** 用户昵称 - 可选 */
  nickname?: string;

  /** 部门ID数组（多部门支持） - 可选 */
  deptIds?: number[];

  /** 主部门ID - 可选 */
  mainDeptId?: number;

  /** 岗位ID数组 - 可选 */
  postIds?: number[];

  /** 用户邮箱 - 可选，长度0-50字符 */
  email?: string;

  /** 手机号码 - 可选，格式：^1[3|4|5|6|7|8|9][0-9]\d{8}$ */
  phoneNumber?: string;

  /** 用户性别 - 可选（0男 1女 -1未知） */
  sex?: string;

  /** 头像路径 - 可选 */
  avatar?: string;

  /** 密码 - 可选，长度5-20字符 */
  password?: string;

  /** 帐号状态 - 可选（0正常 1停用） */
  status?: string;

  /** 备注 - 可选，长度0-500字符 */
  remark?: string;

  /** 角色ID数组 - 可选 */
  roleIds?: number[];

  /** 登录IP - 可选 */
  loginIp?: string;

  /** 登录时间 - 可选 */
  loginDate?: Date;

  /** 创建时间 - 可选 */
  createTime?: Date;

  /** 员工类型 - 可选 */
  empTypes?: number[] | string;

  /** 部门ID（单个） - 可选 */
  deptId?: number;

  /** 手机号（别名） - 可选 */
  mobile?: string;
}

// 分页查询参数
export interface UserPageParam {
  pageNo?: number;
  pageSize?: number;
  userName?: string;
  nickname?: string;
  phoneNumber?: string;
  status?: string;
  deptId?: number;
  createTime?: string[];
}

/**
 * 查询用户管理列表
 * @param params 分页查询参数
 */
export function getUserPage(params: UserPageParam) {
  return axios.get('/system/user/list', { params });
}

/**
 * 查询所有用户列表
 */
export function getAllUser() {
  return axios.get('/system/user/all');
}

/**
 * 根据用户编号获取详细信息
 * @param userId 用户ID
 */
export function getUser(userId: number) {
  return axios.get(`/system/user/${userId}`);
}

/**
 * 新增用户
 * @param data 用户信息
 */
export function createUser(data: UserVO) {
  return axios.post('/system/user/add', data);
}

/**
 * 修改用户
 * @param data 用户信息
 */
export function updateUser(data: UserVO) {
  return axios.put('/system/user/edit', data);
}

/**
 * 删除用户
 * @param userIds 用户ID或ID数组
 */
export function deleteUser(userIds: number | number[]) {
  const ids = Array.isArray(userIds) ? userIds.join(',') : userIds;
  return axios.delete(`/system/user/${ids}`);
}

/**
 * 导出用户
 * @param params 导出参数
 */
export function exportUser(params: UserPageParam) {
  return axios.get('/system/user/export', {
    params,
    responseType: 'blob',
  });
}

/**
 * 下载用户导入模板
 */
export function importUserTemplate() {
  return axios.get('/system/user/get-import-template', {
    responseType: 'blob',
  });
}

/**
 * 用户密码重置
 * @param id 用户ID
 * @param password 新密码
 */
export function resetUserPwd(id: number, password: string) {
  const data = {
    id,
    password,
  };
  return axios.put('/system/user/update-password', data);
}

/**
 * 用户状态修改
 * @param id 用户ID
 * @param status 状态（0正常 1停用）
 */
export function updateUserStatus(id: number, status: number) {
  const data = {
    id,
    status,
  };
  return axios.put('/system/user/changeStatus', data);
}

/**
 * 获取用户精简信息列表
 */
export function getSimpleUserList() {
  return axios.get<UserVO[]>('/system/user/simple-list');
}
