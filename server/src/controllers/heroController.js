const heroModel = require('../models/heroModel');
const pick = require('../utils/pick');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

exports.get = async (req, res, next) => {
  try {
    res.json(await heroModel.get());
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = pick(req.body, heroModel.FIELDS);
    if ('title' in data && !data.title) return res.status(400).json({ message: 'Title is required' });

    const current = await heroModel.get();
    if (req.file) {
      const { url, publicId } = await uploadImage(req.file.buffer, 'clinic-booking/hero');
      data.image_url = url;
      data.image_public_id = publicId;
      if (current?.image_public_id) await deleteImage(current.image_public_id).catch(() => {});
    }

    res.json(await heroModel.save(data));
  } catch (err) {
    next(err);
  }
};
