// script.js – products, cart, checkout, invoice, login & register

// ------------------ TAX & DISCOUNT RULES ------------------
const TAX_RATE = 0.15;          // 15% tax
const DISCOUNT_THRESHOLD = 300; // apply discount if subtotal > 300
const DISCOUNT_RATE = 0.10;     // 10% discount

// ------------------ PRODUCTS (16 BOOKS) ------------------
const PRODUCTS = [
    { id: 1,  name: "Maze Runner - James Dashner", price: 210, image: "maze runner.jpg" },
    { id: 2,  name: "All Systems Red - Martha Wells", price: 230, image: "all systems red.jpg" },
    { id: 3,  name: "The Love Hypothesis - Ali Hazelwood", price: 350, image: "love hypothesis.jpg" },
    { id: 4,  name: "Fourth Wing - Rebecca Yarros", price: 300, image: "fourth wing.jpg" },
    { id: 5,  name: "Star Wars: Heir to the Empire - Timothy Zahn", price: 215, image: "star wars.jpeg" },
    { id: 6,  name: "Surviving to Drive - Guenther Steiner", price: 500, image: "f1 drive.jpg" },
    { id: 7,  name: "The Sun is also a Star - Nicola Yoon", price: 480, image: "sun is also.jpeg" },
    { id: 8,  name: "Lord of the Flies - William Golding", price: 520, image: "lord of the flies.jpeg" },
    { id: 9,  name: "Hunger Games - Suzanne Collins", price: 600, image: "hunger games.jpg" },
    { id: 10, name: "The Fault in Our Stars - John Green", price: 640, image: "fault in.jpg" },
    { id: 11, name: "Scythe - Neal Shusterman", price: 590, image: "scythe.jpg" },
    { id: 12, name: "You Should See Me in Crown - Leah Johnson", price: 450, image: "you should.jpg" },
    { id: 13, name: "Red Queen - Victoria Aveyard", price: 420, image: "red queen.jpg" },
    { id: 14, name: "The Lightening Theif - Rick Riordan", price: 550, image: "pery jackson.jpg" },
    { id: 15, name: "Bride - Ali Hazelwood", price: 620, image: "bride.jpg" },
    { id: 16, name: "Love on the Brain - Ali Hazelwood", price: 480, image: "love on brain.jpg" }
];

// ------------------ CART HELPERS ------------------
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function clearCart() {
    localStorage.removeItem("cart");
}

// Add item to cart
// Logic/ Interactivity 
// Control Strcutures 
function addToCart(productId) {
    const cart = getCart();
    const item = cart.find(i => i.productId === productId);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ productId, quantity: 1 });
    }
    saveCart(cart);
    alert("Item added to cart.");
}

function formatCurrency(value) {
    return "$" + value.toFixed(2);
}

//Caclulates subtotals, discounts, tax, and final total
function calculateTotals(cart) {
    let subTotal = 0;

    cart.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.productId);
        if (product) {
            subTotal += product.price * item.quantity;
        }
    });

    let discount = 0;
    if (subTotal > DISCOUNT_THRESHOLD) {
        discount = subTotal * DISCOUNT_RATE;
    }

    const taxableAmount = subTotal - discount;
    const tax = taxableAmount * TAX_RATE;
    const total = taxableAmount + tax;

    return { subTotal, discount, tax, total };
}

// ------------------ PAGE ROUTER ------------------
// DOM Manipulation
// Event Handling
document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;

    if (page === "product")     initHomePage();
    if (page === "cart")     initCartPage();
    if (page === "checkout") initCheckoutPage();
    if (page === "invoice")  initInvoicePage();
    if (page === "login")    initLoginPage();
    if (page === "register") initRegisterPage();
});

