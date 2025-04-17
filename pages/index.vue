<template lang="pug">
v-container(
  fluid
)
  //- Permanent navigation drawer for optimization options
  v-row.h-screen(
    align="center"
  )
    v-col.h-100
      //- Show preview grid if files exist, else show DropZone
      template(v-if="files.length > 0")
        OptimizeDrawer(:files="files")
        PreviewGrid(:files="files")
      template(v-else)
        DropZone(@files-dropped="onFilesDropped")
</template>

<script setup>
const files = ref([])

function onFilesDropped (droppedFiles) {
  files.value = Array.from(droppedFiles).map(file => ({
    file,
    name: file.name,
    url: URL.createObjectURL(file)
  }))
}
</script>

<style lang="scss">
// No additional styles needed here; DropZone and PreviewGrid are styled in their own files.
</style>
