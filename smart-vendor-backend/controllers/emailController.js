const { sendBudgetAlertEmail } = require('../utils/mailer');

/**
 * @route   POST /api/notifications/send-budget-alert
 * @desc    Sends a budget alert email.
 */
exports.sendBudgetAlert = async (req, res) => {
  const { userEmail, category, spentAmount, budgetAmount } = req.body;

  if (!userEmail || !category || spentAmount === undefined || budgetAmount === undefined) {
    return res.status(400).json({ message: 'Missing required fields for email alert.' });
  }

  try {
    await sendBudgetAlertEmail({ userEmail, category, spentAmount, budgetAmount });
    res.status(200).json({ message: 'Budget alert sent successfully!' });
  } catch (error) {
    console.error('[ERROR] Failed to send budget alert:', error);
    res.status(500).json({ message: 'Failed to send email alert.' });
  }
};