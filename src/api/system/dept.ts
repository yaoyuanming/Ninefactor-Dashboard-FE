import axios from 'axios';

// 部门数据对象
export interface DeptVO {
  id?: number;
  name: string;
  parentId: number;
  status: number;
  sort: number;
  leaderUserId: number;
  phone: string;
  email: string;
  createTime: Date;
}

// 部门树查询请求参数
export interface DeptTreeListReqVO {
  pageNo?: number;
  pageSize?: number;
  beginTime?: string;
  endTime?: string;
  params?: string;
  deptId?: number;
  parentId?: number;
  deptName?: string;
  status?: string;
  phone?: string;
  email?: string;
}

// 分页查询参数
export interface PageParam {
  pageNo?: number;
  pageSize?: number;
  [key: string]: any;
}

/**
 * 查询部门（精简）列表
 */
export function getSimpleDeptList(): Promise<DeptVO[]> {
  return axios.get('/system/dept/simple-list');
}

/**
 * 查询部门树结构列表
 * @param params 查询参数
 */
export function getDeptTreeList(params?: DeptTreeListReqVO) {
  return axios.get('/system/dept/treeList', { params });
}

/**
 * 查询部门列表
 * @param params 分页参数
 */
export function getDeptPage(params: PageParam) {
  return axios.get('/system/dept/list', { params });
}

/**
 * 查询部门详情
 * @param id 部门ID
 */
export function getDept(id: number) {
  return axios.get(`/system/dept/${id}`);
}

/**
 * 新增部门
 * @param data 部门信息
 */
export function createDept(data: any) {
  return axios.post('/system/dept', data);
}

/**
 * 修改部门
 * @param data 部门信息
 */
export function updateDept(data: any) {
  return axios.put('/system/dept', data);
}

/**
 * 删除部门
 * @param id 部门ID
 */
export function deleteDept(id: number) {
  return axios.delete(`/system/dept/${id}`);
}

/**
 * 获取部门树形选择器
 * @param params 查询参数
 */
export function getDeptTreeSelect(params?: any) {
  return axios.get('/system/dept/treeselect', { params });
}
