Music Structure JSON: Format and Preview Integration Guide

Purpose
- Define a simple, interoperable JSON format for chord-chart style song structures using Nashville Numbers.
- Enable other applications to load the JSON and render a bar-by-bar preview consistently (time signatures, sections, chords).
- Source of truth implementation: [src/views/MusicEditor.vue](src/views/MusicEditor.vue)

Versioning
- version: SemVer-like number indicating schema version. Current: 0.1
- Consumers SHOULD validate version and handle known versions gracefully (reject, warn, or migrate).

Top-level Schema
- Root object:
  - version: number
  - data: object
    - key: string (one of the 12-TET sharps: C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
    - arrangement: number[] (list of section ids indicating play order; duplicates allowed)
    - sections: Section[] (catalog of sections that can be referenced by arrangement)

Types (as implemented in the editor)
- Type references to implementation for clarity:
  - [ts.Structure()](src/views/MusicEditor.vue:385)
  - [ts.Section()](src/views/MusicEditor.vue:379)
  - [ts.Bar()](src/views/MusicEditor.vue:374)
  - [ts.NoteWrap()](src/views/MusicEditor.vue:370)
  - [ts.Chord()](src/views/MusicEditor.vue:365)
  - [ts.Degree()](src/views/MusicEditor.vue:363)
  - [ts.Quality()](src/views/MusicEditor.vue:358)

Field Details

1) data.key
- Required.
- One of:
  - [ts.KEYS()](src/views/MusicEditor.vue:411)
- Used to convert Nashville degree numbers to concrete note names:
  - [ts.degreeToNoteName()](src/views/MusicEditor.vue:436)
  - Major scale semitone offsets: [ts.MAJOR_SCALE()](src/views/MusicEditor.vue:413)

2) data.sections
- Array of Section objects:
  - id: number (unique within this document; referenced by arrangement)
  - name: string (human-readable section name)
  - bars: Bar[] (ordered sequence of bars inside this section)
- Sections define reusable segments (e.g., Verse, Chorus) that can be sequenced via arrangement.

3) Section.bars (Bar)
- timeSignature: [number, number] (e.g., [4,4], [6,8])
  - Valid upper values recommended: [ts.BEATS()](src/views/MusicEditor.vue:416)
  - Valid lower values recommended: [ts.DIVISIONS()](src/views/MusicEditor.vue:417)
- notes: NoteWrap[]
  - IMPORTANT: The length of notes MUST equal the numerator (beats) of timeSignature.
  - The editor normalizes this rule:
    - [ts.ensureBarNotesLength()](src/views/MusicEditor.vue:472)
    - [ts.normalizeAllBars()](src/views/MusicEditor.vue:485)

4) NoteWrap and Chord
- NoteWrap object:
  - chord: Chord | object
- Chord object:
  - note: Degree (one of '-', '1'..'7')
  - quality?: Quality
- Degree values: ['-', '1', '2', '3', '4', '5', '6', '7']
  - See [ts.Degree()](src/views/MusicEditor.vue:363)
  - '-' represents a rest/hold/no chord for that beat slot.
- Quality values (optional):
  - [ts.QUALITY_ITEMS()](src/views/MusicEditor.vue:415)
  - Render mapping (see below) comes from [ts.renderChord()](src/views/MusicEditor.vue:447)

Arrangement Semantics
- data.arrangement: number[] of Section ids
  - Defines the performance order by reference to sections.
  - Sections can repeat as needed by repeating their ids in the array.
  - Example: [1, 1, 2, 1] means: Section#1, Section#1 again, Section#2, then Section#1 again.

Rendering Rules (Preview)

1) Nashville Number Conversion
- Use [ts.degreeToNoteName()](src/views/MusicEditor.vue:436) to map Degree (1..7) to concrete note names in data.key.
- If note is '-', render '-' (rest/hold).

2) Chord Quality Suffix Mapping
- Render with [ts.renderChord()](src/views/MusicEditor.vue:447), which applies:
  - maj → '' (no suffix)
  - min → 'm'
  - dim → 'dim'
  - aug → 'aug'
  - dom7 → '7'
  - maj7 → 'maj7'
  - min7 → 'm7'
  - sus2 → 'sus2'
  - sus4 → 'sus4'
  - add9 → 'add9'
- Examples in key C:
  - note: '1', quality: 'maj' → 'C'
  - note: '6', quality: 'min' → 'Am'
  - note: '-' → '-'

3) Time Signature Display
- Show time signature (beats/unit) at the beginning of a section or whenever it changes compared to previous bar:
  - Logic reference: [ts.arrangementLines()](src/views/MusicEditor.vue:498)
  - Same-time-signature detection: [ts.sameTimeSig()](src/views/MusicEditor.vue:468)
- Practical behavior:
  - For the first bar of each contiguous segment (or when time signature changes), display (N/D) before the bar.

4) Bar Layout and Separators
- Prefix start of a line with double barline "||".
- Between each bar, display a single bar separator "|".
- End with "||" to close the line.
- Each bar contains beats count equal to its numerator with visual tokens for each NoteWrap (e.g., chips, text cells).

5) Notes Array Rule
- The number of notes displayed per bar equals the numerator of the time signature (e.g., 4 for 4/4).
- If the source JSON does not strictly match, normalize it as the editor does:
  - [ts.ensureBarNotesLength()](src/views/MusicEditor.vue:472)

