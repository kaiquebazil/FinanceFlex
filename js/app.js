// DOM Elements
const accountModal = document.getElementById("accountModal");
const transactionModal = document.getElementById("transactionModal");
const toast = document.getElementById("toast");
const addAccountBtns = document.querySelector("#addAccountBtn");
const addIncomeBtn = document.getElementById("addIncomeBtn");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const modalCloses = document.querySelectorAll(".modal-close");
const accountForm = document.getElementById("accountForm");
const transactionForm = document.getElementById("transactionForm");
const transactionType = document.getElementById("transactionType");
const transferAccountGroup = document.getElementById("transferAccountGroup");
const accountsList = document.getElementById("accountsList");
const transactionsList = document.getElementById("transactionsList");
const monthlySummary = document.getElementById("monthlySummary");
const calendarContainer = document.getElementById("calendarContainer");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const tabs = document.querySelectorAll(".tab");
const transactionModalTitle = document.getElementById("transactionModalTitle");

// Data
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedPeriod = "today";

// Variáveis para controle dos filtros
let currentFilter = "all";
let currentPeriod = "today";
let currentCategory = "all";

// Variáveis globais para cartões e cofrinhos
let currentCreditCardId = null;
let currentPiggyBankId = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Inicializando aplicação...");

  // INICIALIZAR TODOS OS DADOS PRIMEIRO
  initializeAllData();

  // DEPOIS CONFIGURAR A INTERFACE
  setupInterface();

  // FINALMENTE CARREGAR OS DADOS
  loadAllData();

  // Configurar filtros
  setupFilterButtons();

  // Adicione esta linha para garantir que as contas recorrentes são renderizadas
  renderRecurringBills();
});

function initializeAllData() {
  // Garantir que todos os dados existam
  if (!localStorage.getItem("financeAccounts")) {
    initializeData();
  }
  if (!localStorage.getItem("financeCategories")) {
    populateTransactionCategories();
  }
  if (!localStorage.getItem("recurringBills")) {
    initRecurringBills(); // Usar a função atualizada
  }
  if (!localStorage.getItem("piggyBanks")) {
    initPiggyBanks();
  }
  if (!localStorage.getItem("financeCreditCards")) {
    initCreditCardsSystem();
  }
}

function setupInterface() {
  // Configurar data atual
  document.getElementById("transactionDate").valueAsDate = new Date();
  document.getElementById("piggyBankTransactionDate").valueAsDate = new Date();

  // Configurar event listeners
  setupEventListeners();
}

function loadAllData() {
  // Carregar todos os dados na interface
  loadAccounts();
  loadTransactions();
  loadMonthlySummary();
  generateCalendar(currentMonth, currentYear);
  populateTransactionCategories();
  populateAccountDropdowns();
  populatePiggyBankAccountDropdowns();
  loadPiggyBanks();
  loadCreditCards();
}

function setupEventListeners() {
  // Event listeners for modals
  addAccountBtns.addEventListener("click", () => {
    accountModal.classList.add("active");
  });

  addIncomeBtn.addEventListener("click", () => {
    transactionModalTitle.textContent = "Adicionar Nova Receita";
    document.getElementById("transactionType").value = "income";
    transferAccountGroup.style.display = "none";
    transactionModal.classList.add("active");
  });

  addExpenseBtn.addEventListener("click", () => {
    transactionModalTitle.textContent = "Adicionar Nova Despesa";
    document.getElementById("transactionType").value = "expense";
    transferAccountGroup.style.display = "none";
    transactionModal.classList.add("active");
  });

  modalCloses.forEach((btn) => {
    btn.addEventListener("click", () => {
      accountModal.classList.remove("active");
      transactionModal.classList.remove("active");
      document.getElementById("creditCardsModal").classList.remove("active");
      document.getElementById("creditCardModal").classList.remove("active");
      document
        .getElementById("creditCardPurchaseModal")
        .classList.remove("active");
      document.getElementById("piggyBankModal").classList.remove("active");
      document
        .getElementById("piggyBankTransactionModal")
        .classList.remove("active");
      document.getElementById("categoriesModal").classList.remove("active");
      document.getElementById("reconrrentesModal").classList.remove("active");
      document.getElementById("accountsModal").classList.remove("active");
      document.getElementById("transactionsModal").classList.remove("active");
    });
  });

  // Transaction type change
  transactionType.addEventListener("change", (e) => {
    if (e.target.value === "transfer") {
      transactionModalTitle.textContent = "Adicionar Transferência";
      transferAccountGroup.style.display = "block";
    } else if (e.target.value === "income") {
      transactionModalTitle.textContent = "Adicionar Nova Receita";
      transferAccountGroup.style.display = "none";
    } else {
      transactionModalTitle.textContent = "Adicionar Nova Despesa";
      transferAccountGroup.style.display = "none";
    }
  });

  // Form submissions
  accountForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateAccountForm()) {
      addAccount();
    }
  });

  transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateTransactionForm()) {
      addTransaction();
    }
  });

  // Calendar navigation
  prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
  });

  // Transaction tabs
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      selectedPeriod = tab.dataset.period;
      loadTransactions();
    });
  });

  // Mobile Menu
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
  const addIncomeBtnMobile = document.getElementById("addIncomeBtnMobile");
  const addExpenseBtnMobile = document.getElementById("addExpenseBtnMobile");

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
      mobileMenuOverlay.classList.toggle("active");
    });
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
      mobileMenuOverlay.classList.remove("active");
    });
  }

  // Mobile menu buttons
  if (addIncomeBtnMobile) {
    addIncomeBtnMobile.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
      mobileMenuOverlay.classList.remove("active");
      transactionModalTitle.textContent = "Adicionar Nova Receita";
      document.getElementById("transactionType").value = "income";
      transferAccountGroup.style.display = "none";
      transactionModal.classList.add("active");
    });
  }

  if (addExpenseBtnMobile) {
    addExpenseBtnMobile.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
      mobileMenuOverlay.classList.remove("active");
      transactionModalTitle.textContent = "Adicionar Nova Despesa";
      document.getElementById("transactionType").value = "expense";
      transferAccountGroup.style.display = "none";
      transactionModal.classList.add("active");
    });
  }

  // Botão flutuante
  const fabIncome = document.getElementById("fabIncome");
  if (fabIncome) {
    fabIncome.addEventListener("click", () => {
      transactionModalTitle.textContent = "Adicionar Nova Receita";
      document.getElementById("transactionType").value = "income";
      transferAccountGroup.style.display = "none";
      transactionModal.classList.add("active");

      // Foca no primeiro campo do formulário
      setTimeout(() => {
        document.getElementById("transactionAmount").focus();
      }, 100);
    });
  }

  // Navegação entre modais
  document.querySelectorAll(".nav-b").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove a classe active de todos os botões
      document
        .querySelectorAll(".nav-b")
        .forEach((btn) => btn.classList.remove("active"));

      // Adiciona a classe active ao botão clicado
      this.classList.add("active");

      // Ativa o modal correspondente
      activateCorrespondingModal(this);
    });
  });

  // Contas recorrentes
  document.getElementById("addBillBtn").addEventListener("click", addBill);
  document
    .getElementById("newBillName")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        addBill();
      }
    });

  // Categorias
  document
    .getElementById("addcategoriasBtn")
    .addEventListener("click", addCategory);
  document
    .getElementById("newcategotiaName")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        addCategory();
      }
    });

  // Cofrinhos
  document
    .getElementById("addPiggyBankBtn")
    .addEventListener("click", addPiggyBank);
  document
    .getElementById("piggyBankForm")
    .addEventListener("submit", savePiggyBank);
  document
    .getElementById("piggyBankTransactionForm")
    .addEventListener("submit", handlePiggyBankTransaction);
  document
    .getElementById("piggyBankOperationType")
    .addEventListener("change", function () {
      const title =
        this.value === "deposit"
          ? "Depositar no Cofrinho"
          : "Retirar do Cofrinho";
      document.getElementById("piggyBankTransactionTitle").textContent = title;
    });

  // Cartões de crédito
  document
    .getElementById("viewCreditCardsBtn")
    .addEventListener("click", showCreditCardsModal);
  document
    .getElementById("addCreditCardBtn")
    .addEventListener("click", addCreditCard);
  document
    .getElementById("creditCardForm")
    .addEventListener("submit", saveCreditCard);
  document
    .getElementById("creditCardPurchaseForm")
    .addEventListener("submit", saveCreditCardPurchase);

  // Backup/Export
  document
    .getElementById("exportDataBtn")
    .addEventListener("click", exportData);
  document
    .getElementById("exportDataBtn1")
    .addEventListener("click", exportData);
  document.getElementById("importDataBtn").addEventListener("click", () => {
    document.getElementById("importFileInput").click();
  });
  document.getElementById("importDataBtn1").addEventListener("click", () => {
    document.getElementById("importFileInput1").click();
  });
  document
    .getElementById("importFileInput")
    .addEventListener("change", importData);
  document
    .getElementById("importFileInput1")
    .addEventListener("change", importData);

  // Ocultar/Mostrar valores
  const toggleValuesBtn = document.getElementById("toggleValues");
  let valuesHidden = localStorage.getItem("valuesHidden") === "true";

  // Atualizar estado inicial
  updateValuesVisibility();

  if (toggleValuesBtn) {
    toggleValuesBtn.addEventListener("click", () => {
      valuesHidden = !valuesHidden;
      localStorage.setItem("valuesHidden", valuesHidden);
      updateValuesVisibility();
    });
  }

  function updateValuesVisibility() {
    if (valuesHidden) {
      document.body.classList.add("values-hidden");
      toggleValuesBtn.innerHTML = '<i class="fas fa-eye"></i>';
      toggleValuesBtn.title = "Mostrar Valores";
    } else {
      document.body.classList.remove("values-hidden");
      toggleValuesBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
      toggleValuesBtn.title = "Ocultar Valores";
    }
  }
}

