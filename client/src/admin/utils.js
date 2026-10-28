// Shared helpers for admin pages
export const errorMessage = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.message || fallback;

// Plain object -> FormData (skips undefined; null becomes '')
export const toFormData = (values, files = {}) => {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => v !== undefined && fd.append(k, v ?? ''));
  Object.entries(files).forEach(([k, file]) => file && fd.append(k, file));
  return fd;
};
