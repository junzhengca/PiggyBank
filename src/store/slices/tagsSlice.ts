import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Tag, TagFormData } from '@/types';
import { tagsService } from '@/db/services/tagsService';
import { serializeDates, deserializeDates } from '@/lib/utils';
import type { RootState } from '../index';

interface TagsState {
  tags: any[]; // Serialized tags with date strings
  loading: boolean;
  error: string | null;
}

const initialState: TagsState = {
  tags: [],
  loading: false,
  error: null,
};

export const fetchTags = createAsyncThunk(
  'tags/fetchAll',
  async () => {
    const tags = await tagsService.getAll();
    return serializeDates(tags);
  }
);

export const createTag = createAsyncThunk(
  'tags/create',
  async (data: TagFormData) => {
    const tag = await tagsService.create(data);
    return serializeDates(tag);
  }
);

export const updateTag = createAsyncThunk(
  'tags/update',
  async ({ id, data }: { id: string; data: Partial<TagFormData> }) => {
    const tag = await tagsService.update(id, data);
    return tag ? serializeDates(tag) : undefined;
  }
);

export const deleteTag = createAsyncThunk(
  'tags/delete',
  async (id: string) => {
    await tagsService.delete(id);
    return id;
  }
);

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch tags
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tags';
      })
      // Create tag
      .addCase(createTag.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags.push(action.payload);
      })
      .addCase(createTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create tag';
      })
      // Update tag
      .addCase(updateTag.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.tags.findIndex((t) => t.id === action.payload!.id);
          if (index !== -1) {
            state.tags[index] = action.payload;
          }
        }
      })
      // Delete tag
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tags = state.tags.filter((t) => t.id !== action.payload);
      });
  },
});

// Selectors with date deserialization
export const selectTags = (state: RootState): Tag[] => {
  return deserializeDates(state.tags.tags);
};

export default tagsSlice.reducer;
