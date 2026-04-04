import * as recordService from "../services/recordService.js";
import { createRecordSchema, updateRecordSchema } from "../validations/recordValidation.js";
import { formatRecordDates } from "../utils/formatDate.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createRecord = async (req, res) => {
  try {
    const { error } = createRecordSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[0].message);

    const record = await recordService.createRecord({ ...req.body, user_id: req.user.id });
    return successResponse(res, 201, "Record created successfully", formatRecordDates(record));
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getRecords = async (req, res) => {
  try {
    const records = await recordService.getRecords(req.user.id, req.user.role);
    return successResponse(res, 200, "Records fetched successfully", records.map(formatRecordDates));
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getFilteredRecords = async (req, res) => {
  try {
    const { category_id, type, startDate, endDate } = req.query;
    const records = await recordService.getFilteredRecords(req.user.id, req.user.role, { category_id, type, startDate, endDate });
    return successResponse(res, 200, "Filtered records fetched successfully", records.map(formatRecordDates));
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const updateRecord = async (req, res) => {
  try {
    const { error } = updateRecordSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[0].message);

    const record = await recordService.updateRecord(req.params.id, req.user.id, req.user.role, req.body);
    if (!record) return errorResponse(res, 404, "Record not found");
    return successResponse(res, 200, "Record updated successfully", formatRecordDates(record));
  } catch (err) {
    if (err.message === "Not authorized to update this record") {
      return errorResponse(res, 403, err.message);
    }
    return errorResponse(res, 500, err.message);
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const record = await recordService.deleteRecord(req.params.id, req.user.id, req.user.role);
    if (!record) return errorResponse(res, 404, "Record not found");
    return successResponse(res, 200, "Record deleted successfully");
  } catch (err) {
    if (err.message === "Not authorized to delete this record") {
      return errorResponse(res, 403, err.message);
    }
    return errorResponse(res, 500, err.message);
  }
};
