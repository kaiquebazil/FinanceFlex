
// DOM Elements
const accountModal = document.getElementById('accountModal');
const transactionModal = document.getElementById('transactionModal');
const toast = document.getElementById('toasts');
const addAccountBtns = document.querySelector('#addAccountBtn');
const addIncomeBtn = document.getElementById('addIncomeBtn');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const modalCloses = document.querySelectorAll('.modal-close');
const accountForm = document.getElementById('accountForm');
const transactionForm = document.getElementById('transactionForm');
const transactionType = document.getElementById('transactionType');
const transferAccountGroup = document.getElementById('transferAccountGroup');
const accountsList = document.getElementById('accountsList');
const transactionsList = document.getElementById('transactionsList');
const monthlySummary = document.getElementById('monthlySummary');
const calendarContainer = document.getElementById('calendarContainer');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const tabs = document.querySelectorAll('.tab');
const transactionModalTitle = document.getElementById('transactionModalTitle');

// Data
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedPeriod = 'today';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Load data from localStorage or initialize
    if (!localStorage.getItem('financeAccounts')) {
        initializeData();
    }

    // Set current date for transaction form
    document.getElementById('transactionDate').valueAsDate = new Date();

    // Load UI
    loadAccounts();
    loadTransactions();
    loadMonthlySummary();
    generateCalendar(currentMonth, currentYear);
    populateTransactionCategories();
    populateAccountDropdowns();

    // Event listeners for modals
    addAccountBtns.addEventListener('click', () => {
            accountModal.classList.add('active');
        });

    addIncomeBtn.addEventListener('click', () => {
        transactionModalTitle.textContent = 'Adicionar Nova Receita';
        document.getElementById('transactionType').value = 'income';
        transferAccountGroup.style.display = 'none';
        transactionModal.classList.add('active');
    });

    addExpenseBtn.addEventListener('click', () => {
        transactionModalTitle.textContent = 'Adicionar Nova Despesa';
        document.getElementById('transactionType').value = 'expense';
        transferAccountGroup.style.display = 'none';
        transactionModal.classList.add('active');
    });

    modalCloses.forEach(btn => {
        btn.addEventListener('click', () => {
            accountModal.classList.remove('active');
            transactionModal.classList.remove('active');
        });
    });

    // Transaction type change
    transactionType.addEventListener('change', (e) => {
        if (e.target.value === 'transfer') {
            transactionModalTitle.textContent = 'Adicionar Transferência';
            transferAccountGroup.style.display = 'block';
        } else if (e.target.value === 'income') {
            transactionModalTitle.textContent = 'Adicionar Nova Receita';
            transferAccountGroup.style.display = 'none';
        } else {
            transactionModalTitle.textContent = 'Adicionar Nova Despesa';
            transferAccountGroup.style.display = 'none';
        }
    });

    // Form submissions
    accountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addAccount();
    });

    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTransaction();
    });

    // Calendar navigation
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
    });

    // Transaction tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            selectedPeriod = tab.dataset.period;
            loadTransactions();
        });
    });
});

// Variáveis para controle dos filtros
let currentFilter = 'all';
let currentPeriod = 'today';
let currentCategory = 'all';

// Inicializar filtros
document.addEventListener('DOMContentLoaded', () => {
    loadTransactionCategories();
    setupFilterButtons();
});

// Configurar botões de filtro
function setupFilterButtons() {
    // Event listeners para os botões de filtro (tipo)
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn[data-filter]').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            loadFilteredTransactions();
        });
    });

    // Event listeners para os botões de período
    document.querySelectorAll('.filter-btn[data-period]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn[data-period]').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            currentPeriod = this.dataset.period;
            loadFilteredTransactions();
        });
    });
}

// Carregar categorias disponíveis
function loadTransactionCategories() {
    const transactions = JSON.parse(localStorage.getItem('financeTransactions')) || [];
    const categorySelect = document.getElementById('categorySelect');
    
    // Extrair categorias únicas
    const categories = [...new Set(transactions.map(t => t.category))].filter(Boolean);
    
    // Limpar e preencher dropdown
    categorySelect.innerHTML = '<option value="all">Todas categorias</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    // Event listener para filtro de categoria
    categorySelect.addEventListener('change', function() {
        currentCategory = this.value;
        loadFilteredTransactions();
    });
}

// Função principal de filtragem
function loadFilteredTransactions() {
    const transactions = JSON.parse(localStorage.getItem('financeTransactions')) || [];
    const accounts = JSON.parse(localStorage.getItem('financeAccounts')) || [];
    
    // Aplicar todos os filtros
    let filteredTransactions = applyFilters(transactions);
    
    // Ordenar por data (mais recente primeiro)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Renderizar resultados
    renderTransactions(filteredTransactions, accounts);
}

// Aplicar todos os filtros
function applyFilters(transactions) {
    let result = [...transactions];
    
    // Filtro por tipo
    if (currentFilter !== 'all') {
        result = result.filter(t => t.type === currentFilter);
    }
    
    // Filtro por categoria
    if (currentCategory !== 'all') {
        result = result.filter(t => t.category === currentCategory);
    }
    
    // Filtro por período
    result = filterByPeriod(result);
    
    return result;
}

