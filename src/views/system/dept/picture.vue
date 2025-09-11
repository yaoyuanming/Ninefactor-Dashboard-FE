<template>
  <ContentWrap>
    <div id="mainTree" style="width: 100%; height: 720px"></div>
  </ContentWrap>
</template>
<script setup lang="ts">
let loading = ref(false)
let list = ref([])
import * as DeptApi from '@/api/system/dept'

const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  name: undefined,
  status: undefined
})
import { handleTree } from '@/utils/tree'

/** 查询部门列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await DeptApi.getDeptPage(queryParams)
    list.value = handleTree(data)
    console.log('list.value', list.value)
  } finally {
    loading.value = false
  }
}
import * as echarts from 'echarts'

const huizhi = () => {
  var chartDom = document.getElementById('mainTree');
  var myChart = echarts.init(chartDom);
  console.log('myChart', myChart);
  var option;
  myChart.setOption(
    (option = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: [
        {
          type: 'tree',
          data: list.value,
          left: '2%',
          right: '2%',
          top: '8%',
          bottom: '20%',
          symbol: 'emptyCircle',
          orient: 'vertical',
          expandAndCollapse: true,
          label: {
            backgroundColor: "#ffffff", // 背景白色
            borderColor: "#000000",     // 边框黑色
            borderWidth: 1,            // 边框宽度
            borderRadius: 4,           // 边框圆角
            padding: [8, 12],          // 增加内边距（上下8px，左右12px）
            color: "#000000",          // 文字颜色黑色
            position: 'top',
            rotate: 0,
            verticalAlign: 'middle',
            align: 'center',
            fontSize: 18,
            rich: {
              // 竖排文字样式
              verticalText: {
                align: 'center',
                width: 20,  // 重要：限制宽度强制换行
                padding: [8, 12],
                verticalAlign: 'middle',
                lineHeight: 18,  // 行高等于字体大小
                // 通过换行符实现竖排效果
                formatter: function(value) {
                  // 将字符串转换为数组并用换行符连接
                  return value.split('').join('\n');
                }
              },
              // 普通横排文字样式
              normalText: {
                align: 'center',
                verticalAlign: 'middle'
              }
            },
            // 动态判断节点层级
            formatter: function(params) {
              const isSecondLevel = params.dataIndex != 1;
              return `{${isSecondLevel ? 'verticalText' : 'normalText'}|${params.name}}`;
            }
          },
          animationDurationUpdate: 750,
          edgeShape: "polyline"
        }
      ]
    })
  );
};
/** 初始化 **/
onMounted(async () => {
  await getList()
  huizhi()
})
</script>

<style scoped lang="scss"></style>
