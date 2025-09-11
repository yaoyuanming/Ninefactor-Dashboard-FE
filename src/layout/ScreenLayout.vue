<script lang="tsx">
import { defineComponent } from 'vue'
import { useRenderLayout } from './components/useRenderLayout'

const renderLayout = () => {
  const { screenCard } = useRenderLayout()
  return screenCard()
}

export default defineComponent({
  name: 'ScreenLayout',
  setup() {
    return () => <section class={['w-[100%] h-[100%] relative']}>{renderLayout()}</section>
  }
})
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-layout;

.#{$prefix-cls} {
  background-color: var(--app-content-bg-color);
}
</style>