// Filtro por período
function filterByPeriod(transactions) {
    const now = new Date();
    let startDate, endDate;
    
    switch (currentPeriod) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date(now);
            endDate.setDate(now.getDate() + (6 - now.getDay()));
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            endDate.setHours(23, 59, 59, 999);
            break;
        default:
            return transactions;
    }
    
    return transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= startDate && transDate <= endDate;
    });
}

// Renderizar transações (agrupadas por categoria)
function renderTransactions(transactions, accounts) {
    const container = document.getElementById('transactionsModalContent');
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="empty-text">Nenhuma transação encontrada</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // Agrupar por categoria
    const transactionsByCategory = transactions.reduce((acc, transaction) => {
        const category = transaction.category || 'Sem categoria';
        if (!acc[category]) acc[category] = [];
        acc[category].push(transaction);
        return acc;
    }, {});
    
    // Renderizar cada categoria
    for (const [category, categoryTransactions] of Object.entries(transactionsByCategory)) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-group';
        
        // Calcular total da categoria
        const categoryTotal = categoryTransactions.reduce((sum, t) => {
            return t.type === 'income' ? sum + t.amount : sum - t.amount;
        }, 0);
        
        // Header da categoria
        categoryElement.innerHTML = `
            <div class="category-header">
                <div class="category-name">${category}</div>
                <div class="category-total ${categoryTotal >= 0 ? 'income' : 'expense'}">
                    ${categoryTotal >= 0 ? '+' : ''}${formatCurrency(Math.abs(categoryTotal), 'BRL')}
                </div>
            </div>
        `;
        
        // Adicionar transações
        const transactionsList = document.createElement('div');
        categoryTransactions.forEach(transaction => {
            const account = accounts.find(a => a.id === transaction.account);
            transactionsList.appendChild(createTransactionElement(transaction, account));
        });
        
        categoryElement.appendChild(transactionsList);
        container.appendChild(categoryElement);
    }
}

// Criar elemento de transação individual
function createTransactionElement(transaction, account) {
    const element = document.createElement('div');
    element.className = 'transaction-item';
    
    element.innerHTML = `
        <div class="transaction-icon ${transaction.type}">
            <i class="fas ${getTransactionIcon(transaction.type, transaction.category)}"></i>
        </div>
        <div class="transaction-details">
            <div class="transaction-name">${transaction.description}</div>
            <div class="transaction-info">
                <span class="transaction-date">${formatDate(transaction.date)}</span>
                <span class="transaction-account">${account?.name || 'Conta desconhecida'}</span>
            </div>
        </div>
        <div class="transaction-amount ${transaction.type === 'income' ? 'positive' : 'negative'}">
            ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount, account?.currency || 'BRL')}
        </div>
    `;
    
    return element;
}

// Funções auxiliares
function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency || 'BRL'
    }).format(amount);
}

function getTransactionIcon(type, category) {
    // Sua implementação existente
    // ...
}

// Initialize sample data
function initializeData() {
    const accounts = [
        {
            id: 'acc1',
            name: 'Mercado Pago',
            type: 'Digital',
            balance: 0.00,
            currency: 'BRL'
        },
        {
            id: 'acc2',
            name: 'Dinheiro',
            type: 'Físico',
            balance: 0.00,
            currency: 'BRL'
        }
    ];

    const transactions = [];

    localStorage.setItem('financeAccounts', JSON.stringify(accounts));
    localStorage.setItem('financeTransactions', JSON.stringify(transactions));
}

// Load accounts
function loadAccounts() {
    const accounts2 = document.getElementById('accountsModalContent');
    const accounts = JSON.parse(localStorage.getItem('financeAccounts')) || [];
    accountsList.innerHTML = '';

    if (accounts.length === 0) {
        accountsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-wallet"></i>
                </div>
                <div class="empty-text">Nenhuma conta encontrada</div>
            </div>
        `;
        accounts2.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-wallet"></i>
                </div>
                <div class="empty-text">Nenhuma conta encontrada</div>
            </div>
        `;
        return;
    }

    accounts.forEach(account => {
        const accountItem = document.createElement('div');
        accountItem.className = 'account-item';
        accountItem.innerHTML = `
            <div class="account-info">
                <div class="account-icon">
                    <i class="fas ${getAccountIcon(account.type)}"></i>
                </div>
                <div>
                    <div class="account-name">${account.name}</div>
                    <div class="account-type">${account.type} • ${account.currency}</div>
                </div>
            </div>
            <div class="account-balance ${account.balance >= 0 ? 'positivo' : 'negativo'}">
                ${formatCurrency(account.balance, account.currency)}
            </div>
            
        `;
        accountsList.appendChild(accountItem);
    });

    // Modal content (if you want to show the accounts in a modal as well)
    const content = document.getElementById('accountsModalContent');
    if (content) {
        content.innerHTML = `
            <div class="accounts-list">
                ${accounts.map(account => `
                    <div class="account-item">
                        <div class="account-icon">
                            <i class="fas ${getAccountIcon(account.type)}"></i>
                        </div>
                        <div class="account-details">
                            <h4>${account.name}</h4>
                            <p>${account.type} • ${account.currency}</p>
                        </div>
                        <button class="icon-modal delete-account-btn" data-id="${account.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Event listeners for delete
    document.querySelectorAll('.delete-account-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja apagar esta conta?')) {
                let accounts = JSON.parse(localStorage.getItem('financeAccounts')) || [];
                accounts = accounts.filter(acc => acc.id !== id);
                localStorage.setItem('financeAccounts', JSON.stringify(accounts));
                loadAccounts();
                populateAccountDropdowns();
                showToast('Conta removida com sucesso!');
            }
        });
    });
}

