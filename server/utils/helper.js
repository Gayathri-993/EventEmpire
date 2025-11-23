const {EXPENSE_THRESHOLD} = require("./constants");
function checkAndGetAlertForExpenseLimit(expenses, totalBudget){
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = totalBudget - totalExpenses;
    const alert = remaining < (totalBudget * EXPENSE_THRESHOLD); 
    return {alert, remaining};
}

module.exports = {
    checkAndGetAlertForExpenseLimit
};