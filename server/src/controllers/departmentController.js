const departmentModel = require('../models/departmentModel');
const pick = require('../utils/pick');
const slugify = require('../utils/slugify');

exports.getPublic = async (req, res, next) => {
  try {
    res.json(await departmentModel.listActive());
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    res.json(await departmentModel.listAll());
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = pick(req.body, departmentModel.FIELDS);
    if (!data.name) return res.status(400).json({ message: 'Department name is required' });
    data.slug = slugify(data.name);
    res.status(201).json(await departmentModel.create(data));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const dept = await departmentModel.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const data = pick(req.body, departmentModel.FIELDS);
    if ('name' in data) {
      if (!data.name) return res.status(400).json({ message: 'Department name is required' });
      data.slug = slugify(data.name);
    }
    res.json(await departmentModel.update(dept.id, data));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await departmentModel.remove(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
