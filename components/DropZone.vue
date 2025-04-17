<template>
  <div
    class="drop-zone h-100 d-flex flex-column align-center justify-center"
    :class="{ 'drag-over': isDragOver }"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <slot>
      <div class="text-overline">
        Drop Image(s) here
      </div>
      <div class="text-overline text-grey">
        Or
      </div>
      <div class="text-overline">
        Click to select
      </div>
    </slot>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['files-dropped'])

const isDragOver = ref(false)

function onDragOver (e) {
  isDragOver.value = true
}

function onDragLeave (e) {
  isDragOver.value = false
}

function onDrop (e) {
  isDragOver.value = false
  const files = Array.from(e.dataTransfer.files)
    .filter(f => f.type.startsWith('image/'))
  if (files.length) {
    emit('files-dropped', files)
  }
}
</script>

<style scoped lang="scss">
.drop-zone {
  border: 2px dashed #bbb;
  border-radius: 12px;
  transition: background 0.2s, border-color 0.2s;
  cursor: pointer;
}
.drop-zone.drag-over {
  background: #f5f5f5;
  border-color: #1976d2;
}
</style>
