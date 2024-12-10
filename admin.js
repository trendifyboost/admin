// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, get, push, remove } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5JTd88XMPaw8ThV8i4wh8r37uhSuuKiQ",
  authDomain: "trendify-30126.firebaseapp.com",
  databaseURL: "https://trendify-30126-default-rtdb.firebaseio.com",
  projectId: "trendify-30126",
  storageBucket: "trendify-30126.firebasestorage.app",
  messagingSenderId: "816600328899",
  appId: "1:816600328899:web:4b01799c1e82e932451076",
  measurementId: "G-9QV2QDB3CG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Add Customer Functionality (New Implementation)
function addCustomer() {
  const customerName = document.getElementById('customer-name').value.trim();
  const pageName = document.getElementById('page-name').value.trim();
  const packageName = document.getElementById('package-name').value;
  const startDate = document.getElementById('start-date').value;
  const packageDays = parseInt(document.getElementById('package-days').value);
  const packagePrice = parseFloat(document.getElementById('package-price').value);
  const customerPaid = parseFloat(document.getElementById('customer-paid').value);

  if (customerName && pageName && startDate && !isNaN(packageDays) && !isNaN(packagePrice) && !isNaN(customerPaid)) {
    const remaining = packagePrice - customerPaid;

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + packageDays);

    const newCustomer = {
      name: customerName,
      page: pageName,
      package: packageName,
      startDate: startDate,
      packageDays: packageDays,
      packagePrice: packagePrice,
      customerPaid: customerPaid,
      remaining: remaining,
      endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    // Push customer data to Firebase database
    const customersRef = ref(db, 'customers');
    push(customersRef, newCustomer)
      .then(() => {
        alert('Customer added successfully!');
        loadCustomers(); // Reload the customer list
      })
      .catch((error) => {
        console.error('Error adding customer:', error);
        alert('Failed to add customer. Please try again.');
      });
  } else {
    alert('Please fill in all required fields correctly.');
  }
}

// Delete Customer Functionality
window.deleteCustomer = function (key) {
  remove(ref(db, `customers/${key}`))
    .then(() => {
      alert("Customer deleted successfully!");
      loadCustomers();
    })
    .catch(error => console.error("Error deleting customer:", error));
};

// Fetch and Display All Customers
function loadCustomers() {
  const customerList = document.getElementById("customer-list");
  const customersRef = ref(db, "customers");

  get(customersRef)
    .then(snapshot => {
      customerList.innerHTML = ""; // Clear previous rows

      if (snapshot.exists()) {
        const customers = snapshot.val();

        Object.keys(customers).forEach(key => {
          const customer = customers[key];

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${key}</td>
            <td>${customer.page}</td>
            <td>${customer.package}</td>
            <td>${customer.startDate}</td>
            <td>${customer.packageDays}</td>
            <td>${customer.packagePrice}</td>
            <td>${customer.customerPaid}</td>
            <td>${customer.remaining}</td>
            <td>${customer.endDate}</td>
            <td><button onclick="deleteCustomer('${key}')">Delete</button></td>
          `;

          customerList.appendChild(row);
        });
      } else {
        console.log("No customers found.");
        alert("No customers found in the database.");
      }
    })
    .catch(error => {
      console.error("Error fetching customers:", error);
      alert("An error occurred while fetching customers.");
    });
}

// Attach Event Listener for Add Customer Button
document.getElementById("add-customer-button").addEventListener("click", addCustomer);

// Initial Load of Customers
loadCustomers();

// Logout Button Functionality
document.getElementById("logout-button").addEventListener("click", () => {
  alert("You have successfully logged out.");
  window.location.href = "login.html";
  sessionStorage.clear();
});