// Configurar botões de filtro
function setupFilterButtons() {
  // Event listeners para os botões de filtro (tipo)
  document.querySelectorAll(".filter-btn[data-filter]").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter-btn[data-filter]").forEach((b) => {
        b.classList.remove("active");
      });
      this.classList.add("active");
      currentFilter = this.dataset.filter;
      loadFilteredTransactions();
    });
  });

  // Event listeners para os botões de período
  document.querySelectorAll(".filter-btn[data-period]").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter-btn[data-period]").forEach((b) => {
        b.classList.remove("active");
      });
      this.classList.add("active");
      currentPeriod = this.dataset.period;
      loadFilteredTransactions();
    });
  });
}

// FUNÇÃO PARA ATUALIZAR TODAS AS INTERFACES
function updateAllInterfaces() {
  loadAccounts();
  loadTransactions();
  loadMonthlySummary();
  generateCalendar(currentMonth, currentYear);
  loadPiggyBanks();
  populateAccountDropdowns();
  populatePiggyBankAccountDropdowns();
  loadCreditCards();
  renderRecurringBills(); // Adicionar esta linha
}

// Initialize sample data
function initializeData() {
  const accounts = [
    {
      id: "acc1",
      name: "Mercado Pago",
      type: "Digital",
      balance: 0.0,
      currency: "BRL",
    },
    {
      id: "acc2",
      name: "Dinheiro",
      type: "Físico",
      balance: 0.0,
      currency: "BRL",
    },
  ];

  const transactions = [];

  localStorage.setItem("financeAccounts", JSON.stringify(accounts));
  localStorage.setItem("financeTransactions", JSON.stringify(transactions));
}

// VALIDAÇÃO DE FORMULÁRIOS
function validateAccountForm() {
  const name = document.getElementById("accountName").value.trim();
  const type = document.getElementById("accountType").value;
  const balance = parseFloat(document.getElementById("accountBalance").value);

  if (!name) {
    showToast("Nome da conta é obrigatório!", "error");
    return false;
  }

  if (!type) {
    showToast("Tipo de conta é obrigatório!", "error");
    return false;
  }

  if (isNaN(balance)) {
    showToast("Saldo inicial deve ser um número válido!", "error");
    return false;
  }

  return true;
}

function validateTransactionForm() {
  const amount = parseFloat(document.getElementById("transactionAmount").value);
  const description = document
    .getElementById("transactionDescription")
    .value.trim();
  const category = document.getElementById("transactionCategory").value;
  const account = document.getElementById("transactionAccount").value;

  if (isNaN(amount) || amount <= 0) {
    showToast("Valor deve ser maior que zero!", "error");
    return false;
  }

  if (!description) {
    showToast("Descrição é obrigatória!", "error");
    return false;
  }

  if (!category) {
    showToast("Categoria é obrigatória!", "error");
    return false;
  }

  if (!account) {
    showToast("Conta é obrigatória!", "error");
    return false;
  }

  return true;
}

// Add new account
function addAccount() {
  const accounts = JSON.parse(localStorage.getItem("financeAccounts")) || [];

  const newAccount = {
    id: "acc" + Date.now(),
    name: document.getElementById("accountName").value,
    type: document.getElementById("accountType").value,
    balance: parseFloat(document.getElementById("accountBalance").value),
    currency: document.getElementById("accountCurrency").value,
  };

  accounts.push(newAccount);
  localStorage.setItem("financeAccounts", JSON.stringify(accounts));

  accountModal.classList.remove("active");
  accountForm.reset();
  updateAllInterfaces();
  showToast("Conta adicionada com sucesso!");
}

// Add new transaction - VERSÃO CORRIGIDA
function addTransaction() {
  const transactions =
    JSON.parse(localStorage.getItem("financeTransactions")) || [];
  const accounts = JSON.parse(localStorage.getItem("financeAccounts")) || [];

  const type = document.getElementById("transactionType").value;
  const amount = parseFloat(document.getElementById("transactionAmount").value);
  const description = document.getElementById("transactionDescription").value;
  const category = document.getElementById("transactionCategory").value;
  const account = document.getElementById("transactionAccount").value;
  const toAccount =
    type === "transfer"
      ? document.getElementById("transactionToAccount").value
      : null;
  const dateInput = document.getElementById("transactionDate").value;

  // VALIDAÇÃO CRÍTICA
  if (!account) {
    showToast("Selecione uma conta!", "error");
    return;
  }

  if (amount <= 0) {
    showToast("O valor deve ser maior que zero!", "error");
    return;
  }

  const dateObj = new Date(dateInput);
  const date = dateObj.toISOString().split("T")[0];

  if (type === "transfer") {
    if (!account || !toAccount || account === toAccount) {
      showToast("Selecione contas diferentes para transferência.", "error");
      return;
    }

    const fromIndex = accounts.findIndex((a) => a.id === account);
    const toIndex = accounts.findIndex((a) => a.id === toAccount);

    if (fromIndex === -1 || toIndex === -1) {
      showToast("Conta de origem ou destino inválida.", "error");
      return;
    }

    if (accounts[fromIndex].balance < amount) {
      showToast("Saldo insuficiente para transferência.", "error");
      return;
    }

    // Atualizar saldos
    accounts[fromIndex].balance -= amount;
    accounts[toIndex].balance += amount;

    // Registrar transações
    const transferOut = {
      id: "tr" + Date.now(),
      type: "transfer",
      amount,
      description: description || "Transferência enviada",
      category: category || "Transferência",
      account,
      toAccount,
      date: date,
      direction: "out",
    };

    const transferIn = {
      id: "tr" + (Date.now() + 1),
      type: "transfer",
      amount,
      description: description || "Transferência recebida",
      category: category || "Transferência",
      account: toAccount,
      toAccount: account,
      date: date,
      direction: "in",
    };

    transactions.push(transferOut, transferIn);

    // SALVAR E ATUALIZAR TUDO
    localStorage.setItem("financeTransactions", JSON.stringify(transactions));
    localStorage.setItem("financeAccounts", JSON.stringify(accounts));

    // ATUALIZAR TODAS AS INTERFACES
    updateAllInterfaces();

    showToast("Transferência realizada com sucesso!");
  } else {
    // Transação normal (receita/despesa)
    const newTransaction = {
      id: "tr" + Date.now(),
      type,
      amount,
      description,
      category,
      account,
      date: date,
    };

    transactions.push(newTransaction);

    // Atualizar saldo da conta
    const accountIndex = accounts.findIndex((a) => a.id === account);
    if (accountIndex !== -1) {
      if (type === "income") {
        accounts[accountIndex].balance += amount;
      } else {
        if (accounts[accountIndex].balance < amount) {
          showToast("Saldo insuficiente!", "error");
          return;
        }
        accounts[accountIndex].balance -= amount;
      }

      // SALVAR E ATUALIZAR TUDO
      localStorage.setItem("financeTransactions", JSON.stringify(transactions));
      localStorage.setItem("financeAccounts", JSON.stringify(accounts));

      // ATUALIZAR TODAS AS INTERFACES
      updateAllInterfaces();

      showToast("Transação adicionada com sucesso!");
    }
  }

  // Fechar modal e resetar formulário
  transactionModal.classList.remove("active");
  transactionForm.reset();
  document.getElementById("transactionDate").valueAsDate = new Date();
}

// Load accounts - VERSÃO CORRIGIDA
function loadAccounts() {
  const accounts = JSON.parse(localStorage.getItem("financeAccounts")) || [];
  const accountsList = document.getElementById("accountsList");
  const accountsModalContent = document.getElementById("accountsModalContent");

  // VERIFICAÇÃO DE ELEMENTOS
  if (!accountsList) {
    console.error("Elemento accountsList não encontrado");
    return;
  }

  accountsList.innerHTML = "";

  if (accounts.length === 0) {
    accountsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-wallet"></i>
                </div>
                <div class="empty-text">Nenhuma conta encontrada</div>
            </div>
        `;

    if (accountsModalContent) {
      accountsModalContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <div class="empty-text">Nenhuma conta encontrada</div>
                </div>
            `;
    }
    return;
  }

  // RENDERIZAR CONTAS NO DASHBOARD
  accounts.forEach((account) => {
    const accountItem = document.createElement("div");
    accountItem.className = "account-item";
    accountItem.innerHTML = `
            <div class="account-info">
                <div class="account-icon">
                    <i class="fas ${getAccountIcon(account.type)}"></i>
                </div>
                <div>
                    <div class="account-name">${account.name}</div>
                    <div class="account-type">${account.type} • ${
      account.currency
    }</div>
                </div>
            </div>
            <div class="account-balance ${
              account.balance >= 0 ? "positive" : "negative"
            }">
                ${formatCurrency(account.balance, account.currency)}
            </div>
        `;
    accountsList.appendChild(accountItem);
  });

  // RENDERIZAR CONTAS NO MODAL (COM BOTÕES DE AÇÃO)
  if (accountsModalContent) {
    accountsModalContent.innerHTML = `
            <div class="accounts-list">
                ${accounts
                  .map(
                    (account) => `
                    <div class="account-item">
                        <div class="account-icon">
                            <i class="fas ${getAccountIcon(account.type)}"></i>
                        </div>
                        <div class="account-details">
                            <h4>${account.name}</h4>
                            <p>${account.type} • ${account.currency}</p>
                            <p class="balance">${formatCurrency(
                              account.balance,
                              account.currency
                            )}</p>
                        </div>
                        <div class="account-actions">
                            <button class="icon-modal delete-account-btn" data-id="${
                              account.id
                            }" title="Remover conta">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;

    // RE-ADICIONAR EVENTOS DE DELETE
    accountsModalContent
      .querySelectorAll(".delete-account-btn")
      .forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          deleteAccount(id);
        });
      });
  }
}

