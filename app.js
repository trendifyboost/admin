import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5JTd88XMPaw8ThV8i4wh8r37uhSuuKiQ",
  authDomain: "trendify-30126.firebaseapp.com",
  databaseURL: "https://trendify-30126-default-rtdb.firebaseio.com",
  projectId: "trendify-30126",
  storageBucket: "trendify-30126.firebasestorage.app",
  messagingSenderId: "816600328899",
  appId: "1:816600328899:web:70ee632ac3424277451076",
  measurementId: "G-ZQ2ECPNY9C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Add Customer
const customerForm = document.getElementById("customer-form");
customerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get input values
    const customerName = document.getElementById("customerName").value;
    const packageName = document.getElementById("packageName").value;
    const pageName = document.getElementById("pageName").value;
    const startDate = document.getElementById("startDate").value;
    const packageDuration = parseInt(document.getElementById("packageDuration").value);
    const packagePrice = parseFloat(document.getElementById("packagePrice").value);
    const customerPaid = parseFloat(document.getElementById("customerPaid").value);

    // Calculate end date and due amount
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + packageDuration);
    const dueAmount = packagePrice - customerPaid;

    // Push data to Realtime Database
    const newCustomerRef = push(ref(db, "customers"));
    try {
        await set(newCustomerRef, {
            customerName,
            packageName,
            pageName,
            startDate,
            endDate: endDate.toISOString().split("T")[0],
            packageDuration,
            packagePrice,
            customerPaid,
            dueAmount
        });
        alert("Customer added successfully!");
        customerForm.reset();
        loadCustomers(); // Reload customer table
    } catch (error) {
        console.error("Error adding customer: ", error);
    }
});

// Load Customers
const customerTable = document.getElementById("customerTable");

function loadCustomers() {
    onValue(ref(db, "customers"), (snapshot) => {
        customerTable.innerHTML = ""; // Clear table
        const customers = snapshot.val();
        if (customers) {
            for (const id in customers) {
                const customer = customers[id];
                const remainingDays = Math.max(
                    0,
                    Math.ceil((new Date(customer.endDate) - new Date()) / (1000 * 60 * 60 * 24))
                );

                // Add row to table
                const row = `
                    <tr>
                        <td>${customer.customerName}</td>
                        <td>${customer.packageName}</td>
                        <td>${customer.pageName}</td>
                        <td>${customer.startDate}</td>
                        <td>${customer.endDate}</td>
                        <td>${remainingDays}</td>
                        <td>${customer.packagePrice}৳</td>
                        <td>${customer.customerPaid}৳</td>
                        <td>${customer.dueAmount}৳</td>
                        <td>
                            <button onclick="deleteCustomer('${id}')">Delete</button>
                        </td>
                    </tr>
                `;
                customerTable.innerHTML += row;
            }
        } else {
            customerTable.innerHTML = "<tr><td colspan='10'>No customers found.</td></tr>";
        }
    });
}

// Delete Customer
window.deleteCustomer = async (id) => {
    const customerRef = ref(db, `customers/${id}`);
    try {
        await remove(customerRef);
        alert("Customer deleted successfully!");
        loadCustomers(); // Reload customer table
    } catch (error) {
        console.error("Error deleting customer: ", error);
    }
};

// Load customers on page load
loadCustomers();