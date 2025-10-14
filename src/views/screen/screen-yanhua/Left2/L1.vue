<template>
    <div class="checked-list">
        <div class="checked-item">
            <a-checkbox-group direction="vertical">
                <a-checkbox :value="items.id" v-for="items in CheckedItems" :key="items.id">
                    <div class="item-flex">
                        <div class="title">{{ items.label }}</div>
                        <img :src="items.url" alt="">
                    </div>
                </a-checkbox>
            </a-checkbox-group>
        </div>
    </div>
</template>

<script lang='ts' setup>
import govtMarker from '@/assets/screen/emergency/govt-marker.png';
import rescueForceMarker from '@/assets/screen/emergency/rescue-force-marker.png';
import medicalMarker from '@/assets/screen/emergency/medical-institution-marker.png';
import suppliesMarker from '@/assets/screen/emergency/emergency-supplies-marker.png';
import equipmentMarker from '@/assets/screen/emergency/emergency-equipment-marker.png';
import consequencesMarker from '@/assets/screen/emergency/Consequences.png';

const CheckedItems = [
  { id: 0, url: govtMarker, label: '企业' },
  { id: 1, url: rescueForceMarker, label: '救援队' },
  { id: 2, url: medicalMarker, label: '医疗机构' },
  { id: 3, url: suppliesMarker, label: '应急物资' },
  { id: 4, url: equipmentMarker, label: '应急装备' },
  { id: 5, url: consequencesMarker, label: '事故后果' },
];
</script>
<style scoped lang='less'>
.checked-list {
    margin-top: 80px;
    padding: 0 43px;
    height: 407px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(65, 106, 146, 0.1);
    .item-flex{
        display: flex;
        align-items: center;
        gap: 16px;
        .title{
            font-size: 20px;
            color: #fff;
            margin-left: 6px;
        }
        img{
            width: 24px;
            height: 24px;
        }
    }
}

.arco-checkbox-group{
    display: flex;
    flex-direction: column;
    gap: 20px;
}

::v-deep(.arco-icon-hover){
    width: 24px;
    height: 24px;
    .arco-checkbox-icon{
        width: 100%;
        height: 100%;
    }
    [data-v-a3c0f96c] .arco-checkbox-icon{
        background-color: #133556;
    }
    .arco-checkbox-checked{
        background-color: #007DFA !important;
    }
}
</style>