// ------------------ HOME PAGE ------------------
// Displays products and handles search + product slide panel
function initHomePage() {
    const container = document.getElementById("productsContainer");
    const searchBox = document.getElementById("searchBox");
    if (!container) return;

    function displayProducts(list) {
        container.innerHTML = "";
        list.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}" data-view="${product.id}">
                <h3>${product.name}</h3>
                <p class="price">${formatCurrency(product.price)}</p>
                <p class="desc">A riveting read leaving you wanting more.</p>
                <button type="button" data-id="${product.id}">Add to Cart</button>
            `;
            container.appendChild(card);
        });
    }

    // first render
    displayProducts(PRODUCTS);

    // search filter
    if (searchBox) {
        searchBox.addEventListener("input", () => {
            const text = searchBox.value.toLowerCase();
            const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(text));
            displayProducts(filtered);
        });
    }

    // slide panel elements
    const panel      = document.getElementById("productPanel");
    const panelClose = document.getElementById("panelClose");
    const panelImage = document.getElementById("panelImage");
    const panelName  = document.getElementById("panelName");
    const panelPrice = document.getElementById("panelPrice");
    const panelDesc  = document.getElementById("panelDesc");
    const panelAddBtn = document.getElementById("panelAddBtn");

    // open panel when image clicked, or add to cart
    container.addEventListener("click", e => {
        if (e.target.dataset.view) {
            const id = parseInt(e.target.dataset.view);
            const product = PRODUCTS.find(p => p.id === id);
            if (!product || !panel) return;

            panelImage.src = product.image;
            panelName.textContent = product.name;
            panelPrice.textContent = formatCurrency(product.price);
            panelDesc.textContent = "Top-tier books with the best reviews";
            panelAddBtn.setAttribute("data-id", id);

            panel.classList.add("open");
        }

        if (e.target.tagName === "BUTTON") {
            const id = parseInt(e.target.getAttribute("data-id"));
            addToCart(id);
        }
    });

    // Close / Add actions in panel
    if (panel && panelAddBtn && panelClose) {
        panelAddBtn.addEventListener("click", () => {
            const id = parseInt(panelAddBtn.getAttribute("data-id"));
            addToCart(id);
            panel.classList.remove("open");
        });

        panelClose.addEventListener("click", () => {
            panel.classList.remove("open");
        });
    }
}

// ------------------ CART PAGE ------------------
// Builds cart table + totals dynamically
function initCartPage() {
    const tbody = document.querySelector("#cartTable tbody");
    const totalsDiv = document.getElementById("cartTotals");
    if (!tbody || !totalsDiv) return;

    const cart = getCart();

    if (cart.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">Your cart is empty.</td></tr>`;
        totalsDiv.textContent = "";
        return;
    }

    tbody.innerHTML = "";
    cart.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.productId);
        if (!product) return;

        const row = document.createElement("tr");
        const lineSubtotal = product.price * item.quantity;
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(lineSubtotal)}</td>
        `;
        tbody.appendChild(row);
    });

    const totals = calculateTotals(cart);
    totalsDiv.innerHTML = `
        <p>Sub-total: ${formatCurrency(totals.subTotal)}</p>
        <p>Discount: ${formatCurrency(totals.discount)}</p>
        <p>Tax: ${formatCurrency(totals.tax)}</p>
        <p><strong>Total: ${formatCurrency(totals.total)}</strong></p>
    `;
}

// ------------------ CHECKOUT PAGE ------------------
// Validates user input + processes payment
function initCheckoutPage() {
    const summaryDiv = document.getElementById("checkoutSummary");
    const form = document.getElementById("checkoutForm");
    const messageDiv = document.getElementById("checkoutMessage");
    if (!summaryDiv || !form) return;

    const cart = getCart();

    if (cart.length === 0) {
        summaryDiv.innerHTML = "<p>Your cart is empty. Please add items before checking out.</p>";
        form.style.display = "none";
        return;
    }

    const totals = calculateTotals(cart);

    // Show summary
    summaryDiv.innerHTML = `
        <h3>Shopping Cart Summary</h3>
        <p>Number of items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
        <p>Sub-total: ${formatCurrency(totals.subTotal)}</p>
        <p>Discount: ${formatCurrency(totals.discount)}</p>
        <p>Tax: ${formatCurrency(totals.tax)}</p>
        <p><strong>Total: ${formatCurrency(totals.total)}</strong></p>
    `;

    const btnCancel   = document.getElementById("btnCancel");
    const btnClearAll = document.getElementById("btnClearAll");
    const btnCheckout = document.getElementById("btnCheckout");
    const btnClose    = document.getElementById("btnClose");


    // Checkout form validation
    form.addEventListener("submit", e => {
        e.preventDefault();

        const name = form.customerName.value.trim();
        const address = form.address.value.trim();
        const city = form.city.value.trim();
        const amountPaid = parseFloat(form.amountPaid.value);

        if (!name || !address || !city || isNaN(amountPaid)) {
            messageDiv.className = "message error";
            messageDiv.textContent = "Please fill in all fields and enter a valid amount.";
            return;
        }

        if (amountPaid < totals.total) {
            messageDiv.className = "message error";
            messageDiv.textContent = "Amount being paid is less than the total cost.";
            return;
        }

        const change = amountPaid - totals.total;

        // Build order object
        const order = {
            name,
            address,
            city,
            amountPaid,
            change,
            cart,
            totals,
            date: new Date().toLocaleString()
        };
            saveInvoice(order);
        // Save last order
        localStorage.setItem("lastOrder", JSON.stringify(order));
        clearCart();

        messageDiv.className = "message success";
        messageDiv.textContent = "Order confirmed! Loading invoice...";
        setTimeout(() => {
            window.location.href = "invoice.html";
        }, 1000);
    });

    if (btnCheckout) {
        btnCheckout.addEventListener("click", () => form.requestSubmit());
    }
    if (btnCancel) {
        btnCancel.addEventListener("click", e => {
            e.preventDefault();
            window.location.href = "cart.html";
        });
    }
    if (btnClearAll) {
        btnClearAll.addEventListener("click", e => {
            e.preventDefault();
            clearCart();
            location.reload();
        });
    }
    if (btnClose) {
        btnClose.addEventListener("click", e => {
            e.preventDefault();
            window.location.href = "index.html";
        });
    }
}

// ------------------ INVOICE PAGE ------------------
// Generates invoice from saved order
function initInvoicePage() {
    const container = document.getElementById("invoiceContainer");
    if (!container) return;

    const order = JSON.parse(localStorage.getItem("lastOrder"));

    if (!order) {
        container.innerHTML = "<p>No recent order found.</p>";
        return;
    }

    let rowsHtml = "";
    
    // Build invoice rows dynamically
    order.cart.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.productId);
        if (!product) return;
        const lineSubtotal = product.price * item.quantity;

        rowsHtml += `
            <tr>
                <td>${product.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${formatCurrency(lineSubtotal)}</td>
            </tr>
        `;
    });

    container.innerHTML = `
        <h2>Invoice</h2>
        <p><strong>Date:</strong> ${order.date}</p>
        <p><strong>Customer:</strong> ${order.name}</p>
        <p><strong>Shipping Address:</strong> ${order.address}, ${order.city}</p>

        <h3>Order Details</h3>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>

        <div class="totals">
            <p>Sub-total: ${formatCurrency(order.totals.subTotal)}</p>
            <p>Discount: ${formatCurrency(order.totals.discount)}</p>
            <p>Tax: ${formatCurrency(order.totals.tax)}</p>
            <p><strong>Total: ${formatCurrency(order.totals.total)}</strong></p>
            <p><strong>Amount Paid: ${formatCurrency(order.amountPaid)}</strong></p>
            <p><strong>Change Returned: ${formatCurrency(order.change)}</strong></p>
        </div>
    `;
}

// ------------------ LOGIN PAGE ------------------

function initLoginPage() {
    const form = document.getElementById("loginForm");
    const msg = document.getElementById("loginMessage");
    if (!form) return;

    const lockoutData = JSON.parse(localStorage.getItem("loginLockout")) || {};
    const currentTime = new Date().getTime();

    form.addEventListener("submit", e => {
        e.preventDefault();

        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!username || !password) {
            msg.className = "message error";
            msg.textContent = "Please enter both username and password.";
            return;
        }

        // Check if account is locked
        if (lockoutData[username] && lockoutData[username].locked) {
            const lockTime = lockoutData[username].lockTime;
            const timeElapsed = currentTime - lockTime;
            const lockDuration = 15 * 60 * 1000; // 15 minutes

            if (timeElapsed < lockDuration) {
                const remainingMinutes = Math.ceil((lockDuration - timeElapsed) / 60000);
                msg.className = "message error";
                msg.textContent = `Account locked. Try again in ${remainingMinutes} minutes.`;
                return;
            } else {
                // Reset lockout after time passed
                delete lockoutData[username];
                localStorage.setItem("loginLockout", JSON.stringify(lockoutData));
            }
        }

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.username === username && u.password === password);
        
        if (!user) {
            // Track failed attempts
            if (!lockoutData[username]) {
                lockoutData[username] = { attempts: 0, locked: false };
            }

            lockoutData[username].attempts += 1;
            const attemptsLeft = 3 - lockoutData[username].attempts;

            if (lockoutData[username].attempts >= 3) {
                lockoutData[username].locked = true;
                lockoutData[username].lockTime = currentTime;
                localStorage.setItem("loginLockout", JSON.stringify(lockoutData));

                msg.className = "message error";
                msg.textContent = "Account locked due to 3 failed attempts. Please wait 15 minutes.";
                return;
            }

            localStorage.setItem("loginLockout", JSON.stringify(lockoutData));
            msg.className = "message error";
            msg.textContent = `Invalid username or password. ${attemptsLeft} attempt(s) remaining.`;
            return;
        }

        // Successful login - reset attempts
        if (lockoutData[username]) {
            delete lockoutData[username];
            localStorage.setItem("loginLockout", JSON.stringify(lockoutData));
        }

        localStorage.setItem("currentUser", JSON.stringify(user));

        msg.className = "message success";
        msg.textContent = "Login successful! Redirecting to home...";
        setTimeout(() => {
            window.location.href = "product.html";
        }, 1000);
    });
}
// ------------------ REGISTER PAGE (UPDATED VALIDATION) ------------------
function initRegisterPage() {
    const form = document.getElementById("registerForm");
    const msg = document.getElementById("registerMessage");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

    const fullName = document.getElementById("firstName").value.trim() + " " +
                    document.getElementById("lastName").value.trim();

    const dob = document.getElementById("dob").value.trim();
    const email = document.getElementById("email").value.trim();
    const trn = document.getElementById("trn").value.trim();
    const username = trn; 
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;


        // ---------------------- REQUIRED FIELD CHECK ----------------------
        if (!fullName || !dob || !email || !trn || !username || !password || !confirmPassword) {
            msg.className = "message error";
            msg.textContent = "Please complete all fields.";
            return;
        }

        // ---------------------- AGE VALIDATION (18+) ----------------------
        const birthYear = new Date(dob).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;

        if (age < 18) {
            msg.className = "message error";
            msg.textContent = "You must be at least 18 years old to register.";
            return;
        }

        // ---------------------- TRN VALIDATION ----------------------
        if (!/^[0-9]{9}$/.test(trn)) {
            msg.className = "message error";
            msg.textContent = "TRN must be exactly 9 digits.";
            return;
        }

        const users = JSON.parse(localStorage.getItem("users")) || [];

        const trnExists = users.some(u => u.trn === trn);
        if (trnExists) {
            msg.className = "message error";
            msg.textContent = "This TRN is already registered.";
            return;
        }

        // ---------------------- PASSWORD LENGTH CHECK ----------------------
        if (password.length < 8) {
            msg.className = "message error";
            msg.textContent = "Password must be at least 8 characters long.";
            return;
        }

        // ---------------------- PASSWORD MATCH CHECK ----------------------
        if (password !== confirmPassword) {
            msg.className = "message error";
            msg.textContent = "Passwords do not match.";
            return;
        }

        // ---------------------- USERNAME UNIQUE CHECK ----------------------
        const exists = users.some(u => u.username === username);
        if (exists) {
            msg.className = "message error";
            msg.textContent = "That username is already taken. Please choose another.";
            return;
        }

        // ---------------------- SAVE USER ----------------------
        const newUser = { fullName, dob, trn, email, username: trn, password };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        msg.className = "message success";
        msg.textContent = "Registration successful! Redirecting to login...";
        form.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
    });
}

// ------------------ USER STATUS (LOGGED IN DISPLAY + LOGOUT) ------------------
document.addEventListener("DOMContentLoaded", () => {
    const statusBox = document.getElementById("userStatus");
    if (!statusBox) return;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
        // Show user + logout button
         const firstName = currentUser.fullName.split(" ")[0];
        statusBox.innerHTML = `
            <span class="welcome-text">Welcome, ${firstName}!</span>
            <button id="logoutBtn" class="logout-btn">Logout</button>
        `;

        const btn = document.getElementById("logoutBtn");
        btn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        });

    } else {
        statusBox.innerHTML = "";
    }
});
