<template>
  <div>
    <div class="grid-container">
      <div> 风险点名称：</div>
      <div>
        {{ props.initialData?.riskName }}
      </div>
      <div> 风险单元：</div>
      <div>
        {{ props.initialData?.riskUnitId }}
      </div>
      <div> 风险等级：</div>
      <div>
        {{ getDictLabel(DICT_TYPE.RISKLEVEL, props.initialData?.overallRisk) }}
      </div>
      <div> 管控层级：</div>
      <div>
        {{ getcontrolLevel(props.initialData?.controlLevel) }}
      </div>
    </div>
    <table style="width: 100%; text-align: left" border="1" cellspacing="0">
      <tr>
        <td style="width: 60px">序号</td>
        <td>危险有害因素</td>
        <td>可能造成的事故类型</td>
        <td>管控措施类型</td>
        <td>管控措施</td>
        <td>检查项目</td>
        <td>检查标准</td>
      </tr>
      <tr v-for="(item, index) in props.initialData?.riskFactorsList" :key="index">
        <td style="width: 60px">{{ index + 1 }}</td>
        <td>{{ item.riskFactorsName }}</td>
        <td
          >{{ getDictLabel(DICT_TYPE.ACCIDENT_TYPE, item.accidentType)
          }}{{ getControlType(item.accidentType) }}
        </td>
        <td>{{ getDictLabel(DICT_TYPE.CONTROL_TYPE, item.controlType) }}</td>
        <td>{{ item.controlMeasures }}</td>
        <td>{{ item.inspectItemName }}</td>
        <td>{{ item.inspectStandard }}</td>
      </tr>
    </table>
    <el-row style="margin-top: 5px">
      <el-col :span="8"> 责任部门：{{ props.initialData?.respDeptName }}</el-col>
      <el-col :span="8"> 责任岗位：{{ props.initialData?.respPostName }}</el-col>
      <el-col :span="8"> 管控责任人：{{ props.initialData?.respUserName }}</el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, defineProps, defineEmits, withDefaults } from 'vue'
import type { ComponentSize, FormInstance, FormRules, FormProps } from 'element-plus'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'

interface FormData {
  name: string
  checkList: string[]
  region: string
  count: string
  date1: string
  date2: string
  delivery: boolean
  location: string
  location1: string
  type: string[]
  resource: string
  desc: string
}

interface Props {
  initialData?: Partial<FormData>
  riskLeveList?: []
  size?: ComponentSize
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({
    name: '',
    checkList: [],
    region: '',
    riskLevel: '',
    count: '',
    date1: '',
    date2: '',
    delivery: false,
    location: '',
    location1: '',
    type: [],
    resource: '',
    desc: ''
  }),
  size: 'default'
})
const getControlType = (val) => {
  let str = []
  val?.split(',').forEach((o) => {
    str.push(getDictLabel(DICT_TYPE.ACCIDENT_TYPE, o))
  })
  return str.toString()
}
const emit = defineEmits(['submit', 'reset'])

const ruleFormRef = ref<FormInstance>()
const formData = reactive<FormData>({
  name: props.initialData.name || '',
  region: props.initialData.region || '',
  count: props.initialData.count || '',
  date1: props.initialData.date1 || '',
  date2: props.initialData.date2 || '',
  delivery: props.initialData.delivery || false,
  location: props.initialData.location || '',
  location1: props.initialData.location1 || '',
  type: props.initialData.type || [],
  checkList: props.initialData.checkList || [],
  resource: props.initialData.resource || '',
  desc: props.initialData.desc || ''
})
const getcontrolLevel = (val) => {
  let str = ''
  props.riskLeveList.forEach((item) => {
    if (val == item.id) {
      str = item.controlLevel
    }
  })
  return str
}
const submitForm = async (): Promise<{
  state: boolean
  data: FormData | null
}> => {
  if (!ruleFormRef.value) return { state: false, data: null }
  return new Promise((resolve) => {
    ruleFormRef.value?.validate((valid) => {
      if (valid) {
        emit('submit', formData) // 使用组件内的 ruleForm
        resolve({
          state: true,
          data: formData
        })
      } else {
        resolve({
          state: false,
          data: null
        })
      }
    })
  })
}
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  Table,
  TableRow,
  TableCell
} from 'docx'

