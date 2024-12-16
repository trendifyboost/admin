// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5JTd88XMPaw8ThV8i4wh8r37uhSuuKiQ",
  authDomain: "trendify-30126.firebaseapp.com",
  databaseURL: "https://trendify-30126-default-rtdb.firebaseio.com",
  projectId: "trendify-30126",
  storageBucket: "trendify-30126.appspot.com",
  messagingSenderId: "816600328899",
  appId: "1:816600328899:web:4b01799c1e82e932451076",
  measurementId: "G-9QV2QDB3CG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Add Customer Functionality
document.getElementById("add-customer-button").addEventListener("click", () => {
  const name = document.getElementById("customer-name").value.trim();
  const pageName = document.getElementById("page-name").value.trim();
  const packageName = document.getElementById("package-name").value;
  const startDate = document.getElementById("start-date").value;
  const packageDays = parseInt(document.getElementById("package-days").value);
  const packagePrice = parseFloat(document.getElementById("package-price").value);
  const customerPaid = parseFloat(document.getElementById("customer-paid").value);

  if (!name || !pageName || !startDate || isNaN(packageDays) || isNaN(packagePrice) || isNaN(customerPaid)) {
    alert("Please fill in all customer details correctly.");
    return;
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + packageDays);

  const safeName = name.replace(/[^a-zA-Z0-9]/g, "_");
  const customerRef = ref(db, `customers/${safeName}`);

  set(customerRef, {
    name,
    pageName,
    packageName,
    startDate,
    packageDays,
    packagePrice,
    customerPaid,
    endDate: endDate.toISOString().split('T')[0]
  })
  .then(() => {
    alert("Customer added successfully!");
    loadCustomers();
  })
  .catch(error => console.error("Error adding customer:", error));
});

// Load and Display Customers
function loadCustomers() {
  const customerList = document.getElementById("customer-list");
  const customersRef = ref(db, "customers");

  get(customersRef).then(snapshot => {
    customerList.innerHTML = "";

    if (snapshot.exists()) {
      const customers = snapshot.val();
      const sortedCustomers = Object.entries(customers).sort((a, b) => new Date(a[1].endDate) - new Date(b[1].endDate));

      sortedCustomers.forEach(([key, customer]) => {
        const endDate = new Date(customer.endDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        let dotColor = "";
        if (endDate.toDateString() === today.toDateString()) {
          dotColor = "red";
        } else if (endDate.toDateString() === tomorrow.toDateString()) {
          dotColor = "yellow";
        }

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${customer.name} <span style="color: ${dotColor}; font-weight: bold;">●</span></td>
          <td>
            <button onclick="viewCustomer('${key}')">View</button>
            <button onclick="deleteCustomer('${key}')">Delete</button>
          </td>
        `;
        customerList.appendChild(row);
      });
    }
  }).catch(error => console.error("Error loading customers:", error));
}

// Delete Customer
window.deleteCustomer = function (key) {
  remove(ref(db, `customers/${key}`)).then(() => {
    alert("Customer deleted successfully!");
    loadCustomers();
  }).catch(error => console.error("Error deleting customer:", error));
};

// View Customer Details
window.viewCustomer = function (key) {
  get(ref(db, `customers/${key}`)).then(snapshot => {
    if (snapshot.exists()) {
      const customer = snapshot.val();
      alert(`
        Name: ${customer.name}
        Page: ${customer.pageName}
        Package: ${customer.packageName}
        Start Date: ${customer.startDate}
        End Date: ${customer.endDate}
        Package Days: ${customer.packageDays}
        Package Price: ${customer.packagePrice}
        Paid Amount: ${customer.customerPaid}
      `);
    } else {
      alert("Customer data not found.");
    }
  }).catch(error => console.error("Error viewing customer:", error));
};

// Initial load
loadCustomers();