// FUNÇÃO PARA DELETAR CONTA
function deleteAccount(accountId) {
  if (
    !confirm(
      "Tem certeza que deseja apagar esta conta? Todas as transações associadas serão perdidas."
    )
  ) {
    return;
  }

  let accounts = JSON.parse(localStorage.getItem("financeAccounts")) || [];
  let transactions =
    JSON.parse(localStorage.getItem("financeTransactions")) || [];

  // REMOVER CONTA
  accounts = accounts.filter((acc) => acc.id !== accountId);

  // REMOVER TRANSAÇÕES ASSOCIADAS
  transactions = transactions.filter(
    (t) => t.account !== accountId && t.toAccount !== accountId
  );

  // SALVAR ALTERAÇÕES
  localStorage.setItem("financeAccounts", JSON.stringify(accounts));
  localStorage.setItem("financeTransactions", JSON.stringify(transactions));

  // ATUALIZAR TUDO
  updateAllInterfaces();
  showToast("Conta removida com sucesso!");
}

// Load transactions
function loadTransactions() {
  const transactions =
    JSON.parse(localStorage.getItem("financeTransactions")) || [];
  const now = new Date();
  let filteredTransactions = [];

  switch (selectedPeriod) {
    case "today":
      filteredTransactions = transactions.filter((t) => {
        const transDate = new Date(t.date);
        return transDate.toDateString() === now.toDateString();
      });
      break;
    case "week":
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);

      filteredTransactions = transactions.filter((t) => {
        const transDate = new Date(t.date);
        return transDate >= startOfWeek && transDate <= endOfWeek;
      });
      break;
    case "month":
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      filteredTransactions = transactions.filter((t) => {
        const transDate = new Date(t.date);
        return transDate >= startOfMonth && transDate <= endOfMonth;
      });
      break;
    case "upcoming":
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      filteredTransactions = transactions.filter((t) => {
        const transDate = new Date(t.date);
        return transDate > today && transDate <= nextWeek;
      });
      break;
    default:
      filteredTransactions = transactions;
  }

  transactionsList.innerHTML = "";

  if (filteredTransactions.length === 0) {
    transactionsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="empty-text">Nenhuma transação encontrada</div>
            </div>
        `;
  } else {
    filteredTransactions.forEach((transaction) => {
      const accounts =
        JSON.parse(localStorage.getItem("financeAccounts")) || [];
      const account = accounts.find((a) => a.id === transaction.account);

      const transactionItem = document.createElement("div");
      transactionItem.className = "transaction-item";
      transactionItem.innerHTML = `
                <div class="transaction-icon">
                    <i class="fas ${getTransactionIcon(
                      transaction.type,
                      transaction.category
                    )}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-name">${
                      transaction.description
                    }</div>
                    <div class="transaction-category">${
                      transaction.category
                    } • ${account ? account.name : "Unknown Account"}</div>
                    <span class="transaction-date">${new Date(
                      transaction.date
                    ).toLocaleDateString("pt-BR")}</span>
                </div>
                <div class="transaction-amount ${
                  transaction.type === "income" ? "positive" : "negative"
                }">
                    ${
                      transaction.type === "income" ? "+" : "-"
                    }${formatCurrency(
        transaction.amount,
        account ? account.currency : "BRL"
      )}
                </div>
            `;
      transactionsList.appendChild(transactionItem);
    });
  }

  // Adiciona as transações no modal de transações
  const transactionsModalContent = document.getElementById(
    "transactionsModalContent"
  );
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
                    ${transactions
                      .map((transaction) => {
                        const accounts =
                          JSON.parse(localStorage.getItem("financeAccounts")) ||
                          [];
                        const account = accounts.find(
                          (a) => a.id === transaction.account
                        );
                        return `
                            <div class="transaction-item">
                                <div class="transaction-icon">
                                    <i class="fas ${getTransactionIcon(
                                      transaction.type,
                                      transaction.category
                                    )}"></i>
                                </div>
                                <div class="transaction-details">
                                    <div class="transaction-name">${
                                      transaction.description
                                    }</div>
                                    <div class="transaction-category">${
                                      transaction.category
                                    } • ${
                          account ? account.name : "Unknown Account"
                        }</div>
                                    <span class="transaction-date">${new Date(
                                      transaction.date
                                    ).toLocaleDateString("pt-BR")}</span>
                                </div>
                                <div class="transaction-amount ${
                                  transaction.type === "income"
                                    ? "positive"
                                    : "negative"
                                }">
                                    ${
                                      transaction.type === "income" ? "+" : "-"
                                    }${formatCurrency(
                          transaction.amount,
                          account ? account.currency : "BRL"
                        )}
                                </div>
                                <button class="icon-modal delete-transaction-btn" data-id="${
                                  transaction.id
                                }" title="Remover">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                      })
                      .join("")}
                </div>
            `;
    }

    // Adiciona evento de remoção
    transactionsModalContent
      .querySelectorAll(".delete-transaction-btn")
      .forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          let transactions =
            JSON.parse(localStorage.getItem("financeTransactions")) || [];
          const transactionToRemove = transactions.find((t) => t.id === id);

          // Atualiza saldo da conta ao remover transação
          if (transactionToRemove) {
            let accounts =
              JSON.parse(localStorage.getItem("financeAccounts")) || [];
            const accountIndex = accounts.findIndex(
              (a) => a.id === transactionToRemove.account
            );
            if (accountIndex !== -1) {
              if (transactionToRemove.type === "income") {
                accounts[accountIndex].balance -= transactionToRemove.amount;
              } else if (transactionToRemove.type === "expense") {
                accounts[accountIndex].balance += transactionToRemove.amount;
              } else if (transactionToRemove.type === "transfer") {
                // Para transferências, remova ambos os registros (in/out)
                transactions = transactions.filter(
                  (t) =>
                    !(
                      t.id === id ||
                      (t.type === "transfer" &&
                        t.account === transactionToRemove.toAccount &&
                        t.amount === transactionToRemove.amount &&
                        t.date === transactionToRemove.date)
                    )
                );
                localStorage.setItem(
                  "financeTransactions",
                  JSON.stringify(transactions)
                );
                localStorage.setItem(
                  "financeAccounts",
                  JSON.stringify(accounts)
                );
                updateAllInterfaces();
                showToast("Transferência removida com sucesso!");
                return;
              }
              localStorage.setItem("financeAccounts", JSON.stringify(accounts));
            }
          }

          // Remove a transação
          transactions = transactions.filter((t) => t.id !== id);
          localStorage.setItem(
            "financeTransactions",
            JSON.stringify(transactions)
          );
          updateAllInterfaces();
          showToast("Transação removida com sucesso!");
        });
      });
  }
}

// Load monthly summary
function loadMonthlySummary() {
  const transactions =
    JSON.parse(localStorage.getItem("financeTransactions")) || [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const transDate = new Date(t.date);
    return (
      transDate.getMonth() === currentMonth &&
      transDate.getFullYear() === currentYear
    );
  });

  const income = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = income - expense;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

  monthlySummary.innerHTML = `
                <div class="summary-item">
                    <div class="summary-label">
                        <i class="fas fa-arrow-down"></i>
                        <span>Receitas</span>
                    </div>
                    <div class="summary-value income">${formatCurrency(
                      income,
                      "BRL"
                    )}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">
                        <i class="fas fa-arrow-up"></i>
                        <span>Despesas</span>
                    </div>
                    <div class="summary-value expense">${formatCurrency(
                      expense,
                      "BRL"
                    )}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">
                        <i class="fas fa-piggy-bank"></i>
                        <span>Saldo </span>
                    </div>
                    <div class="summary-value savings">${formatCurrency(
                      savings,
                      "BRL"
                    )}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">
                        <i class="fas fa-percentage"></i>
                        <span>Percentagem</span>
                    </div>
                    <div class="summary-value rate">${savingsRate}% ${
    savingsRate >= 0 ? "▲" : "▼"
  }</div>
                </div>
            `;
}

// Generate calendar
function generateCalendar(month, year) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const transactions =
    JSON.parse(localStorage.getItem("financeTransactions")) || [];
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
    calendarHTML += `<div class="calendar-day other-month">${
      prevMonthLastDay - startingDay + i + 1
    }</div>`;
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const hasEvent = transactions.some((t) => {
      const transDate = new Date(t.date);
      return (
        transDate.getDate() === i &&
        transDate.getMonth() === month &&
        transDate.getFullYear() === year
      );
    });

    const isToday =
      i === today && month === currentMonth && year === currentYear;
    const dayClass = isToday
      ? "calendar-day current"
      : hasEvent
      ? "calendar-day has-event"
      : "calendar-day";

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
  document.querySelectorAll(".calendar-day.has-event").forEach((day) => {
    day.addEventListener("click", () => {
      const dayNumber = parseInt(day.textContent);
      const date = new Date(year, month, dayNumber);
      showTransactionsForDate(date);
    });
  });
}

// Show transactions for a specific date
function showTransactionsForDate(date) {
  const transactions =
    JSON.parse(localStorage.getItem("financeTransactions")) || [];
  const dateStr = date.toISOString().split("T")[0];

  const filteredTransactions = transactions.filter((t) => {
    const transDate = new Date(t.date).toISOString().split("T")[0];
    return transDate === dateStr;
  });

  if (filteredTransactions.length === 0) {
    showToast("Nenhuma transação encontrada para esta data", "info");
    return;
  }

  let message = `Transações para ${date.toLocaleDateString("pt-BR")}:\n\n`;
  filteredTransactions.forEach((t) => {
    message += `${t.type === "income" ? "+" : "-"}${formatCurrency(
      t.amount,
      "BRL"
    )} - ${t.description} (${t.category})\n`;
  });

  showToast(message, "info");
}

// Populate transaction categories - VERSÃO CORRIGIDA
function populateTransactionCategories() {
  // VERIFICAR SE EXISTEM CATEGORIAS
  let categories = JSON.parse(localStorage.getItem("financeCategories"));

  if (!categories || categories.length === 0) {
    // Recriar categorias padrão se não existirem
    categories = [
      "Salário",
      "Bônus",
      "Freelance",
      "Investimento",
      "Presente",
      "Moradia",
      "Alimentação",
      "Transporte",
      "Saúde",
      "Lazer",
      "Educação",
      "Outros",
    ];
    localStorage.setItem("financeCategories", JSON.stringify(categories));
  }

  // PREENCHER SELECT DE CATEGORIAS - COM VERIFICAÇÃO
  const categorySelect = document.getElementById("transactionCategory");
  if (categorySelect) {
    categorySelect.innerHTML =
      '<option value="">Selecione a categoria</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  // PREENCHER MODAL DE CATEGORIAS - COM VERIFICAÇÃO
  const categoriesModalContent = document.getElementById(
    "categoriesModalContent"
  );
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
                    ${categories
                      .map(
                        (category, idx) => `
                        <div class="category-item">
                            <span>${category}</span>
                            <button class="icon-modal delete-category-btn" data-idx="${idx}" title="Remover">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;

      // RE-ADICIONAR EVENTOS DE REMOÇÃO
      categoriesModalContent
        .querySelectorAll(".delete-category-btn")
        .forEach((btn) => {
          btn.addEventListener("click", function () {
            const idx = parseInt(this.getAttribute("data-idx"));
            let categories =
              JSON.parse(localStorage.getItem("financeCategories")) || [];
            if (idx >= 0 && idx < categories.length) {
              const removed = categories.splice(idx, 1);
              localStorage.setItem(
                "financeCategories",
                JSON.stringify(categories)
              );
              populateTransactionCategories(); // RECARREGAR
              showToast(`Categoria "${removed[0]}" removida com sucesso!`);
            }
          });
        });
    }
  }
}

