const settingsModel = require('../models/settingsModel');
const pick = require('../utils/pick');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

exports.get = async (req, res, next) => {
  try {
    res.json(await settingsModel.get());
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = pick(req.body, settingsModel.FIELDS);
    if ('clinic_name' in data && !data.clinic_name) {
      return res.status(400).json({ message: 'Clinic name is required' });
    }

    const current = await settingsModel.get();
    if (req.file) {
      const { url, publicId } = await uploadImage(req.file.buffer, 'clinic-booking/branding');
      data.logo_url = url;
      data.logo_public_id = publicId;
      if (current?.logo_public_id) await deleteImage(current.logo_public_id).catch(() => {});
    } else if (req.body.remove_logo === 'true' && current?.logo_url) {
      await deleteImage(current.logo_public_id).catch(() => {});
      data.logo_url = null;
      data.logo_public_id = null;
    }

    res.json(await settingsModel.save(data));
  } catch (err) {
    next(err);
  }
};
