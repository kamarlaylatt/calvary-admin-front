<template>
  <div class="rich-text-editor">
    <v-card variant="outlined">
      <v-card-text class="pa-0">
        <div class="editor-toolbar">
          <v-btn
            size="small"
            variant="text"
            :class="{ 'text-primary': editor?.isActive('bold') }"
            @click="editor?.chain().focus().toggleBold().run()"
          >
            <v-icon>mdi-format-bold</v-icon>
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            :class="{ 'text-primary': editor?.isActive('italic') }"
            @click="editor?.chain().focus().toggleItalic().run()"
          >
            <v-icon>mdi-format-italic</v-icon>
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            :class="{ 'text-primary': editor?.isActive('heading', { level: 1 }) }"
            @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
          >
            H1
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            :class="{ 'text-primary': editor?.isActive('heading', { level: 2 }) }"
            @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
          >
            H2
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            :class="{ 'text-primary': editor?.isActive('bulletList') }"
            @click="editor?.chain().focus().toggleBulletList().run()"
          >
            <v-icon>mdi-format-list-bulleted</v-icon>
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            :class="{ 'text-primary': editor?.isActive('orderedList') }"
            @click="editor?.chain().focus().toggleOrderedList().run()"
          >
            <v-icon>mdi-format-list-numbered</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <div class="editor-content">
          <editor-content :editor="editor" />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue)
  }
})
</script>

<style scoped>
.rich-text-editor {
  width: 100%;
}

.editor-toolbar {
  display: flex;
  gap: 4px;
  padding: 8px;
  background-color: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-border-color));
}

.editor-content {
  min-height: 150px;
  padding: 16px;
}

:deep(.ProseMirror) {
  outline: none;
  min-height: 150px;
}

:deep(.ProseMirror h1) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.5em 0;
}

:deep(.ProseMirror h2) {
  font-size: 1.25em;
  font-weight: bold;
  margin: 0.5em 0;
}

:deep(.ProseMirror ul) {
  list-style-type: disc;
  margin-left: 1.5em;
}

:deep(.ProseMirror ol) {
  list-style-type: decimal;
  margin-left: 1.5em;
}

:deep(.ProseMirror li) {
  margin: 0.25em 0;
}

:deep(.ProseMirror p) {
  margin: 0.5em 0;
}
</style>