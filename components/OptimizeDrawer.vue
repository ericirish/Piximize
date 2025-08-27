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

    .text-overline Crop

    v-item-group(
      v-model="aspectRatio"
    )
      v-row.mb-4
        v-col(
          cols=4
          v-for="ratio in aspectRatios"
          :key="ratio.value"
        )
          v-item(
            v-slot="{ isSelected, toggle }"
            :value="ratio.value"
          )
            v-btn(
              block
              :color="isSelected ? 'primary' : 'default'"
              @click="toggle"
              :variant="isSelected ? 'elevated' : 'tonal'"
            ) {{ ratio.label }}

    .text-overline Rename

    v-text-field(
      v-model="sequence"
      label="Sequence"
      placeholder="e.g., vacation-photos"
      persistent-hint
    )

    v-btn.mb-4(
      block
      color="primary"
      height="68"
      elevation=10
      @click="downloadAllProcessed"
      :disabled="!props.files || !props.files.length || !props.files[0].processedBlob"
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
import { ref, watch, onMounted, defineProps, defineEmits, onUnmounted, computed } from 'vue'

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['clear', 'update:files'])

const sizes = [1920, 1440, 1000, 500]
const formats = ['JPEG', 'PNG', 'WebP']

const aspectRatios = [
  { value: 'original', label: 'Original' },
  { value: '16:9', label: '16:9' },
  { value: '1:1', label: '1:1' }
]

const longEdge = ref(1920)
const format = ref('JPEG')
const quality = ref(70)
const sequence = ref(null)
const customLongEdge = ref('')
const selectedFile = ref(null)
const aspectRatio = ref('original')

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

// Utility to create a signature for the files array
function filesSignature (files) {
  if (!Array.isArray(files)) { return '' }
  return files.map((f) => {
    const fileObj = f.file || f
    return [fileObj?.name, fileObj?.size, fileObj?.lastModified, fileObj?.url].join(':')
  }).join('|')
}

const filesSig = computed(() => filesSignature(props.files))

// If files are passed as prop, select the first file by default
watch(
  filesSig,
  (newSig, oldSig) => {
    console.log('[OptimizeDrawer] filesSig changed:', { newSig, oldSig })
    const newFiles = props.files
    if (Array.isArray(newFiles) && newFiles.length > 0) {
      selectedFile.value = newFiles[0].file || newFiles[0]
    } else {
      selectedFile.value = null
    }
  },
  { immediate: true }
)

// Simple debounce utility
function debounce (fn, delay) {
  let timeout
  function debounced (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(this, args), delay)
  }
  debounced.cancel = () => clearTimeout(timeout)
  return debounced
}

const debouncedProcessAllImages = debounce(processAllImages, 300) // 300ms debounce

// Function to crop image to specific aspect ratio
async function cropImage(file, targetAspectRatio) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      const { width: originalWidth, height: originalHeight } = img

      if (targetAspectRatio === 'original') {
        // No cropping needed
        canvas.width = originalWidth
        canvas.height = originalHeight
        ctx.drawImage(img, 0, 0)
        resolve(canvas)
        return
      }

      let targetWidth, targetHeight

      if (targetAspectRatio === '16:9') {
        // 16:9 aspect ratio
        if (originalWidth / originalHeight > 16/9) {
          // Image is wider than 16:9, crop width
          targetHeight = originalHeight
          targetWidth = originalHeight * (16/9)
        } else {
          // Image is taller than 16:9, crop height
          targetWidth = originalWidth
          targetHeight = originalWidth * (9/16)
        }
      } else if (targetAspectRatio === '1:1') {
        // 1:1 (square) aspect ratio
        const size = Math.min(originalWidth, originalHeight)
        targetWidth = size
        targetHeight = size
      }

      // Calculate crop position (center crop)
      const cropX = (originalWidth - targetWidth) / 2
      const cropY = (originalHeight - targetHeight) / 2

      canvas.width = targetWidth
      canvas.height = targetHeight

      // Draw the cropped portion
      ctx.drawImage(
        img,
        cropX, cropY, targetWidth, targetHeight,
        0, 0, targetWidth, targetHeight
      )

      resolve(canvas)
    }

    img.src = URL.createObjectURL(file)
  })
}

onMounted(processAllImages)

