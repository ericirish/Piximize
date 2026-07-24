<template>
  <aside class="flex w-full shrink-0 flex-col border-t border-[var(--pix-line)] bg-[var(--pix-panel)] backdrop-blur-xl lg:h-dvh lg:w-[22.5rem] lg:border-t-0 lg:border-l">
    <div class="border-b border-[var(--pix-line)] px-6 py-5">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pix-muted)]">
        Optimize
      </p>
      <p class="mt-1 text-lg font-semibold tracking-tight text-[var(--pix-ink)]">
        Output settings
      </p>
    </div>

    <div class="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-6">
      <section class="space-y-3">
        <h2 class="text-sm font-semibold text-[var(--pix-ink)]">
          Crop
        </h2>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="item in cropPresets"
            :key="item.value"
            type="button"
            class="rounded-lg border px-2 py-2.5 text-sm font-semibold transition-colors"
            :class="cropRatio === item.value
              ? 'border-[var(--pix-accent)] bg-[var(--pix-accent-soft)] text-[var(--pix-accent)]'
              : 'border-[var(--pix-line)] bg-white/60 text-[var(--pix-ink)] hover:border-[var(--pix-accent)]/40'"
            @click="emit('update:cropRatio', item.value)"
          >
            {{ item.label }}
          </button>
        </div>
      </section>

      <section class="space-y-3">
        <div class="flex items-end justify-between gap-3">
          <h2 class="text-sm font-semibold text-[var(--pix-ink)]">
            Long edge
          </h2>
          <span class="text-xs tabular-nums text-[var(--pix-muted)]">{{ longEdge }}px</span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="size in sizes"
            :key="size"
            type="button"
            class="rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors"
            :class="longEdge === size
              ? 'border-[var(--pix-accent)] bg-[var(--pix-accent-soft)] text-[var(--pix-accent)]'
              : 'border-[var(--pix-line)] bg-white/60 text-[var(--pix-ink)] hover:border-[var(--pix-accent)]/40'"
            @click="selectSize(size)"
          >
            {{ size }}
          </button>
        </div>

        <UFormField label="Custom">
          <UInputNumber
            v-model="customLongEdge"
            :min="1"
            placeholder="e.g. 1600"
            class="w-full"
            :decrement="false"
            :increment="false"
            @update:model-value="onCustomLongEdge"
          />
        </UFormField>
      </section>

      <section class="space-y-3">
        <h2 class="text-sm font-semibold text-[var(--pix-ink)]">
          Format
        </h2>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="item in formats"
            :key="item"
            type="button"
            class="rounded-lg border px-2 py-2.5 text-sm font-semibold transition-colors"
            :class="format === item
              ? 'border-[var(--pix-accent)] bg-[var(--pix-accent-soft)] text-[var(--pix-accent)]'
              : 'border-[var(--pix-line)] bg-white/60 text-[var(--pix-ink)] hover:border-[var(--pix-accent)]/40'"
            @click="format = item"
          >
            {{ item }}
          </button>
        </div>
      </section>

      <section class="space-y-3">
        <div class="flex items-end justify-between gap-3">
          <h2 class="text-sm font-semibold text-[var(--pix-ink)]">
            Quality
          </h2>
          <span class="text-xs tabular-nums text-[var(--pix-muted)]">{{ quality }}%</span>
        </div>
        <USlider
          v-model="quality"
          :min="1"
          :max="100"
          :step="1"
          tooltip
        />
      </section>

      <section class="space-y-3">
        <h2 class="text-sm font-semibold text-[var(--pix-ink)]">
          Rename sequence
        </h2>
        <UInput
          v-model="sequence"
          placeholder="Optional prefix"
          icon="i-lucide-text-cursor-input"
        />
        <p class="text-xs text-[var(--pix-muted)]">
          Creates names like <span class="font-medium text-[var(--pix-ink)]">prefix-1.jpg</span>
        </p>
      </section>

      <div
        v-if="savingsLabel"
        class="rounded-xl border border-[var(--pix-line)] bg-white/70 px-4 py-3"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pix-muted)]">
          Estimated savings
        </p>
        <p class="mt-1 text-2xl font-bold tracking-tight text-[var(--pix-accent)]">
          {{ savingsLabel }}
        </p>
      </div>
    </div>

    <div class="sticky bottom-0 space-y-2 border-t border-[var(--pix-line)] bg-white/80 px-6 py-5 backdrop-blur-md">
      <UButton
        color="primary"
        size="xl"
        block
        icon="i-lucide-download"
        :disabled="!canProcess"
        :loading="isProcessing"
        @click="downloadAllProcessed"
      >
        Download {{ props.files.length }} {{ props.files.length === 1 ? 'image' : 'images' }}
      </UButton>

      <UButton
        color="neutral"
        variant="ghost"
        size="lg"
        block
        @click="clearAll"
      >
        Start over
      </UButton>
    </div>
  </aside>
