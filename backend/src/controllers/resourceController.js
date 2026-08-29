const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isValidName, isValidResourceStatus, isValidCapacity, isValidImageUrl } = require('../utils/validators');
const {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} = require('../database/resourceQueries');

function validateResourceInput({ name, category, location, capacity, status, image_url }) {
  if (!isValidName(name)) {
    throw new AppError('Resource name must be at least 2 characters', 400);
  }
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    throw new AppError('Category is required', 400);
  }
  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    throw new AppError('Location is required', 400);
  }
  if (!isValidCapacity(capacity)) {
    throw new AppError('Capacity must be a positive whole number', 400);
  }
  if (status !== undefined && !isValidResourceStatus(status)) {
    throw new AppError('Status must be AVAILABLE, UNAVAILABLE, or MAINTENANCE', 400);
  }
  if (!isValidImageUrl(image_url)) {
    throw new AppError('Image URL must start with http:// or https://', 400);
  }
}

const listResources = asyncHandler(async (req, res) => {
  const { search, category, status } = req.query;
  const resources = await getAllResources({ search, category, status });
  res.json({ success: true, message: 'Resources retrieved', data: resources });
});

const getResource = asyncHandler(async (req, res) => {
  const resource = await getResourceById(req.params.id);
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }
  res.json({ success: true, message: 'Resource retrieved', data: resource });
});

const addResource = asyncHandler(async (req, res) => {
  validateResourceInput(req.body);
  const resource = await createResource(req.body);
  res.status(201).json({ success: true, message: 'Resource created successfully', data: resource });
});

const editResource = asyncHandler(async (req, res) => {
  const existing = await getResourceById(req.params.id);
  if (!existing) {
    throw new AppError('Resource not found', 404);
  }
  validateResourceInput(req.body);
  const resource = await updateResource(req.params.id, req.body);
  res.json({ success: true, message: 'Resource updated successfully', data: resource });
});

const removeResource = asyncHandler(async (req, res) => {
  const existing = await getResourceById(req.params.id);
  if (!existing) {
    throw new AppError('Resource not found', 404);
  }

  try {
    await deleteResource(req.params.id);
  } catch (error) {
    if (error.code === '23503') {
      throw new AppError(
        'This resource has booking history and cannot be deleted. Set its status to UNAVAILABLE instead.',
        409
      );
    }
    throw error;
  }

  res.json({ success: true, message: 'Resource deleted successfully', data: {} });
});

module.exports = { listResources, getResource, addResource, editResource, removeResource };