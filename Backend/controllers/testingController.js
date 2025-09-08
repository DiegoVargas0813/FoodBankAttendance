const { fetchTestData } = require('../models/testingModel');

exports.getTestData = async (req, res) => {
  try {
    console.log("Getting test data");
    const data = await fetchTestData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};