const myExport = async (fileName = '风险分级管控清单') => {
  try {
    const data = props.initialData

    // 创建表格数据行
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('序号')], width: { size: 1000 } }),
          new TableCell({ children: [new Paragraph('危险有害因素')], width: { size: 3000 } }),
          new TableCell({ children: [new Paragraph('可能造成的事故类型')], width: { size: 3000 } }),
          new TableCell({ children: [new Paragraph('管控措施类型')], width: { size: 2000 } }),
          new TableCell({ children: [new Paragraph('管控措施')], width: { size: 4000 } }),
          new TableCell({ children: [new Paragraph('检查项目')], width: { size: 3000 } }),
          new TableCell({ children: [new Paragraph('检查标准')], width: { size: 4000 } })
        ],
        tableHeader: true
      }),
      ...(data?.riskFactorsList?.map(
        (item, index) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph((index + 1).toString())] }),
              new TableCell({ children: [new Paragraph(item.riskFactorsName || '')] }),
              new TableCell({
                children: [
                  new Paragraph(
                    `${getDictLabel(DICT_TYPE.ACCIDENT_TYPE, item.accidentType)}${getControlType(item.accidentType)}`
                  )
                ]
              }),
              new TableCell({
                children: [
                  new Paragraph(getDictLabel(DICT_TYPE.CONTROL_TYPE, item.controlType) || '')
                ]
              }),
              new TableCell({ children: [new Paragraph(item.controlMeasures || '')] }),
              new TableCell({ children: [new Paragraph(item.inspectItemName || '')] }),
              new TableCell({ children: [new Paragraph(item.inspectStandard || '')] })
            ]
          })
      ) || [])
    ]
    console.log('data?.riskUnitId', data?.riskUnitId)
    // 创建文档内容
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // 主标题
            new Paragraph({
              text: '风险分级管控清单',
              // heading: HeadingLevel.HEADING_1,
              alignment: 'center',
              spacing: { after: 400 }
            }),

            // 基本信息网格
            new Paragraph({
              children: [
                // 风险点名称（加粗标签）
                new TextRun({
                  text: '风险点名称：' + (data?.riskName || ' ')
                }),
                // 空行
                new TextRun({ text: '  ' }),

                // 风险单元（加粗标签）
                new TextRun({
                  text: '风险单元：' + (data?.riskUnitId?.toString() || ' ')
                }),
                // 空行
                new TextRun({ text: '  ' }),

                // 风险等级（加粗标签）
                new TextRun({
                  text: '风险等级：' + (getDictLabel(DICT_TYPE.RISKLEVEL, data?.overallRisk) || ' ')
                }),
                // 空行
                new TextRun({ text: '  ' }),

                // 管控层级（加粗标签）
                new TextRun({
                  text: '管控层级：' + (getcontrolLevel(data?.controlLevel) || ' ')
                })
              ],
              alignment: 'center', // 设置整个段落居中对齐
              spacing: {
                after: 200, // 段落后的间距
                line: 300 // 行间距
              }
            }),

            // 危险有害因素表格
            // new Paragraph({
            //   text: '危险有害因素清单',
            //   heading: HeadingLevel.HEADING_2,
            //   spacing: { after: 200 }
            // }),
            new Table({
              rows: tableRows,
              width: { size: 100, type: 'pct' },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }),

            // 责任信息
            // new Paragraph({
            //   text: '责任信息',
            //   heading: HeadingLevel.HEADING_2,
            //   spacing: { before: 400, after: 200 }
            // }),
            new Paragraph({
              children: [
                // 风险点名称（加粗标签）
                new TextRun({
                  text: '责任部门：' + (data?.respDeptName || ' ')
                }),
                // 空行
                new TextRun({ text: '  ' }),

                // 风险单元（加粗标签）
                new TextRun({
                  text: '责任岗位：' + (data?.respPostName || ' ')
                }),
                // 空行
                new TextRun({ text: '  ' }),

                // 风险等级（加粗标签）
                new TextRun({
                  text: '管控责任人：' + (data?.respUserName || ' ')
                })
              ],
              alignment: 'center', // 设置整个段落居中对齐
              spacing: {
                after: 200, // 段落后的间距
                line: 300 // 行间距
              }
            })
          ]
        }
      ]
    })

    // 生成 Word 文件并下载
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}_${new Date().toLocaleDateString()}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)
  } catch (error) {
    console.error('导出Word失败:', error)
    ElMessage.error('导出Word失败')
  }
}
// import ExcelJS from 'exceljs'
// // 导出数据为excel表格
// const myExport = async (fileName = '风险分级管控清单') => {
//   try {
//     // 创建工作簿和工作表
//     const workbook = new ExcelJS.Workbook()
//     const worksheet = workbook.addWorksheet('风险分级管控清单')
//
//     // 设置表头
//     worksheet.columns = [
//       { header: '序号', key: 'index', width: 10 },
//       { header: '危险有害因素', key: 'riskFactorsName', width: 30 },
//       { header: '可能造成的事故类型', key: 'accidentType', width: 25 },
//       { header: '管控措施类型', key: 'controlType', width: 20 },
//       { header: '管控措施', key: 'controlMeasures', width: 40 },
//       { header: '检查项目', key: 'inspectItemName', width: 30 },
//       { header: '检查标准', key: 'inspectStandard', width: 40 }
//     ]
//
//     // 设置表头样式
//     worksheet.getRow(1).eachCell((cell) => {
//       cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
//       cell.fill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: 'FF4F81BD' }
//       }
//       cell.alignment = { vertical: 'middle', horizontal: 'center' }
//       cell.border = {
//         top: { style: 'thin' },
//         left: { style: 'thin' },
//         bottom: { style: 'thin' },
//         right: { style: 'thin' }
//       }
//     })
//
//     // 添加数据行
//     props.initialData?.riskFactorsList?.forEach((item, index) => {
//       const row = worksheet.addRow({
//         index: index + 1,
//         riskFactorsName: item.riskFactorsName,
//         accidentType: getControlType(item.accidentType),
//         controlType: getDictLabel(DICT_TYPE.CONTROL_TYPE, item.controlType),
//         controlMeasures: item.controlMeasures,
//         inspectItemName: item.inspectItemName,
//         inspectStandard: item.inspectStandard
//       })
//       // 设置数据行样式
//       row.eachCell((cell) => {
//         cell.border = {
//           top: { style: 'thin' },
//           left: { style: 'thin' },
//           bottom: { style: 'thin' },
//           right: { style: 'thin' }
//         }
//         cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
//       })
//     })
//
//     // 自动调整列宽（根据内容）
//     worksheet.columns.forEach((column) => {
//       let maxLength = 0
//       column.eachCell({ includeEmpty: true }, (cell) => {
//         const columnLength = cell.value ? cell.value.toString().length : 0
//         if (columnLength > maxLength) {
//           maxLength = columnLength
//         }
//       })
//       column.width = Math.min(Math.max(maxLength + 2, column.width || 0), 50)
//     })
//
//     // 生成 Excel 文件并下载
//     const buffer = await workbook.xlsx.writeBuffer()
//     const blob = new Blob([buffer], {
//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     })
//     const link = document.createElement('a')
//     link.href = URL.createObjectURL(blob)
//     link.download = `${fileName}_${new Date().toLocaleDateString()}.xlsx`
//     link.click()
//     setTimeout(() => {
//       URL.revokeObjectURL(link.href)
//     }, 100)
//   } catch (error) {
//     console.error('导出Excel失败:', error)
//     ElMessage.error('导出Excel失败')
//   }
// }
// 暴露方法给父组件
defineExpose({
  validate: submitForm,
  myExport
})
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

.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
}
</style>
