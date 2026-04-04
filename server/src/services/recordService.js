import * as recordModel from "../models/recordModel.js";

export const createRecord = async (data) => {
  return await recordModel.createRecord(data);
};

export const getRecords = async (userId, role) => {
  if (role >= 2) return await recordModel.getAllRecords();
  return await recordModel.getRecordsByUserId(userId);
};

export const getFilteredRecords = async (userId, role, filters) => {
  if (role >= 2) return await recordModel.getAllFilteredRecords(filters);
  return await recordModel.getFilteredRecords(userId, filters);
};

export const updateRecord = async (id, userId, role, data) => {
  if (role === 3) return await recordModel.updateRecordById(id, data);

  const record = await recordModel.getRecordById(id);
  if (!record) return null;
  if (record.user_id !== userId) throw new Error("Not authorized to update this record");

  return await recordModel.updateRecord(id, userId, data);
};

export const deleteRecord = async (id, userId, role) => {
  if (role === 3) return await recordModel.deleteRecordById(id);

  const record = await recordModel.getRecordById(id);
  if (!record) return null;
  if (record.user_id !== userId) throw new Error("Not authorized to delete this record");

  return await recordModel.deleteRecord(id, userId);
};
