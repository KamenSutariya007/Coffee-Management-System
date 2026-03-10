const fs = require("fs");
const asyncHandler = require("express-async-handler");
const { cloudinaryUploadImg } = require("../utils/cloudinary");

const uploadImages = asyncHandler(async (req, res) => {
  try {
    const uploader = (path) => cloudinaryUploadImg(path);
    const urls = [];
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files were uploaded" });
    }

    for (const file of files) {
      const { path } = file;
      try {
        const newpath = await uploader(path);
        urls.push(newpath);
        fs.unlinkSync(path);
      } catch (error) {
        console.error("Error uploading file:", error);
        // Continue with other files if one fails
      }
    }

    if (urls.length === 0) {
      return res.status(500).json({ message: "Failed to upload any files" });
    }

    res.json(urls);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading images", error: error.message });
  }
});
const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = cloudinaryDeleteImg(id, "images");
    res.json({ message: "Deleted" });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  uploadImages,
  deleteImages,
};
