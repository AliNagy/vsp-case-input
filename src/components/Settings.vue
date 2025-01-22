<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section> </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick" />
        <q-btn color="primary" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineOptions } from 'vue'

defineOptions({
  name: 'SettingsDialog',
})

import { useDialogPluginComponent } from 'quasar'

const configuration = ref({
  folder: '',
  structure: '{{doctor}} - {{patient}} - {{procedure}}',
})

const getConfiguration = async () => {
  const _configuration = await window.electronStore.get('configuration')
  if (_configuration) configuration.value = _configuration
}

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

function onOKClick() {
  onDialogOK()
}

getConfiguration()
</script>
