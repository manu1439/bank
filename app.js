const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('#nav-menu a[data-page]');
const logoutBtn = document.getElementById('logout-btn');

let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || {};

// Utility to show a page and hide others
function showPage(pageId) {
    pages.forEach(page => {
        if (page.id === pageId) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
    updateNav();
}

// Update navigation links visibility based on auth state
function updateNav() {
    const authOnlyElements = document.querySelectorAll('.auth-only');
    if (currentUser) {
        authOnlyElements.forEach(el => el.style.display = 'inline');
        // Hide login and register links
        document.querySelector('a[data-page="login"]').style.display = 'none';
        document.querySelector('a[data-page="register"]').style.display = 'none';
    } else {
        authOnlyElements.forEach(el => el.style.display = 'none');
        document.querySelector('a[data-page="login"]').style.display = 'inline';
        document.querySelector('a[data-page="register"]').style.display = 'inline';
    }
}

// Navigation link click handler
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        if (page === 'balance' || page === 'transfer' || page === 'profile') {
            if (!currentUser) {
                alert('Please login to access this page.');
                showPage('login');
                return;
            }
        }
        showPage(page);
        if (page === 'balance') {
            updateBalance();
        } else if (page === 'profile') {
            updateProfile();
        }
    });
});

// Logout button handler
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentUser = null;
    showPage('home');
});

// Login form handler
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (users[username] && users[username].password === password) {
        currentUser = username;
        loginForm.reset();
        showPage('home');
    } else {
        loginError.textContent = 'Invalid username or password.';
    }
});

// Register form handler
const registerForm = document.getElementById('register-form');
const registerError = document.getElementById('register-error');
const registerSuccess = document.getElementById('register-success');
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    registerError.textContent = '';
    registerSuccess.textContent = '';
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    if (!username || !password) {
        registerError.textContent = 'Please enter username and password.';
        return;
    }
    if (users[username]) {
        registerError.textContent = 'Username already exists.';
        return;
    }
    users[username] = {
        password: password,
        balance: 1000.00 // initial balance
    };
    localStorage.setItem('users', JSON.stringify(users));
    registerSuccess.textContent = 'Registration successful. You can now login.';
    registerForm.reset();
});

// Update balance display
function updateBalance() {
    const balanceAmount = document.getElementById('balance-amount');
    if (currentUser && users[currentUser]) {
        balanceAmount.textContent = users[currentUser].balance.toFixed(2);
    } else {
        balanceAmount.textContent = '0.00';
    }
}

// Transfer form handler
const transferForm = document.getElementById('transfer-form');
const transferError = document.getElementById('transfer-error');
const transferSuccess = document.getElementById('transfer-success');
transferForm.addEventListener('submit', (e) => {
    e.preventDefault();
    transferError.textContent = '';
    transferSuccess.textContent = '';
    if (!currentUser) {
        transferError.textContent = 'You must be logged in to transfer funds.';
        return;
    }
    const recipient = document.getElementById('transfer-recipient').value.trim();
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    if (!recipient || isNaN(amount) || amount <= 0) {
        transferError.textContent = 'Please enter valid recipient and amount.';
        return;
    }
    if (!users[recipient]) {
        transferError.textContent = 'Recipient does not exist.';
        return;
    }
    if (users[currentUser].balance < amount) {
        transferError.textContent = 'Insufficient balance.';
        return;
    }
    if (recipient === currentUser) {
        transferError.textContent = 'Cannot transfer to yourself.';
        return;
    }
    users[currentUser].balance -= amount;
    users[recipient].balance += amount;
    localStorage.setItem('users', JSON.stringify(users));
    transferSuccess.textContent = `Transferred $${amount.toFixed(2)} to ${recipient}.`;
    transferForm.reset();
    updateBalance();
});

// Update profile display
function updateProfile() {
    const profileUsername = document.getElementById('profile-username');
    if (currentUser) {
        profileUsername.textContent = currentUser;
    } else {
        profileUsername.textContent = '';
    }
}

// Initialize app
function init() {
    updateNav();
    showPage('home');
}

init();
