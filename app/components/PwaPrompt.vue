<script setup lang="ts">
const { $pwa } = useNuxtApp()
const toast = useToast()

const offlineToastId = 'pwa-offline-ready'
const refreshToastId = 'pwa-need-refresh'
const installToastId = 'pwa-install'

watch(
  () => $pwa?.offlineReady,
  (ready) => {
    if (!ready) return

    toast.add({
      id: offlineToastId,
      title: 'Ready offline',
      description: 'Piximize can work without a network connection.',
      icon: 'i-lucide-wifi',
      color: 'success',
      duration: 5000,
      close: {
        onClick: () => {
          $pwa?.closePrompt()
        }
      }
    })
  },
  { immediate: true }
)

watch(
  () => $pwa?.needRefresh,
  (needsRefresh) => {
    if (!needsRefresh) return

    toast.add({
      id: refreshToastId,
      title: 'Update available',
      description: 'A new version of Piximize is ready.',
      icon: 'i-lucide-refresh-cw',
      color: 'info',
      duration: 0,
      actions: [{
        label: 'Reload',
        color: 'primary',
        variant: 'solid',
        onClick: () => {
          $pwa?.updateServiceWorker()
        }
      }],
      close: {
        onClick: () => {
          $pwa?.closePrompt()
        }
      }
    })
  },
  { immediate: true }
)

watch(
  () => $pwa?.showInstallPrompt,
  (show) => {
    if (!show || $pwa?.isPWAInstalled) return

    toast.add({
      id: installToastId,
      title: 'Install Piximize',
      description: 'Add it to your home screen for quicker access.',
      icon: 'i-lucide-download',
      color: 'neutral',
      duration: 0,
      actions: [{
        label: 'Install',
        color: 'primary',
        variant: 'solid',
        onClick: () => {
          $pwa?.install()
        }
      }],
      close: {
        onClick: () => {
          $pwa?.cancelInstall()
        }
      }
    })
  },
  { immediate: true }
)
</script>

<template>
  <span class="hidden" aria-hidden="true" />
</template>
