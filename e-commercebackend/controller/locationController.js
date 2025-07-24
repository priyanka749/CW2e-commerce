const Location = require('../models/location');

exports.saveLocation = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { address, lat, lon } = req.body;

    if (!address || lat === undefined || lon === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const location = await Location.findOneAndUpdate(
      { userId },
      { address, lat, lon },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: "Location saved successfully", location });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