// Populate account dropdowns
function populateAccountDropdowns() {
  const accounts = JSON.parse(localStorage.getItem("financeAccounts")) || [];
  const accountSelect = document.getElementById("transactionAccount");
  const toAccountSelect = document.getElementById("transactionToAccount");

  if (accountSelect) {
    accountSelect.innerHTML = '<option value="">Selecione Conta</option>';
  }
  if (toAccountSelect) {
    toAccountSelect.innerHTML = '<option value="">Selecione Conta</option>';
  }

  accounts.forEach((account) => {
    if (accountSelect) {
      const option = document.createElement("option");
      option.value = account.id;
      option.textContent = `${account.name}`;
      accountSelect.appendChild(option);
    }

    if (toAccountSelect) {
      const option2 = document.createElement("option");
      option2.value = account.id;
      option2.textContent = `${account.name}`;
      toAccountSelect.appendChild(option2);
    }
  });
}

// Show toast notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  const toastIcon = toast.querySelector(".toast-icon");
  const toastContent = toast.querySelector(".toast-content");

  // Define o ícone com base no tipo
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  // Atualiza o conteúdo
  toast.className = "toasts";
  toast.classList.add(type);
  toastIcon.className = `fas ${icons[type]} toast-icon`;
  toastContent.textContent = message;
  toast.classList.add("show");

  // Remove automaticamente após 5 segundos
  setTimeout(() => {
    toast.classList.remove("show");
  }, 5000);

  // Fechar ao clicar no botão
  const closeBtn = toast.querySelector(".toast-close");
  if (closeBtn) {
    closeBtn.onclick = () => {
      toast.classList.remove("show");
    };
  }
}

// Helper functions
function formatCurrency(amount, currency) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
    minimumFractionDigits: 2,
  }).format(amount);
}

function getAccountIcon(type) {
  switch (type) {
    case "Dinheiro":
      return "fa-money-bill-wave";
    case "Banco":
      return "fa-university";
    case "Crédito":
      return "fa-credit-card";
    case "Investimento":
      return "fa-chart-line";
    case "Digital":
      return "fa-mobile-alt";
    default:
      return "fa-wallet";
  }
}

function getTransactionIcon(type, category) {
  if (type === "income") {
    switch (category) {
      case "Salário":
        return "fa-briefcase";
      case "Bônus":
        return "fa-gift";
      case "Freelance":
        return "fa-laptop-code";
      case "Investimento":
        return "fa-chart-line";
      case "Presente":
        return "fa-gift";
      default:
        return "fa-dollar-sign";
    }
  } else {
    switch (category) {
      case "Moradia":
        return "fa-home";
      case "Contas":
        return "fa-bolt";
      case "Alimentação":
        return "fa-utensils";
      case "Restaurante":
        return "fa-hamburger";
      case "Transporte":
        return "fa-car";
      case "Saúde":
        return "fa-heartbeat";
      case "Seguro":
        return "fa-shield-alt";
      case "Lazer":
        return "fa-gamepad";
      case "Compras":
        return "fa-shopping-bag";
      case "Educação":
        return "fa-graduation-cap";
      case "Presentes":
        return "fa-gift";
      case "Viagens":
        return "fa-plane";
      default:
        return "fa-receipt";
    }
  }
}

// CONTAS RECORRENTES
let recurringBills = JSON.parse(localStorage.getItem('recurringBills')) || [];

// Atualize esta função:
function initRecurringBills() {
  const savedBills = localStorage.getItem("recurringBills");
  if (!savedBills) {
    const defaultBills = [
      { id: "bill1", name: "Dentista", checked: false },
      { id: "bill2", name: "Internet", checked: false },
      { id: "bill3", name: "Celular", checked: false },
    ];
    localStorage.setItem("recurringBills", JSON.stringify(defaultBills));
  }
  loadRecurringBills();
}

// Crie esta nova função para carregar as contas recorrentes:
function loadRecurringBills() {
  const savedBills = localStorage.getItem("recurringBills");
  recurringBills = savedBills ? JSON.parse(savedBills) : [];
  renderRecurringBills();
}

// Atualize a função saveRecurringBills:
function saveRecurringBills() {
  localStorage.setItem("recurringBills", JSON.stringify(recurringBills));
}

// Atualize a função addBill:
function addBill() {
  const input = document.getElementById("newBillName");
  const billName = input.value.trim();

  if (billName) {
    const newBill = {
      id: "bill" + Date.now(),
      name: billName,
      checked: false,
    };

    recurringBills.push(newBill);
    saveRecurringBills();
    renderRecurringBills();
    input.value = "";
    showToast("Conta adicionada com sucesso!");
  }
}

// Atualize a função removeBill:
function removeBill(billId) {
  if (confirm("Tem certeza que deseja remover esta conta recorrente?")) {
    recurringBills = recurringBills.filter((bill) => bill.id !== billId);
    saveRecurringBills();
    renderRecurringBills();
    showToast("Conta removida com sucesso!");
  }
}

// Atualize a função toggleBillChecked:
function toggleBillChecked(billId) {
  recurringBills = recurringBills.map((bill) => {
    if (bill.id === billId) {
      const updatedBill = { ...bill, checked: !bill.checked };
      return updatedBill;
    }
    return bill;
  });
  saveRecurringBills();
}

