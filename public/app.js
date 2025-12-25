document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        token: localStorage.getItem('token'),
        username: localStorage.getItem('username'),
        currentView: 'auth', // 'auth', 'books', 'history'
    };

    // --- DOM ELEMENTS ---
    const G = {
        navLinks: document.getElementById('nav-links'),
        views: document.querySelectorAll('.view'),
        
        // Auth View
        authView: document.getElementById('auth-view'),
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        loginUsernameInput: document.getElementById('login-username'),
        loginPasswordInput: document.getElementById('login-password'),
        registerUsernameInput: document.getElementById('register-username'),
        registerPasswordInput: document.getElementById('register-password'),
        showRegisterLink: document.getElementById('show-register'),
        showLoginLink: document.getElementById('show-login'),
        loginFormContainer: document.getElementById('login-form-container'),
        registerFormContainer: document.getElementById('register-form-container'),

        // Books View
        booksView: document.getElementById('books-view'),
        booksList: document.getElementById('books-list'),

        // History View
        historyView: document.getElementById('history-view'),
        historyList: document.getElementById('history-list'),

        // Welcome Message
        welcomeMessage: document.getElementById('welcome-message'),

        // Toast
        toast: document.getElementById('toast'),
    };

    // --- API HELPER ---
    const api = {
        baseUrl: '/api',
        
        async request(endpoint, options = {}) {
            const url = `${this.baseUrl}${endpoint}`;
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers,
            };

            if (state.token) {
                headers['Authorization'] = `Bearer ${state.token}`;
            }

            try {
                const response = await fetch(url, { ...options, headers });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'An error occurred');
                }
                return data;

            } catch (error) {
                console.error(`API Error on ${endpoint}:`, error);
                showToast(error.message, 'error');
                throw error;
            }
        },

        register: (username, password) => api.request('/register', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),
        
        login: (username, password) => api.request('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),

        getBooks: () => api.request('/books'),
        
        borrowBook: (bookId) => api.request(`/books/borrow/${bookId}`, {
            method: 'POST',
        }),

        returnBook: (transactionId) => api.request(`/books/return/${transactionId}`, {
            method: 'POST',
        }),

        getHistory: () => api.request('/history'),
    };

    // --- UI RENDERING & VIEW MANAGEMENT ---

    /**
     * Shows a notification toast message.
     * @param {string} message The message to display.
     * @param {'success'|'error'} type The type of toast.
     */
    function showToast(message, type = 'success') {
        G.toast.textContent = message;
        G.toast.className = `show ${type}`;
        setTimeout(() => {
            G.toast.className = G.toast.className.replace('show', '');
        }, 3000);
    }
    
    /**
     * Switches between showing the login and register forms.
     * @param {'login'|'register'} formToShow 
     */
    function toggleAuthForms(formToShow) {
        if (formToShow === 'register') {
            G.loginFormContainer.style.display = 'none';
            G.registerFormContainer.style.display = 'block';
        } else {
            G.registerFormContainer.style.display = 'none';
            G.loginFormContainer.style.display = 'block';
        }
    }
    
    /**
     * Updates the UI based on the current application state (logged in/out, current view).
     */
    function render() {
        // Hide all views initially
        G.views.forEach(view => view.style.display = 'none');
        G.welcomeMessage.style.display = 'none';

        if (!state.token) {
            // --- Logged Out State ---
            state.currentView = 'auth';
            G.authView.style.display = 'block';
            G.welcomeMessage.style.display = 'block';
            G.navLinks.innerHTML = `
                <a href="#" data-view="auth">Login/Register</a>
            `;
        } else {
            // --- Logged In State ---
            G.navLinks.innerHTML = `
                <span>Welcome, ${state.username}!</span>
                <a href="#" data-view="books">All Books</a>
                <a href="#" data-view="history">My History</a>
                <button id="logout-btn">Logout</button>
            `;
            
            if (state.currentView === 'books') {
                G.booksView.style.display = 'block';
                fetchAndRenderBooks();
            } else if (state.currentView === 'history') {
                G.historyView.style.display = 'block';
                fetchAndRenderHistory();
            } else {
                // Default to books view if logged in but no view is set
                state.currentView = 'books';
                G.booksView.style.display = 'block';
                fetchAndRenderBooks();
            }
        }
    }

    /**
     * Fetches books from the API and renders them to the page.
     */
    async function fetchAndRenderBooks() {
        try {
            const response = await api.getBooks();
            console.log('Received from /api/books:', response);
            const { data } = response;
            G.booksList.innerHTML = data.map(book => `
                <div class="book-item">
                    <div class="book-item-details">
                        <h3>${book.title}</h3>
                        <p>by ${book.author}</p>
                        <p>Status: <span class="status-${book.status.toLowerCase().replace(' ', '')}">${book.status} (${book.quantity} left)</span></p>
                    </div>
                    <button class="borrow-btn" data-book-id="${book._id}" ${book.quantity === 0 ? 'disabled' : ''}>
                        Borrow
                    </button>
                </div>
            `).join('');
        } catch (error) {
            G.booksList.innerHTML = '<p>Could not fetch books.</p>';
        }
    }

    /**
     * Fetches the user's borrowing history and renders it.
     */
    async function fetchAndRenderHistory() {
        try {
            const { data } = await api.getHistory();
            if (data.length === 0) {
                G.historyList.innerHTML = '<p>You have no borrowing history.</p>';
                return;
            }
            G.historyList.innerHTML = data.map(tx => `
                <div class="history-item">
                    <div class="history-item-details">
                        <h3>${tx.book.title}</h3>
                        <p>by ${tx.book.author}</p>
                        <p>Borrowed: ${new Date(tx.borrowDate).toLocaleDateString()}</p>
                        <p>Status: <span class="status-${tx.status.toLowerCase()}">${tx.status}</span></p>
                    </div>
                    ${tx.status === 'Borrowed' 
                        ? `<button class="return-btn" data-transaction-id="${tx._id}">Return</button>`
                        : `<span class="returned-tag">Returned on ${new Date(tx.returnDate).toLocaleDateString()}</span>`
                    }
                </div>
            `).join('');
        } catch (error) {
            G.historyList.innerHTML = '<p>Could not fetch history.</p>';
        }
    }
    
    // --- EVENT HANDLERS ---
    
    /**
     * Handles the login form submission.
     */
    async function handleLogin(e) {
        e.preventDefault();
        try {
            const { token, username } = await api.login(G.loginUsernameInput.value, G.loginPasswordInput.value);
            state.token = token;
            state.username = username;
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            state.currentView = 'books';
            render();
            showToast('Login successful!', 'success');
        } catch (error) {
            // Error toast is shown by the API helper
        }
    }

    /**
     * Handles the registration form submission.
     */
    async function handleRegister(e) {
        e.preventDefault();
        try {
            await api.register(G.registerUsernameInput.value, G.registerPasswordInput.value);
            showToast('Registration successful! Please log in.', 'success');
            // Switch to login form
            toggleAuthForms('login');
            G.loginUsernameInput.value = G.registerUsernameInput.value;
            G.registerUsernameInput.value = '';
            G.registerPasswordInput.value = '';
            G.loginPasswordInput.focus();
        } catch (error) {
            // Error toast is shown by the API helper
        }
    }

    /**
     * Handles user logout.
     */
    function handleLogout() {
        state.token = null;
        state.username = null;
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        state.currentView = 'auth';
        render();
        showToast('You have been logged out.', 'success');
    }

    /**
     * Handles clicks on the navigation links to switch views.
     */
    function handleNavClick(e) {
        if (e.target.matches('[data-view]')) {
            e.preventDefault();
            state.currentView = e.target.dataset.view;
            render();
        }
        if (e.target.id === 'logout-btn') {
            handleLogout();
        }
    }

    /**
     * Handles clicks on borrow buttons.
     */
    async function handleBorrowClick(e) {
        if (e.target.matches('.borrow-btn')) {
            const bookId = e.target.dataset.bookId;
            try {
                await api.borrowBook(bookId);
                showToast('Book borrowed successfully!', 'success');
                fetchAndRenderBooks(); // Re-render books to show updated quantity
            } catch (error) {
                // Error toast is shown by the API helper
            }
        }
    }
    
    /**
     * Handles clicks on return buttons.
     */
    async function handleReturnClick(e) {
        if (e.target.matches('.return-btn')) {
            const transactionId = e.target.dataset.transactionId;
            try {
                await api.returnBook(transactionId);
                showToast('Book returned successfully!', 'success');
                fetchAndRenderHistory(); // Re-render history to show updated status
            } catch (error) {
                // Error toast is shown by the API helper
            }
        }
    }

    // --- INITIALIZATION ---

    function init() {
        // Bind event listeners
        G.loginForm.addEventListener('submit', handleLogin);
        G.registerForm.addEventListener('submit', handleRegister);
        G.showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms('register'); });
        G.showLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms('login'); });
        G.navLinks.addEventListener('click', handleNavClick);
        G.booksList.addEventListener('click', handleBorrowClick);
        G.historyList.addEventListener('click', handleReturnClick);
        
        // Initial render
        render();
    }

    init();
});
