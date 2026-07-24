<template>
  <div
    class="w-full"
    :class="showFeatured ? 'flex h-full min-h-[min(70dvh,40rem)] flex-col' : ''"
  >
    <!-- Featured / crop editor -->
    <article
      v-if="showFeatured && featuredFile"
      class="pix-preview-item mx-auto flex h-full w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-2xl bg-white/50 shadow-[0_1px_0_rgba(15,23,42,0.04)] ring-1 ring-[var(--pix-line)]"
    >
      <div class="relative min-h-0 flex-1">
        <CropPreview
          v-if="isCropping"
          :src="featuredFile.url"
          :alt="displayName(featuredFile)"
          :ratio="cropRatio"
          :crop="featuredFile.crop"
          :natural-width="featuredFile.naturalWidth"
          :natural-height="featuredFile.naturalHeight"
          @update:crop="emitCrop"
          @dimensions="emitDimensions"
        />
        <img
          v-else
          :src="featuredFile.processedUrl || featuredFile.url"
          :alt="displayName(featuredFile)"
          class="absolute inset-0 size-full object-contain p-3 sm:p-5"
        >
      </div>

      <div class="flex items-center justify-between gap-4 border-t border-[var(--pix-line)] bg-white/70 px-5 py-4 backdrop-blur-md">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-[var(--pix-ink)]">
            {{ displayName(featuredFile) }}
          </p>
          <p
            v-if="isCropping"
            class="mt-0.5 text-xs text-[var(--pix-muted)]"
          >
            Drag to reposition · corners to resize
          </p>
          <p
            v-else-if="savings(featuredFile)"
            class="mt-0.5 text-xs font-medium text-[var(--pix-accent)]"
          >
            {{ savings(featuredFile) }} smaller
          </p>
        </div>

        <p
          v-if="featuredFile.newSize && !isCropping"
          class="shrink-0 rounded-lg bg-[var(--pix-accent-soft)] px-2.5 py-1 text-sm font-semibold tabular-nums text-[var(--pix-accent)]"
        >
          {{ formatSize(featuredFile.newSize) }}
        </p>
      </div>
    </article>

    <!-- Gallery for multiple images -->
    <div
      v-else-if="files?.length"
      class="grid gap-3 sm:gap-4"
      :style="galleryStyle"
    >
      <button
        v-for="(file, i) in files"
        :key="`${file.name}-${i}`"
        type="button"
        class="pix-preview-item group relative overflow-hidden rounded-2xl bg-white/50 text-left shadow-[0_1px_0_rgba(15,23,42,0.04)] ring-1 ring-[var(--pix-line)] transition-shadow hover:ring-[var(--pix-accent)]/50"
        :style="{ animationDelay: `${Math.min(i, 8) * 45}ms` }"
        @click="emit('select', i)"
      >
        <div class="relative aspect-square overflow-hidden bg-slate-100">
          <img
            :src="file.processedUrl || file.url"
            :alt="displayName(file)"
            class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          >

          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent p-3 pt-10 text-white">
            <div class="flex items-end justify-between gap-2">
              <p class="truncate text-xs font-medium">
                {{ displayName(file) }}
              </p>
              <p
                v-if="file.newSize"
                class="shrink-0 rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums backdrop-blur-sm"
              >
                {{ formatSize(file.newSize) }}
              </p>
            </div>

            <p
              v-if="savings(file)"
              class="mt-1 text-[11px] font-medium text-sky-200"
            >
              {{ savings(file) }} smaller
            </p>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  files: {
    type: Array,
    default: () => []
  },
  cropRatio: {
    type: String,
    default: 'none'
  },
  selectedIndex: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['select', 'update:crop', 'update:dimensions'])

const isSingle = computed(() => props.files?.length === 1)
const isCropping = computed(() => props.cropRatio !== 'none')
const showFeatured = computed(() => isSingle.value || props.selectedIndex !== null)
const featuredIndex = computed(() => {
  if (isSingle.value) { return 0 }
  return props.selectedIndex
})
const featuredFile = computed(() => {
  const i = featuredIndex.value
  return i == null ? null : props.files[i]
})

function emitCrop (crop) {
  emit('update:crop', { index: featuredIndex.value, crop })
}

function emitDimensions ({ width, height }) {
  emit('update:dimensions', { index: featuredIndex.value, width, height })
}

function formatSize (size) {
  if (typeof size !== 'number') { return '' }
  if (size < 1024) { return '1.0 kB' }
  const kb = size / 1024
  if (kb < 1000) { return `${kb.toFixed(1)} kB` }
  return `${(kb / 1024).toFixed(2)} MB`
}

function displayName (file) {
  return file.newBaseName || file.originalBaseName || file.name || 'Image'
}

function savings (file) {
  if (typeof file.originalSize !== 'number' || typeof file.newSize !== 'number') { return '' }
  if (!file.originalSize || file.newSize >= file.originalSize) { return '' }
  return `${Math.round(((file.originalSize - file.newSize) / file.originalSize) * 100)}%`
}

const galleryStyle = computed(() => {
  const count = props.files.length
  if (count <= 4) {
    return {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
    }
  }
  return {
    gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))'
  }
})
</script>
