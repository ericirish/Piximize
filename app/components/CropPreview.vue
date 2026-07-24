<template>
  <div
    ref="stageRef"
    class="relative size-full select-none touch-none overflow-hidden bg-slate-100/80"
  >
    <img
      ref="imgRef"
      :src="src"
      :alt="alt"
      class="pointer-events-none absolute object-contain"
      :style="imageStyle"
      draggable="false"
      @load="onImageLoad"
    >

    <template v-if="displayCrop && imageBox">
      <div
        class="pointer-events-none absolute bg-slate-950/45"
        :style="dimStyle('top')"
      />
      <div
        class="pointer-events-none absolute bg-slate-950/45"
        :style="dimStyle('bottom')"
      />
      <div
        class="pointer-events-none absolute bg-slate-950/45"
        :style="dimStyle('left')"
      />
      <div
        class="pointer-events-none absolute bg-slate-950/45"
        :style="dimStyle('right')"
      />

      <div
        class="absolute cursor-move border-2 border-[var(--pix-accent)] shadow-[0_0_0_1px_rgba(255,255,255,0.55)]"
        :style="{
          left: `${imageBox.left + displayCrop.left}px`,
          top: `${imageBox.top + displayCrop.top}px`,
          width: `${displayCrop.width}px`,
          height: `${displayCrop.height}px`
        }"
        @pointerdown.stop.prevent="startDrag($event, 'move')"
      >
        <span
          v-for="handle in handles"
          :key="handle"
          class="absolute size-3 rounded-sm border-2 border-white bg-[var(--pix-accent)]"
          :class="handleClass(handle)"
          @pointerdown.stop.prevent="startDrag($event, handle)"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { clampCrop, getAspect } from '~/utils/crop'

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: 'Crop preview' },
  ratio: { type: String, required: true },
  crop: { type: Object, default: null },
  naturalWidth: { type: Number, default: 0 },
  naturalHeight: { type: Number, default: 0 }
})

const emit = defineEmits(['update:crop', 'dimensions'])

const stageRef = ref(null)
const imgRef = ref(null)
const stageSize = ref({ width: 0, height: 0 })
const natural = ref({ width: props.naturalWidth, height: props.naturalHeight })
const handles = ['nw', 'ne', 'sw', 'se']

const imageBox = computed(() => {
  const nw = natural.value.width
  const nh = natural.value.height
  const sw = stageSize.value.width
  const sh = stageSize.value.height
  if (!nw || !nh || !sw || !sh) { return null }

  const scale = Math.min(sw / nw, sh / nh)
  const width = nw * scale
  const height = nh * scale
  return {
    left: (sw - width) / 2,
    top: (sh - height) / 2,
    width,
    height,
    scale
  }
})

const displayCrop = computed(() => {
  if (!props.crop || !imageBox.value) { return null }
  const s = imageBox.value.scale
  return {
    left: props.crop.x * s,
    top: props.crop.y * s,
    width: props.crop.width * s,
    height: props.crop.height * s
  }
})

const imageStyle = computed(() => {
  if (!imageBox.value) {
    return { inset: '0', margin: 'auto', maxWidth: '100%', maxHeight: '100%' }
  }
  return {
    left: `${imageBox.value.left}px`,
    top: `${imageBox.value.top}px`,
    width: `${imageBox.value.width}px`,
    height: `${imageBox.value.height}px`
  }
})

function dimStyle (side) {
  if (!imageBox.value || !displayCrop.value) { return {} }
  const box = imageBox.value
  const crop = displayCrop.value

  if (side === 'top') {
    return {
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${crop.top}px`
    }
  }
  if (side === 'bottom') {
    return {
      left: `${box.left}px`,
      top: `${box.top + crop.top + crop.height}px`,
      width: `${box.width}px`,
      height: `${Math.max(0, box.height - crop.top - crop.height)}px`
    }
  }
  if (side === 'left') {
    return {
      left: `${box.left}px`,
      top: `${box.top + crop.top}px`,
      width: `${crop.left}px`,
      height: `${crop.height}px`
    }
  }
  return {
    left: `${box.left + crop.left + crop.width}px`,
    top: `${box.top + crop.top}px`,
    width: `${Math.max(0, box.width - crop.left - crop.width)}px`,
    height: `${crop.height}px`
  }
}

function handleClass (handle) {
  return {
    nw: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
    ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
    sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
    se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize'
  }[handle]
}

function measureStage () {
  if (!stageRef.value) { return }
  const rect = stageRef.value.getBoundingClientRect()
  stageSize.value = { width: rect.width, height: rect.height }
}

function onImageLoad () {
  const img = imgRef.value
  if (!img) { return }
  natural.value = { width: img.naturalWidth, height: img.naturalHeight }
  emit('dimensions', { ...natural.value })
  measureStage()
}

let drag = null

function startDrag (event, mode) {
  if (!props.crop || !imageBox.value) { return }
  drag = {
    mode,
    startX: event.clientX,
    startY: event.clientY,
    origin: { ...props.crop }
  }
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove (event) {
  if (!drag || !imageBox.value) { return }
  const scale = imageBox.value.scale
  const dx = (event.clientX - drag.startX) / scale
  const dy = (event.clientY - drag.startY) / scale
  const aspect = getAspect(props.ratio)
  if (!aspect) { return }

  const o = drag.origin
  let next

  if (drag.mode === 'move') {
    next = {
      x: o.x + dx,
      y: o.y + dy,
      width: o.width,
      height: o.height
    }
  } else if (drag.mode === 'se') {
    const width = Math.max(40, o.width + dx)
    next = { x: o.x, y: o.y, width, height: width / aspect }
  } else if (drag.mode === 'sw') {
    const width = Math.max(40, o.width - dx)
    next = {
      x: o.x + o.width - width,
      y: o.y,
      width,
      height: width / aspect
    }
  } else if (drag.mode === 'ne') {
    const width = Math.max(40, o.width + dx)
    const height = width / aspect
    next = {
      x: o.x,
      y: o.y + o.height - height,
      width,
      height
    }
  } else {
    const width = Math.max(40, o.width - dx)
    const height = width / aspect
    next = {
      x: o.x + o.width - width,
      y: o.y + o.height - height,
      width,
      height
    }
  }

  emit('update:crop', clampCrop(
    next,
    natural.value.width,
    natural.value.height,
    props.ratio
  ))
}

function onPointerUp () {
  drag = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

let resizeObserver
onMounted(() => {
  measureStage()
  resizeObserver = new ResizeObserver(measureStage)
  if (stageRef.value) { resizeObserver.observe(stageRef.value) }
  window.addEventListener('resize', measureStage)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', measureStage)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})

watch(() => [props.naturalWidth, props.naturalHeight], ([w, h]) => {
  if (w && h) { natural.value = { width: w, height: h } }
})
</script>
