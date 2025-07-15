// src/redux/ExampleSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { crudFactory, addCrudExtraReducers } from "../helpers/CrudToolkit";
// Generate thunks for this resource
const {
  fetchAll,
  create,
  getById,
  update,
  remove,
  restore,
  fetchDeleted
} = crudFactory("example_state", {
  withRestore: true,
  withDeleted: true,
});
// Initial state
const initialState = {
  example_state: [],
  deleted: [],
  record: null,
  isLoading: false,
  error: null,
  success: null,
};
// Create slice
const ExampleSlice = createSlice({
  name: "example_state",
  initialState,
  reducers: {
    clearState: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    addCrudExtraReducers(builder, {
      fetchAll,
      create,
      getById,
      update,
      remove,
      restore,
      fetchDeleted,
      key: "example_state",
    });
  },
});
// Export
export const { clearState } = ExampleSlice.actions;
export {
  fetchAll as fetchExample,
  create as addExample,
  getById as ExampleRecord,
  update as updateRecord,
  remove as deleteRecord,
  restore as restoreRecord,
  fetchDeleted as fetchDeletedExample,
};
export default ExampleSlice.reducer;