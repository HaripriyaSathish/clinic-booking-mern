// Builds list/create/update/delete handlers for simple sortable tables
// (services, testimonials, gallery, clinic_timings). Optional single image via Cloudinary.
const pool = require('../config/db');
const pick = require('./pick');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

module.exports = function crudFactory({
  table,
  fields,
  required = [],
  numeric = [],
  booleans = ['is_active'],
  nullable = [], // empty string -> NULL (e.g. TIME columns)
  image = null, // { urlCol: 'image_url', idCol: 'image_public_id', folder: 'clinic-booking/x' }
  hasActive = true,
  orderBy = 'sort_order, id',
}) {
  const findById = async (id) => {
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return rows[0] || null;
  };

  const listAll = async () => {
    const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
    return rows;
  };

  const listActive = async () => {
    const [rows] = await pool.query(
      `SELECT * FROM ${table} ${hasActive ? 'WHERE is_active = 1' : ''} ORDER BY ${orderBy}`
    );
    return image ? rows.map(({ [image.idCol]: _omit, ...rest }) => rest) : rows;
  };

  const normalise = (body, isCreate) => {
    const data = pick(body, fields);
    for (const key of required) {
      if ((isCreate || key in data) && !data[key]) {
        throw Object.assign(new Error(`${key.replace(/_/g, ' ')} is required`), { status: 400 });
      }
    }
    for (const key of numeric) if (key in data) data[key] = data[key] === '' ? null : Number(data[key]) || 0;
    for (const key of booleans) if (key in data) data[key] = ['1', 'true', 1, true].includes(data[key]) ? 1 : 0;
    for (const key of nullable) if (key in data && data[key] === '') data[key] = null;
    return data;
  };

  const attachImage = async (req, data, current) => {
    if (!image || !req.file) return;
    const { url, publicId } = await uploadImage(req.file.buffer, image.folder);
    data[image.urlCol] = url;
    data[image.idCol] = publicId;
    if (current?.[image.idCol]) await deleteImage(current[image.idCol]).catch(() => {});
  };

  const controller = {
    list: async (req, res, next) => {
      try {
        res.json(await listAll());
      } catch (err) {
        next(err);
      }
    },
    create: async (req, res, next) => {
      try {
        const data = normalise(req.body, true);
        await attachImage(req, data, null);
        if (image?.requiredOnCreate && !data[image.urlCol]) {
          return res.status(400).json({ message: 'Please upload an image' });
        }
        const [result] = await pool.query(`INSERT INTO ${table} SET ?`, [data]);
        res.status(201).json(await findById(result.insertId));
      } catch (err) {
        next(err);
      }
    },
    update: async (req, res, next) => {
      try {
        const current = await findById(req.params.id);
        if (!current) return res.status(404).json({ message: 'Not found' });
        const data = normalise(req.body, false);
        await attachImage(req, data, current);
        if (Object.keys(data).length) await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [data, current.id]);
        res.json(await findById(current.id));
      } catch (err) {
        next(err);
      }
    },
    remove: async (req, res, next) => {
      try {
        const current = await findById(req.params.id);
        if (!current) return res.status(404).json({ message: 'Not found' });
        await pool.query(`DELETE FROM ${table} WHERE id = ?`, [current.id]);
        if (image && current[image.idCol]) await deleteImage(current[image.idCol]).catch(() => {});
        res.json({ message: 'Deleted' });
      } catch (err) {
        next(err);
      }
    },
  };

  // Mounts GET/POST/PUT/DELETE on an admin router: /<path> and /<path>/:id
  const mount = (router, path, upload) => {
    const withFile = image ? [upload.single('image')] : [];
    router.get(`/${path}`, controller.list);
    router.post(`/${path}`, ...withFile, controller.create);
    router.put(`/${path}/:id`, ...withFile, controller.update);
    router.delete(`/${path}/:id`, controller.remove);
  };

  return { listAll, listActive, findById, controller, mount };
};
