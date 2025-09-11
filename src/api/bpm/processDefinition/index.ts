import request from '@/config/axios'
// 获得流程定义
export const getDefinition = async (params: any) => {
  return await request.get({ url: `/bpm/process-definition/get`, params })
}
// 获得流程定义列表
export const getDefinitionList = async (params: any) => {
  return await request.get({ url: `/bpm/process-definition/list`, params })
}
// 获得流程定义分页
export const getDefinitionPage = async (params: any) => {
  return await request.get({ url: `/bpm/process-definition/page`, params })
}
// 获得流程定义分页
export const getDefinitionSimpleList = async (params: any) => {
  return await request.get({ url: `/bpm/process-definition/simple-list`, params })
}
