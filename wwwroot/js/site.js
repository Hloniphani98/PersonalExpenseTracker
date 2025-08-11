// Expense Tracker Application
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const expenseList = document.getElementById('expenseList');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const addFirstExpenseBtn = document.getElementById('addFirstExpense');
    const expenseForm = document.getElementById('expenseForm');
    const addExpenseModal = document.getElementById('addExpenseModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchExpenses = document.getElementById('searchExpenses');
    const totalExpensesElement = document.getElementById('totalExpenses');
    const monthlyExpensesElement = document.getElementById('monthlyExpenses');
    const dailyAverageElement = document.getElementById('dailyAverage');
    const currentMonthElement = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    // Categories
    const categories = [
        'Food & Dining',
        'Transport',
        'Housing',
        'Utilities',
        'Entertainment',
        'Shopping',
        'Healthcare',
        'Education',
        'Other'
    ];

    // Current month tracking
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Sample data (will be replaced with localStorage later)
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [
        {
            id: 1,
            description: "Groceries at Checkers",
            amount: 450.99,
            date: "2023-06-15",
            category: "Food & Dining",
            notes: "Weekly shopping"
        },
        {
            id: 2,
            description: "Petrol",
            amount: 600.00,
            date: "2023-06-10",
            category: "Transport",
            notes: "Filled up the tank"
        },
        {
            id: 3,
            description: "Electricity",
            amount: 800.50,
            date: "2023-06-05",
            category: "Utilities",
            notes: "Prepaid electricity"
        }
    ];

    // Initialize the app
    init();

    function init() {
        // Set current month display
        updateMonthDisplay();

        // Populate category filter
        populateCategoryFilter();

        // Render expenses
        renderExpenses();

        // Update stats
        updateStats();

        // Event listeners
        addExpenseBtn.addEventListener('click', openAddExpenseModal);
        addFirstExpenseBtn.addEventListener('click', openAddExpenseModal);
        expenseForm.addEventListener('submit', handleAddExpense);
        closeModalBtns.forEach(btn => btn.addEventListener('click', closeAddExpenseModal));
        categoryFilter.addEventListener('change', filterExpenses);
        searchExpenses.addEventListener('input', filterExpenses);
        prevMonthBtn.addEventListener('click', goToPrevMonth);
        nextMonthBtn.addEventListener('click', goToNextMonth);

        // Set today's date as default in the form
        document.getElementById('expenseDate').valueAsDate = new Date();
    }

    function openAddExpenseModal() {
        addExpenseModal.style.display = 'flex';
        document.getElementById('expenseDescription').focus();
    }

    function closeAddExpenseModal() {
        addExpenseModal.style.display = 'none';
        expenseForm.reset();
    }

    function handleAddExpense(e) {
        e.preventDefault();

        const newExpense = {
            id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
            description: document.getElementById('expenseDescription').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            date: document.getElementById('expenseDate').value,
            category: document.getElementById('expenseCategory').value,
            notes: document.getElementById('expenseNotes').value
        };

        // Add to expenses array
        expenses.push(newExpense);

        // Save to localStorage
        localStorage.setItem('expenses', JSON.stringify(expenses));

        // Update UI
        renderExpenses();
        updateStats();

        // Close modal and reset form
        closeAddExpenseModal();
    }

    function renderExpenses() {
        // Filter expenses by current month and year
        const filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear;
        });

        // Sort by date (newest first)
        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredExpenses.length === 0) {
            expenseList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No expenses recorded for this month</p>
                    <button id="addFirstExpense" class="btn-primary">
                        <i class="fas fa-plus"></i> Add Your First Expense
                    </button>
                </div>
            `;
            document.getElementById('addFirstExpense').addEventListener('click', openAddExpenseModal);
            return;
        }

        let html = '';

        filteredExpenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            const formattedDate = expenseDate.toLocaleDateString('en-ZA', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

            html += `
                <div class="expense-item" data-id="${expense.id}" data-category="${expense.category}" data-search="${expense.description.toLowerCase()}">
                    <div class="expense-info">
                        <div class="expense-icon">
                            <i class="${getCategoryIcon(expense.category)}"></i>
                        </div>
                        <div class="expense-details">
                            <h4>${expense.description}</h4>
                            <p>
                                <span>${formattedDate}</span>
                                <span>•</span>
                                <span>${expense.category}</span>
                            </p>
                        </div>
                    </div>
                    <div class="expense-amount">
                        R ${expense.amount.toFixed(2)}
                    </div>
                </div>
            `;
        });

        expenseList.innerHTML = html;
    }

    function filterExpenses() {
        const category = categoryFilter.value;
        const searchTerm = searchExpenses.value.toLowerCase();

        const expenseItems = document.querySelectorAll('.expense-item');

        expenseItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            const itemSearch = item.getAttribute('data-search');

            const categoryMatch = category === 'all' || itemCategory === category;
            const searchMatch = itemSearch.includes(searchTerm);

            if (categoryMatch && searchMatch) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    function updateStats() {
        // Total expenses
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        totalExpensesElement.textContent = `R ${total.toFixed(2)}`;

        // Monthly expenses (current month)
        const monthlyTotal = expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth &&
                    expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, expense) => sum + expense.amount, 0);

        monthlyExpensesElement.textContent = `R ${monthlyTotal.toFixed(2)}`;

        // Daily average (current month)
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dailyAverage = monthlyTotal / daysInMonth;
        dailyAverageElement.textContent = `R ${dailyAverage.toFixed(2)}`;
    }

    function populateCategoryFilter() {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    function updateMonthDisplay() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    function goToPrevMonth() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateMonthDisplay();
        renderExpenses();
        updateStats();
    }

    function goToNextMonth() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateMonthDisplay();
        renderExpenses();
        updateStats();
    }

    function getCategoryIcon(category) {
        const icons = {
            'Food & Dining': 'fas fa-utensils',
            'Transport': 'fas fa-car',
            'Housing': 'fas fa-home',
            'Utilities': 'fas fa-bolt',
            'Entertainment': 'fas fa-film',
            'Shopping': 'fas fa-shopping-bag',
            'Healthcare': 'fas fa-heartbeat',
            'Education': 'fas fa-book',
            'Other': 'fas fa-random'
        };

        return icons[category] || 'fas fa-receipt';
    }

    // Close modal when clicking outside
    addExpenseModal.addEventListener('click', function (e) {
        if (e.target === addExpenseModal) {
            closeAddExpenseModal();
        }
    });
});