// Atualize a função renderRecurringBills para carregar do localStorage:
function renderRecurringBills() {
  const billsList = document.getElementById("recurringBillsList");
  if (!billsList) return;

  // Carregar do localStorage
  const savedBills = localStorage.getItem("recurringBills");
  recurringBills = savedBills ? JSON.parse(savedBills) : [];

  billsList.innerHTML = "";

  if (recurringBills.length === 0) {
    billsList.innerHTML = `
            <div class="empty-recurring">
                <i class="fas fa-file-invoice-dollar"></i>
                <p>Nenhuma conta frequente cadastrada</p>
            </div>
        `;
    return;
  }

  recurringBills.forEach((bill) => {
    const billElement = document.createElement("div");
    billElement.className = "bill-item";
    billElement.innerHTML = `
            <div class="bill-info">
                <input type="checkbox" id="check-${
                  bill.id
                }" class="bill-checkbox" ${bill.checked ? "checked" : ""}>
                <label for="check-${bill.id}" class="bill-name">${
      bill.name
    }</label>
            </div>
            <div class="bill-actions">
                <button class="icon-modal bill-action-btn delete-bill" data-id="${
                  bill.id
                }">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    billsList.appendChild(billElement);
  });

  // Adicionar eventos
  document.querySelectorAll(".bill-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const billId = this.id.replace("check-", "");
      toggleBillChecked(billId);
    });
  });

  document.querySelectorAll(".delete-bill").forEach((btn) => {
    btn.addEventListener("click", function () {
      const billId = this.getAttribute("data-id");
      removeBill(billId);
    });
  });
}

function renderRecurringBills() {
  const billsList = document.getElementById("recurringBillsList");
  if (!billsList) return;

  billsList.innerHTML = "";

  if (recurringBills.length === 0) {
    billsList.innerHTML = `
            <div class="empty-recurring">
                <i class="fas fa-file-invoice-dollar"></i>
                <p>Nenhuma conta frequente cadastrada</p>
            </div>
        `;
    return;
  }

  recurringBills.forEach((bill) => {
    const billElement = document.createElement("div");
    billElement.className = "bill-item";
    billElement.innerHTML = `
            <div class="bill-info">
                <input type="checkbox" id="check-${
                  bill.id
                }" class="bill-checkbox" ${bill.checked ? "checked" : ""}>
                <label for="check-${bill.id}" class="bill-name">${
      bill.name
    }</label>
            </div>
            <div class="bill-actions">
                <button class="icon-modal bill-action-btn delete-bill" data-id="${
                  bill.id
                }">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    billsList.appendChild(billElement);
  });

  // Adicionar eventos
  document.querySelectorAll(".bill-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const billId = this.id.replace("check-", "");
      toggleBillChecked(billId);
    });
  });

  document.querySelectorAll(".delete-bill").forEach((btn) => {
    btn.addEventListener("click", function () {
      const billId = this.getAttribute("data-id");
      removeBill(billId);
    });
  });
}

function addBill() {
  const input = document.getElementById("newBillName");
  const billName = input.value.trim();

  if (billName) {
    const newBill = {
      id: "bill" + Date.now(),
      name: billName,
      checked: false,
    };

    recurringBills.push(newBill);
    saveRecurringBills();
    renderRecurringBills();
    input.value = "";
    showToast("Conta adicionada com sucesso!");
  }
}

function removeBill(billId) {
  recurringBills = recurringBills.filter((bill) => bill.id !== billId);
  saveRecurringBills();
  renderRecurringBills();
  showToast("Conta removida com sucesso!");
}

function toggleBillChecked(billId) {
  recurringBills = recurringBills.map((bill) => {
    if (bill.id === billId) {
      return { ...bill, checked: !bill.checked };
    }
    return bill;
  });
  saveRecurringBills();
}

function addCategory() {
  const addNewcategotia = document.getElementById("newcategotiaName");
  const newCategory = addNewcategotia ? addNewcategotia.value.trim() : "";
  if (newCategory) {
    let categories =
      JSON.parse(localStorage.getItem("financeCategories")) || [];
    if (!categories.includes(newCategory)) {
      categories.push(newCategory);
      localStorage.setItem("financeCategories", JSON.stringify(categories));
      populateTransactionCategories();
      showToast("Categoria adicionada com sucesso!");
    } else {
      showToast("Categoria já existe!", "error");
    }
    addNewcategotia.value = "";
  }
}

function activateCorrespondingModal(navButton) {
  // Remove a classe active de todos os modais
  document
    .querySelectorAll(".modal-nav")
    .forEach((modal) => modal.classList.remove("active"));

  // Obtém o seletor do modal alvo a partir do atributo data-target
  const targetModalId = navButton.getAttribute("data-target");
  if (!targetModalId) return;

  // Encontra o modal correspondente
  const targetModal = document.querySelector(targetModalId);

  // Adiciona a classe active ao modal correspondente, se existir
  if (targetModal) {
    targetModal.classList.add("active");
  }
}

// FILTROS DE TRANSAÇÕES
function loadTransactionCategories() {
  const transactions =
    JSON.parse(localStorage.getItem("financeTransactions")) || [];
  const categorySelect = document.getElementById("categorySelect");
  if (!categorySelect) return;

  // Extrair categorias únicas
  const categories = [...new Set(transactions.map((t) => t.category))].filter(
    Boolean
  );

  // Limpar e preencher dropdown
  categorySelect.innerHTML = '<option value="all">Todas categorias</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // Event listener para filtro de categoria
  categorySelect.addEventListener("change", function () {
    currentCategory = this.value;
    loadFilteredTransactions();
  });
}

function loadFilteredTransactions() {
  const transactions =
    JSON.parse(localStorage.getItem("financeTransactions")) || [];
  const accounts = JSON.parse(localStorage.getItem("financeAccounts")) || [];

  // Aplicar todos os filtros
  let filteredTransactions = applyFilters(transactions);

  // Ordenar por data (mais recente primeiro)
  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Renderizar resultados
  renderTransactions(filteredTransactions, accounts);
}

function applyFilters(transactions) {
  let result = [...transactions];

  // Filtro por tipo
  if (currentFilter !== "all") {
    result = result.filter((t) => t.type === currentFilter);
  }

  // Filtro por categoria
  if (currentCategory !== "all") {
    result = result.filter((t) => t.category === currentCategory);
  }

  // Filtro por período
  result = filterByPeriod(result);

  return result;
}

function filterByPeriod(transactions) {
  const now = new Date();
  let startDate, endDate;

  switch (currentPeriod) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "week":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(now);
      endDate.setDate(now.getDate() + (6 - now.getDay()));
      endDate.setHours(23, 59, 59, 999);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      return transactions;
  }

  return transactions.filter((t) => {
    const transDate = new Date(t.date);
    return transDate >= startDate && transDate <= endDate;
  });
}

function renderTransactions(transactions, accounts) {
  const container = document.getElementById("transactionsModalContent");
  if (!container) return;

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

  container.innerHTML = "";

  // Agrupar por categoria
  const transactionsByCategory = transactions.reduce((acc, transaction) => {
    const category = transaction.category || "Sem categoria";
    if (!acc[category]) acc[category] = [];
    acc[category].push(transaction);
    return acc;
  }, {});

  // Renderizar cada categoria
  for (const [category, categoryTransactions] of Object.entries(
    transactionsByCategory
  )) {
    const categoryElement = document.createElement("div");
    categoryElement.className = "category-group";

    // Calcular total da categoria
    const categoryTotal = categoryTransactions.reduce((sum, t) => {
      return t.type === "income" ? sum + t.amount : sum - t.amount;
    }, 0);

    // Header da categoria
    categoryElement.innerHTML = `
            <div class="category-header">
                <div class="category-name">${category}</div>
                <div class="category-total ${
                  categoryTotal >= 0 ? "income" : "expense"
                }">
                    ${categoryTotal >= 0 ? "+" : ""}${formatCurrency(
      Math.abs(categoryTotal),
      "BRL"
    )}
                </div>
            </div>
        `;

    // Adicionar transações
    const transactionsList = document.createElement("div");
    categoryTransactions.forEach((transaction) => {
      const account = accounts.find((a) => a.id === transaction.account);
      transactionsList.appendChild(
        createTransactionElement(transaction, account)
      );
    });

    categoryElement.appendChild(transactionsList);
    container.appendChild(categoryElement);
  }
}

function createTransactionElement(transaction, account) {
  const element = document.createElement("div");
  element.className = "transaction-item";

  element.innerHTML = `
        <div class="transaction-icon ${transaction.type}">
            <i class="fas ${getTransactionIcon(
              transaction.type,
              transaction.category
            )}"></i>
        </div>
        <div class="transaction-details">
            <div class="transaction-name">${transaction.description}</div>
            <div class="transaction-info">
                <span class="transaction-date">${formatDate(
                  transaction.date
                )}</span>
                <span class="transaction-account">${
                  account?.name || "Conta desconhecida"
                }</span>
            </div>
        </div>
        <div class="transaction-amount ${
          transaction.type === "income" ? "positive" : "negative"
        }">
            ${transaction.type === "income" ? "+" : "-"}${formatCurrency(
    transaction.amount,
    account?.currency || "BRL"
  )}
        </div>
    `;

  return element;
}

function formatDate(dateString) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(dateString).toLocaleDateString("pt-BR", options);
}

