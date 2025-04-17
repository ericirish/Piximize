<template lang="pug">
.preview-grid
  //- TODO: Replace with actual image previews
  .file-list(v-if="files && files.length" :style="gridStyle")
    v-card.file-item.d-flex(
      width="100%"
      flat
      tile
      height="100%"
      v-for="(file, i) in files" :key="i"
    )
      template(#image)
        v-img(
          :src="file.processedUrl || file.url"
          cover
          gradient="rgba(0,0,0,0), rgba(0,0,0,.5)"
        )
      .mt-auto.text-white.w-100.d-flex
        span(class="text-caption" v-if="file.originalBaseName !== file.newBaseName") {{ file.newBaseName }}
        .text-caption.ml-auto
          span {{ formatSize(file.newSize) }}
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  files: {
    type: Array,
    default: () => []
  }
})

function formatSize (size) {
  if (typeof size !== 'number') { return '' }
  if (size < 1024) { return '1.0 kB' }
  const kb = size / 1024
  if (kb < 1000) { return kb.toFixed(1) + ' kB' }
  return (kb / 1024).toFixed(2) + ' MB'
}

const gridStyle = computed(() => {
  const count = props.files.length
  if (count === 1) {
    return {
      gridTemplateColumns: '1fr',
      gridTemplateRows: '1fr',
      minHeight: '300px' // Ensures it fills space
    }
  } else if (count > 1 && count <= 4) {
    return {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridTemplateRows: 'repeat(2, 1fr)',
      minHeight: '300px'
    }
  } else if (count > 4) {
    return {
      gridTemplateColumns: 'repeat(4, 1fr)',
      minHeight: '300px'
    }
  } else {
    return {}
  }
})
</script>

<style scoped>
.preview-grid {
  width: 100%;
}
.file-list {
  display: grid;
  gap: 0px;
  margin-top: 16px;
}
.file-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 0.9rem;
  aspect-ratio: 1 / 1;
  position: relative;
}
</style>
