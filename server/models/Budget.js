const mongoose = require('mongoose');
const { EXPENSE_TYPE_ENUM } = require('../utils/constants');

const budgetSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        unique: true,
    },
    totalBudget: {
        type: Number,
        required: true,
    },
    expenses: [
        {
            id: {type: String, required: true},
            title: String,
            amount: Number,
            category: {
                type: String,
                enum: EXPENSE_TYPE_ENUM,
                default: 'Other',
            },
            date: { type: Date, default: Date.now },
        },
    ],
});

module.exports = mongoose.model('Budget', budgetSchema);
