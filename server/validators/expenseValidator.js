const { EXPENSE_TYPE_ENUM } = require("../utils/constants");

const validateExpense = (data) => {
    const errors = [];
    if (!data.title) errors.push('Expense title is required');
    if (!data.amount || typeof data.amount !== "number") errors.push('Expense amount is required and must be a number');
    if(typeof data.amount == "number" && data.amount < 0) errors.push('Expense amount cannot be negative')
    if (!data.category) errors.push('Expense category is required');
    if (typeof data.category=="string" && !EXPENSE_TYPE_ENUM.includes(data.category)) errors.push('Expense category must be one of '+EXPENSE_TYPE_ENUM.join(", "));
    
    return errors;
};

module.exports = { validateExpense };
