<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">Music Editor</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Edit music details</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.push('/songs')">
        Back to Songs
      </v-btn>
    </div>

    <v-card elevation="2">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="8">
            <!-- Key and scale mapping -->
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-select label="Key" :items="KEYS" v-model="structure.data.key" density="comfortable"></v-select>
              </v-col>
              <v-col cols="12" md="8">
                <div>Scale mapping:</div>
                <div class="d-flex flex-wrap">
                  <v-chip v-for="deg in [1,2,3,4,5,6,7]" :key="deg" class="ma-1" color="primary" variant="tonal">
                    {{ deg }} = {{ degreeToNoteName(structure.data.key, deg) }}
                  </v-chip>
                </div>
              </v-col>
            </v-row>

            <!-- Section selection toolbar -->
            <v-card class="mb-4" variant="tonal">
              <v-card-text>
                <v-row class="align-center">
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="selectedSectionId"
                      :items="sectionSelectItems"
                      item-title="title"
                      item-value="value"
                      label="Select Section"
                      density="comfortable"
                      clearable
                    />
                  </v-col>
                  <v-col cols="12" md="6" class="d-flex justify-end">
                    <v-btn color="primary" prepend-icon="mdi-plus" variant="tonal" class="mr-2" @click="addSection">
                      Add Section
                    </v-btn>
                    <v-btn color="error" prepend-icon="mdi-delete" variant="text" :disabled="!selectedSection" @click="removeSelectedSection">
                      Remove Selected
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Selected section editor -->
            <v-alert v-if="!selectedSection" type="info" variant="tonal" density="comfortable" class="mb-4">
              <div class="d-flex align-center justify-space-between">
                <div>No section selected. Create or select a section to edit its bars.</div>
                <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addSection">
                  Add Section
                </v-btn>
              </div>
            </v-alert>
            <div v-else>
              <v-card class="mb-2">
                <v-card-title class="d-flex align-center">
                  <v-text-field
                    v-model="selectedSection.name"
                    label="Section name"
                    variant="underlined"
                    density="compact"
                    class="mr-4"
                  />
                  <div class="text-caption text-medium-emphasis mr-4">
                    {{ selectedSection.bars.length }} bar{{ selectedSection.bars.length === 1 ? '' : 's' }}
                  </div>
                  <v-spacer />
                  <v-btn color="primary" variant="tonal" size="small" @click="addBarForSelected">Add Bar</v-btn>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-alert v-if="selectedSection.bars.length === 0" type="warning" variant="tonal" density="comfortable" class="mb-3">
                    <div class="d-flex align-center justify-space-between">
                      <div>No bars in this section.</div>
                      <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addBarForSelected">
                        Add First Bar
                      </v-btn>
                    </div>
                  </v-alert>

                  <div v-else class="paper-line d-flex align-center flex-wrap">
                    <span class="barline">||</span>
                    <template v-for="(bar, bIdx) in selectedSection.bars" :key="bIdx">
                      <span
                        class="ts"
                        v-if="bIdx === 0 || !sameTimeSig(selectedSection.bars[bIdx - 1], bar)"
                        @click="openTsDialog(bar)"
                        title="Click to edit time signature"
                      >
                        ({{ bar.timeSignature[0] }}/{{ bar.timeSignature[1] }})
                      </span>
                      <span class="bar-content d-flex align-center flex-wrap">
                        <v-chip
                          v-for="(note, nIdx) in bar.notes"
                          :key="nIdx"
                          size="small"
                          variant="tonal"
                          class="ma-1"
                          @click="openNoteEditor(selectedSection, bar, note)"
                          title="Click to edit chord"
                        >
                          {{ renderChord(note.chord) }}
                        </v-chip>
                      </span>
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        class="ml-1"
                        :title="'Edit time signature of bar ' + (bIdx + 1)"
                        @click="openTsDialog(bar)"
                      >
                        <v-icon size="16">mdi-timer-outline</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        color="error"
                        class="ml-1"
                        :title="'Remove bar ' + (bIdx + 1)"
                        @click="removeBar(selectedSection, bIdx)"
                      >
                        <v-icon size="16">mdi-close</v-icon>
                      </v-btn>
                      <span class="bar-sep">|</span>
                    </template>
                    <span class="barline">|</span><span class="barline">|</span>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- Arrangement editor: allow duplicates and ordering -->
            <v-card class="mt-6">
              <v-card-title class="text-subtitle-1">Arrangement</v-card-title>
              <v-divider />
              <v-card-text>
                <div class="d-flex align-center mb-3">
                  <v-btn
                    size="small"
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-plus"
                    class="mr-2"
                    :disabled="!selectedSectionId"
                    @click="appendSelectedToArrangement"
                  >
                    Append Selected
                  </v-btn>
                  <v-btn size="small" variant="tonal" prepend-icon="mdi-playlist-plus" class="mr-2" @click="addArrangementStep">
                    Add Step
                  </v-btn>
                  <v-btn size="small" variant="text" color="error" prepend-icon="mdi-delete-sweep" @click="clearArrangement">
                    Clear
                  </v-btn>
                </div>

                <v-alert v-if="structure.data.arrangement.length === 0" type="info" variant="tonal" density="comfortable" class="mb-2">
                  <div class="d-flex align-center justify-space-between">
                    <div>Arrangement is empty.</div>
                    <div>
                      <v-btn
                        size="small"
                        variant="tonal"
                        color="primary"
                        class="mr-2"
                        :disabled="!selectedSectionId"
                        @click="appendSelectedToArrangement"
                        prepend-icon="mdi-plus"
                      >
                        Append Selected
                      </v-btn>
                      <v-btn size="small" variant="tonal" @click="addArrangementStep" prepend-icon="mdi-playlist-plus">
                        Add Step
                      </v-btn>
                    </div>
                  </div>
                </v-alert>

                <div v-for="(secId, idx) in structure.data.arrangement" :key="idx" class="d-flex align-center mb-2">
                  <div class="text-caption" style="width: 24px">{{ idx + 1 }}</div>
                  <v-select
                    v-model="structure.data.arrangement[idx]"
                    :items="sectionSelectItems"
                    item-title="title"
                    item-value="value"
                    label="Section"
                    density="compact"
                    style="max-width: 280px"
                    class="mr-2"
                    clearable
                  />
                  <v-btn icon size="small" variant="text" class="mr-1" :disabled="idx === 0" @click="moveArrangement(idx, -1)">
                    <v-icon>mdi-arrow-up</v-icon>
                  </v-btn>
                  <v-btn icon size="small" variant="text" class="mr-1" :disabled="idx === structure.data.arrangement.length - 1" @click="moveArrangement(idx, +1)">
                    <v-icon>mdi-arrow-down</v-icon>
                  </v-btn>
                  <v-btn icon size="small" color="error" variant="text" @click="removeArrangement(idx)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <v-card class="mt-6">
              <v-card-title class="text-subtitle-1">Arrangement Preview</v-card-title>
              <v-divider />
              <v-card-text>
                <div v-if="arrangementLines.length === 0" class="text-medium-emphasis">
                  No bars to preview. Ensure arrangement includes sections with bars.
                </div>
                <div v-else>
                  <div v-for="(line, idx) in arrangementLines" :key="idx" class="mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ line.title }}</div>
                    <div class="paper-line d-flex align-center flex-wrap">
                      <span class="barline">||</span>
                      <template v-for="(entry, bIdx) in line.bars" :key="bIdx">
                        <span v-if="entry.showTs" class="ts">({{ entry.bar.timeSignature[0] }}/{{ entry.bar.timeSignature[1] }})</span>
                        <span class="bar-content d-flex align-center flex-wrap">
                          <v-chip
                            v-for="(note, nIdx) in entry.bar.notes"
                            :key="nIdx"
                            size="small"
                            variant="tonal"
                            class="ma-1"
                          >
                            {{ renderChord(note.chord) }}
                          </v-chip>
                        </span>
                        <span class="bar-sep">|</span>
                      </template>
                      <span class="barline">|</span><span class="barline">|</span>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

          </v-col>

          <v-col cols="12" md="4">
            <v-card elevation="1" class="mb-4">
              <v-card-title class="text-subtitle-1">JSON Preview</v-card-title>
              <v-divider />
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-caption text-medium-emphasis">Structure JSON</div>
                  <v-btn size="x-small" variant="text" prepend-icon="mdi-content-copy" @click="copyJson">Copy</v-btn>
                </div>
                <pre class="text-body-2" style="max-height: 420px; overflow: auto">{{ jsonPreview }}</pre>
              </v-card-text>
            </v-card>

            <v-card elevation="1">
              <v-card-title class="text-subtitle-1">Nashville Numbers</v-card-title>
              <v-divider />
              <v-card-text>
                <div class="d-flex flex-wrap">
                  <v-chip v-for="deg in [1,2,3,4,5,6,7]" :key="deg" class="ma-1" variant="tonal">
                    {{ deg }} → {{ degreeToNoteName(structure.data.key, deg) }}
                  </v-chip>
                </div>
                <div class="mt-2 text-caption text-medium-emphasis">
                  Display updates when key changes. Example: Key E → 1 is E, 2 is F#.
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Note editor -->
    <v-dialog v-model="noteDialog.visible" max-width="480">
      <v-card>
        <v-card-title>Edit Chord</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <v-select
                label="Degree"
                :items="degreeDisplayItems"
                item-title="title"
                item-value="value"
                v-model="noteDialog.form.note"
                density="comfortable"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select label="Quality" :items="QUALITY_ITEMS" v-model="noteDialog.form.quality" density="comfortable" clearable></v-select>
            </v-col>
          </v-row>
          <div class="mt-2">
            <div class="text-caption text-medium-emphasis">Chord preview</div>
            <div class="text-subtitle-2">{{ renderChord(noteDialog.form) }}</div>
          </div>

          <v-divider class="my-3" />

          <v-text-field
            ref="quickInput"
            v-model="noteDialog.quick"
            label="Quick chord (e.g., Am, Cmaj7, Bb7, 6m)"
            variant="underlined"
            density="compact"
            clearable
            :hint="noteDialog.quickHint"
            persistent-hint
            append-inner-icon="mdi-check"
            @click:append-inner="applyQuick"
            @update:model-value="onQuickChange"
            @keyup.enter="applyQuick"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteNote">Delete</v-btn>
          <v-btn color="primary" @click="saveNote">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="tsDialog.visible" max-width="360">
      <v-card>
        <v-card-title>Time Signature</v-card-title>
        <v-card-text>
          <div class="d-flex align-center">
            <v-select
              :items="BEATS"
              v-model="tsDialog.beats"
              label="Beats"
              density="compact"
              style="max-width: 120px"
              class="mr-2"
            />
            <span class="mx-1">/</span>
            <v-select
              :items="DIVISIONS"
              v-model="tsDialog.unit"
              label="Unit"
              density="compact"
              style="max-width: 120px"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="tsDialog.visible = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveTs">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, nextTick } from 'vue'