// Load transactions
function loadTransactions() {
    const transactions = JSON.parse(localStorage.getItem('financeTransactions')) || [];
    const now = new Date();
    let filteredTransactions = [];

    switch (selectedPeriod) {
        case 'today':
            filteredTransactions = transactions.filter(t => {
                const transDate = new Date(t.date);
                return transDate.toDateString() === now.toDateString();
            });
            break;
        case 'week':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(now);
            endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
            endOfWeek.setHours(23, 59, 59, 999);

            filteredTransactions = transactions.filter(t => {
                const transDate = new Date(t.date);
                return transDate >= startOfWeek && transDate <= endOfWeek;
            });
            break;
        case 'month':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);

            filteredTransactions = transactions.filter(t => {
                const transDate = new Date(t.date);
                return transDate >= startOfMonth && transDate <= endOfMonth;
            });
            break;
        case 'upcoming':
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);

            filteredTransactions = transactions.filter(t => {
                const transDate = new Date(t.date);
                return transDate > today && transDate <= nextWeek;
            });
            break;
        default:
            filteredTransactions = transactions;
    }

    transactionsList.innerHTML = '';

    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="empty-text">Nenhuma conta encontrada</div>
            </div>
        `;
    } else {
        filteredTransactions.forEach(transaction => {
            const accounts = JSON.parse(localStorage.getItem('financeAccounts')) || [];
            const account = accounts.find(a => a.id === transaction.account);

            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            transactionItem.innerHTML = `
                <div class="transaction-icon">
                    <i class="fas ${getTransactionIcon(transaction.type, transaction.category)}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-name">${transaction.description}</div>
                    <div class="transaction-category">${transaction.category} • ${account ? account.name : 'Unknown Account'}</div>
                    <span class="transaction-date">${new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="transaction-amount ${transaction.type === 'income' ? 'positivo' : 'negativo'}">
                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount, account ? account.currency : 'BRL')}
                </div>
            `;
            transactionsList.appendChild(transactionItem);
        });
    }

    // Adiciona as transações no modal de transações
    const transactionsModalContent = document.getElementById('transactionsModalContent');
    if (transactionsModalContent) {
        if (transactions.length === 0) {
            transactionsModalContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                    <div class="empty-text">Nenhuma transação encontrada</div>
                </div>
            `;
        } else {
            transactionsModalContent.innerHTML = `
                <div class="transactions-list">
                    ${transactions.map(transaction => {
                        const accounts = JSON.parse(localStorage.getItem('financeAccounts')) || [];
                        const account = accounts.find(a => a.id === transaction.account);
                        return `
                            <div class="transaction-item">
                                <div class="transaction-icon">
                                    <i class="fas ${getTransactionIcon(transaction.type, transaction.category)}"></i>
                                </div>
                                <div class="transaction-details">
                                    <div class="transaction-name">${transaction.description}</div>
                                    <div class="transaction-category">${transaction.category} • ${account ? account.name : 'Unknown Account'}</div>
                                    <span class="transaction-date">${new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div class="transaction-amount ${transaction.type === 'income' ? 'positivo' : 'negativo'}">
                                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount, account ? account.currency : 'BRL')}
                                </div>
                                <button class="icon-modal delete-transaction-btn" data-id="${transaction.id}" title="Remover">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // Adiciona evento de remoção
        transactionsModalContent.querySelectorAll('.delete-transaction-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                let transactions = JSON.parse(localStorage.getItem('financeTransactions')) || [];
                const transactionToRemove = transactions.find(t => t.id === id);

                // Atualiza saldo da conta ao remover transação
                if (transactionToRemove) {
                    let accounts = JSON.parse(localStorage.getItem('financeAccounts')) || [];
                    const accountIndex = accounts.findIndex(a => a.id === transactionToRemove.account);
                    if (accountIndex !== -1) {
                        if (transactionToRemove.type === 'income') {
                            accounts[accountIndex].balance -= transactionToRemove.amount;
                        } else if (transactionToRemove.type === 'expense') {
                            accounts[accountIndex].balance += transactionToRemove.amount;
                        } else if (transactionToRemove.type === 'transfer') {
                            // Para transferências, remova ambos os registros (in/out)
                            transactions = transactions.filter(t =>
                                !(t.id === id || (t.type === 'transfer' && t.account === transactionToRemove.toAccount && t.amount === transactionToRemove.amount && t.date === transactionToRemove.date))
                            );
                            localStorage.setItem('financeTransactions', JSON.stringify(transactions));
                            localStorage.setItem('financeAccounts', JSON.stringify(accounts));
                            loadTransactions();
                            loadAccounts();
                            loadMonthlySummary();
                            generateCalendar(currentMonth, currentYear);
                            showToast('Transferência removida com sucesso!');
                            return;
                        }
                        localStorage.setItem('financeAccounts', JSON.stringify(accounts));
                    }
                }

                // Remove a transação
                transactions = transactions.filter(t => t.id !== id);
                localStorage.setItem('financeTransactions', JSON.stringify(transactions));
                loadTransactions();
                loadAccounts();
                loadMonthlySummary();
                generateCalendar(currentMonth, currentYear);
                showToast('Transação removida com sucesso!');
            });
        });
    }
}

