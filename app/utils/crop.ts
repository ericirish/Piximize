export type CropRatio = 'none' | '3:2' | '16:9' | '1:1'

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export const CROP_RATIOS: { label: string, value: CropRatio, aspect: number | null }[] = [
  { label: 'None', value: 'none', aspect: null },
  { label: '3:2', value: '3:2', aspect: 3 / 2 },
  { label: '16:9', value: '16:9', aspect: 16 / 9 },
  { label: 'Square', value: '1:1', aspect: 1 }
]

export function getAspect (ratio: CropRatio): number | null {
  return CROP_RATIOS.find(r => r.value === ratio)?.aspect ?? null
}

export function getCenteredCrop (
  naturalW: number,
  naturalH: number,
  ratio: CropRatio
): CropRect | null {
  const aspect = getAspect(ratio)
  if (!aspect || !naturalW || !naturalH) { return null }

  let width = naturalW
  let height = width / aspect

  if (height > naturalH) {
    height = naturalH
    width = height * aspect
  }

  return {
    x: (naturalW - width) / 2,
    y: (naturalH - height) / 2,
    width,
    height
  }
}

export function clampCrop (
  crop: CropRect,
  naturalW: number,
  naturalH: number,
  ratio: CropRatio
): CropRect {
  const aspect = getAspect(ratio)
  if (!aspect || !naturalW || !naturalH) {
    return { x: 0, y: 0, width: naturalW, height: naturalH }
  }

  const minSize = Math.min(naturalW, naturalH, 40)
  let width = Math.max(minSize, Math.min(crop.width, naturalW))
  let height = width / aspect

  if (height > naturalH) {
    height = naturalH
    width = height * aspect
  }

  if (width < minSize) {
    width = minSize
    height = width / aspect
    if (height > naturalH) {
      height = Math.max(minSize, naturalH)
      width = height * aspect
    }
  }

  const x = Math.min(Math.max(0, crop.x), Math.max(0, naturalW - width))
  const y = Math.min(Math.max(0, crop.y), Math.max(0, naturalH - height))

  return { x, y, width, height }
}

export function loadImageDimensions (src: string): Promise<{ width: number, height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = reject
    img.src = src
  })
}

export async function cropImageToFile (
  file: File,
  crop: CropRect,
  fileName?: string
): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const width = Math.max(1, Math.round(crop.width))
  const height = Math.max(1, Math.round(crop.height))
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Could not get canvas context')
  }

  ctx.drawImage(
    bitmap,
    Math.round(crop.x),
    Math.round(crop.y),
    width,
    height,
    0,
    0,
    width,
    height
  )
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) { resolve(result) } else { reject(new Error('Crop failed')) }
    }, file.type || 'image/png')
  })

  return new File([blob], fileName || file.name, {
    type: blob.type,
    lastModified: Date.now()
  })
}

export function cropSignature (files: Array<{ crop?: CropRect | null }>): string {
  if (!Array.isArray(files)) { return '' }
  return files.map((f) => {
    const c = f.crop
    if (!c) { return 'none' }
    return [c.x, c.y, c.width, c.height].map(n => Math.round(n)).join(':')
  }).join('|')
}