type Quality =
  | 'maj' | 'min' | 'dim' | 'aug'
  | 'dom7' | 'maj7' | 'min7'
  | 'sus2' | 'sus4' | 'add9'

type Degree =
  | '-'
  | '1' | '1#' | '1b'
  | '2' | '2#' | '2b'
  | '3' | '3#' | '3b'
  | '4' | '4#' | '4b'
  | '5' | '5#' | '5b'
  | '6' | '6#' | '6b'
  | '7' | '7#' | '7b'

interface Chord {
  note: Degree
  quality?: Quality
}

interface NoteWrap {
  chord: Chord | Record<string, any>
}

interface Bar {
  timeSignature: [number, number]
  notes: NoteWrap[]
}

interface Section {
  id: number
  name: string
  bars: Bar[]
}

interface Structure {
  version: number
  data: {
    key: string
    arrangement: number[]
    sections: Section[]
  }
}

const fallback: Structure = {
  version: 0.1,
  data: {
    key: 'C',
    arrangement: [],
    sections: []
  }
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

const structure = reactive<Structure>(deepClone(fallback))
normalizeAllBars()

// Constants
const KEYS = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B']
const SEMITONES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]
const DEGREE_ITEMS: Degree[] = [
  '-',
  '1', '1#', '1b',
  '2', '2#', '2b',
  '3', '3#', '3b',
  '4', '4#', '4b',
  '5', '5#', '5b',
  '6', '6#', '6b',
  '7', '7#', '7b',
]
const QUALITY_ITEMS: Quality[] = ['maj','min','dim','aug','dom7','maj7','min7','sus2','sus4','add9']
const BEATS = [2,3,4,6,7,9,12]
const DIVISIONS = [2,4,8,16]