// Load monthly summary
function loadMonthlySummary() {
    const transactions = JSON.parse(localStorage.getItem('financeTransactions')) || [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const savings = income - expense;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

    monthlySummary.innerHTML = `
                <div class="summary-item">
                    <div class="summary-label">
                        <i class="fas fa-arrow-down"></i>
                        <span>Renda</span>
                    </div>
                    <div class="summary-value income">${formatCurrency(income, 'BRL')}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">
                        <i class="fas fa-arrow-up"></i>
                        <span>Despesa</span>
                    </div>
                    <div class="summary-value expense">${formatCurrency(expense, 'BRL')}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">
                        <i class="fas fa-piggy-bank"></i>
                        <span>Saldo </span>
                    </div>
                    <div class="summary-value savings">${formatCurrency(savings, 'BRL')}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">
                        <i class="fas fa-percentage"></i>
                        <span>Percentagem</span>
                    </div>
                    <div class="summary-value rate">${savingsRate}% ${savingsRate >= 0 ? '▲' : '▼'}</div>
                </div>
            `;
}

// Generate calendar
function generateCalendar(month, year) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const transactions = JSON.parse(localStorage.getItem('financeTransactions')) || [];
    const now = new Date();
    const today = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let calendarHTML = `
                <div class="calendar-header">
                    <div class="calendar-title">${monthNames[month]} ${year}</div>
                </div>
                <div class="calendar-grid">
                    <div class="calendar-day header">Dom</div>
                    <div class="calendar-day header">Seg</div>
                    <div class="calendar-day header">Ter</div>
                    <div class="calendar-day header">Qua</div>
                    <div class="calendar-day header">Qui</div>
                    <div class="calendar-day header">Sex</div>
                    <div class="calendar-day header">Sab</div>
            `;

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startingDay; i++) {
        calendarHTML += `<div class="calendar-day other-month">${prevMonthLastDay - startingDay + i + 1}</div>`;
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const hasEvent = transactions.some(t => {
            const transDate = new Date(t.date);
            return transDate.getDate() === i &&
                transDate.getMonth() === month &&
                transDate.getFullYear() === year;
        });

        const isToday = i === today && month === currentMonth && year === currentYear;
        const dayClass = isToday ? 'calendar-day current' :
            hasEvent ? 'calendar-day has-event' : 'calendar-day';

        calendarHTML += `<div class="${dayClass}">${i}</div>`;
    }

    // Next month days
    let nextMonthDay = 1;
    while ((startingDay + daysInMonth + nextMonthDay - 1) % 7 !== 0) {
        calendarHTML += `<div class="calendar-day other-month">${nextMonthDay}</div>`;
        nextMonthDay++;
    }

    calendarHTML += `</div>`;
    calendarContainer.innerHTML = calendarHTML;

    // Add click event to days with events
    document.querySelectorAll('.calendar-day.has-event').forEach(day => {
        day.addEventListener('click', () => {
            const dayNumber = parseInt(day.textContent);
            const date = new Date(year, month, dayNumber);
            showTransactionsForDate(date);
        });
    });
}

// Show transactions for a specific date
function showTransactionsForDate(date) {
    const transactions = JSON.parse(localStorage.getItem('financeTransactions')) || [];
    const dateStr = date.toISOString().split('T')[0];

    const filteredTransactions = transactions.filter(t => {
        const transDate = new Date(t.date).toISOString().split('T')[0];
        return transDate === dateStr;
    });

    if (filteredTransactions.length === 0) {
        showToast('Exite transaçãoes para esta data', 'info');
        return;
    }

    let message = `Transactions for ${date.toDateString()}:\n\n`;
    filteredTransactions.forEach(t => {
        message += `${t.type === 'income' ? '+' : '-'}${t.amount} - ${t.description} (${t.category})\n`;
    });

    showToast(message, 'info');
}

