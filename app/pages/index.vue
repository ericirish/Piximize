<template>
  <div class="min-h-dvh">
    <section
      v-if="files.length === 0"
      class="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16"
    >
      <div class="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <h1 class="pix-brand pix-rise select-none">
          Piximize
        </h1>
        <p class="pix-rise-delay mt-5 max-w-md text-base text-[var(--pix-muted)] sm:text-lg">
          Shrink images in the browser. Fast, private, no upload.
        </p>

        <DropZone
          class="pix-rise-delay mt-12 w-full"
          @files-dropped="onFilesDropped"
        />
      </div>
    </section>

    <div
      v-else
      class="pix-fade flex min-h-dvh flex-col lg:flex-row"
    >
      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div class="flex items-baseline gap-3">
            <p class="text-xl font-bold tracking-tight text-[var(--pix-ink)] sm:text-2xl">
              Piximize
            </p>
            <span class="text-sm text-[var(--pix-muted)]">
              {{ files.length }} {{ files.length === 1 ? 'image' : 'images' }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              v-if="selectedIndex !== null && files.length > 1"
              color="neutral"
              variant="ghost"
              icon="i-lucide-gallery-thumbnails"
              label="Gallery"
              @click="selectedIndex = null"
            />
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              label="Clear"
              @click="clearAll"
            />
          </div>
        </header>

        <main class="flex min-h-0 flex-1 flex-col overflow-auto px-5 pb-8 sm:px-8">
          <PreviewGrid
            class="min-h-0 flex-1"
            :files="files"
            :crop-ratio="cropRatio"
            :selected-index="selectedIndex"
            @select="selectedIndex = $event"
            @update:crop="onCropUpdate"
            @update:dimensions="onDimensions"
          />
        </main>
      </div>

      <OptimizeDrawer
        :files="files"
        :crop-ratio="cropRatio"
        @clear="clearAll"
        @update:files="files = $event"
        @update:crop-ratio="onCropRatioChange"
      />
    </div>
  </div>
</template>

<script setup>
import { getCenteredCrop, loadImageDimensions } from '~/utils/crop'

const files = ref([])
const cropRatio = ref('none')
const selectedIndex = ref(null)

async function onFilesDropped (droppedFiles) {
  selectedIndex.value = null
  const next = await Promise.all(Array.from(droppedFiles).map(async (file) => {
    const url = URL.createObjectURL(file)
    let naturalWidth = 0
    let naturalHeight = 0
    try {
      const dims = await loadImageDimensions(url)
      naturalWidth = dims.width
      naturalHeight = dims.height
    } catch {
      // CropPreview can report dimensions later
    }

    return {
      file,
      name: file.name,
      url,
      cropRatio: cropRatio.value,
      crop: cropRatio.value === 'none'
        ? null
        : getCenteredCrop(naturalWidth, naturalHeight, cropRatio.value),
      naturalWidth,
      naturalHeight
    }
  }))

  files.value = next
  if (next.length === 1) {
    selectedIndex.value = 0
  }
}

function onCropRatioChange (ratio) {
  cropRatio.value = ratio
  files.value = files.value.map((item) => ({
    ...item,
    cropRatio: ratio,
    crop: ratio === 'none' || !item.naturalWidth || !item.naturalHeight
      ? null
      : getCenteredCrop(item.naturalWidth, item.naturalHeight, ratio)
  }))
}

function onCropUpdate ({ index, crop }) {
  if (index == null || !files.value[index]) { return }
  files.value = files.value.map((item, i) => (
    i === index ? { ...item, crop } : item
  ))
}

function onDimensions ({ index, width, height }) {
  if (index == null || !files.value[index]) { return }
  const item = files.value[index]
  if (item.naturalWidth === width && item.naturalHeight === height) { return }

  files.value = files.value.map((entry, i) => {
    if (i !== index) { return entry }
    const needsCrop = cropRatio.value !== 'none' && !entry.crop
    return {
      ...entry,
      naturalWidth: width,
      naturalHeight: height,
      crop: needsCrop
        ? getCenteredCrop(width, height, cropRatio.value)
        : entry.crop
    }
  })
}

function clearAll () {
  files.value.forEach((f) => {
    if (f.url) { URL.revokeObjectURL(f.url) }
    if (f.processedUrl) { URL.revokeObjectURL(f.processedUrl) }
  })
  files.value = []
  selectedIndex.value = null
  cropRatio.value = 'none'
}
</script>
