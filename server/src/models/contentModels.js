// Simple list-type sections built on the CRUD factory
const crudFactory = require('../utils/crudFactory');

exports.services = crudFactory({
  table: 'services',
  fields: ['title', 'description', 'icon', 'sort_order', 'is_active'],
  required: ['title'],
  numeric: ['sort_order'],
  image: { urlCol: 'image_url', idCol: 'image_public_id', folder: 'clinic-booking/services' },
});

exports.testimonials = crudFactory({
  table: 'testimonials',
  fields: ['patient_name', 'location', 'rating', 'message', 'sort_order', 'is_active'],
  required: ['patient_name', 'message'],
  numeric: ['rating', 'sort_order'],
  image: { urlCol: 'photo_url', idCol: 'photo_public_id', folder: 'clinic-booking/testimonials' },
});

exports.gallery = crudFactory({
  table: 'gallery',
  fields: ['title', 'sort_order', 'is_active'],
  numeric: ['sort_order'],
  image: { urlCol: 'image_url', idCol: 'image_public_id', folder: 'clinic-booking/gallery', requiredOnCreate: true },
});

exports.faqs = crudFactory({
  table: 'faqs',
  fields: ['question', 'answer', 'sort_order', 'is_active'],
  required: ['question', 'answer'],
  numeric: ['sort_order'],
});

// Consulting hours rows: day_range (left), times / 24×7 / closed + note (right)
exports.timings = crudFactory({
  table: 'clinic_timings',
  fields: ['label', 'day_range', 'open_time', 'close_time', 'is_24x7', 'is_closed', 'note', 'sort_order'],
  required: ['day_range'],
  numeric: ['sort_order'],
  booleans: ['is_24x7', 'is_closed'],
  nullable: ['open_time', 'close_time', 'note'],
  hasActive: false,
});
