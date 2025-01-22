<template>
  <q-page padding>
    <q-card flat bordered>
      <q-form @submit="createFolders">
        <q-card-section>
          <q-select
            :rules="[(val) => !!val || 'This is required.']"
            ref="proceduresRef"
            outlined
            label="Procedure"
            v-model="folderConfig.procedure"
            clearable
            :options="proceduresFiltered"
            use-input
            use-chips
            @new-value="addProcedure"
            @filter="proceduresFilterFn"
          >
            <template v-slot:option="{ opt, selected, toggleOption }">
              <q-item :active="selected">
                <q-item-section>
                  <q-item-label>
                    {{ opt }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>
                    <q-btn
                      label="Select"
                      color="primary"
                      class="q-mr-md"
                      v-if="!selected"
                      @click="toggleOption(opt)"
                    />
                    <q-btn label="Delete" color="negative" @click="remProcedure(opt)" />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
        <q-card-section>
          <q-select
            :rules="[(val) => !!val || 'This is required.']"
            ref="doctorsRef"
            outlined
            label="Doctor"
            v-model="folderConfig.doctor"
            clearable
            :options="doctorsFiltered"
            use-input
            use-chips
            @new-value="addDoctor"
            @filter="doctorsFilterFn"
          >
            <template v-slot:option="{ opt, selected, toggleOption }">
              <q-item :active="selected">
                <q-item-section>
                  <q-item-label>
                    {{ opt }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>
                    <q-btn
                      label="Select"
                      color="primary"
                      class="q-mr-md"
                      v-if="!selected"
                      @click="toggleOption(opt)"
                    />
                    <q-btn label="Delete" color="negative" @click="remDoctor(opt)" />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
        <q-card-section>
          <q-select
            :rules="[(val) => !!val || 'This is required.']"
            ref="patientsRef"
            outlined
            label="Patient"
            v-model="folderConfig.patient"
            clearable
            :options="patientsFiltered"
            use-input
            use-chips
            @new-value="addPatient"
            @filter="patientsFilterFn"
          >
            <template v-slot:option="{ opt, selected, toggleOption }">
              <q-item :active="selected">
                <q-item-section>
                  <q-item-label>
                    {{ opt }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>
                    <q-btn
                      label="Select"
                      color="primary"
                      class="q-mr-md"
                      v-if="!selected"
                      @click="toggleOption(opt)"
                    />
                    <q-btn label="Delete" color="negative" @click="remPatient(opt)" />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
        <q-card-section>
          <q-input :model-value="preview" outlined label="Preview" readonly />
        </q-card-section>
        <q-card-section class="row q-gutter-md items-start">
          <q-input
            :rules="[(val) => !!val || 'This is required.']"
            v-model="folderConfig.folder"
            outlined
            label="Folder"
            readonly
            class="col"
          />
          <q-btn @click="selectFolder" icon="folder" color="primary" padding="16px" />
        </q-card-section>
        <q-card-section v-if="newFolder">
          <q-banner class="bg-positive text-white" rounded inline-actions>
            {{ newFolder }}
            <template v-slot:action>
              <q-btn @click="copyFolderUrl" flat color="white" label="Copy" />
              <q-btn @click="newFolder = null" flat color="white" label="Dismiss" />
            </template>
          </q-banner>
        </q-card-section>
        <q-card-section>
          <q-btn label="Create Directory" color="primary" type="submit" />
        </q-card-section>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import { useQuasar, copyToClipboard } from 'quasar'

const { notify, loading } = useQuasar()

const folderConfig = ref({
  procedure: null,
  doctor: null,
  patient: null,
  folder: '',
})

const newFolder = ref(null)

const copyFolderUrl = async () => {
  await copyToClipboard(newFolder.value)
  notify({
    type: 'positive',
    message: 'Folder path copied.',
  })
}

const createFolders = async () => {
  try {
    loading.show()

    const newFolderPath = await window.fileSystem.createFolders(
      folderConfig.value.folder,
      preview.value,
      ['1_DICOM_Pre', '2_DICOM_Post', '3_Scan', '4_STL', '5_Documentation', '6_Final'],
    )

    newFolder.value = newFolderPath
  } catch (error) {
    notify({
      message: error.message,
      type: 'negative',
    })
  } finally {
    loading.hide()
  }
}

const selectFolder = async () => {
  const selectedFolder = await window.fileSystem.selectDirectory()
  if (selectedFolder) {
    folderConfig.value.folder = selectedFolder
    window.electronStore.set('default_folder', JSON.stringify({ path: selectedFolder }))
  }
}

const getDefaultFolder = async () => {
  const defaultFolder = await window.electronStore.get('default_folder')
  if (defaultFolder) folderConfig.value.folder = defaultFolder.path
}

getDefaultFolder()

const procedures = ref([])
const proceduresFiltered = ref([])
const proceduresRef = ref(null)

const doctors = ref([])
const doctorsFiltered = ref([])
const doctorsRef = ref(null)

const patients = ref([])
const patientsFiltered = ref([])
const patientsRef = ref(null)

const proceduresFilterFn = (val, update) => {
  if (val === '') {
    update(() => (proceduresFiltered.value = procedures.value))
    return
  }

  update(
    () =>
      (proceduresFiltered.value = procedures.value.filter(
        (procedure) => procedure.toLowerCase().indexOf(val.toLowerCase()) > -1,
      )),
  )
}

const doctorsFilterFn = (val, update) => {
  if (val === '') {
    update(() => (doctorsFiltered.value = doctors.value))
    return
  }

  update(
    () =>
      (doctorsFiltered.value = doctors.value.filter(
        (doctor) => doctor.toLowerCase().indexOf(val.toLowerCase()) > -1,
      )),
  )
}

const patientsFilterFn = (val, update) => {
  if (val === '') {
    update(() => (patientsFiltered.value = patients.value))
    return
  }

  update(
    () =>
      (patientsFiltered.value = patients.value.filter(
        (patient) => patient.toLowerCase().indexOf(val.toLowerCase()) > -1,
      )),
  )
}

watch(
  () => procedures.value,
  (newVal) => {
    window.electronStore.set('procedures', JSON.stringify(newVal))
    proceduresRef.value.updateInputValue('')
  },
  {
    deep: true,
  },
)

watch(
  () => doctors.value,
  (newVal) => {
    window.electronStore.set('doctors', JSON.stringify(newVal))
    doctorsRef.value.updateInputValue('')
  },
  {
    deep: true,
  },
)

watch(
  () => patients.value,
  (newVal) => {
    window.electronStore.set('patients', JSON.stringify(newVal))
    patientsRef.value.updateInputValue('')
  },
  {
    deep: true,
  },
)

const getProcedures = async () => {
  const _procedures = await window.electronStore.get('procedures')
  if (_procedures) procedures.value = _procedures
}

const remProcedure = (val) => {
  procedures.value = procedures.value.filter(
    (procedure) => procedure.toLowerCase() != val.toLowerCase(),
  )
  if (folderConfig.value.procedure?.toLowerCase() == val.toLowerCase())
    folderConfig.value.procedure = null
}

const addProcedure = (val, done) => {
  if (!procedures.value.find((procedure) => procedure.toLowerCase() === val.toLowerCase()))
    procedures.value = [...procedures.value, val]
  done(val, 'add-unique')
}

const getDoctors = async () => {
  const _doctors = await window.electronStore.get('doctors')
  if (_doctors) doctors.value = _doctors
}

const remDoctor = (val) => {
  doctors.value = doctors.value.filter((doctor) => doctor.toLowerCase() != val.toLowerCase())
  if (folderConfig.value.doctor?.toLowerCase() == val.toLowerCase())
    folderConfig.value.doctor = null
}

const addDoctor = (val, done) => {
  if (!doctors.value.find((doctor) => doctor.toLowerCase() === val.toLowerCase()))
    doctors.value = [...doctors.value, val]
  done(val, 'add-unique')
}

const getPatients = async () => {
  const _patients = await window.electronStore.get('patients')
  if (_patients) patients.value = _patients
}

const remPatient = (val) => {
  patients.value = patients.value.filter((patient) => patient.toLowerCase() != val.toLowerCase())
  if (folderConfig.value.patient?.toLowerCase() == val.toLowerCase())
    folderConfig.value.patient = null
}

const addPatient = (val, done) => {
  if (!patients.value.find((patient) => patient.toLowerCase() === val.toLowerCase()))
    patients.value = [...patients.value, val]
  done(val, 'add-unique')
}

getProcedures()
getDoctors()
getPatients()

const preview = computed(
  () =>
    `${folderConfig.value.procedure ?? 'Unassigned'} - ${folderConfig.value.doctor ?? 'Unassigned'} - ${folderConfig.value.patient ?? 'Unassigned'}`,
)
</script>
