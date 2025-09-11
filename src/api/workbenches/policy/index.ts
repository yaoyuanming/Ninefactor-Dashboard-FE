import request from '@/config/axios'

/**
 * 文件存储信息VO
 */
export interface FileSaveVO {
  id?: number // 文件ID
  fileName?: string // 文件名称
  filePath?: string // 文件路径
  fileSize?: number // 文件大小
  fileType?: string // 文件类型
}

/**
 * 政策文件信息保存请求VO
 */
export interface DocumentSaveReqVO {
  id?: number // 主键ID
  title: string // 政策文件标题，必填项
  filePaths: FileSaveVO[] // 文件存储路径集合
  publisherId: number // 发布单位的唯一标识ID
  publisherName?: string // 发布单位的全称
  visibility: number // 文件可见范围：1-公开(所有用户可见)，2-本单位可见(仅发布单位内部可见)
  remark?: string // 文件备注信息，可填写政策要点、适用范围等补充说明
}

/**
 * 政策文件分页查询参数
 */
export interface PolicyDocumentPageReqVO {
  pageNo: number // 页码，从 1 开始
  pageSize: number // 每页条数，最大值为 100
  title?: string // 政策文件标题
  publisherName?: string // 发布单位的全称
  visibility?: number // 文件可见范围：1-公开(所有用户可见)，2-本单位可见(仅发布单位内部可见)
  createTime?: string[] // 创建时间范围
}

// 创建政策文件信息
export const createPolicyDocument = (data: DocumentSaveReqVO) => {
  return request.post({ url: '/mws/policy/document/create', data })
}

// 获取政策文件分页列表
export const getPolicyDocumentPage = (params: PolicyDocumentPageReqVO) => {
  return request.get({ 
    url: '/mws/policy/document/page', 
    params
  })
}

// 获取政策文件详情
export const getPolicyDocument = (id: number) => {
  return request.get({ 
    url: '/mws/policy/document/get', 
    params: { id }
  })
}

// 更新政策文件信息
export const updatePolicyDocument = (data: DocumentSaveReqVO) => {
  return request.put({ url: '/mws/policy/document/update', data })
}

// 删除政策文件
export const deletePolicyDocument = (id: number) => {
  return request.delete({ url: `/mws/policy/document/delete?id=${id}` })
}

// 导出政策文件信息Excel
export const exportPolicyDocumentExcel = (params: PolicyDocumentPageReqVO) => {
  return request.download({
    url: '/mws/policy/document/export-excel',
    params
  })
}