// COFRINHOS
function initPiggyBanks() {
  if (!localStorage.getItem("piggyBanks")) {
    const defaultPiggyBanks = [
      {
        id: "piggy1",
        name: "Férias",
        target: 5000,
        current: 1200,
        account: "",
        targetDate: "",
        color: "#00b0ff",
        createdAt: new Date().toISOString(),
      },
      {
        id: "piggy2",
        name: "Notebook Novo",
        target: 3500,
        current: 500,
        account: "",
        targetDate: "",
        color: "#ff3d00",
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem("piggyBanks", JSON.stringify(defaultPiggyBanks));
  }
  loadPiggyBanks();
}

function loadPiggyBanks() {
  const piggyBanks = JSON.parse(localStorage.getItem("piggyBanks")) || [];
  const piggyBanksList = document.getElementById("piggyBanksList");
  if (!piggyBanksList) return;

  piggyBanksList.innerHTML = "";

  if (piggyBanks.length === 0) {
    piggyBanksList.innerHTML = `
            <div class="empty-piggy-banks">
                <i class="fas fa-piggy-bank"></i>
                <p>Nenhum cofrinho criado ainda</p>
            </div>
        `;
    return;
  }

  piggyBanks.forEach((piggy) => {
    const percentage = Math.min(
      Math.round((piggy.current / piggy.target) * 100),
      100
    );
    const daysLeft = piggy.targetDate
      ? Math.ceil(
          (new Date(piggy.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
        )
      : null;

    const piggyElement = document.createElement("div");
    piggyElement.className = `piggy-bank-item ${
      percentage >= 100 ? "completed" : ""
    }`;
    piggyElement.style.borderLeftColor = piggy.color;
    piggyElement.innerHTML = `
            <div class="piggy-bank-header">
                <div class="piggy-bank-name">${piggy.name}</div>
                ${
                  piggy.targetDate
                    ? `<div class="piggy-bank-target-date">${
                        daysLeft >= 0
                          ? `${daysLeft} dias restantes`
                          : "Prazo expirado"
                      }</div>`
                    : ""
                }
            </div>
            <div class="piggy-bank-progress-container">
                <div class="piggy-bank-progress-bar" style="width: ${percentage}%; background-color: ${
      piggy.color
    }"></div>
            </div>
            <div class="piggy-bank-amounts">
                <span class="piggy-bank-current">${formatCurrency(
                  piggy.current,
                  "BRL"
                )}</span>
                <span class="piggy-bank-target">${formatCurrency(
                  piggy.target,
                  "BRL"
                )}</span>
            </div>
            <div class="piggy-bank-percentage">${percentage}% completo</div>
            <div class="piggy-bank-actions">
                <button class="piggy-bank-btn deposit-btn" data-id="${
                  piggy.id
                }">
                    <i class="fas fa-plus"></i> Depositar
                </button>
                <button class="piggy-bank-btn withdraw-btn" data-id="${
                  piggy.id
                }">
                    <i class="fas fa-minus"></i> Retirar
                </button>
                <button class="piggy-bank-btn edit-btn" data-id="${piggy.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="piggy-bank-btn danger delete-btn" data-id="${
                  piggy.id
                }">
                    <i class="fas fa-trash"></i> Apagar
                </button>
            </div>
        `;
    piggyBanksList.appendChild(piggyElement);
  });

  // Adicionar eventos
  document.querySelectorAll(".deposit-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      currentPiggyBankId = this.getAttribute("data-id");
      document.getElementById("piggyBankTransactionTitle").textContent =
        "Depositar no Cofrinho";
      document.getElementById("piggyBankOperationType").value = "deposit";
      document
        .getElementById("piggyBankTransactionModal")
        .classList.add("active");
    });
  });

  document.querySelectorAll(".withdraw-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      currentPiggyBankId = this.getAttribute("data-id");
      document.getElementById("piggyBankTransactionTitle").textContent =
        "Retirar do Cofrinho";
      document.getElementById("piggyBankOperationType").value = "withdraw";
      document
        .getElementById("piggyBankTransactionModal")
        .classList.add("active");
    });
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const piggyBankId = this.getAttribute("data-id");
      editPiggyBank(piggyBankId);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const piggyBankId = this.getAttribute("data-id");
      deletePiggyBank(piggyBankId);
    });
  });
}

function addPiggyBank() {
  document.getElementById("piggyBankModalTitle").textContent =
    "Adicionar Cofrinho";
  document.getElementById("piggyBankForm").reset();
  document.getElementById("piggyBankColor").value = "#7c4dff";
  currentPiggyBankId = null;
  document.getElementById("piggyBankModal").classList.add("active");
}

function editPiggyBank(piggyBankId) {
  const piggyBanks = JSON.parse(localStorage.getItem("piggyBanks")) || [];
  const piggyBank = piggyBanks.find((p) => p.id === piggyBankId);

  if (!piggyBank) return;

  document.getElementById("piggyBankModalTitle").textContent =
    "Editar Cofrinho";
  document.getElementById("piggyBankName").value = piggyBank.name;
  document.getElementById("piggyBankTarget").value = piggyBank.target;
  document.getElementById("piggyBankCurrent").value = piggyBank.current;
  document.getElementById("piggyBankAccount").value = piggyBank.account || "";
  document.getElementById("piggyBankTargetDate").value = piggyBank.targetDate
    ? piggyBank.targetDate.split("T")[0]
    : "";
  document.getElementById("piggyBankColor").value = piggyBank.color;
  currentPiggyBankId = piggyBankId;
  document.getElementById("piggyBankModal").classList.add("active");
}

function savePiggyBank(e) {
  e.preventDefault();

  const piggyBanks = JSON.parse(localStorage.getItem("piggyBanks")) || [];
  const name = document.getElementById("piggyBankName").value;
  const target = parseFloat(document.getElementById("piggyBankTarget").value);
  const current = parseFloat(document.getElementById("piggyBankCurrent").value);
  const account = document.getElementById("piggyBankAccount").value;
  const targetDate = document.getElementById("piggyBankTargetDate").value;
  const color = document.getElementById("piggyBankColor").value;

  if (current > target) {
    showToast("O valor atual não pode ser maior que a meta!", "error");
    return;
  }

  if (currentPiggyBankId) {
    // Editar cofrinho existente
    const index = piggyBanks.findIndex((p) => p.id === currentPiggyBankId);
    if (index !== -1) {
      piggyBanks[index] = {
        ...piggyBanks[index],
        name,
        target,
        current,
        account,
        targetDate: targetDate ? new Date(targetDate).toISOString() : "",
        color,
      };
    }
  } else {
    // Criar novo cofrinho
    const newPiggyBank = {
      id: "piggy" + Date.now(),
      name,
      target,
      current,
      account,
      targetDate: targetDate ? new Date(targetDate).toISOString() : "",
      color,
      createdAt: new Date().toISOString(),
    };
    piggyBanks.push(newPiggyBank);
  }

  localStorage.setItem("piggyBanks", JSON.stringify(piggyBanks));
  document.getElementById("piggyBankModal").classList.remove("active");
  loadPiggyBanks();
  showToast(
    `Cofrinho ${currentPiggyBankId ? "atualizado" : "criado"} com sucesso!`
  );
}

function deletePiggyBank(piggyBankId) {
  if (!confirm("Tem certeza que deseja apagar este cofrinho?")) return;

  const piggyBanks = JSON.parse(localStorage.getItem("piggyBanks")) || [];
  const updatedPiggyBanks = piggyBanks.filter((p) => p.id !== piggyBankId);

  localStorage.setItem("piggyBanks", JSON.stringify(updatedPiggyBanks));
  loadPiggyBanks();
  showToast("Cofrinho apagado com sucesso!");
}

function handlePiggyBankTransaction(e) {
  e.preventDefault();

  const piggyBanks = JSON.parse(localStorage.getItem("piggyBanks")) || [];
  const accounts = JSON.parse(localStorage.getItem("financeAccounts")) || [];
  const operationType = document.getElementById("piggyBankOperationType").value;
  const amount = parseFloat(document.getElementById("piggyBankAmount").value);
  const accountId = document.getElementById(
    "piggyBankTransactionAccount"
  ).value;
  const date = document.getElementById("piggyBankTransactionDate").value;

  if (!currentPiggyBankId) return;

  const piggyIndex = piggyBanks.findIndex((p) => p.id === currentPiggyBankId);
  if (piggyIndex === -1) return;

  const piggyBank = piggyBanks[piggyIndex];
  const accountIndex = accounts.findIndex((a) => a.id === accountId);

  if (operationType === "deposit") {
    // Verificar saldo da conta se estiver associada
    if (accountIndex !== -1 && accounts[accountIndex].balance < amount) {
      showToast("Saldo insuficiente na conta selecionada!", "error");
      return;
    }

    piggyBank.current += amount;

    // Deduzir da conta se estiver associada
    if (accountIndex !== -1) {
      accounts[accountIndex].balance -= amount;

      // Registrar transação
      const transactions =
        JSON.parse(localStorage.getItem("financeTransactions")) || [];
      transactions.push({
        id: "tr" + Date.now(),
        type: "expense",
        amount,
        description: `Depósito no cofrinho: ${piggyBank.name}`,
        category: "Economias",
        account: accountId,
        date: new Date(date).toISOString(),
      });
      localStorage.setItem("financeTransactions", JSON.stringify(transactions));
    }
  } else {
    // Retirada
    if (piggyBank.current < amount) {
      showToast("Saldo insuficiente no cofrinho!", "error");
      return;
    }

    piggyBank.current -= amount;

    // Adicionar à conta se estiver associada
    if (accountIndex !== -1) {
      accounts[accountIndex].balance += amount;

      // Registrar transação
      const transactions =
        JSON.parse(localStorage.getItem("financeTransactions")) || [];
      transactions.push({
        id: "tr" + Date.now(),
        type: "income",
        amount,
        description: `Retirada do cofrinho: ${piggyBank.name}`,
        category: "Economias",
        account: accountId,
        date: new Date(date).toISOString(),
      });
      localStorage.setItem("financeTransactions", JSON.stringify(transactions));
    }
  }

  // Atualizar dados
  piggyBanks[piggyIndex] = piggyBank;
  localStorage.setItem("piggyBanks", JSON.stringify(piggyBanks));
  if (accountIndex !== -1) {
    localStorage.setItem("financeAccounts", JSON.stringify(accounts));
  }

  // Fechar modal e atualizar UI
  document
    .getElementById("piggyBankTransactionModal")
    .classList.remove("active");
  document.getElementById("piggyBankTransactionForm").reset();
  updateAllInterfaces();
  showToast(`Operação no cofrinho realizada com sucesso!`, "success");
}

