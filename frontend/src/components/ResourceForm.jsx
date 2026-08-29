import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import FormField from './FormField';
import Select from './Select';
import Button from './Button';

const CATEGORIES = ['Computer Lab', 'Seminar Hall', 'Meeting Room', 'Equipment'];
const STATUSES = ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'];

function ResourceForm({ initialValues, onSubmit, submitting, submitLabel }) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [previewBroken, setPreviewBroken] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'image_url') setPreviewBroken(false);
  }

  function validate() {
    const newErrors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.location || formData.location.trim().length === 0) {
      newErrors.location = 'Location is required';
    }
    if (formData.capacity && (isNaN(formData.capacity) || Number(formData.capacity) <= 0)) {
      newErrors.capacity = 'Capacity must be a positive number';
    }
    if (formData.image_url && !/^https?:\/\/.+/i.test(formData.image_url.trim())) {
      newErrors.image_url = 'Must be a valid URL starting with http:// or https://';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      capacity: formData.capacity ? Number(formData.capacity) : null,
      image_url: formData.image_url ? formData.image_url.trim() : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormField label="Name" id="name" error={errors.name}>
        <input id="name" name="name" value={formData.name} onChange={handleChange} className="input-field" />
      </FormField>

      <FormField label="Category" id="category" error={errors.category}>
        <Select id="category" name="category" value={formData.category} onChange={handleChange}>
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Description" id="description">
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="input-field"
        />
      </FormField>

      <FormField label="Location" id="location" error={errors.location}>
        <input id="location" name="location" value={formData.location} onChange={handleChange} className="input-field" />
      </FormField>

      <FormField label="Image URL (optional)" id="image_url" error={errors.image_url}>
        <input
          id="image_url"
          name="image_url"
          type="text"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://example.com/photo.jpg"
          className="input-field"
        />
      </FormField>

      {formData.image_url && !previewBroken && (
        <img
          src={formData.image_url}
          onError={() => setPreviewBroken(true)}
          alt="Preview"
          className="h-32 w-full rounded-input border border-border object-cover"
        />
      )}
      {formData.image_url && previewBroken && (
        <p className="flex items-center gap-1.5 text-xs text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          This image URL doesn't seem to load — it'll still save, but double-check the link.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Capacity (optional)" id="capacity" error={errors.capacity}>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            className="input-field"
          />
        </FormField>

        <FormField label="Status" id="status">
          <Select id="status" name="status" value={formData.status} onChange={handleChange}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </FormField>
      </div>

      <Button type="submit" variant="primary" loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  );
}

export default ResourceForm;