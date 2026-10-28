const cloudinary = require('../config/cloudinary');

// Upload a multer memory buffer; returns { url, publicId }
const uploadImage = (fileBuffer, folder = 'clinic-booking') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id }))
    );
    stream.end(fileBuffer);
  });

const deleteImage = async (publicId) => {
  if (publicId) await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, deleteImage };