watch([
  longEdge,
  format,
  quality,
  sequence,
  filesSig
], () => {
  debouncedProcessAllImages()
})

onUnmounted(() => {
  debouncedProcessAllImages.cancel && debouncedProcessAllImages.cancel()
})

// Process all files in props.files
async function processAllImages () {
  if (!Array.isArray(props.files) || props.files.length === 0) { return }

  console.log('[OptimizeDrawer] Processing images with sequence:', sequence.value)
  console.log('[OptimizeDrawer] Sequence type:', typeof sequence.value, 'Length:', sequence.value?.length)

  const options = {
    maxWidthOrHeight: Number(longEdge.value),
    initialQuality: quality.value / 100,
    fileType: format.value === 'JPEG' ? 'image/jpeg' : format.value === 'PNG' ? 'image/png' : 'image/webp',
    useWebWorker: true
  }

  // Prepare base name and extension
  const baseName = sequence.value?.trim() || ''
  const ext = format.value === 'JPEG' ? '.jpg' : format.value === 'PNG' ? '.png' : '.webp'

  console.log('[OptimizeDrawer] Base name:', baseName, 'Extension:', ext, 'Format:', format.value)

  // We'll build a new array to emit
  const processedFiles = []

  for (let i = 0; i < props.files.length; i++) {
    const fileObj = props.files[i]
    const file = fileObj.file || fileObj
    try {
      let fileToProcess = file

      // Apply cropping if needed
      if (aspectRatio.value !== 'original') {
        const croppedCanvas = await cropImage(file, aspectRatio.value)
        // Convert canvas to blob for further processing
        const croppedBlob = await new Promise(resolve => {
          croppedCanvas.toBlob(resolve, 'image/jpeg', 1.0)
        })
        fileToProcess = new File([croppedBlob], file.name, { type: 'image/jpeg' })
      }

      const compressedFile = await imageCompression(fileToProcess, options)
      const url = URL.createObjectURL(compressedFile)

      // Generate new name based on sequence or original
      let newName
      if (baseName) {
        // Use sequence naming: baseName-1.ext, baseName-2.ext, etc.
        newName = `${baseName}-${i + 1}${ext}`
        console.log(`[OptimizeDrawer] File ${i + 1} using sequence naming:`, newName)
      } else {
        // Use original name but change extension to match format
        const originalNameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        newName = `${originalNameWithoutExt}${ext}`
        console.log(`[OptimizeDrawer] File ${i + 1} using original naming:`, newName)
      }

      // Extract base names (sans extension) for comparison
      const originalBaseName = file.name.replace(/\.[^/.]+$/, '')
      const newBaseName = newName.replace(/\.[^/.]+$/, '')
      const nameChanged = originalBaseName !== newBaseName

      console.log(`[OptimizeDrawer] File ${i + 1}:`, {
        original: file.name,
        new: newName,
        nameChanged,
        baseName,
        originalBaseName,
        newBaseName
      })

      // Build processed file object
      processedFiles.push({
        ...fileObj,
        originalSize: file.size,
        newSize: compressedFile.size,
        processedBlob: compressedFile,
        processedUrl: url,
        newName,
        originalBaseName,
        newBaseName,
        nameChanged
      })
    } catch (err) {
      alert('Error processing image: ' + (file.name || '') + ': ' + err)
    }
  }
  // Emit the processed files so parent can update
  emit('update:files', processedFiles)
  // Optionally, you can clearAll here if you want to reset UI
  // clearAll()
}

// Download all processed images
function downloadAllProcessed () {
  if (!Array.isArray(props.files) || props.files.length === 0) { return }
  for (let i = 0; i < props.files.length; i++) {
    const fileObj = props.files[i]
    if (fileObj.processedBlob && fileObj.newName) {
      const url = fileObj.processedUrl || URL.createObjectURL(fileObj.processedBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileObj.newName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // Optionally, revoke the object URL if you created it here
      if (!fileObj.processedUrl) { URL.revokeObjectURL(url) }
    }
  }

  clearAll()
}

function clearAll () {
  // Reset all local state to initial values
  longEdge.value = sizes[0]
  customLongEdge.value = ''
  format.value = formats[0]
  quality.value = 80
  sequence.value = ''
  aspectRatio.value = 'original'
  emit('clear') // Notify parent to clear files
}
</script>

<style scoped>
</style>