function populatePiggyBankAccountDropdowns() {
  const accounts = JSON.parse(localStorage.getItem("financeAccounts")) || [];
  const piggyBankAccountSelect = document.getElementById("piggyBankAccount");
  const piggyBankTransactionAccountSelect = document.getElementById(
    "piggyBankTransactionAccount"
  );

  if (piggyBankAccountSelect) {
    piggyBankAccountSelect.innerHTML =
      '<option value="">Não associar a conta</option>';
  }
  if (piggyBankTransactionAccountSelect) {
    piggyBankTransactionAccountSelect.innerHTML =
      '<option value="">Selecione a conta</option>';
  }

  accounts.forEach((account) => {
    if (piggyBankAccountSelect) {
      const option = document.createElement("option");
      option.value = account.id;
      option.textContent = `${account.name} (${formatCurrency(
        account.balance,
        account.currency
      )})`;
      piggyBankAccountSelect.appendChild(option);
    }

    if (piggyBankTransactionAccountSelect) {
      const option2 = document.createElement("option");
      option2.value = account.id;
      option2.textContent = `${account.name} (${formatCurrency(
        account.balance,
        account.currency
      )})`;
      piggyBankTransactionAccountSelect.appendChild(option2);
    }
  });
}

// CARTÕES DE CRÉDITO
function initCreditCardsSystem() {
  initCreditCards();
  loadCreditCards();
}

function initCreditCards() {
  if (!localStorage.getItem("financeCreditCards")) {
    const defaultCreditCards = [
      {
        id: "card1",
        name: "Nubank",
        limit: 5000,
        dueDate: 10,
        closingDate: 5,
        color: "#8A05BE",
      },
      {
        id: "card2",
        name: "PicPay",
        limit: 3000,
        dueDate: 8,
        closingDate: 3,
        color: "#21BA72",
      },
    ];
    localStorage.setItem(
      "financeCreditCards",
      JSON.stringify(defaultCreditCards)
    );
  }

  if (!localStorage.getItem("creditCardTransactions")) {
    localStorage.setItem("creditCardTransactions", JSON.stringify([]));
  }
}

// Carregar cartões no dashboard - VERSÃO CORRIGIDA
function loadCreditCards() {
  const creditCards =
    JSON.parse(localStorage.getItem("financeCreditCards")) || [];
  const transactions =
    JSON.parse(localStorage.getItem("creditCardTransactions")) || [];
  const dashboard = document.getElementById("creditCardsDashboard");
  if (!dashboard) return;

  if (creditCards.length === 0) {
    dashboard.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-credit-card"></i>
                </div>
                <div class="empty-text">Nenhum cartão cadastrado</div>
                <button id="addFirstCreditCardBtn" class="btn btn-outline" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Adicionar Primeiro Cartão
                </button>
            </div>
        `;

    // Adicionar evento ao botão
    const addFirstBtn = document.getElementById("addFirstCreditCardBtn");
    if (addFirstBtn) {
      addFirstBtn.addEventListener("click", addCreditCard);
    }
    return;
  }

  dashboard.innerHTML = "";

  creditCards.forEach((card) => {
    const cardTransactions = transactions.filter(
      (t) => t.cardId === card.id && !t.installments.every((i) => i.paid)
    );
    const totalSpent = cardTransactions.reduce((sum, transaction) => {
      const unpaidInstallments = transaction.installments.filter(
        (i) => !i.paid
      );
      return (
        sum +
        unpaidInstallments.reduce(
          (installmentSum, installment) => installmentSum + installment.amount,
          0
        )
      );
    }, 0);

    const usagePercentage = Math.min((totalSpent / card.limit) * 100, 100);
    const availableLimit = card.limit - totalSpent;

    // Determinar classe de uso baseado na porcentagem
    let usageClass = "low-usage";
    if (usagePercentage > 50) usageClass = "medium-usage";
    if (usagePercentage > 80) usageClass = "high-usage";

    const cardElement = document.createElement("div");
    cardElement.className = `credit-card-item ${usageClass}`;
    cardElement.style.borderLeftColor = card.color;

    cardElement.innerHTML = `
            <div class="credit-card-header">
                <div class="credit-card-name">
                    <i class="fas fa-credit-card" style="margin-right: 8px; color: ${
                      card.color
                    };"></i>
                    ${card.name}
                </div>
                <div class="credit-card-limit">
                    <span class="label">Limite total</span>
                    <span class="value">${formatCurrency(
                      card.limit,
                      "BRL"
                    )}</span>
                </div>
            </div>
            
            <div class="credit-card-progress">
                <div class="credit-card-progress-bar">
                    <div class="credit-card-progress-fill" style="width: ${usagePercentage}%"></div>
                </div>
                <div class="credit-card-usage">
                    <div>
                        <span class="used">Usado: ${formatCurrency(
                          totalSpent,
                          "BRL"
                        )}</span>
                    </div>
                    <div>
                        <span class="available">Disponível: ${formatCurrency(
                          availableLimit,
                          "BRL"
                        )}</span>
                    </div>
                </div>
            </div>
            
            <div class="credit-card-actions">
                <button class="credit-card-btn view-card-btn" data-id="${
                  card.id
                }">
                    <i class="fas fa-eye"></i> Detalhes
                </button>
                <button class="credit-card-btn add-purchase-btn" data-id="${
                  card.id
                }">
                    <i class="fas fa-plus"></i> Compra
                </button>
            </div>
        `;

    dashboard.appendChild(cardElement);
  });

  // Adicionar eventos aos botões
  document.querySelectorAll(".view-card-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const cardId = this.getAttribute("data-id");
      showCardDetails(cardId);
    });
  });

  document.querySelectorAll(".add-purchase-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const cardId = this.getAttribute("data-id");
      addCreditCardPurchase(cardId);
    });
  });
}

// Mostrar modal de cartões
function showCreditCardsModal() {
  const modal = document.getElementById("creditCardsModal");
  const cardsList = document.getElementById("creditCardsList");
  const creditCards =
    JSON.parse(localStorage.getItem("financeCreditCards")) || [];

  if (!modal || !cardsList) return;

  if (creditCards.length === 0) {
    cardsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-credit-card"></i>
                </div>
                <div class="empty-text">Nenhum cartão cadastrado</div>
            </div>
        `;
  } else {
    cardsList.innerHTML = `
            <div class="credit-cards-grid">
                ${creditCards
                  .map(
                    (card) => `
                    <div class="credit-card-item" style="border-left-color: ${
                      card.color
                    }">
                        <div class="credit-card-header">
                            <div class="credit-card-name">
                                <i class="fas fa-credit-card" style="color: ${
                                  card.color
                                };"></i>
                                ${card.name}
                            </div>
                            <button class="icon-modal delete-card-btn" data-id="${
                              card.id
                            }">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div class="credit-card-details">
                            <div>Limite: ${formatCurrency(
                              card.limit,
                              "BRL"
                            )}</div>
                            <div>Vencimento: dia ${card.dueDate}</div>
                            <div>Fechamento: dia ${card.closingDate}</div>
                        </div>
                        <div class="credit-card-actions">
                            <button class="credit-card-btn edit-card-btn" data-id="${
                              card.id
                            }">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="credit-card-btn view-card-btn" data-id="${
                              card.id
                            }">
                                <i class="fas fa-list"></i> Compras
                            </button>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  modal.classList.add("active");
}

// Adicionar novo cartão
function addCreditCard() {
  document.getElementById("creditCardModalTitle").textContent =
    "Adicionar Cartão";
  document.getElementById("creditCardForm").reset();
  document.getElementById("creditCardColor").value = "#7c4dff";
  currentCreditCardId = null;
  document.getElementById("creditCardModal").classList.add("active");
}