// Add new account
function addAccount() {
    const accounts = JSON.parse(localStorage.getItem('financeAccounts')) || [];

    const newAccount = {
        id: 'acc' + Date.now(),
        name: document.getElementById('accountName').value,
        type: document.getElementById('accountType').value,
        balance: parseFloat(document.getElementById('accountBalance').value),
        currency: document.getElementById('accountCurrency').value
    };

    accounts.push(newAccount);
    localStorage.setItem('financeAccounts', JSON.stringify(accounts));

    accountModal.classList.remove('active');
    accountForm.reset();
    loadAccounts();
    populateAccountDropdowns();
    showToast('Account added successfully!');
}

// ADICIONAR TRANFERENCIA
// Adicionar nova transação
function addTransaction() {
    const transactions = JSON.parse(localStorage.getItem('financeTransactions')) || [];
    const accounts = JSON.parse(localStorage.getItem('financeAccounts')) || [];

    const type = document.getElementById('transactionType').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const description = document.getElementById('transactionDescription').value;
    const category = document.getElementById('transactionCategory').value;
    const account = document.getElementById('transactionAccount').value;
    const toAccount = type === 'transfer' ? document.getElementById('transactionToAccount').value : null;
    const dateInput = document.getElementById('transactionDate').value;
    const dateObj = new Date(dateInput);
    dateObj.setDate(dateObj.getDate() + 1);
    const date = dateObj.toISOString().split('T')[0];

    if (type === 'transfer') {
        // Prevent transfer to the same account
        if (!account || !toAccount || account === toAccount) {
            showToast('Selecione contas diferentes para transferência.', 'error');
            return;
        }

        // Find source and destination accounts
        const fromIndex = accounts.findIndex(a => a.id === account);
        const toIndex = accounts.findIndex(a => a.id === toAccount);

        if (fromIndex === -1 || toIndex === -1) {
            showToast('Conta de origem ou destino inválida.', 'error');
            return;
        }

        if (accounts[fromIndex].balance < amount) {
            showToast('Saldo insuficiente para transferência.', 'error');
            return;
        }

        // Subtract from source, add to destination
        accounts[fromIndex].balance -= amount;
        accounts[toIndex].balance += amount;

        // Register two transactions: one out, one in
        const transferOut = {
            id: 'tr' + Date.now(),
            type: 'transfer',
            amount,
            description: description || 'Transferência enviada',
            category: category || 'Transferência',
            account,
            toAccount,
            date: new Date(date).toISOString(),
            direction: 'out'
        };
        const transferIn = {
            id: 'tr' + (Date.now() + 1),
            type: 'transfer',
            amount,
            description: description || 'Transferência recebida',
            category: category || 'Transferência',
            account: toAccount,
            toAccount: account,
            date: new Date(date).toISOString(),
            direction: 'in'
        };

        transactions.push(transferOut, transferIn);
        localStorage.setItem('financeTransactions', JSON.stringify(transactions));
        localStorage.setItem('financeAccounts', JSON.stringify(accounts));

        transactionModal.classList.remove('active');
        transactionForm.reset();
        document.getElementById('transactionDate').valueAsDate = new Date();
        loadTransactions();
        loadAccounts();
        loadMonthlySummary();
        generateCalendar(currentMonth, currentYear);
        showToast('Transferência realizada com sucesso!');
        return;
    }

    const newTransaction = {
        id: 'tr' + Date.now(),
        type,
        amount,
        description,
        category,
        account,
        date: new Date(date).toISOString()
    };

    transactions.push(newTransaction);
    localStorage.setItem('financeTransactions', JSON.stringify(transactions));

    // Update account balances if not transfer (transfers would need special handling)
    const accountIndex = accounts.findIndex(a => a.id === account);
    if (accountIndex !== -1) {
        if (type === 'income') {
            accounts[accountIndex].balance += amount;
        } else {
            accounts[accountIndex].balance -= amount;
        }
        localStorage.setItem('financeAccounts', JSON.stringify(accounts));
    }

    transactionModal.classList.remove('active');
    transactionForm.reset();
    document.getElementById('transactionDate').valueAsDate = new Date();
    loadTransactions();
    loadAccounts();
    loadMonthlySummary();
    generateCalendar(currentMonth, currentYear);
    showToast('Transação adicionada com sucesso!');
}

