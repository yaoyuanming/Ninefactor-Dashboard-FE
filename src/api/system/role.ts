import axios from 'axios';

// 角色信息请求DTO
export interface RoleReqDTO {
  id?: number; // 角色ID
  roleName: string; // 角色名称（必需，0-30字符）
  roleKey: string; // 角色权限字符串（必需，0-100字符）
  roleSort?: number; // 角色排序
  dataScope?: string; // 数据范围（1：全部数据权限 2：自定义数据权限 3：本部门数据权限 4：本部门及以下数据权限）
  status?: string; // 角色状态（0正常 1停用）
  remark?: string; // 备注（0-500字符）
  menuIds?: number[]; // 菜单ID数组
  deptIds?: number[]; // 部门ID数组（数据权限）
}

// 角色数据对象
export interface RoleVO {
  id: number;
  roleName: string;
  roleKey: string;
  roleSort?: number;
  dataScope?: string;
  dataScopeName?: string;
  status: string;
  statusName?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

// 角色列表查询参数
export interface RoleListReqVO {
  roleName?: string; // 角色名称
  roleKey?: string; // 角色权限字符串
  status?: string; // 角色状态（0正常 1停用）
  params_beginTime?: string; // 时间范围-开始时间
  params_endTime?: string; // 时间范围-结束时间
  pageNum?: number; // 页码，默认值: 1
  pageSize?: number; // 页大小，默认值: 10
}

/**
 * 新增角色
 * @param data 角色信息
 * @returns 新增结果
 */
export function addRole(data: RoleReqDTO) {
  return axios.post('/system/role/add', data);
}

/**
 * 根据角色编号获取详细信息
 * @param roleId 角色ID
 * @returns 角色详情
 */
export function getRoleDetail(roleId: number) {
  return axios.get(`/system/role/${roleId}`);
}

/**
 * 根据用户ID获取角色列表
 * @param userId 用户ID
 * @returns 角色列表
 */
export function getRoleByUserId(userId: number) {
  return axios.get(`/system/role/selectRoleByUserId/${userId}`);
}

/**
 * 获取角色选择框列表
 * @param roleIds 角色ID数组（可选）
 * @returns 角色选择框列表
 */
export function getRoleOptionSelect(roleIds?: number[]) {
  return axios.get('/system/role/optionselect', {
    params: { roleIds },
  });
}

/**
 * 获取角色列表
 * @param params 查询参数
 * @returns 角色列表
 */
export function getRoleList(params?: RoleListReqVO) {
  return axios.get('/system/role/list', { params });
}

/**
 * 删除角色
 * @param roleIds 角色ID数组
 * @returns 删除结果
 */
export function deleteRole(roleIds: number[]) {
  return axios.delete(`/system/role/${roleIds.join(',')}`);
}

/**
 * 修改角色状态
 * @param data 角色信息（包含id和status）
 * @returns 修改结果
 */
export function changeRoleStatus(data: RoleReqDTO) {
  return axios.put('/system/role/changeStatus', data);
}

/**
 * 修改角色
 * @param data 角色信息
 * @returns 修改结果
 */
export function editRole(data: RoleReqDTO) {
  return axios.put('/system/role/edit', data);
}

/**
 * 修改保存数据权限
 * @param data 角色信息（包含数据权限相关字段）
 * @returns 修改结果
 */
export function updateRoleDataScope(data: RoleReqDTO) {
  return axios.put('/system/role/dataScope', data);
}
