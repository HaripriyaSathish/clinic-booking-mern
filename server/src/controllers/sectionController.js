const sectionModel = require('../models/sectionModel');
const pick = require('../utils/pick');

const KEY_PATTERN = /^[a-z_]{2,40}$/;

exports.get = async (req, res, next) => {
  try {
    if (!KEY_PATTERN.test(req.params.key)) return res.status(400).json({ message: 'Invalid section' });
    res.json((await sectionModel.get(req.params.key)) || { section_key: req.params.key });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (!KEY_PATTERN.test(req.params.key)) return res.status(400).json({ message: 'Invalid section' });
    res.json(await sectionModel.save(req.params.key, pick(req.body, sectionModel.FIELDS)));
  } catch (err) {
    next(err);
  }
};
