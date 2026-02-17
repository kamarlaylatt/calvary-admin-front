<template>
    <v-container fluid class="pa-6">
        <div class="d-flex justify-space-between align-center mb-6">
            <div>
                <h1 class="text-h4 font-weight-bold mb-2">
                    {{ isEditing ? "Edit Song" : "Add New Song" }}
                </h1>
                <p class="text-subtitle-1 text-medium-emphasis">
                    {{
                        isEditing
                            ? "Update song details"
                            : "Create a new song entry"
                    }}
                </p>
            </div>
            <v-btn
                variant="outlined"
                prepend-icon="mdi-arrow-left"
                @click="goBack"
            >
                {{ backButtonText }}
            </v-btn>
        </div>

        <!-- Error Alert -->
        <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            closable
            class="mb-4"
            @click:close="error = ''"
        >
            {{ error }}
        </v-alert>

        <v-card elevation="2">
            <v-card-text>
                <div v-if="loading" class="text-center py-8">
                    <v-progress-circular indeterminate></v-progress-circular>
                    <div class="mt-2">Loading song...</div>
                </div>
                <v-form v-else @submit.prevent="saveSong">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="song.title"
                                label="Title"
                                variant="outlined"
                                required
                                :rules="[(v) => !!v || 'Title is required']"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="song.song_writer"
                                label="Song Writer"
                                variant="outlined"
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="song.style_id"
                                :items="styles"
                                item-title="name"
                                item-value="id"
                                label="Style"
                                variant="outlined"
                                clearable
                                :hint="'Optional'"
                                persistent-hint
                            ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="song.youtube"
                                label="YouTube URL"
                                variant="outlined"
                                placeholder="https://www.youtube.com/watch?v=..."
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="song.category_ids"
                                :items="categories"
                                item-title="name"
                                item-value="id"
                                label="Categories"
                                variant="outlined"
                                multiple
                                chips
                                clearable
                                hint="Select one or more categories for this song"
                                persistent-hint
                            ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="song.song_language_ids"
                                :items="songLanguages"
                                item-title="name"
                                item-value="id"
                                label="Song Languages"
                                variant="outlined"
                                multiple
                                chips
                                clearable
                                hint="Select one or more languages for this song"
                                persistent-hint
                            ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-rating
                                v-model="song.popular_rating"
                                label="Popular Rating"
                                color="amber"
                                hover
                                clearable
                            ></v-rating>
                            <v-label
                                class="text-caption text-medium-emphasis mt-1"
                            >
                                Rate the popularity of this song (1-5 stars)
                            </v-label>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <v-textarea
                                v-model="song.description"
                                label="Description"
                                variant="outlined"
                                rows="8"
                            ></v-textarea>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <v-label class="text-body-1 font-weight-medium mb-2"
                                >Lyrics</v-label
                            >
                            <RichTextEditor v-model="song.lyrics" />
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <v-textarea
                                v-model="song.lyrics"
                                label="Lyrics Simple Edit"
                                variant="outlined"
                                rows="3"
                            ></v-textarea>
                        </v-col>
                    </v-row>

                    

                    <v-row>
                        <v-col cols="12">
                            <v-label class="text-body-1 font-weight-medium mb-2"
                                >Music Notes</v-label
                            >
                            <RichTextEditor v-model="song.music_notes" />
                        </v-col>
                    </v-row>

                    <v-row class="mt-4">
                        <v-col cols="12">
                            <v-btn
                                type="submit"
                                color="primary"
                                size="large"
                                :loading="saving"
                            >
                                {{ isEditing ? "Update Song" : "Create Song" }}
                            </v-btn>
                            <v-btn
                                variant="outlined"
                                size="large"
                                class="ml-2"
                                @click="goBack"
                            >
                                Cancel
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import RichTextEditor from "../components/RichTextEditor.vue";
import apiService, {
    type Style,
    type Category,
    type SongLanguage,
    type CreateSongRequest,
    type UpdateSongRequest,
} from "@/services/api";

const route = useRoute();
const router = useRouter();

const saving = ref(false);
const loading = ref(false);
const error = ref("");
const isEditing = computed(() => !!route.params.id);

const backButtonText = computed(() => {
    return route.query.from === "hymns" ? "Back to Hymns" : "Back to Songs";
});

const song = reactive({
    id: null as number | null,
    title: "",
    song_writer: "",
    style_id: undefined as number | undefined,
    youtube: "",
    description: "",
    lyrics: "",
    music_notes: "",
    popular_rating: undefined as number | undefined,
    category_ids: [] as number[],
    song_language_ids: [] as number[],
});

const styles = ref<Style[]>([]);
const categories = ref<Category[]>([]);
const songLanguages = ref<SongLanguage[]>([]);

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

function goBack() {
    if (route.query.from === "hymns") {
        const query: Record<string, string> = {};
        if (route.query.page) {
            query.page = route.query.page as string;
        }
        router.push({ path: "/hymns", query });
    } else {
        router.push({ path: "/songs", query: { page: route.query.page } });
    }
}

onMounted(() => {
    fetchData();
    if (isEditing.value) {
        loadSong();
    }
});

async function fetchData() {
    try {
        const [stylesData, categoriesResponse, songLanguagesData] =
            await Promise.all([
                apiService.getStyles(),
                apiService.getCategories(1, ""), // Get first page with no search filter
                apiService.getSongLanguages(),
            ]);
        styles.value = stylesData;
        categories.value = categoriesResponse.data || [];
        songLanguages.value = songLanguagesData;
    } catch (err) {
        error.value = "Failed to load data. Please try again.";
        console.error("Error fetching data:", err);
    }
}

async function loadSong() {
    const songId = parseInt(route.params.id as string);
    if (isNaN(songId)) {
        router.push("/songs");
        return;
    }

    loading.value = true;
    error.value = "";

    try {
        const existingSong = await apiService.getSong(songId);
        Object.assign(song, {
            ...existingSong,
            style_id: existingSong.style_id ?? undefined,
            popular_rating: existingSong.popular_rating ?? undefined,
            category_ids:
                existingSong.categories?.map((c: Category) => c.id) || [],
            song_language_ids:
                existingSong.song_languages?.map((l: SongLanguage) => l.id) ||
                [],
        });
    } catch (err) {
        error.value = "Failed to load song. Please try again.";
        console.error("Error loading song:", err);
    } finally {
        loading.value = false;
    }
}

async function saveSong() {
    if (!song.title.trim()) {
        error.value = "Song title is required.";
        scrollToTop();
        return;
    }

    if (!song.style_id) {
        // Allow nullable style
    }

    saving.value = true;
    error.value = "";

    try {
        const songData: CreateSongRequest | UpdateSongRequest = {
            title: song.title,
            song_writer: song.song_writer,
            style_id: song.style_id ?? null,
            youtube: song.youtube,
            description: song.description,
            lyrics: song.lyrics,
            music_notes: song.music_notes,
            popular_rating: song.popular_rating,
            category_ids: song.category_ids,
            song_language_ids: song.song_language_ids,
        };

        if (isEditing.value && song.id) {
            // Update existing song
            await apiService.updateSong(song.id, songData as UpdateSongRequest);
        } else {
            // Create new song
            await apiService.createSong(songData as CreateSongRequest);
        }

        goBack();
    } catch (err: any) {
        error.value = err.message || "Failed to save song. Please try again.";
        scrollToTop();
        console.error("Error saving song:", err);
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
.v-label {
    display: block;
    margin-bottom: 8px;
}
</style>
