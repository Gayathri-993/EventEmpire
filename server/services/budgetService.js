const { default: mongoose } = require('mongoose');
const Budget = require('../models/Budget');
const Event = require('../models/Event');
const {checkAndGetAlertForExpenseLimit} = require('../utils/helper');
const {validateExpense} = require('../validators/expenseValidator');

const getBudget = async (eventId, userId) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');
    if (event.user.toString() !== userId.toString()) throw new Error('Not authorized');

    let budget = await Budget.findOne({ event: eventId });
    if (!budget) {
        // Create default if not exists
        budget = await Budget.create({ event: eventId, totalBudget: 0, expenses: [] });
    }
    return budget;
};

const updateBudget = async (eventId, budgetData, userId) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');
    if (event.user.toString() !== userId.toString()) throw new Error('Not authorized');

    const budget = await Budget.findOneAndUpdate(
        { event: eventId },
        { totalBudget: budgetData.totalBudget },
        { new: true, upsert: true }
    );
    return budget;
};

//TODO: If required add validation for ((current expenses amount + new expense amount) > totalbudget) while adding and updating expenses
const addExpense = async (eventId, expenseData, userId) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');
    if (event.user.toString() !== userId.toString()) throw new Error('Not authorized');

    const budget = await Budget.findOne({ event: eventId });
    if (!budget) throw new Error('Budget not set');

    const expenseId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const errors = validateExpense({...expenseData, id: expenseId});
    if (errors.length > 0) throw new Error(errors.join(', '));

    budget.expenses.push({...expenseData, id: expenseId});
    await budget.save();

    // Check threshold
    const {alert, remaining} = checkAndGetAlertForExpenseLimit(budget.expenses,budget.totalBudget);

    return { budget, alert, remaining };
};

const updateExpense = async (eventId, expenseId, expenseData, userId) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');
    if (event.user.toString() !== userId.toString()) throw new Error('Not authorized');

    const budget = await Budget.findOne({ event: eventId });
    if (!budget) throw new Error('Budget not set');

    let expenseFound = false;
    var i=0;
    for(;i<budget.expenses.length;i++){
        const expense = budget.expenses[i];
        if(expense.id == expenseId){
            expenseFound = true;
            budget.expenses[i] = {
                id: expenseId,
                ...expenseData,
            };
            break;
        }
    }
    
    if(!expenseFound){
        throw new Error('Invalid Expense');
    }

    const errors = validateExpense(budget.expenses[i]);
    if (errors.length > 0) throw new Error(errors.join(', '));

    await budget.save();

    // Check threshold
    const {alert, remaining} = checkAndGetAlertForExpenseLimit(budget.expenses,budget.totalBudget);

    return { budget, alert, remaining };
};

const deleteExpense = async (eventId, expenseId, userId) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');
    if (event.user.toString() !== userId.toString()) throw new Error('Not authorized');

    const budget = await Budget.findOne({ event: new mongoose.Types.ObjectId(eventId) });
    if (!budget) throw new Error('Budget not set');

    const expenseToDelete = budget.expenses.filter(expense => expense.id == expenseId);
    if(expenseToDelete.length == 0){
        throw new Error('Invalid Expense');
    }

    await budget.expenses.id(expenseToDelete[0]._id).deleteOne();
    await budget.save();

    // Check threshold
    const {alert, remaining} = checkAndGetAlertForExpenseLimit(budget.expenses,budget.totalBudget);

    return { budget, alert, remaining };
};

module.exports = { getBudget, updateBudget, addExpense, updateExpense, deleteExpense };
