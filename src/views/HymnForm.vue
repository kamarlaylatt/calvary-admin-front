<template>
    <v-container fluid class="pa-6">
        <div class="d-flex justify-space-between align-center mb-6">
            <div>
                <h1 class="text-h4 font-weight-bold mb-2">
                    {{ isEditing ? "Edit Hymn" : "Add New Hymn" }}
                </h1>
                <p class="text-subtitle-1 text-medium-emphasis">
                    {{
                        isEditing ? "Update hymn details" : "Create a new hymn"
                    }}
                </p>
            </div>
            <v-btn
                variant="outlined"
                prepend-icon="mdi-arrow-left"
                @click="goBackToHymns"
            >
                Back to Hymns
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
                    <div class="mt-2">Loading hymn...</div>
                </div>
                <v-form v-else @submit.prevent="saveHymn">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="hymn.no"
                                label="Hymn Number"
                                variant="outlined"
                                type="number"
                                required
                                :rules="[
                                    (v) => !!v || 'Hymn number is required',
                                    (v) =>
                                        v > 0 || 'Hymn number must be positive',
                                ]"
                                hint="The unique hymn number"
                                persistent-hint
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model.number="hymn.reference_id"
                                label="Reference ID"
                                variant="outlined"
                                type="number"
                                hint="Optional reference ID"
                                persistent-hint
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="hymn.hymn_category_id"
                                :items="hymnCategories"
                                item-title="name"
                                item-value="id"
                                label="Hymn Category"
                                variant="outlined"
                                required
                                :rules="[
                                    (v) => !!v || 'Hymn category is required',
                                ]"
                                hint="Select the hymn category"
                                persistent-hint
                            ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="hymn.song_id"
                                :items="songs"
                                item-title="title"
                                item-value="id"
                                label="Associated Song (Optional)"
                                variant="outlined"
                                clearable
                                hint="Link to an existing song"
                                persistent-hint
                            ></v-select>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="hymn.english_title"
                                label="English Title"
                                variant="outlined"
                                hint="English title of the hymn"
                                persistent-hint
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12" class="d-flex justify-end ga-2">
                            <v-btn
                                variant="outlined"
                                @click="goBackToHymns"
                                :disabled="saving"
                            >
                                Cancel
                            </v-btn>
                            <v-btn
                                type="submit"
                                color="primary"
                                :loading="saving"
                            >
                                {{ isEditing ? "Update" : "Create" }} Hymn
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiService, {
    type CreateHymnRequest,
    type UpdateHymnRequest,
    type HymnCategory,
    type Song,
} from "@/services/api";

const route = useRoute();
const router = useRouter();

// Data
const loading = ref(false);
const saving = ref(false);
const error = ref("");

// Hymn form data
const hymn = ref<CreateHymnRequest>({
    no: 1,
    hymn_category_id: 0,
    song_id: undefined,
    reference_id: undefined,
    english_title: "",
});

// Dropdown data
const hymnCategories = ref<HymnCategory[]>([]);
const songs = ref<Song[]>([]);

// Computed
const isEditing = computed(() => route.params.id !== "new");
const hymnId = computed(() => {
    const id = route.params.id;
    return id && id !== "new" ? parseInt(id as string) : null;
});

// Lifecycle
onMounted(() => {
    fetchHymnCategories();
    fetchSongs();
    if (isEditing.value && hymnId.value) {
        fetchHymn(hymnId.value);
    }
});

// Methods
async function fetchHymnCategories() {
    try {
        hymnCategories.value = await apiService.getAllHymnCategories();
    } catch (err) {
        error.value = "Failed to load hymn categories. Please try again.";
        console.error("Error fetching hymn categories:", err);
    }
}

async function fetchSongs() {
    try {
        const response = await apiService.getSongs(
            1,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
        );
        songs.value = response.data;
    } catch (err) {
        error.value = "Failed to load songs. Please try again.";
        console.error("Error fetching songs:", err);
    }
}

async function fetchHymn(id: number) {
    loading.value = true;
    error.value = "";

    try {
        const data = await apiService.getHymn(id);
        hymn.value = {
            no: data.no,
            hymn_category_id: data.hymn_category_id,
            song_id: data.song_id || undefined,
            reference_id: data.reference_id || undefined,
            english_title: data.english_title || "",
        };
    } catch (err) {
        error.value =
            "Failed to load hymn. " +
            (err instanceof Error ? err.message : "Please try again.");
        console.error("Error fetching hymn:", err);
    } finally {
        loading.value = false;
    }
}

function goBackToHymns() {
    const query: Record<string, string> = {};
    if (route.query.page) {
        query.page = route.query.page as string;
    }
    router.push({ path: "/hymns", query });
}

async function saveHymn() {
    if (!hymn.value.no || hymn.value.no <= 0) {
        error.value = "Hymn number is required and must be positive.";
        return;
    }

    if (!hymn.value.hymn_category_id) {
        error.value = "Hymn category is required.";
        return;
    }

    saving.value = true;
    error.value = "";

    try {
        if (isEditing.value && hymnId.value) {
            // Update existing hymn
            const updateData: UpdateHymnRequest = {
                no: hymn.value.no,
                hymn_category_id: hymn.value.hymn_category_id,
                song_id: hymn.value.song_id,
                reference_id: hymn.value.reference_id,
                english_title: hymn.value.english_title || undefined,
            };
            await apiService.updateHymn(hymnId.value, updateData);
        } else {
            // Create new hymn
            await apiService.createHymn(hymn.value);
        }

        // Navigate back to hymns list
        goBackToHymns();
    } catch (err) {
        error.value =
            "Failed to save hymn. " +
            (err instanceof Error ? err.message : "Please try again.");
        console.error("Error saving hymn:", err);
    } finally {
        saving.value = false;
    }
}
</script>
