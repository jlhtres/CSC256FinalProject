// ---------------------------
// Never Broke Again - Budget App
// ---------------------------

// Save data key for localStorage
const STORAGE_KEY = "nba_budget_state_v1";

// State of the app (budget and list of expenses)
let state = {
  budget: 0,
  expenses: [] // expenses will be stored as objects {id, name, amount, category, dateISO}
};

// ---------------------------
// Grab page elements
// ---------------------------
const budgetInput = document.getElementById('budgetInput');
const saveBudgetBtn = document.getElementById('saveBudgetBtn');

const summaryBudget = document.getElementById('summaryBudget');
const summarySpent = document.getElementById('summarySpent');
const summaryRemaining = document.getElementById('summaryRemaining');
const progressBar = document.getElementById('progressBar');
const alertText = document.getElementById('alertText');

const expenseForm = document.getElementById('expenseForm');
const expensesTbody = document.getElementById('expensesTbody');
const clearAllBtn = document.getElementById('clearAllBtn');

// ---------------------------
// Utility functions
// ---------------------------

// Load data from localStorage (if it exists)
function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return;
  try{
    state = JSON.parse(raw);
  }catch(e){
    console.warn('Could not parse saved data.');
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Save current state into localStorage
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Format number into money style ($10.00)
function formatMoney(n){
  return (n || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

// Get percent value (used for progress bar)
function percent(n, d){
  if(d <= 0) return 0;
  return Math.min(100, Math.round((n / d) * 100));
}

// ---------------------------
// Render functions (update the page)
// ---------------------------

// Update budget summary numbers and alerts
function renderSummary(){
  const spent = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, state.budget - spent);
  const pct = percent(spent, state.budget);

  summaryBudget.textContent = formatMoney(state.budget);
  summarySpent.textContent = formatMoney(spent);
  summaryRemaining.textContent = formatMoney(remaining);
  progressBar.style.width = pct + '%';

  // Show warnings when budget is being used up
  alertText.className = 'alert'; // reset
  if(state.budget > 0){
    if(pct >= 90){
      alertText.textContent = 'Warning: Only ~10% of your budget remains.';
      alertText.classList.add('danger');
    }else if(pct >= 75){
      alertText.textContent = 'Heads up: ~75% of your budget is used.';
      alertText.classList.add('warn');
    }else if(pct >= 50){
      alertText.textContent = 'Notice: ~50% of your budget is used.';
      alertText.classList.add('warn');
    }else if(pct >= 25){
      alertText.textContent = 'Good to know: ~25% of your budget is used.';
      alertText.classList.add('warn');
    }else{
      alertText.textContent = '';
    }
  }else{
    alertText.textContent = 'Set a budget to start tracking progress.';
  }
}

// Update the list of expenses
function renderExpenses(){
  expensesTbody.innerHTML = '';

  state.expenses.forEach(exp => {
    const tr = document.createElement('tr');

    // name cell
    const tdName = document.createElement('td');
    tdName.textContent = exp.name;

    // category cell
    const tdCat = document.createElement('td');
    tdCat.textContent = exp.category || '—';

    // date cell
    const tdDate = document.createElement('td');
    tdDate.textContent = exp.dateISO ? new Date(exp.dateISO).toLocaleDateString() : '—';

    // amount cell
    const tdAmt = document.createElement('td');
    tdAmt.className = 'right';
    tdAmt.textContent = formatMoney(exp.amount);

    // delete button cell
    const tdDel = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'danger';
    delBtn.addEventListener('click', () => {
      deleteExpense(exp.id);
    });
    tdDel.appendChild(delBtn);

    // add cells to row
    tr.append(tdName, tdCat, tdDate, tdAmt, tdDel);
    expensesTbody.appendChild(tr);
  });
}

// Call both render functions
function renderAll(){
  renderSummary();
  renderExpenses();
}

// ---------------------------
// Actions (change the state)
// ---------------------------

// Set a new budget
function setBudget(n){
  state.budget = Math.max(0, Number(n) || 0);
  saveState();
  renderAll();
}

// Add a new expense
function addExpense({name, amount, category, dateISO}){
  const id = Date.now() + '_' + Math.random().toString(36).slice(2,7);
  const expense = {
    id,
    name: (name || '').trim(),
    amount: Math.max(0, Number(amount) || 0),
    category: category || 'Other',
    dateISO: dateISO || null
  };

  if(!expense.name || expense.amount <= 0){
    alert('Please enter a valid name and amount.');
    return;
  }

  state.expenses.push(expense);
  saveState();
  renderAll();
  expenseForm.reset();
}

// Delete one expense by id
function deleteExpense(id){
  state.expenses = state.expenses.filter(e => e.id !== id);
  saveState();
  renderAll();
}

// Clear everything
function clearAll(){
  if(confirm('Clear all expenses and budget?')){
    state = { budget: 0, expenses: [] };
    saveState();
    renderAll();
    budgetInput.value = '';
  }
}

// ---------------------------
// Event listeners
// ---------------------------

// Save budget button
saveBudgetBtn.addEventListener('click', () => setBudget(budgetInput.value));

// Expense form submission
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('expenseName').value;
  const amount = document.getElementById('expenseAmount').value;
  const category = document.getElementById('expenseCategory').value;
  const dateISO = document.getElementById('expenseDate').value || null;
  addExpense({name, amount, category, dateISO});
});

// Clear all button
clearAllBtn.addEventListener('click', clearAll);

// ---------------------------
// Initialize the app
// ---------------------------
loadState();
renderAll();

// Show budget in the input if it was already set
if(state.budget > 0){
  budgetInput.value = state.budget;
}