// Note name helpers for quick entry
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const FLAT_TO_SHARP: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' }

function normalizeNoteName(s: string): string | null {
  const t = s.trim()
  const m = t.match(/^([A-Ga-g])([#bB]?)/)
  if (!m) return null
  const base = m[1].toUpperCase()
  const acc = m[2] || ''
  const raw = base + (acc === 'B' ? 'b' : acc)
  const sharp = FLAT_TO_SHARP[raw] || raw
  return NOTE_NAMES.includes(sharp) ? sharp : null
}

function findDegreeForNoteName(key: string, noteName: string): Degree | null {
  for (const deg of DEGREE_ITEMS) {
    if (deg === '-') continue
    if (degreeToNoteName(key, deg) === noteName) return deg
  }
  return null
}

function canonicalSuffixFromQuality(q?: Quality): string {
  if (!q || q === 'maj') return ''
  switch (q) {
    case 'min': return 'min'
    case 'dim': return 'dim'
    case 'aug': return 'aug'
    case 'dom7': return '7'
    case 'maj7': return 'maj7'
    case 'min7': return 'min7'
    case 'sus2': return 'sus2'
    case 'sus4': return 'sus4'
    case 'add9': return 'add9'
    default: return String(q)
  }
}

function qualityFromRawSuffix(raw: string): Quality | undefined {
  const t = raw.trim()
  const tl = t.toLowerCase()
  if (t === '' || tl === 'maj') return undefined
  if (tl === 'm' || tl === 'min' || tl === 'minor') return 'min'
  if (tl === 'dim' || tl === 'o' || t === '°') return 'dim'
  if (tl === 'aug' || t === '+') return 'aug'
  if (tl === '7' || tl === 'dom7' || tl === 'dom') return 'dom7'
  if (tl === 'maj7' || t === 'M7' || t === 'Δ7' || tl === 'ma7') return 'maj7'
  if (tl === 'm7' || tl === 'min7' || tl === 'minor7') return 'min7'
  if (tl === 'sus2') return 'sus2'
  if (tl === 'sus4') return 'sus4'
  if (tl === 'add9') return 'add9'
  return undefined
}

function chordToCanonicalText(chord: Chord, key: string): string {
  const degree = chord.note
  if (degree === '-') return '-'
  const root = degreeToNoteName(key, degree)
  const suffix = canonicalSuffixFromQuality(chord.quality)
  return root + suffix
}

function parseQuickChord(input: string, key: string): { chord: Chord; text: string; degree?: Degree } | null {
  const s = input.trim()
  if (s === '' || s === '-') {
    return { chord: { note: '-' }, text: '-' }
  }
  // Support Nashville degree input like "6m"
  const mNum = s.match(/^([1-7])([#bB]?)\s*(.*)$/)
  if (mNum) {
    const base = mNum[1]
    const acc = mNum[2] || ''
    const deg = (base + acc) as Degree
    if (!DEGREE_ITEMS.includes(deg)) return null
    const qual = qualityFromRawSuffix(mNum[3] || '')
    const chord: Chord = { note: deg, quality: qual }
    const root = degreeToNoteName(key, deg)
    return { chord, text: root + canonicalSuffixFromQuality(qual), degree: deg }
  }
  // Absolute chord like "Bb7", "C#m7", "Am"
  const m = s.match(/^([A-Ga-g])([#bB]?)(.*)$/)
  if (!m) return null
  const root = normalizeNoteName((m[1] + (m[2] || '')).toUpperCase())
  if (!root) return null
  const qual = qualityFromRawSuffix(m[3] || '')
  const deg = findDegreeForNoteName(key, root)
  if (!deg) return null
  const chord: Chord = { note: deg, quality: qual }
  return { chord, text: root + canonicalSuffixFromQuality(qual), degree: deg }
}
 
const degreeDisplayItems = computed(() => {
  const items: { title: string; value: Degree }[] = [{ title: '-', value: '-' }]
  for (const deg of DEGREE_ITEMS) {
    if (deg === '-') continue
    items.push({ title: `${deg} = ${degreeToNoteName(structure.data.key, deg)}`, value: deg })
  }
  return items
})

// Helpers
function getChordDegree(chord: Partial<Chord> & Record<string, any>): Degree {
  const n = chord?.note as Degree | undefined
  if (n && (DEGREE_ITEMS as string[]).includes(n)) return n as Degree
  const name = chord?.name
  if (name === '-') return '-'
  return '-'
}

function degreeToNoteName(key: string, degree: Degree | number | undefined | null): string {
  if (degree == null || degree === '-') return '-'

  const keyName = normalizeNoteName(key)
  if (!keyName) return 'Invalid key'
  
  const tonic = SEMITONES.indexOf(keyName)
  if (tonic < 0) return String(degree)

  const degreeStr = String(degree)
  const match = degreeStr.match(/^([1-7])([#b]?)/)
  if (!match) return String(degree)

  const [, baseDegree, accidental] = match
  const degreeNum = parseInt(baseDegree, 10)

  if (isNaN(degreeNum) || degreeNum < 1 || degreeNum > 7) return String(degree)

  const scaleNoteIndex = (tonic + MAJOR_SCALE_INTERVALS[degreeNum - 1]) % 12
  
  let finalIndex = scaleNoteIndex
  if (accidental === '#') {
    finalIndex = (finalIndex + 1) % 12
  } else if (accidental === 'b') {
    finalIndex = (finalIndex - 1 + 12) % 12
  }

  return SEMITONES[finalIndex]
}

function renderChord(chord: Chord | Record<string, any>): string {
  const degree = getChordDegree(chord as any)
  const root = degreeToNoteName(structure.data.key, degree)
  if (root === '-') return '-'
  const qualMap: Record<string, string> = {
    maj: '',
    min: 'm',
    dim: 'dim',
    aug: 'aug',
    dom7: '7',
    maj7: 'maj7',
    min7: 'm7',
    sus2: 'sus2',
    sus4: 'sus4',
    add9: 'add9'
  }
  const q = (chord as any).quality as Quality | undefined
  const suffix = q ? (qualMap[q] ?? q) : ''
  return suffix ? `${root}${suffix}` : root
}

function sameTimeSig(a: Bar, b: Bar): boolean {
  return a.timeSignature[0] === b.timeSignature[0] && a.timeSignature[1] === b.timeSignature[1]
}

function ensureBarNotesLength(bar: Bar): void {
  const beats = bar.timeSignature[0]
  if (!Array.isArray(bar.notes)) bar.notes = []
  if (bar.notes.length > beats) {
    bar.notes = bar.notes.slice(0, beats)
  } else if (bar.notes.length < beats) {
    for (let i = bar.notes.length; i < beats; i++) {
      bar.notes.push({ chord: { note: '-' } })
    }
  }
}


function normalizeAllBars(): void {
  for (const sec of structure.data.sections) {
    for (const bar of sec.bars) {
      ensureBarNotesLength(bar)
    }
  }
}

function sameTimeSigTs(prev: [number, number] | null, curr: [number, number]): boolean {
  if (!prev) return true
  return prev[0] === curr[0] && prev[1] === curr[1]
}

const arrangementLines = computed(() => {
  const lines: { title: string; bars: { bar: Bar; showTs: boolean }[] }[] = []
  structure.data.arrangement.forEach((secId) => {
    const sec = structure.data.sections.find(s => s.id === secId)
    if (!sec) return
    let prev: [number, number] | null = null
    const bars = sec.bars.map((bar) => {
      ensureBarNotesLength(bar)
      const showTs = prev === null || !sameTimeSigTs(prev, bar.timeSignature)
      prev = bar.timeSignature
      return { bar, showTs }
    })
    lines.push({ title: `${sec.name} (#${sec.id})`, bars })
  })
  return lines
})

 
// Section selection and helpers
const selectedSectionId = ref<number | null>(null)
const sectionSelectItems = computed(() =>
  structure.data.sections.map(s => ({ title: `${s.name} (#${s.id})`, value: s.id }))
)
const selectedSection = computed<Section | undefined>(() => {
  const id = selectedSectionId.value
  return id == null ? undefined : structure.data.sections.find(s => s.id === id)
})

watch(
  () => structure.data.sections.length,
  (len) => {
    if (len > 0 && (selectedSectionId.value == null || !structure.data.sections.some(s => s.id === selectedSectionId.value))) {
      selectedSectionId.value = structure.data.sections[0].id
    }
    if (len === 0) selectedSectionId.value = null
  },
  { immediate: true }
)

function nextSectionId(): number {
  const ids = structure.data.sections.map(s => s.id)
  return ids.length ? Math.max(...ids) + 1 : 1
}

function addSection(): void {
  const newId = nextSectionId()
  structure.data.sections.push({
    id: newId,
    name: `Section ${structure.data.sections.length + 1}`,
    bars: []
  })
  selectedSectionId.value = newId
}

function removeSelectedSection(): void {
  if (selectedSectionId.value == null) return
  const idx = structure.data.sections.findIndex(s => s.id === selectedSectionId.value)
  if (idx >= 0) {
    const removed = structure.data.sections[idx]
    structure.data.sections.splice(idx, 1)
    // prune arrangement references to this section id
    structure.data.arrangement = structure.data.arrangement.filter(id => id !== removed.id)
  }
  // select next available
  selectedSectionId.value = structure.data.sections[0]?.id ?? null
}

function addBar(section: Section): void {
  // Default time signature follows previous bar, otherwise 4/4
  const last = section.bars[section.bars.length - 1]
  const beats = last ? last.timeSignature[0] : 4
  const unit = last ? last.timeSignature[1] : 4
  const bar: Bar = {
    timeSignature: [beats, unit],
    notes: []
  }
  ensureBarNotesLength(bar)
  section.bars.push(bar)
}

function addBarForSelected(): void {
  if (!selectedSection.value) return
  addBar(selectedSection.value)
}

function removeBar(section: Section, barIndex: number): void {
  section.bars.splice(barIndex, 1)
}


// Arrangement controls (allow duplicates)
function appendSelectedToArrangement(): void {
  if (selectedSectionId.value == null) return
  structure.data.arrangement.push(selectedSectionId.value)
}

function addArrangementStep(): void {
  // Add a step with the current selected or first available section id (or 0 if none)
  const fallbackId = structure.data.sections[0]?.id ?? 0
  structure.data.arrangement.push(selectedSectionId.value ?? fallbackId)
}

function removeArrangement(index: number): void {
  structure.data.arrangement.splice(index, 1)
}

function moveArrangement(index: number, delta: number): void {
  const newIndex = index + delta
  if (newIndex < 0 || newIndex >= structure.data.arrangement.length) return
  const arr = structure.data.arrangement
  const [item] = arr.splice(index, 1)
  arr.splice(newIndex, 0, item)
}

function clearArrangement(): void {
  structure.data.arrangement = []
}

// Note editor dialog state
const noteDialog = reactive<{
  visible: boolean
  section?: Section
  bar?: Bar
  noteRef?: NoteWrap
  form: Chord
  quick: string
  quickHint?: string
}>({
  visible: false,
  form: { note: '-' },
  quick: '',
  quickHint: ''
})
const quickInput = ref<any>(null)

function openNoteEditor(section: Section, bar: Bar, note: NoteWrap): void {
  noteDialog.section = section
  noteDialog.bar = bar
  noteDialog.noteRef = note
  const deg = getChordDegree(note.chord as any)
  noteDialog.form = {
    note: deg,
    quality: (note.chord as any).quality as Quality | undefined
  }
  noteDialog.quick = chordToCanonicalText(noteDialog.form, structure.data.key)
  noteDialog.quickHint = noteDialog.form.note === '-' ? 'Parsed: -' : `Parsed: ${noteDialog.quick} → degree ${noteDialog.form.note}`
  noteDialog.visible = true
  nextTick(() => {
    const inputEl = quickInput.value?.$el?.querySelector('input') as HTMLInputElement | undefined
    if (inputEl) {
      inputEl.focus()
      inputEl.select()
    }
  })
}

function saveNote(): void {
  if (noteDialog.noteRef) {
    noteDialog.noteRef.chord = noteDialog.noteRef.chord || ({} as any)
    ;(noteDialog.noteRef.chord as any).note = noteDialog.form.note
    ;(noteDialog.noteRef.chord as any).quality = noteDialog.form.quality
    if ('name' in (noteDialog.noteRef.chord as any)) {
      delete (noteDialog.noteRef.chord as any).name
    }
  }
  noteDialog.visible = false
}

function deleteNote(): void {
  const { bar, noteRef } = noteDialog
  if (bar && noteRef) {
    // Replace with "-" instead of removing to keep fixed beat slots
    ;(noteRef as any).chord = { note: '-' }
    ensureBarNotesLength(bar)
  }
  noteDialog.visible = false
}

function applyQuick(): void {
  const res = parseQuickChord(noteDialog.quick, structure.data.key)
  if (!res) {
    noteDialog.quickHint = 'Unrecognized chord'
    return
  }
  noteDialog.form.note = res.chord.note
  noteDialog.form.quality = res.chord.quality
  noteDialog.quick = res.text
  const deg = res.degree ?? getChordDegree(res.chord as any)
  noteDialog.quickHint = res.text === '-' ? 'Parsed: -' : `Parsed: ${res.text} → degree ${deg}`
  if (noteDialog.noteRef) {
    saveNote()
  }
}

const tsDialog = reactive<{
  visible: boolean
  bar?: Bar
  beats: number
  unit: number
}>({
  visible: false,
  bar: undefined,
  beats: 4,
  unit: 4
})

function openTsDialog(bar: Bar): void {
  tsDialog.bar = bar
  tsDialog.beats = bar.timeSignature[0]
  tsDialog.unit = bar.timeSignature[1]
  tsDialog.visible = true
}

function saveTs(): void {
  if (!tsDialog.bar) {
    tsDialog.visible = false
    return
  }
  tsDialog.bar.timeSignature = [tsDialog.beats, tsDialog.unit]
  ensureBarNotesLength(tsDialog.bar)
  tsDialog.visible = false
}
 
// JSON preview
const jsonPreview = computed(() => JSON.stringify(structure, null, 2))

async function copyJson(): Promise<void> {
  try {
    await navigator.clipboard.writeText(jsonPreview.value)
  } catch (err) {
    // ignore copy errors silently
  }
}
function onQuickChange(val: string): void {
  noteDialog.quick = val
  const res = parseQuickChord(val, structure.data.key)
  if (!res) {
    noteDialog.quickHint = 'Unrecognized chord'
    return
  }
  // Update form values
  noteDialog.form.note = res.chord.note
  noteDialog.form.quality = res.chord.quality

  // Live-apply directly to the current beat (no button/enter required)
  if (noteDialog.noteRef) {
    noteDialog.noteRef.chord = noteDialog.noteRef.chord || ({} as any)
    ;(noteDialog.noteRef.chord as any).note = noteDialog.form.note
    ;(noteDialog.noteRef.chord as any).quality = noteDialog.form.quality
    if ('name' in (noteDialog.noteRef.chord as any)) {
      delete (noteDialog.noteRef.chord as any).name
    }
  }

  // Update UI text
  const deg = res.degree ?? getChordDegree(res.chord as any)
  noteDialog.quick = res.text
  noteDialog.quickHint = res.text === '-' ? 'Parsed: -' : `Parsed: ${res.text} → degree ${deg}`
}

</script>

<style scoped>
.border {
  border: 1px solid rgba(100, 100, 100, 0.25);
}

.paper-line {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  padding: 10px 12px;
  border: 1px dashed rgba(100, 100, 100, 0.28);
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.paper-line .barline {
  font-weight: 600;
  margin: 0 6px;
}

.paper-line .bar-sep {
  margin: 0 6px;
  color: rgba(100, 100, 100, 0.7);
}

.paper-line .ts {
  color: rgba(60, 60, 60, 0.9);
  margin-right: 8px;
  cursor: pointer;
}

.paper-line .bar-content .v-chip {
  cursor: pointer;
}
</style>