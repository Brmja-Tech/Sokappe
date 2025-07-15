// src/redux/helpers/crudToolkit.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import i18n from "../../i18n/i18n"; 

const BASE_URL = process.env.REACT_APP_BASE_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
  "Accept-Language": i18n.language,
});

// ✅ Factory to generate CRUD thunks (optionally with restore and deleted)
export const crudFactory = (resourceName, options = {}) => {
  const { withRestore = false, withDeleted = false } = options;

  const fetchAll = createAsyncThunk(
    `${resourceName}/fetchAll`,
    async (_, { rejectWithValue }) => {
      try {
        const res = await axios.get(`${BASE_URL}/${resourceName}`, {
          headers: getHeaders(),
        });
        return res.data.data;
      } catch (err) {
        return rejectWithValue(
          err.response?.data?.message || "Failed to load data"
        );
      }
    }
  );

  const create = createAsyncThunk(
    `${resourceName}/add`,
    async (formData, { rejectWithValue }) => {
      try {
        const res = await axios.post(
          `${BASE_URL}/${resourceName}`,
          formData,
          { headers: getHeaders() }
        );
        return res.data;
      } catch (err) {
        return rejectWithValue(
          err.response?.data?.message || "Failed to create"
        );
      }
    }
  );

  const getById = createAsyncThunk(
    `${resourceName}/record`,
    async (id, { rejectWithValue }) => {
      try {
        const res = await axios.get(`${BASE_URL}/${resourceName}/${id}`, {
          headers: getHeaders(),
        });
        return res.data;
      } catch (err) {
        return rejectWithValue(
          err.response?.data?.message || "Failed to get record"
        );
      }
    }
  );

  const update = createAsyncThunk(
    `${resourceName}/update`,
    async ({ id, formData }, { rejectWithValue }) => {
      try {
        const res = await axios.post(
          `${BASE_URL}/${resourceName}/${id}`,
          formData,
          { headers: getHeaders() }
        );
        return res.data;
      } catch (err) {
        return rejectWithValue(
          err.response?.data?.message || "Failed to update"
        );
      }
    }
  );

  const remove = createAsyncThunk(
    `${resourceName}/delete`,
    async (id, { rejectWithValue }) => {
      try {
        const res = await axios.delete(`${BASE_URL}/${resourceName}/${id}`, {
          headers: getHeaders(),
        });
        return { ...res.data, id };
      } catch (err) {
        return rejectWithValue(
          err.response?.data?.message || "Failed to delete"
        );
      }
    }
  );

  const restore = withRestore
    ? createAsyncThunk(
        `${resourceName}/restore`,
        async ({ id, formData }, { rejectWithValue }) => {
          try {
            const res = await axios.post(
              `${BASE_URL}/${resourceName}/${id}/restore`,
              formData,
              { headers: getHeaders() }
            );
            return res.data;
          } catch (error) {
            return rejectWithValue(
              error.response?.data?.message || "Restore failed"
            );
          }
        }
      )
    : undefined;

  const fetchDeleted = withDeleted
    ? createAsyncThunk(
        `${resourceName}/fetchDeleted`,
        async (_, { rejectWithValue }) => {
          try {
            const res = await axios.get(`${BASE_URL}/${resourceName}/delete`, {
              headers: getHeaders(),
            });
            return res.data.data;
          } catch (error) {
            return rejectWithValue(
              error.response?.data?.message || "Failed to load deleted data"
            );
          }
        }
      )
    : undefined;

  return {
    fetchAll,
    create,
    getById,
    update,
    remove,
    ...(withRestore && { restore }),
    ...(withDeleted && { fetchDeleted }),
  };
};

// ✅ Helper to auto-generate reducers for those thunks
export function addCrudExtraReducers(
  builder,
  { fetchAll, create, getById, update, remove, restore, fetchDeleted, key, idKey = "id" }
) {
  builder
    .addCase(fetchAll.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchAll.fulfilled, (state, action) => {
      state.isLoading = false;
      state[key] = action.payload;
    })
    .addCase(fetchAll.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    .addCase(create.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(create.fulfilled, (state, action) => {
      state.isLoading = false;
      state.success = action.payload.message;
    })
    .addCase(create.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    .addCase(getById.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(getById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.record = action.payload.data;
    })
    .addCase(getById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    .addCase(update.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(update.fulfilled, (state, action) => {
      state.isLoading = false;
      state.success = action.payload.message;
    })
    .addCase(update.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    .addCase(remove.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(remove.fulfilled, (state, action) => {
      state.isLoading = false;
      state[key] = state[key].filter(
        (item) => item[idKey] !== action.meta.arg
      );
      state.success = action.payload.message;
    })
    .addCase(remove.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

  if (restore) {
    builder
      .addCase(restore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restore.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
      })
      .addCase(restore.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }

  if (fetchDeleted) {
    builder
      .addCase(fetchDeleted.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDeleted.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deleted = action.payload;
      })
      .addCase(fetchDeleted.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
}
