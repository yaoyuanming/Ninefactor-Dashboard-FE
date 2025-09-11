import request from '@/config/axios'

export const getDepartmentInfo = (data: { pageNum: number, pageSize: number, keyWord?: string }) => {
  return request.post({ url: '/mws/department-info/page', data })
}


// 创建部门信息接口
export const createDepartmentInfo = (data) => {
  return request.post({ url: '/mws/department-info/create', data })
}

// 更新部门信息接口
export const updateDepartmentInfo = (data) => {
  return request.put({ url: '/mws/department-info/update', data })
}

// 删除部门信息接口
export const deleteDepartmentInfo = (deptId) => {
  return request.delete({ url: '/mws/department-info/delete', params: { deptId } })
}

// 获取部门树接口
export const getDepartmentTree = (data) => {
  return request.post({ url: '/mws/department-info/getDeptTree', data })
} 