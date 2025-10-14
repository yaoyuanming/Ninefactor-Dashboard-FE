<template>
    <div class="stats-section alarm-stats-section">
        <Title title="风险提示" :src="TitleImage" :tabs="[]" @imgClick="handleWarehouseClick" />

        <div class="items">
            <img src="@/assets/screen/imgs/none-items.png" alt="">
        </div>
    </div>
</template>

<script lang='ts' setup>
import TitleImage from '@/assets/screen/lien.png';
import {
    ref,
    onMounted,
    onBeforeUnmount,
    nextTick,
    watch,
    inject,
} from 'vue';
import Title from '../components/Title.vue';
import { DrawerType } from '../DetailDrawer/types';
const openDrawer = inject<any>('openDrawer');

// 点击仓库概况
const handleWarehouseClick = () => {
    console.log('Left/L2组件：handleWarehouseClick被调用了');
    console.log('openDrawer是否存在：', !!openDrawer);
    openDrawer?.(DrawerType.WAREHOUSE, '仓库概况', {
        name: '1号危化品仓库',
        code: 'WH2025001',
        company: '福州市XXXXX公司',
        type: '危险品仓库',
        dangerLevel: '01-1.1级库房',
        capacity: '500吨',
        manager: '李四',
        phone: '13800138000',
        address: '福建省福州市仓山区金山大道XXX号仓储区A区',
        area: '1200㎡',
        startDate: '2019-03-15',
        safetyLevel: 'A级',
    });
};
</script>
<style scoped lang='less'>
.stats-section {
  background: linear-gradient(90deg, #0c2249 0%, rgb(65 106 146 / 69%) 97%);
  border-radius: 4px;
  pointer-events: all;
  padding-bottom: 20px;
}

.items{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 35px 0;
    img{
        width: 64px;
        height: 90px;
    }
}
</style>