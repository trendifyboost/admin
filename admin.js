// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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

// Add Customer Functionality
document.getElementById("add-customer-button").addEventListener("click", () => {
  const name = document.getElementById("customer-name").value.trim();
  const pageName = document.getElementById("page-name").value.trim();
  const packageName = document.getElementById("package-name").value;
  const startDate = document.getElementById("start-date").value;
  const packageDays = parseInt(document.getElementById("package-days").value);
  const packagePrice = parseFloat(document.getElementById("package-price").value);
  const customerPaid = parseFloat(document.getElementById("customer-paid").value);

  const button = document.getElementById("add-customer-button");

  // Validate Input Fields
  if (!name || !pageName || !startDate || isNaN(packageDays) || isNaN(packagePrice) || isNaN(customerPaid)) {
    alert("Please fill in all customer details correctly.");
    return;
  }

  button.disabled = true;  // Disable button to prevent multiple clicks

  const remaining = packagePrice - customerPaid;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + packageDays);

  const safeName = name.replace(/[^a-zA-Z0-9]/g, "_");
  const customerRef = ref(db, `customers/${safeName}`);

  set(customerRef, {
    pageName,
    packageName,
    startDate,
    packageDays,
    packagePrice,
    customerPaid,
    remaining,
    endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  })
    .then(() => {
      alert("Customer added successfully!");
      loadCustomers();
      button.disabled = false;  // Re-enable button
    })
    .catch(error => {
      console.error("Error adding customer:", error);
      alert("An error occurred while adding the customer. Please try again.");
      button.disabled = false;  // Re-enable button
    });
});

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
      customerList.innerHTML = "";

      if (snapshot.exists()) {
        const customers = snapshot.val();

        // Sorting customers by End Date (ascending)
        const sortedCustomers = Object.entries(customers).sort((a, b) => {
          return new Date(a[1].endDate) - new Date(b[1].endDate);
        });

        sortedCustomers.forEach(([key, customer]) => {
          const row = document.createElement("tr");

          let endDate = new Date(customer.endDate);
          let today = new Date();
          let tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          let dotColor = "";
          if (endDate.toDateString() === today.toDateString()) {
            dotColor = "red";
          } else if (endDate.toDateString() === tomorrow.toDateString()) {
            dotColor = "yellow";
          } else {
            dotColor = "gray";
          }

          row.innerHTML = `
            <td>${key} <span style="color: ${dotColor}; font-weight: bold;">●</span></td>
            <td>${customer.pageName}</td>
            <td>${customer.packageName}</td>
            <td>${customer.startDate}</td>
            <td>${customer.packageDays}</td>
            <td>${customer.packagePrice}</td>
            <td>${customer.customerPaid}</td>
            <td>${customer.remaining}</td>
            <td>${customer.endDate}</td>
            <td>
              <button onclick="editCustomer('${key}')">Edit</button>
              <button onclick="deleteCustomer('${key}')">Delete</button>
              <button onclick="viewCustomerDetails('${key}')">View</button>
            </td>
          `;
          
          customerList.appendChild(row);
        });
      }
    })
    .catch(error => console.error("Error fetching customers:", error));
}

function viewCustomerDetails(key) {
  get(ref(db, `customers/${key}`))
    .then(snapshot => {
      if (snapshot.exists()) {
        const customer = snapshot.val();
        const content = `
          <div style="padding: 20px; font-family: Arial; line-height: 1.8;">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${key}</p>
            <p><strong>Page:</strong> ${customer.pageName}</p>
            <p><strong>Package:</strong> ${customer.packageName}</p>
            <p><strong>Start Date:</strong> ${customer.startDate}</p>
            <p><strong>Package Duration (Days):</strong> ${customer.packageDays}</p>
            <p><strong>Price:</strong> ${customer.packagePrice}</p>
            <p><strong>Paid Amount:</strong> ${customer.customerPaid}</p>
            <p><strong>Payment Due:</strong> ${customer.remaining}</p>
            <p><strong>End Date:</strong> ${customer.endDate}</p>
          </div>
        `;

        const popup = window.open("", "Customer Details", "width=600,height=400");
        popup.document.write(content);
        popup.document.close();
      }
    })
    .catch(console.error);
}




// Logout Button Functionality
document.getElementById("logout-button").addEventListener("click", () => {
  // Perform logout action (you can redirect or clear session/local storage)
  
  alert("You have successfully logged out.");
  
  // Redirect to login page
  window.location.href = "login.html";
  
  // Alternatively, clear session storage
  sessionStorage.clear();
});
