<template lang="pug">
v-navigation-drawer(
  permanent
  location="end"
  width="500"
)
  .pa-6
    .text-overline.mb-2 Long Edge

    v-item-group(
      v-model="longEdge"
    )
      v-row.mb-4
        v-col(
          cols=6
          v-for="size in sizes"
          :key="size"
          :value="size"
        )
          v-item(
            v-slot="{ isSelected, toggle }"
            :value="size"
          )
            v-btn(
              block
              :color="isSelected ? 'primary' : 'default'"
              @click="toggle"
              :variant="isSelected ? 'elevated' : 'tonal'"
            ) {{ size }}

    v-text-field.mb-8(
      v-model.number="customLongEdge"
      label="Custom Value"
      type="number"
      min="1"
      @input="onCustomLongEdgeInput"
    )

    .text-overline.mb-2 Formats

    v-item-group.mb-8(
      v-model="format"
    )
      v-row.mb-4
        v-col(
          cols=6
          v-for="format in formats"
          :key="format"
        )
          v-item(
            v-slot="{ isSelected, toggle }"
            :value="format"
          )
            v-btn(
              block
              :color="isSelected ? 'primary' : null"
              @click="toggle"
              :variant="isSelected ? 'elevated' : 'tonal'"
            ) {{ format }}

    .text-overline Quality

    v-slider(
      color="primary"
      v-model="quality"
      min="1"
      max="100"
      step="1"
      thumb-label="always"
    )

    .text-overline Rename

    v-text-field(
      v-model="sequence"
      label="Sequence"
    )

    v-btn.mb-4(
      block
      color="primary"
      height="68"
      elevation=10
      @click="processAllImages"
      :disabled="!props.files || props.files.length === 0"
    ) Process {{ props.files.length }} Images

    v-btn(
      variant="tonal"
      block
      height="60"
      color="grey-darken-1"
      @click="clearAll"
    ) Clear
</template>

<script setup>
import imageCompression from 'browser-image-compression'

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['clear'])

const sizes = [1920, 1440, 1000, 500]
const formats = ['JPEG', 'PNG', 'WebP']

const longEdge = ref(1920)
const format = ref('JPEG')
const quality = ref(70)
const sequence = ref(null)
const customLongEdge = ref('')
const selectedFile = ref(null)

function onCustomLongEdgeInput () {
  // If the user enters a value, update longEdge to that value
  if (longEdge.value === 'custom' && customLongEdge.value) {
    longEdge.value = customLongEdge.value
  }
}

// Watch for longEdge changes: if user clicks away from custom, clear customLongEdge
watch(longEdge, (val, oldVal) => {
  if (val !== 'custom') {
    customLongEdge.value = ''
  }
})

// If files are passed as prop, select the first file by default
watch(
  () => props.files,
  (newFiles) => {
    if (Array.isArray(newFiles) && newFiles.length > 0) {
      // Use the original File object if available
      selectedFile.value = newFiles[0].file || newFiles[0]
    } else {
      selectedFile.value = null
    }
  },
  { immediate: true }
)

// Process all files in props.files
async function processAllImages () {
  if (!Array.isArray(props.files) || props.files.length === 0) { return }

  const options = {
    maxWidthOrHeight: Number(longEdge.value),
    initialQuality: quality.value / 100,
    fileType: format.value === 'JPEG' ? 'image/jpeg' : format.value === 'PNG' ? 'image/png' : 'image/webp',
    useWebWorker: true
  }

  // Prepare base name and extension
  const baseName = sequence.value || ''

  for (let i = 0; i < props.files.length; i++) {
    const fileObj = props.files[i]
    const file = fileObj.file || fileObj
    try {
      const compressedFile = await imageCompression(file, options)
      const url = URL.createObjectURL(compressedFile)
      // Determine extension based on format
      let ext = '.webp'
      if (format.value === 'JPEG') { ext = '.jpg' } else if (format.value === 'PNG') { ext = '.png' }
      // Sequence naming if sequence present
      let newName
      if (baseName) {
        newName = `${baseName}-${i+1}${ext}`
      } else {
        // fallback: use original name
        newName = file.name
      }
      // Trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = newName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // Optionally, you can revoke the object URL after download
      // URL.revokeObjectURL(url)
    } catch (err) {
      alert('Error processing image: ' + (file.name || '') + ': ' + err)
    }
  }
  // Call clearAll after all images are processed
  clearAll()
}

function clearAll () {
  // Reset all local state to initial values
  longEdge.value = sizes[0]
  customLongEdge.value = ''
  format.value = formats[0]
  quality.value = 80
  sequence.value = ''
  emit('clear') // Notify parent to clear files
}
</script>

<style scoped>
</style>
