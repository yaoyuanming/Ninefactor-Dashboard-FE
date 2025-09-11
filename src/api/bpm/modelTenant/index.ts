import request from '@/config/axios'

export type ProcessDefinitionVO = {
  id: string
  version: number
  deploymentTIme: string
  suspensionState: number
  formType?: number
}

export type ModelVO = {
  id: number
  formName: string
  key: string
  name: string
  description: string
  category: string
  formType: number
  formId: number
  formCustomCreatePath: string
  formCustomViewPath: string
  processDefinition: ProcessDefinitionVO
  status: number
  remark: string
  createTime: string
  bpmnXml: string
}

export const getModelList = async (name: string | undefined) => {
  return await request.get({ url: '/bpm/model-tenant/list', params: { name } })
}

export const getModel = async (id: string) => {
  return await request.get({ url: '/bpm/model-tenant/get?id=' + id })
}

export const updateModel = async (data: ModelVO) => {
  return await request.put({ url: '/bpm/model-tenant/update', data: data })
}

// 批量修改流程分类的排序
export const updateModelSortBatch = async (ids: number[]) => {
  return await request.put({
    url: `/bpm/model-tenant/update-sort-batch`,
    params: {
      ids: ids.join(',')
    }
  })
}

export const updateModelBpmn = async (data: ModelVO) => {
  return await request.put({ url: '/bpm/model-tenant/update-bpmn', data: data })
}

// 任务状态修改
export const updateModelState = async (id: number, state: number) => {
  const data = {
    id: id,
    state: state
  }
  return await request.put({ url: '/bpm/model-tenant/update-state', data: data })
}

export const createModel = async (data: ModelVO) => {
  return await request.post({ url: '/bpm/model-tenant/create', data: data })
}

export const deleteModel = async (id: number) => {
  return await request.delete({ url: '/bpm/model-tenant/delete?id=' + id })
}

export const deployModel = async (id: number) => {
  return await request.post({ url: '/bpm/model-tenant/deploy?id=' + id })
}

export const cleanModel = async (id: number) => {
  return await request.delete({ url: '/bpm/model-tenant/clean?id=' + id })
}