// Populate transaction categories
function populateTransactionCategories() {
    // Carrega categorias do localStorage ou usa padrão
    let categories = JSON.parse(localStorage.getItem('financeCategories'));
    if (!categories) {
        categories = [
            // Receitas
            'Salário',
            'Bônus',
            'Freelance',
            'Investimento',
            'Presente',
            'Aluguel Recebido',
            'Venda de Itens',
            'Reembolso',
            'Prêmios',
            'Dividendos',
            'Outras Receitas',
            'Renda Passiva',
            'Renda Extra',

            // Despesas
            'Moradia',
            'Aluguel',
            'Condomínio',
            'Contas (Água/Luz/Gás)',
            'Internet',
            'Telefone',
            'TV a Cabo',
            'Alimentação',
            'Supermercado',
            'Transporte',
            'Combustível',
            'Manutenção Veicular',
            'Estacionamento',
            'Transporte Público',
            'Saúde',
            'Farmácia',
            'Plano de Saúde',
            'Seguro',
            'Seguro de Vida',
            'Lazer',
            'Psícologa',
            'Viagens',
            'Passagens',
            'Compras',
            'Roupas',
            'Eletrônicos',
            'Educação',
            'Cursos',
            'Mensalidade Escolar',
            'Presentes',
            'Doações',
            'Cuidados Pessoais',
            'Beleza',
            'Assinaturas',
            'Academia',
            'Outros'
        ];
        localStorage.setItem('financeCategories', JSON.stringify(categories));
    }

    // Preenche o select de categorias
    const categorySelect = document.getElementById('transactionCategory');
    categorySelect.innerHTML = '<option value="">Selecione a categoria</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Preenche o modal de categorias
    const categoriesModalContent = document.getElementById('categoriesModalContent');
    if (categoriesModalContent) {
        if (categories.length === 0) {
            categoriesModalContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-tags"></i>
                    </div>
                    <div class="empty-text">Nenhuma categoria cadastrada</div>
                </div>
            `;
        } else {
            categoriesModalContent.innerHTML = `
                <div class="categories-list">
                    ${categories.map((category, idx) => `
                        <div class="category-item">
                            <span>${category}</span>
                            <button class="icon-modal delete-category-btn" data-idx="${idx}" title="Remover">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
            // Adiciona eventos de remoção
            categoriesModalContent.querySelectorAll('.delete-category-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const idx = parseInt(this.getAttribute('data-idx'));
                    let categories = JSON.parse(localStorage.getItem('financeCategories')) || [];
                    const removed = categories.splice(idx, 1);
                    localStorage.setItem('financeCategories', JSON.stringify(categories));
                    populateTransactionCategories();
                    showToast(`Categoria "${removed[0]}" removida com sucesso!`);
                });
            });
        }
    }

    // Adiciona evento para adicionar categoria
    const addBtn = document.getElementById('addcategoriasBtn');
    const addNewcategotia = document.getElementById('newcategotiaName');
    addBtn.onclick = function () {
            const newCategory = addNewcategotia ? addNewcategotia.value.trim() : '';
            if (newCategory) {
                let categories = JSON.parse(localStorage.getItem('financeCategories')) || [];
                if (!categories.includes(newCategory)) {
                    categories.push(newCategory);
                    localStorage.setItem('financeCategories', JSON.stringify(categories));
                    populateTransactionCategories();
                    showToast('Categoria adicionada com sucesso!');
                } else {
                    showToast('Categoria já existe!', 'error');
                }
                addNewcategotia.value = '';
            }
        };
}

// Populate account dropdowns
function populateAccountDropdowns() {
    const accounts = JSON.parse(localStorage.getItem('financeAccounts')) || [];
    const accountSelect = document.getElementById('transactionAccount');
    const toAccountSelect = document.getElementById('transactionToAccount');

    accountSelect.innerHTML = '<option value="">Selecione Conta</option>';
    toAccountSelect.innerHTML = '<option value="">Selecione Conta</option>';

    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name}`;
        accountSelect.appendChild(option);

        const option2 = document.createElement('option');
        option2.value = account.id;
        option2.textContent = `${account.name}`;
        toAccountSelect.appendChild(option2);
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastContent = toast.querySelector('.toast-content');
    
    // Define o ícone com base no tipo
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    // Atualiza o conteúdo
    toast.className = 'toasts';
    toast.classList.add(type);
    toastIcon.className = `fas ${icons[type]} toast-icon`;
    toastContent.textContent = message;
    toast.classList.add('show');
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
    
    // Fechar ao clicar no botão
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
    });
}

// Helper functions
function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency || 'RBR',
        minimumFractionDigits: 2
    }).format(amount);
}

function getAccountIcon(type) {
    switch (type) {
        case 'Dinheiro': return 'fa-money-bill-wave';
        case 'Banco': return 'fa-university';
        case 'Crédito': return 'fa-credit-card';
        case 'Investimento': return 'fa-chart-line';
        case 'Digital': return 'fa-mobile-alt';
        default: return 'fa-wallet';
    }
}

function getTransactionIcon(type, category) {
    if (type === 'income') {
        switch (category) {
            case 'Salário': return 'fa-briefcase';
            case 'Bônus': return 'fa-gift';
            case 'Freelance': return 'fa-laptop-code';
            case 'Investimento': return 'fa-chart-line';
            case 'Presente': return 'fa-gift';
            default: return 'fa-dollar-sign';
        }
    } else {
        switch (category) {
            case 'Moradia': return 'fa-home';
            case 'Contas': return 'fa-bolt';
            case 'Alimentação': return 'fa-utensils';
            case 'Restaurante': return 'fa-hamburger';
            case 'Transporte': return 'fa-car';
            case 'Saúde': return 'fa-heartbeat';
            case 'Seguro': return 'fa-shield-alt';
            case 'Lazer': return 'fa-gamepad';
            case 'Compras': return 'fa-shopping-bag';
            case 'Educação': return 'fa-graduation-cap';
            case 'Presentes': return 'fa-gift';
            case 'Viagens': return 'fa-plane';
            default: return 'fa-receipt';
        }
    }
}

