<script lang="ts" setup>
import { useDesign } from '@/hooks/web/useDesign'

defineOptions({ name: 'LayoutRadioPicker' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('layout-radio-picker')

const layout = computed(() => {
  return isAcitve.value
})
const props = defineProps({
  modelValue: {
    type: String,
    default: 'classic'
  }
})
console.log("props----",props.modelValue)
const emit = defineEmits(['update:modelValue'])
// ref(props.modelValue)
let isAcitve =  computed(() => props.modelValue)
const seAcitve = (type: string) => {
  isAcitve.value = type
  emit('update:modelValue', type)
}
</script>

<template>
  <div :class="prefixCls" class="flex flex-wrap space-x-14px">
    <div
      :class="[
        `${prefixCls}__classic`,
        'relative w-56px h-48px cursor-pointer bg-gray-300',
        {
          'is-acitve': layout === 'classic'
        }
      ]"
      @click="seAcitve('classic')"
    ></div>
    <div
      :class="[
        `${prefixCls}__top-left`,
        'relative w-56px h-48px cursor-pointer bg-gray-300',
        {
          'is-acitve': layout === 'topLeft'
        }
      ]"
      @click="seAcitve('topLeft')"
    ></div>
    <div
      :class="[
        `${prefixCls}__top-left-menu`,
        'relative w-56px h-48px cursor-pointer bg-gray-300',
        {
          'is-acitve': layout === 'tlMenu'
        }
      ]"
      @click="seAcitve('tlMenu')"
    ></div>
    <div
      :class="[
        `${prefixCls}__top`,
        'relative w-56px h-48px cursor-pointer bg-gray-300',
        {
          'is-acitve': layout === 'top'
        }
      ]"
      @click="seAcitve('top')"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-layout-radio-picker;

.#{$prefix-cls} {
  &__classic {
    border: 2px solid #e5e7eb;
    border-radius: 4px;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 33%;
      height: 100%;
      background-color: #273352;
      border-radius: 4px 0 0 4px;
      content: '';
    }

    &::after {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 25%;
      background-color: #fff;
      border-radius: 4px 4px 0;
      content: '';
    }
  }

  &__top-left {
    border: 2px solid #e5e7eb;
    border-radius: 4px;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 33%;
      background-color: #273352;
      border-radius: 4px 4px 0 0;
      content: '';
    }

    &::after {
      position: absolute;
      top: 0;
      left: 0;
      width: 33%;
      height: 100%;
      background-color: #fff;
      border-radius: 4px 0 0 4px;
      content: '';
    }
  }

  &__top-left-menu {
    border: 2px solid #e5e7eb;
    border-radius: 4px;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 33%;
      background-color: #273352;
      border-radius: 4px 4px 0 0;
      content: '';
    }

    &::after {
      position: absolute;
      top: 0;
      left: 0;
      width: 20%;
      height: 100%;
      background-color: #fff;
      border-radius: 4px 0 0 4px;
      content: '';
    }
  }

  &__top {
    border: 2px solid #e5e7eb;
    border-radius: 4px;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 33%;
      background-color: #273352;
      border-radius: 4px 4px 0 0;
      content: '';
    }
  }

  &__cut-menu {
    border: 2px solid #e5e7eb;
    border-radius: 4px;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 33%;
      background-color: #273352;
      border-radius: 4px 4px 0 0;
      content: '';
    }

    &::after {
      position: absolute;
      top: 0;
      left: 0;
      width: 10%;
      height: 100%;
      background-color: #fff;
      border-radius: 4px 0 0 4px;
      content: '';
    }
  }

  .is-acitve {
    border-color: var(--el-color-primary);
  }
}
</style>
