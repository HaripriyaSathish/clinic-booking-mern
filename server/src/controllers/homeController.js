const settingsModel = require('../models/settingsModel');
const heroModel = require('../models/heroModel');
const statModel = require('../models/statModel');
const sectionModel = require('../models/sectionModel');
const departmentModel = require('../models/departmentModel');
const doctorModel = require('../models/doctorModel');
const content = require('../models/contentModels');

// Strip Cloudinary ids — the public site only needs URLs
const clean = (row) => {
  if (!row) return null;
  const { logo_public_id, image_public_id, ...rest } = row;
  return rest;
};

// Everything the landing page needs in one request; extend as sections are added
exports.getHomeData = async (req, res, next) => {
  try {
    const [settings, hero, stats, sections, departments, doctors, services, testimonials, gallery, timings, faqs] =
      await Promise.all([
        settingsModel.get(),
        heroModel.get(),
        statModel.listActive(),
        sectionModel.getAll(),
        departmentModel.listActive(),
        doctorModel.listFeatured(4),
        content.services.listActive(),
        content.testimonials.listActive(),
        content.gallery.listActive(),
        content.timings.listActive(),
        content.faqs.listActive(),
      ]);
    res.json({
      settings: clean(settings), hero: clean(hero), stats, sections, departments, doctors,
      services, testimonials, gallery, timings, faqs,
    });
  } catch (err) {
    next(err);
  }
};