// Variável global para armazenar contas frequentes
let recurringBills = [];

// Inicializar contas frequentes
function initRecurringBills() {
    const savedBills = localStorage.getItem('recurringBills');
    recurringBills = savedBills ? JSON.parse(savedBills) : [
        { id: 'bill1', name: 'Dentista', checked: false },
        { id: 'bill2', name: 'Internet', checked: false },
        { id: 'bill3', name: 'Celular', checked: false }
    ];
    saveRecurringBills();
    renderRecurringBills();
}

// Salvar no localStorage
function saveRecurringBills() {
    localStorage.setItem('recurringBills', JSON.stringify(recurringBills));
}

// Renderizar a lista
function renderRecurringBills() {
    const billsList = document.getElementById('recurringBillsList');
    billsList.innerHTML = '';

    if (recurringBills.length === 0) {
        billsList.innerHTML = `
            <div class="empty-recurring">
                <i class="fas fa-file-invoice-dollar"></i>
                <p>Nenhuma conta frequente cadastrada</p>
            </div>
        `;
        return;
    }

    recurringBills.forEach(bill => {
        const billElement = document.createElement('div');
        billElement.className = 'bill-item';
        billElement.innerHTML = `
            <div class="bill-info">
                <input type="checkbox" id="check-${bill.id}" class="bill-checkbox" ${bill.checked ? 'checked' : ''}>
                <label for="check-${bill.id}" class="bill-name">${bill.name}</label>
            </div>
            <div class="bill-actions">
                <button class="icon-modal bill-action-btn delete-bill" data-id="${bill.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        billsList.appendChild(billElement);
    });

    // Adicionar eventos
    document.querySelectorAll('.bill-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const billId = this.id.replace('check-', '');
            toggleBillChecked(billId);
        });
    });

    document.querySelectorAll('.delete-bill').forEach(btn => {
        btn.addEventListener('click', function() {
            const billId = this.getAttribute('data-id');
            removeBill(billId);
        });
    });
}

// Adicionar nova conta
function addBill() {
    const input = document.getElementById('newBillName');
    const billName = input.value.trim();

    if (billName) {
        const newBill = {
            id: 'bill' + Date.now(),
            name: billName,
            checked: false
        };
        
        recurringBills.push(newBill);
        saveRecurringBills();
        renderRecurringBills();
        input.value = '';
        showToast('Conta adicionada com sucesso!');
    }
}

// Remover conta
function removeBill(billId) {
    recurringBills = recurringBills.filter(bill => bill.id !== billId);
    saveRecurringBills();
    renderRecurringBills();
    showToast('Conta removida com sucesso!');
}

// Marcar/desmarcar como paga
function toggleBillChecked(billId) {
    recurringBills = recurringBills.map(bill => {
        if (bill.id === billId) {
            return { ...bill, checked: !bill.checked };
        }
        return bill;
    });
    saveRecurringBills();
}

// No DOMContentLoaded, adicione:
document.addEventListener('DOMContentLoaded', () => {
   
    initRecurringBills();

    
    document.getElementById('addBillBtn').addEventListener('click', addBill);
    document.getElementById('newBillName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addBill();
        }
    });

    document.getElementById('addcategoriasBtn').addEventListener('click', addBill);
    document.getElementById('newcategotiaName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const addNewcategotia = document.getElementById('newcategotiaName');
            const newCategory = addNewcategotia ? addNewcategotia.value.trim() : '';
            if (newCategory) {
                let categories = JSON.parse(localStorage.getItem('financeCategories')) || [];
                if (!categories.includes(newCategory)) {
                    categories.push(newCategory);
                    localStorage.setItem('financeCategories', JSON.stringify(categories));
                    populateTransactionCategories();
                    showToast('Categoria adicionada com sucesso!');
                } else {
                    showToast('Categoria já existe!', 'error');
                }
                addNewcategotia.value = '';
            }
        }
    });
});
 


function activateCorrespondingModal(navButton) {
    // Remove a classe active de todos os modais
    document.querySelectorAll('.modal-nav').forEach(modal => modal.classList.remove('active'));

    // Obtém o seletor do modal alvo a partir do atributo data-target
    const targetModalId = navButton.getAttribute('data-target');
    if (!targetModalId) return;

    // Encontra o modal correspondente
    const targetModal = document.querySelector(targetModalId);

    // Adiciona a classe active ao modal correspondente, se existir
    if (targetModal) {
        targetModal.classList.add('active');
    }
}

document.querySelectorAll('.nav-b').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();

        // Remove a classe active de todos os botões
        document.querySelectorAll('.nav-b').forEach(btn => btn.classList.remove('active'));

        // Adiciona a classe active ao botão clicado
        this.classList.add('active');

        // Ativa o modal correspondente
        activateCorrespondingModal(this);
    });
});

// Fechar modais ao clicar no botão de fechar
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.modal').classList.remove('active');
    });
});

// Mobile Menu
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const addAccountBtnMobile = document.getElementById('addAccountBtnMobile');
const addIncomeBtnMobile = document.getElementById('addIncomeBtnMobile');
const addExpenseBtnMobile = document.getElementById('addExpenseBtnMobile');

hamburgerBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    mobileMenuOverlay.classList.toggle('active');
});

mobileMenuOverlay.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
});

// Mobile menu buttons
addIncomeBtnMobile.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    transactionModalTitle.textContent = 'Adicionar Nova Receita';
    document.getElementById('transactionType').value = 'income';
    transferAccountGroup.style.display = 'none';
    transactionModal.classList.add('active');
});

addExpenseBtnMobile.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    transactionModalTitle.textContent = 'Adicionar Nova Despesa';
    document.getElementById('transactionType').value = 'expense';
    transferAccountGroup.style.display = 'none';
    transactionModal.classList.add('active');
});

// Adiciona evento ao botão flutuante
document.getElementById('fabIncome').addEventListener('click', () => {
    transactionModalTitle.textContent = 'Adicionar Nova Receita';
    document.getElementById('transactionType').value = 'income';
    transferAccountGroup.style.display = 'none';
    transactionModal.classList.add('active');
    
    // Foca no primeiro campo do formulário
    setTimeout(() => {
        document.getElementById('transactionAmount').focus();
    }, 100);
});

//Reiniciar todos os dados
const resetarDados = () => {
    if (confirm('Você tem certeza que deseja reiniciar todos os dados? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('financeAccounts');
        localStorage.removeItem('financeTransactions');
        localStorage.removeItem('financeCategories');
        localStorage.removeItem('recurringBills');
        showToast('Todos os dados foram reiniciados com sucesso!', 'success');
        location.reload();
    }
};
/************************************************************** */
// Exportar dados para arquivo
document.getElementById('exportDataBtn').addEventListener('click', exportData);

// Importar dados de arquivo
document.getElementById('importDataBtn').addEventListener('click', () => {
    document.getElementById('importFileInput').click();
});
// Exportar dados para arquivo
document.getElementById('exportDataBtn1').addEventListener('click', exportData);

// Importar dados de arquivo
document.getElementById('importDataBtn1').addEventListener('click', () => {
    document.getElementById('importFileInput1').click();
});

document.getElementById('importFileInput').addEventListener('change', importData);
document.getElementById('importFileInput1').addEventListener('change', importData);

// Função para exportar dados
function exportData() {
    // Coletar todos os dados do localStorage
    const appData = {
        financeAccounts: JSON.parse(localStorage.getItem('financeAccounts') || '[]'),
        financeTransactions: JSON.parse(localStorage.getItem('financeTransactions') || '[]'),
        financeCreditCards: JSON.parse(localStorage.getItem('financeCreditCards') || '[]'),
        recurringBills: JSON.parse(localStorage.getItem('recurringBills') || '[]'),
        financeCategories: JSON.parse(localStorage.getItem('financeCategories') || '[]'),
        // Adicione outros dados que deseja backup
        exportDate: new Date().toISOString()
    };

    // Criar arquivo JSON
    const dataStr = JSON.stringify(appData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    // Criar link de download
    const exportFileDefaultName = `finance-flex-backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    
    showToast('Backup exportado com sucesso!', 'success');
}

// Função para importar dados
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const appData = JSON.parse(e.target.result);
            
            // Verificar se o arquivo é válido
            if (!appData.financeAccounts || !appData.financeTransactions) {
                throw new Error('Arquivo de backup inválido');
            }

            // Confirmar antes de sobrescrever dados
            if (confirm('Isso substituirá todos os seus dados atuais. Continuar?')) {
                // Salvar dados no localStorage
                localStorage.setItem('financeAccounts', JSON.stringify(appData.financeAccounts));
                localStorage.setItem('financeTransactions', JSON.stringify(appData.financeTransactions));
                
                if (appData.financeCreditCards) {
                    localStorage.setItem('financeCreditCards', JSON.stringify(appData.financeCreditCards));
                }
                
                if (appData.recurringBills) {
                    localStorage.setItem('recurringBills', JSON.stringify(appData.recurringBills));
                }

                // Importar categorias, se existirem
                if (appData.financeCategories) {
                    localStorage.setItem('financeCategories', JSON.stringify(appData.financeCategories));
                }
                
                showToast('Dados importados com sucesso!', 'success');
                
                // Recarregar a aplicação
                setTimeout(() => location.reload(), 1000);
            }
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            showToast('Erro ao importar backup: ' + error.message, 'error');
        }
        
        // Resetar o input
        event.target.value = '';
    };
    reader.readAsText(file);
}

