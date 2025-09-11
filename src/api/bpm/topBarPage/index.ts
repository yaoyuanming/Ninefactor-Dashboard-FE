import request from '@/config/axios'
// 获得待办事项数量
export const getCount = async (params) => {
  return await request.get({ url: '/bpm/task/todo-count', params })
}
// 获得待办事项
export const getById = async (params) => {
  return await request.get({ url: '/bpm/todo-task-work/page', params })
}
// 获得待办事项分页
export const getPage = async (params) => {
  return await request.get({ url: '/bpm/todo-task-work/page', params })
}
// 根据业务ID获得流程记录
export const getProcess = async (params) => {
  return await request.get({ url: '/bpm/todo-task-work/process-by-biz-id', params })
}
// 审批通过
export const isAgreedYue = async (data) => {
  return await request.put({ url: `/bpm/todo-task-work/approve`, data })
}
// 审批拒绝
export const isAgreedNo = async (data) => {
  return await request.put({ url: `/bpm/todo-task-work/reject`, data })
}


