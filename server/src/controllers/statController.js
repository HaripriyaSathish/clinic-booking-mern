const statModel = require('../models/statModel');
const pick = require('../utils/pick');

exports.list = async (req, res, next) => {
  try {
    res.json(await statModel.listAll());
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = pick(req.body, statModel.FIELDS);
    if (!data.label || !data.value) return res.status(400).json({ message: 'Label and value are required' });
    res.status(201).json(await statModel.create(data));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const stat = await statModel.findById(req.params.id);
    if (!stat) return res.status(404).json({ message: 'Stat not found' });
    res.json(await statModel.update(stat.id, pick(req.body, statModel.FIELDS)));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await statModel.remove(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