// Salvar cartão
function saveCreditCard(e) {
  e.preventDefault();

  const creditCards =
    JSON.parse(localStorage.getItem("financeCreditCards")) || [];
  const name = document.getElementById("creditCardName").value;
  const limit = parseFloat(document.getElementById("creditCardLimit").value);
  const dueDate = parseInt(document.getElementById("creditCardDueDate").value);
  const closingDate = parseInt(
    document.getElementById("creditCardClosingDate").value
  );
  const color = document.getElementById("creditCardColor").value;

  if (currentCreditCardId) {
    // Editar cartão existente
    const index = creditCards.findIndex((c) => c.id === currentCreditCardId);
    if (index !== -1) {
      creditCards[index] = {
        ...creditCards[index],
        name,
        limit,
        dueDate,
        closingDate,
        color,
      };
    }
  } else {
    // Criar novo cartão
    const newCard = {
      id: "card" + Date.now(),
      name,
      limit,
      dueDate,
      closingDate,
      color,
      createdAt: new Date().toISOString(),
    };
    creditCards.push(newCard);
  }

  localStorage.setItem("financeCreditCards", JSON.stringify(creditCards));
  document.getElementById("creditCardModal").classList.remove("active");
  loadCreditCards();
  showToast(
    `Cartão ${currentCreditCardId ? "atualizado" : "criado"} com sucesso!`
  );
}

// Adicionar compra parcelada
function addCreditCardPurchase(cardId = null) {
  const modal = document.getElementById("creditCardPurchaseModal");
  const cardSelect = document.getElementById("purchaseCard");
  const categorySelect = document.getElementById("purchaseCategory");

  if (!modal || !cardSelect) return;

  // Preencher select de cartões
  const creditCards =
    JSON.parse(localStorage.getItem("financeCreditCards")) || [];
  cardSelect.innerHTML = '<option value="">Selecione o cartão</option>';
  creditCards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.id;
    option.textContent = card.name;
    if (cardId && card.id === cardId) {
      option.selected = true;
    }
    cardSelect.appendChild(option);
  });

  // Preencher select de categorias
  const categories =
    JSON.parse(localStorage.getItem("financeCategories")) || [];
  if (categorySelect) {
    categorySelect.innerHTML =
      '<option value="">Selecione a categoria</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  // Definir data atual
  document.getElementById("purchaseDate").valueAsDate = new Date();

  modal.classList.add("active");
}

// Salvar compra parcelada
function saveCreditCardPurchase(e) {
  e.preventDefault();

  const transactions =
    JSON.parse(localStorage.getItem("creditCardTransactions")) || [];
  const cardId = document.getElementById("purchaseCard").value;
  const description = document.getElementById("purchaseDescription").value;
  const totalAmount = parseFloat(
    document.getElementById("purchaseTotalAmount").value
  );
  const installmentsCount = parseInt(
    document.getElementById("purchaseInstallments").value
  );
  const purchaseDate = new Date(document.getElementById("purchaseDate").value);
  const category = document.getElementById("purchaseCategory").value;

  const installmentValue = totalAmount / installmentsCount;
  const installments = [];

  // Gerar parcelas baseado na data da compra
  for (let i = 0; i < installmentsCount; i++) {
    const dueDate = new Date(purchaseDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    dueDate.setDate(1); // Primeiro dia do mês

    installments.push({
      number: i + 1,
      dueDate: dueDate.toISOString().split("T")[0],
      amount: installmentValue,
      paid: false,
    });
  }

  const newTransaction = {
    id: "cct" + Date.now(),
    cardId,
    description,
    totalAmount,
    installments: installmentsCount,
    installmentValue,
    purchaseDate: purchaseDate.toISOString().split("T")[0],
    firstDueDate: installments[0].dueDate,
    category,
    installmentsPaid: 0,
    installments: installments,
  };

  transactions.push(newTransaction);
  localStorage.setItem("creditCardTransactions", JSON.stringify(transactions));

  document.getElementById("creditCardPurchaseModal").classList.remove("active");
  document.getElementById("creditCardPurchaseForm").reset();
  loadCreditCards();
  showToast("Compra parcelada adicionada com sucesso!");
}

// Função para mostrar detalhes do cartão
function showCardDetails(cardId) {
  const creditCards =
    JSON.parse(localStorage.getItem("financeCreditCards")) || [];
  const transactions =
    JSON.parse(localStorage.getItem("creditCardTransactions")) || [];
  const card = creditCards.find((c) => c.id === cardId);

  if (!card) return;

  const cardTransactions = transactions.filter((t) => t.cardId === cardId);
  const totalSpent = cardTransactions.reduce((sum, transaction) => {
    const unpaidInstallments = transaction.installments.filter((i) => !i.paid);
    return (
      sum +
      unpaidInstallments.reduce(
        (installmentSum, installment) => installmentSum + installment.amount,
        0
      )
    );
  }, 0);

  const availableLimit = card.limit - totalSpent;
  const usagePercentage = Math.min((totalSpent / card.limit) * 100, 100);

  let message = `
        <strong>${card.name}</strong><br>
        Limite: ${formatCurrency(card.limit, "BRL")}<br>
        Utilizado: ${formatCurrency(
          totalSpent,
          "BRL"
        )} (${usagePercentage.toFixed(1)}%)<br>
        Disponível: ${formatCurrency(availableLimit, "BRL")}<br>
        Vencimento: dia ${card.dueDate}<br>
        Fechamento: dia ${card.closingDate}
    `;

  showToast(message, "info");
}

// Função auxiliar para clarear cor
function lightenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

// BACKUP E EXPORTAÇÃO
function exportData() {
  // Coletar todos os dados do localStorage
  const appData = {
    financeAccounts: JSON.parse(
      localStorage.getItem("financeAccounts") || "[]"
    ),
    financeTransactions: JSON.parse(
      localStorage.getItem("financeTransactions") || "[]"
    ),
    financeCreditCards: JSON.parse(
      localStorage.getItem("financeCreditCards") || "[]"
    ),
    recurringBills: JSON.parse(localStorage.getItem("recurringBills") || "[]"), // Adicionar esta linha
    piggyBanks: JSON.parse(localStorage.getItem("piggyBanks") || "[]"),
    financeCategories: JSON.parse(
      localStorage.getItem("financeCategories") || "[]"
    ),
    creditCardTransactions: JSON.parse(
      localStorage.getItem("creditCardTransactions") || "[]"
    ),
    exportDate: new Date().toISOString(),
  };

  // Criar arquivo JSON
  const dataStr = JSON.stringify(appData, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  // Criar link de download
  const exportFileDefaultName = `finance-flex-backup-${
    new Date().toISOString().split("T")[0]
  }.json`;
  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);

  showToast("Backup exportado com sucesso!", "success");
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const appData = JSON.parse(e.target.result);

      // Verificar se o arquivo é válido
      if (!appData.financeAccounts || !appData.financeTransactions) {
        throw new Error("Arquivo de backup inválido");
      }

      // Confirmar antes de sobrescrever dados
      if (confirm("Isso substituirá todos os seus dados atuais. Continuar?")) {
        // Salvar dados no localStorage
        localStorage.setItem(
          "financeAccounts",
          JSON.stringify(appData.financeAccounts)
        );
        localStorage.setItem(
          "financeTransactions",
          JSON.stringify(appData.financeTransactions)
        );

        if (appData.financeCreditCards) {
          localStorage.setItem(
            "financeCreditCards",
            JSON.stringify(appData.financeCreditCards)
          );
        }

        if (appData.recurringBills) {
          localStorage.setItem(
            "recurringBills",
            JSON.stringify(appData.recurringBills)
          );
        }

        // ... resto do código permanece igual
      }
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      showToast("Erro ao importar backup: " + error.message, "error");
    }

    // Resetar o input
    event.target.value = "";
  };
  reader.readAsText(file);
}

//Reiniciar todos os dados
const resetarDados = () => {
  if (
    confirm(
      "Você tem certeza que deseja reiniciar todos os dados? Esta ação não pode ser desfeita."
    )
  ) {
    localStorage.removeItem("financeAccounts");
    localStorage.removeItem("financeTransactions");
    localStorage.removeItem("financeCategories");
    localStorage.removeItem("recurringBills"); // Adicionar esta linha
    localStorage.removeItem("piggyBanks");
    localStorage.removeItem("financeCreditCards");
    localStorage.removeItem("creditCardTransactions");
    showToast("Todos os dados foram reiniciados com sucesso!", "success");
    location.reload();
  }
};

// Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

// Função de Debug (útil para testes)
function debugApp() {
  console.log("=== DEBUG FINANCE FLEX ===");
  console.log(
    "Accounts:",
    JSON.parse(localStorage.getItem("financeAccounts") || "[]")
  );
  console.log(
    "Transactions:",
    JSON.parse(localStorage.getItem("financeTransactions") || "[]")
  );
  console.log(
    "Categories:",
    JSON.parse(localStorage.getItem("financeCategories") || "[]")
  );
  console.log(
    "Credit Cards:",
    JSON.parse(localStorage.getItem("financeCreditCards") || "[]")
  );
  console.log(
    "Piggy Banks:",
    JSON.parse(localStorage.getItem("piggyBanks") || "[]")
  );
  console.log(
    "Recurring Bills:",
    JSON.parse(localStorage.getItem("recurringBills") || "[]")
  );
  console.log(
    "Credit Card Transactions:",
    JSON.parse(localStorage.getItem("creditCardTransactions") || "[]")
  );
}

// Chamar no console para debug
window.debugApp = debugApp;
window.resetarDados = resetarDados;

console.log("Finance Flex carregado com sucesso!");