</template>

<script setup>
import imageCompression from 'browser-image-compression'
import { CROP_RATIOS, cropImageToFile, cropSignature } from '~/utils/crop'

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  },
  cropRatio: {
    type: String,
    default: 'none'
  }
})

const emit = defineEmits(['clear', 'update:files', 'update:cropRatio'])

const sizes = [1920, 1440, 1000, 500]
const formats = ['JPEG', 'PNG', 'WebP']
const cropPresets = CROP_RATIOS

const longEdge = ref(1920)
const format = ref('JPEG')
const quality = ref(70)
const sequence = ref('')
const customLongEdge = ref(undefined)
const isProcessing = ref(false)

const canProcess = computed(() =>
  Array.isArray(props.files)
  && props.files.length > 0
  && Boolean(props.files[0]?.processedBlob)
)

const savingsLabel = computed(() => {
  if (!props.files?.length) { return '' }
  const withSizes = props.files.filter(f => typeof f.originalSize === 'number' && typeof f.newSize === 'number')
  if (!withSizes.length) { return '' }
  const original = withSizes.reduce((sum, f) => sum + f.originalSize, 0)
  const next = withSizes.reduce((sum, f) => sum + f.newSize, 0)
  if (!original || next >= original) { return '0%' }
  return `${Math.round(((original - next) / original) * 100)}%`
})

function selectSize (size) {
  longEdge.value = size
  customLongEdge.value = undefined
}

function onCustomLongEdge (value) {
  if (typeof value === 'number' && value > 0) {
    longEdge.value = value
  }
}

function filesSignature (files) {
  if (!Array.isArray(files)) { return '' }
  return files.map((f) => {
    const fileObj = f.file || f
    return [fileObj?.name, fileObj?.size, fileObj?.lastModified, fileObj?.url].join(':')
  }).join('|')
}

const filesSig = computed(() => filesSignature(props.files))
const cropsSig = computed(() => cropSignature(props.files))

function debounce (fn, delay) {
  let timeout
  function debounced (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(this, args), delay)
  }
  debounced.cancel = () => clearTimeout(timeout)
  return debounced
}

const debouncedProcessAllImages = debounce(processAllImages, 300)

onMounted(processAllImages)

watch([
  longEdge,
  format,
  quality,
  sequence,
  filesSig,
  () => props.cropRatio,
  cropsSig
], () => {
  debouncedProcessAllImages()
})

onUnmounted(() => {
  debouncedProcessAllImages.cancel?.()
})

async function processAllImages () {
  if (!Array.isArray(props.files) || props.files.length === 0) { return }

  isProcessing.value = true

  const options = {
    maxWidthOrHeight: Number(longEdge.value),
    initialQuality: quality.value / 100,
    fileType: format.value === 'JPEG' ? 'image/jpeg' : format.value === 'PNG' ? 'image/png' : 'image/webp',
    useWebWorker: true
  }

  const baseName = sequence.value || ''
  const processedFiles = []

  try {
    for (let i = 0; i < props.files.length; i++) {
      const fileObj = props.files[i]
      const file = fileObj.file || fileObj
      try {
        let sourceFile = file
        if (props.cropRatio !== 'none' && fileObj.crop) {
          sourceFile = await cropImageToFile(file, fileObj.crop, file.name)
        }

        const compressedFile = await imageCompression(sourceFile, options)
        const url = URL.createObjectURL(compressedFile)
        let ext = '.webp'
        if (format.value === 'JPEG') { ext = '.jpg' } else if (format.value === 'PNG') { ext = '.png' }

        let newName
        if (baseName) {
          newName = `${baseName}-${i + 1}${ext}`
        } else {
          newName = file.name.replace(/\.[^/.]+$/, '') + ext
        }

        const getBaseName = name => name.replace(/\.[^/.]+$/, '')
        const originalBaseName = getBaseName(file.name)
        const newBaseName = getBaseName(newName)

        if (fileObj.processedUrl) {
          URL.revokeObjectURL(fileObj.processedUrl)
        }

        processedFiles.push({
          ...fileObj,
          originalSize: file.size,
          newSize: compressedFile.size,
          processedBlob: compressedFile,
          processedUrl: url,
          newName,
          originalBaseName,
          newBaseName,
          nameChanged: originalBaseName !== newBaseName
        })
      } catch (err) {
        alert('Error processing image: ' + (file.name || '') + ': ' + err)
        processedFiles.push(fileObj)
      }
    }

    emit('update:files', processedFiles)
  } finally {
    isProcessing.value = false
  }
}

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
      if (!fileObj.processedUrl) { URL.revokeObjectURL(url) }
    }
  }

  clearAll()
}

function clearAll () {
  longEdge.value = sizes[0]
  customLongEdge.value = undefined
  format.value = formats[0]
  quality.value = 80
  sequence.value = ''
  emit('update:cropRatio', 'none')
  emit('clear')
}
</script>
