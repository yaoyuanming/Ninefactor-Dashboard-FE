import request from '@/config/axios'

export interface FilePageReqVO extends PageParam {
  path?: string
  type?: string
  createTime?: Date[]
}

// 文件预签名地址 Response VO
export interface FilePresignedUrlRespVO {
  // 文件配置编号
  configId: number
  // 文件上传 URL
  uploadUrl: string
  // 文件 URL
  url: string
}
// 根据业务类型获取文件列表
export const getFileList = (params: FilePageReqVO) => {
  return request.get({ url: '/infra/file/list-by-biz', params })
}

// 查询文件列表
export const getFilePage = (params: FilePageReqVO) => {
  return request.get({ url: '/infra/file/page', params })
}

// 查询文件
export const getFile = (id: number) => {
  return request.get({ url: '/infra/file/get?id=' + id })
}

// 删除文件
export const deleteFile = (id: number) => {
  return request.delete({ url: '/infra/file/delete?id=' + id })
}

// 获取文件预签名地址
export const getFilePresignedUrl = (path: string) => {
  return request.get<FilePresignedUrlRespVO>({
    url: '/infra/file/presigned-url',
    params: { path }
  })
}

// 创建文件
export const createFile = (data: any) => {
  return request.post({ url: '/infra/file/create', data })
}

// 更新文件
export const updateFile = (data: any) => {
  return request.put({ url: '/infra/file/update', data })
}

// 上传文件
export const uploadFile = (data: any) => {
  return request.upload({
    url: '/infra/file/upload',
    data
  })
}

// 上传业务文件
export const uploadFileBiz = (data: any) => {
  return request.upload({
    url: '/infra/file/upload-biz',
    data
  })
}
