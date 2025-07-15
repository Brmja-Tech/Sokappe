import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Async Thunk for fetching roles
export const fetchRoles = createAsyncThunk(
  "auth/fetchRoles",
  async (page = 1) => {
    const response = await axios.get(`${BASE_URL}/role?page=${page}`);
    return response.data;
  }
);
export const fetchManagements = createAsyncThunk(
  "companyManagement/fetchManagements",
  async () => {
    const response = await axios.get(`${BASE_URL}/company_managements`);
    return response.data.data;
  }
);

// Async Thunk for fetching permissions
export const fetchPermissions = createAsyncThunk(
  "auth/fetchPermissions",
  async (page = 1) => {
    const response = await axios.get(`${BASE_URL}/permissions?page=${page}`);
    return response.data;
  }
);

// Async Thunk for store role
export const store_role = createAsyncThunk(
  "auth/store_role",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/store_role`, userData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "An unknown error occurred";
      return rejectWithValue({ message });
    }
  }
);

// Async Thunk for get role record
export const getRoleRecord = createAsyncThunk(
  "auth/get_role_record",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/role/${id}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "An unknown error occurred";
      return rejectWithValue({ message });
    }
  }
);
// Async Thunk for update role
export const updateRole = createAsyncThunk(
  "auth/update_role",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/role/${id}`, userData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "An unknown error occurred";
      return rejectWithValue({ message });
    }
  }
);
// Async Thunk for deleting role
export const deleteRole = createAsyncThunk(
  "auth/deleteRole",
  async (roleId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${BASE_URL}/role/${roleId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete role";
      return rejectWithValue({ message });
    }
  }
);

// Async Thunk for user registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/register`, userData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "An unknown error occurred";
      return rejectWithValue({ message });
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed!";
      return rejectWithValue({ message });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    roles: [],
    permissions: [],
    managements: [],
    pagination: null,
    role: null,
    isLoading: false,
    error: null,
    success: null,
    updateSuccess: false,
    getRoleSuccess: false,
  },
  reducers: {
    clearState: (state) => {
      state.error = null;
      state.success = null;
      state.role = null;
      state.updateSuccess = false;
      state.getRoleSuccess = false;
    },
    logout: (state) => {
      state.user = null;

      localStorage.removeItem("userElwnsh");

    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = state.roles.filter((role) => role.id !== action.meta.arg); // إزالة الدور المحذوف
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(fetchManagements.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchManagements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.managements = action.payload;
      })
      .addCase(fetchManagements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        localStorage.setItem("userElwnsh", JSON.stringify(action.payload.data));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = action.payload.data;
        state.pagination = action.payload.pagination;
      })

      .addCase(fetchPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || "Failed to fetch permissions";
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(store_role.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(store_role.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
      })
      .addCase(store_role.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(getRoleRecord.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRoleRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.getRoleSuccess = true;
        state.role = action.payload.data;
      })
      .addCase(getRoleRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(updateRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        state.updateSuccess = true;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      });
  },
});

export const { clearState, logout } = authSlice.actions;
export default authSlice.reducer;
