<template>
  <div
    class="pix-drop group relative flex min-h-[22rem] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--pix-line)] bg-white/55 px-6 py-16 backdrop-blur-md sm:min-h-[26rem]"
    :class="{ 'is-active': isDragOver }"
    role="button"
    tabindex="0"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    @click="openPicker"
    @keydown.enter.prevent="openPicker"
    @keydown.space.prevent="openPicker"
  >
    <input
      ref="inputRef"
      type="file"
      class="sr-only"
      accept="image/*"
      multiple
      @change="onPick"
    >

    <div class="pointer-events-none flex flex-col items-center">
      <div class="mb-6 flex size-16 items-center justify-center rounded-2xl bg-[var(--pix-accent-soft)] text-[var(--pix-accent)] transition-transform duration-300 group-hover:scale-105">
        <UIcon
          name="i-lucide-image-up"
          class="size-7"
        />
      </div>

      <p class="text-lg font-semibold tracking-tight text-[var(--pix-ink)] sm:text-xl">
        Drop images here
      </p>
      <p class="mt-2 text-sm text-[var(--pix-muted)]">
        or click to browse · PNG, JPG, WebP, GIF
      </p>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['files-dropped'])

const isDragOver = ref(false)
const inputRef = ref(null)

function openPicker () {
  inputRef.value?.click()
}

function onDragOver () {
  isDragOver.value = true
}

function onDragLeave () {
  isDragOver.value = false
}

function emitImages (fileList) {
  const images = Array.from(fileList || []).filter(f => f.type.startsWith('image/'))
  if (images.length) {
    emit('files-dropped', images)
  }
}

function onDrop (e) {
  isDragOver.value = false
  emitImages(e.dataTransfer?.files)
}

function onPick (e) {
  emitImages(e.target.files)
  e.target.value = ''
}
</script>