Recommended Rendering Algorithm (High Level)
- For each section id in data.arrangement:
  - Resolve section by id in data.sections.
  - Initialize prevTs = null.
  - For each bar in section.bars:
    - Normalize note count to beats: [ts.ensureBarNotesLength()](src/views/MusicEditor.vue:472)
    - If prevTs is null or different from bar.timeSignature:
      - Render time signature before this bar as "(beats/unit)".
    - For note in bar.notes:
      - Compute label:
        - If note.chord.note == '-' → '-'
        - Else:
          - root = [ts.degreeToNoteName()](src/views/MusicEditor.vue:436)
          - suffix via [ts.renderChord()](src/views/MusicEditor.vue:447)
      - Render chip/cell text as root+suffix or '-'.
    - Render bar separator "|".
    - Update prevTs = bar.timeSignature.
- This is equivalent to what the editor composes into preview lines:
  - [ts.arrangementLines()](src/views/MusicEditor.vue:498)

Validation and Interop Checklist
- version is recognized (e.g., == 0.1).
- key is one of [ts.KEYS()](src/views/MusicEditor.vue:411).
- All section ids referenced by arrangement exist in data.sections.
- Each Section:
  - id is unique.
  - name is non-empty.
  - bars is an array.
- Each Bar:
  - timeSignature is a 2-item array of positive integers.
  - notes length equals timeSignature[0] (beats).
- Each NoteWrap:
  - chord exists.
  - chord.note is in ['-','1','2','3','4','5','6','7'].
  - chord.quality (if present) is one of [ts.QUALITY_ITEMS()](src/views/MusicEditor.vue:415).
- Optional normalization step:
  - Apply [ts.normalizeAllBars()](src/views/MusicEditor.vue:485) or implement the same rule client-side.

Example Data
- See the canonical example file in this repository:
  - [notes_structure.json](notes_structure.json)
- This file demonstrates:
  - key: 'C'
  - two sections (ids 1 and 2)
  - bars with 4/4 time signature
  - notes using '1', '4', '6' with qualities and '-' placeholders
  - arrangement referencing sections by id

Extensibility Guidance
- Consumers may attach additional metadata to chords (e.g., inversion, bass note, lyric syllable) by extending the chord object, as long as:
  - chord.note and chord.quality semantics remain intact for rendering basic previews.
  - Unknown fields are ignored by simple preview renderers.
- Time signatures beyond the recommended sets can be supported if both producer and consumer agree on the meaning (beats as numerator, unit as denominator).

Interoperability Notes
- Degree parsing helper (robust to unknown shapes): [ts.getChordDegree()](src/views/MusicEditor.vue:428)
- When migrating from name-based chords to degree-based Nashville numbers, ensure to map names to the correct degree in the current key before serialization.
- Rendering libraries should treat '-' as a stable, visual hold/rest symbol and should not collapse beats.

Reference Implementation Index
- Data types: [ts.Quality()](src/views/MusicEditor.vue:358), [ts.Degree()](src/views/MusicEditor.vue:363), [ts.Chord()](src/views/MusicEditor.vue:365), [ts.NoteWrap()](src/views/MusicEditor.vue:370), [ts.Bar()](src/views/MusicEditor.vue:374), [ts.Section()](src/views/MusicEditor.vue:379), [ts.Structure()](src/views/MusicEditor.vue:385)
- Constants: [ts.KEYS()](src/views/MusicEditor.vue:411), [ts.MAJOR_SCALE()](src/views/MusicEditor.vue:413), [ts.DEGREE_ITEMS()](src/views/MusicEditor.vue:414), [ts.QUALITY_ITEMS()](src/views/MusicEditor.vue:415), [ts.BEATS()](src/views/MusicEditor.vue:416), [ts.DIVISIONS()](src/views/MusicEditor.vue:417)
- Core helpers: [ts.degreeToNoteName()](src/views/MusicEditor.vue:436), [ts.renderChord()](src/views/MusicEditor.vue:447), [ts.getChordDegree()](src/views/MusicEditor.vue:428), [ts.ensureBarNotesLength()](src/views/MusicEditor.vue:472), [ts.normalizeAllBars()](src/views/MusicEditor.vue:485)
- Preview composition: [ts.arrangementLines()](src/views/MusicEditor.vue:498)

Minimal Consumer Implementation Steps
- Parse JSON, validate version and keys.
- Index sections by id.
- For each id in arrangement:
  - Fetch section, iterate bars.
  - Enforce notes length = beats (or trust producer).
  - For each NoteWrap:
    - If note == '-', render '-'.
    - Else, map degree to note name in data.key via [ts.degreeToNoteName()](src/views/MusicEditor.vue:436), then apply quality suffix from [ts.renderChord()](src/views/MusicEditor.vue:447).
  - Show time signature at the first bar and on changes.
- Render bar separators and double barlines as described.

FAQ
- Q: How to handle missing or invalid section ids in arrangement?
  - A: Skip unknown ids and optionally warn. Do not crash preview.
- Q: How to display non-4/4 bars?
  - A: Use the beats count to decide the number of beat slots; show the (beats/unit) label when it starts or changes.
- Q: Can I remove '-' beats to compress layout?
  - A: Not recommended. '-' is a meaningful per-beat placeholder; removing can desynchronize the beat grid across bars.

Document Change Log
- v0.1 (matches schema version 0.1): Initial publication aligned with [src/views/MusicEditor.vue](src/views/MusicEditor.vue)