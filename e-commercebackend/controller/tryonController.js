// // controllers/tryon.controller.js
// const axios = require('axios');

// exports.tryOn = async (req, res) => {
//   try {
//     const { userBase64, clothBase64 } = req.body;

//     const response = await axios.post(
//       'https://hf.space/embed/Kwai-Kolors/Kolors-Virtual-Try-On/+/api/predict/',
//       {
//         data: [userBase64, clothBase64]
//       },
//       { headers: { 'Content-Type': 'application/json' } }
//     );

//     res.json({ image: response.data.data[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Try-on failed.' });