<template>
  <div>
    <div
      ><span
        style="
          border-radius: 50%;
          height: 10px;
          width: 10px;
          background: #9a9a9a;
          display: inline-table;
        "
      ></span
      >下载模板
    </div>
    <div style="margin-left: 10px; margin-top: 10px; background: #f9f9f9; padding: 10px">
      <div>请下载导入模板，根据填写须知批量填写信息</div>
      <div>
        <el-button type="primary" @click="exportExcel()" size="small" style="margin-top: 10px">
          下载模板文件
        </el-button>
      </div>
    </div>
    <div style="margin-top: 10px"
      ><span
        style="
          border-radius: 50%;
          height: 10px;
          width: 10px;
          background: #9a9a9a;
          display: inline-table;
        "
      ></span
      >上传文件
    </div>
    <div style="margin-left: 10px; margin-top: 10px; background: #f9f9f9; padding: 10px">
      <div style="margin-bottom: 10px">上传填写好的列表文件</div>
      <div>
        <el-upload
          ref="uploadRef"
          action=""
          drag
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          class="upload-demo"
          accept=".xlsx,.xls"
        >
          <div class="el-icon--upload">
            <el-image :src="img" style="height: 40px; width: 40px" />
          </div>
          <div class="el-upload__text"> 可直接将文件拖拽到此处上传，或 <em>点击上传</em></div>
          <div class="el-upload__text"> 仅支持格式：xlsx/xls</div>
        </el-upload>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import img from '@/assets/imgs/prt/file.png'
import { ref,  defineEmits } from 'vue'

const emit = defineEmits(['submit', 'reset'])
import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'
// 导出测试
const exportExcel = async () => {
  // 创建工作簿
  const workbook = new ExcelJS.Workbook()
  workbook.creator = '检查内容'
  workbook.created = new Date()
  // 添加工作表
  const worksheet = workbook.addWorksheet('检查内容')
  // 设置列头
  worksheet.columns = [
    { header: '检查项目', key: 'inspectItemName', width: 20 },
    { header: '检查标准', key: 'inspectStandard', width: 20 }
  ]
  // 添加数据行
  // worksheet.addRow({ id: 1, name: '张三', age: 25 })
  // worksheet.addRow({ id: 2, name: '李四', age: 30 })

  // 设置样式
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    }
  })

  // 导出文件
  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), '检查内容批量导入模板.xlsx')
}

//导入测试
let tableData = ref()
let tableHeaders = ref()
const handleFileChange = async (file) => {
  // 检查文件类型
  if (!file.raw) return
  if (
    ![
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ].includes(file.raw.type)
  ) {
    ElMessage.error('请上传有效的 Excel 文件 (.xlsx 或 .xls)')
    return
  }

  try {
    // 读取文件内容
    const data = await readExcel(file.raw)
    tableData.value = data.rows
    tableHeaders.value = data.headers
    ElMessage.success('Excel 文件解析成功')
    emit('submit', tableData.value)
  } catch (error) {
    console.error('解析 Excel 失败:', error)
    ElMessage.error('解析 Excel 文件失败: ' + error.message)
  }
}

const readExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const buffer = e.target.result
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(buffer)

        const result = {
          headers: [],
          rows: []
        }

        // 读取第一个工作表
        const worksheet = workbook.worksheets[0]

        // 获取表头
        const headerRow = worksheet.getRow(1)
        result.headers = headerRow.values.filter(Boolean)

        // 读取数据行
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            // 跳过表头
            const rowData = {}
            row.eachCell((cell, colNumber) => {
              rowData[result.headers[colNumber - 1]] = cell.value
            })
            result.rows.push(rowData)
          }
        })

        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}




</script>

<style scoped>
.demo-formData {
  margin: 0 auto;
}

.image-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 20px;
  height: auto !important; /* 覆盖默认高度 */
  padding-left: 0 !important; /* 移除默认左边距 */
}

/* 图片样式 */
.checkbox-image {
  width: 100px;
  height: 100px;
  display: block;
  border: 1px solid #eee;
  border-radius: 4px;
}

/* 将默认复选框移到图片右上角 */
.image-checkbox :deep(.el-checkbox__input) {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 1;
}

/* 复选框选中样式 */
.image-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #409eff;
  border-color: #409eff;
}
</style>
