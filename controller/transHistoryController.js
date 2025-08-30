const { Transaction } = require("../models/Transaction.js");

const Transfer_history = async (req, res) => {
  try {
    const userID = req.user.userId;
    const transferHistory = await Transaction.find({
      $or: [{ sender: userID }, { recipient: userID }],
    }).populate("sender recipient");

    if (!transferHistory || transferHistory.length === 0) {
      return res.status(200).json({transferHistory:[]});
    }
    res.json({ transferHistory });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
    Transfer_history
}