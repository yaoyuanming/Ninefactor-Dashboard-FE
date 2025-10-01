<template>
  <div class="content-left" :style="`z-index: ${baseConfig.leftConfig.zIndex}`">
    <div class="content-left-main">
      <div class="company-overview-wrapper" @click="handleCompanyClick">
        <img style="width: 460px" src="@/assets/screen/left1.png" />
      </div>
      <L2 />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { inject } from 'vue';
  import { baseConfig } from '../config';
  import AlarmBg from '../../../../assets/screen/imgs/alarm-bg.png';
  import L2 from './L2.vue';

  const openDrawer = inject<any>('openDrawer');

  // 点击企业概况
  const handleCompanyClick = () => {
    openDrawer?.('company', '企业概况', {
      name: '福州市XXXXX公司',
      code: '91350100MA2XN7KU4X',
      type: '有限责任公司',
      industry: '制造业',
      scale: '大型',
      capital: '5000万元',
      legalPerson: '张三',
      phone: '0591-88888888',
      address: '福建省福州市仓山区金山大道XXX号',
      registerDate: '2018-05-20',
      businessScope: '化工原料及产品制造、销售；危险化学品经营（凭许可证经营）',
      staffCount: '320人',
    });
  };
</script>

<style scoped lang="less">
  .content-left {
    position: absolute;
    top: 0;
    left: 0;
    width: 700px;
    min-width: 440px;
    height: 100%;

    .content-left-main {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 460px;
      margin-top: 80px;
      padding-left: 20px;

      .company-overview-wrapper {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: scale(1.02);
          filter: brightness(1.1);
        }
      }
    }
  }
</style>
