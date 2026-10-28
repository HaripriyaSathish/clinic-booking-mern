const doctorModel = require('../models/doctorModel');
const pick = require('../utils/pick');
const slugify = require('../utils/slugify');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

const TIME = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

// Multipart form values arrive as strings — normalise them for MySQL
const normalise = (body) => {
  const data = pick(body, doctorModel.FIELDS);
  if ('name' in data && !data.name) throw badRequest('Doctor name is required');
  for (const key of ['department_id', 'consultation_fee']) {
    if (key in data) data[key] = data[key] === '' ? null : data[key];
  }
  for (const key of ['experience_years', 'sort_order']) {
    if (key in data) data[key] = Number(data[key]) || 0;
  }
  for (const key of ['is_featured', 'is_active']) {
    if (key in data) data[key] = ['1', 'true', 1, true].includes(data[key]) ? 1 : 0;
  }
  if (data.consultation_fee != null && !(Number(data.consultation_fee) >= 0)) throw badRequest('Fee must be a number');
  if (data.experience_years < 0 || data.experience_years > 70) throw badRequest('Experience must be 0–70 years');
  return data;
};

// schedules arrive as a JSON string: [{ day_of_week, start_time, end_time }]
const parseSchedules = (raw) => {
  if (raw === undefined) return undefined;
  let list;
  try {
    list = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    throw badRequest('Invalid schedule data');
  }
  if (!Array.isArray(list)) throw badRequest('Invalid schedule data');
  return list.map((s) => {
    if (!doctorModel.DAYS.includes(s.day_of_week)) throw badRequest('Invalid day in schedule');
    if (!TIME.test(s.start_time) || !TIME.test(s.end_time)) throw badRequest('Invalid time in schedule');
    if (s.start_time.slice(0, 5) >= s.end_time.slice(0, 5)) throw badRequest(`${s.day_of_week}: end time must be after start time`);
    return { day_of_week: s.day_of_week, start_time: s.start_time.slice(0, 5), end_time: s.end_time.slice(0, 5) };
  });
};

const uniqueSlug = async (name, exceptId) => {
  const base = slugify(name) || 'doctor';
  let slug = base;
  for (let i = 2; await doctorModel.slugExists(slug, exceptId); i += 1) slug = `${base}-${i}`;
  return slug;
};

exports.getPublic = async (req, res, next) => {
  try {
    res.json(await doctorModel.listActive());
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    res.json(await doctorModel.listAll());
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = normalise(req.body);
    if (!data.name) throw badRequest('Doctor name is required');
    const schedules = parseSchedules(req.body.schedules);
    data.slug = await uniqueSlug(data.name, 0);
    if (req.file) {
      const { url, publicId } = await uploadImage(req.file.buffer, 'clinic-booking/doctors');
      data.photo_url = url;
      data.photo_public_id = publicId;
    }
    const id = await doctorModel.create(data);
    if (schedules) await doctorModel.setSchedules(id, schedules);
    res.status(201).json(await doctorModel.findById(id));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const doctor = await doctorModel.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const data = normalise(req.body);
    const schedules = parseSchedules(req.body.schedules);
    if (data.name && data.name !== doctor.name) data.slug = await uniqueSlug(data.name, doctor.id);

    if (req.file) {
      const { url, publicId } = await uploadImage(req.file.buffer, 'clinic-booking/doctors');
      data.photo_url = url;
      data.photo_public_id = publicId;
      if (doctor.photo_public_id) await deleteImage(doctor.photo_public_id).catch(() => {});
    }

    if (Object.keys(data).length) await doctorModel.update(doctor.id, data);
    if (schedules) await doctorModel.setSchedules(doctor.id, schedules);
    res.json(await doctorModel.findById(doctor.id));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const doctor = await doctorModel.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await doctorModel.remove(doctor.id);
    if (doctor.photo_public_id) await deleteImage(doctor.photo_public_id).catch(() => {});
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
