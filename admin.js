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

// Add Customer Functionality
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

// Fetch and Display All Customers with Sorting and Indicators
function loadCustomers() {
  const customerList = document.getElementById("customer-list");
  const customersRef = ref(db, "customers");

  get(customersRef)
    .then(snapshot => {
      customerList.innerHTML = ""; // Clear previous rows

      if (snapshot.exists()) {
        const customers = snapshot.val();

        // Convert customers object to array and sort by End Date
        const sortedCustomers = Object.keys(customers)
          .map(key => ({ key, ...customers[key] }))
          .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

        sortedCustomers.forEach(customer => {
          const today = new Date();
          const endDate = new Date(customer.endDate);
          const isToday = endDate.toDateString() === today.toDateString();
          const isTomorrow =
            new Date(endDate).setDate(endDate.getDate() - 1) ===
            today.setDate(today.getDate());

          let pointColor = "";
          if (isToday) {
            pointColor = "red";
          } else if (isTomorrow) {
            pointColor = "yellow";
          }

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>
              <span style="color: ${pointColor}; font-size: 20px;">●</span> 
              ${customer.key}
            </td>
            <td>
              <button onclick="viewCustomer('${customer.key}')">View</button>
              <button onclick="editCustomer('${customer.key}')">Edit</button>
              <button onclick="deleteCustomer('${customer.key}')">Delete</button>
            </td>
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

// View Customer Details
window.editCustomer = function (key) {
  const customerRef = ref(db, `customers/${key}`);

  get(customerRef)
    .then(snapshot => {
      if (snapshot.exists()) {
        const customer = snapshot.val();

        // Populate form fields with the customer's existing data
        document.getElementById('customer-name').value = customer.name;
        document.getElementById('page-name').value = customer.page;
        document.getElementById('package-name').value = customer.package;
        document.getElementById('start-date').value = customer.startDate;
        document.getElementById('package-days').value = customer.packageDays;
        document.getElementById('package-price').value = customer.packagePrice;
        document.getElementById('customer-paid').value = customer.customerPaid;

        alert(`Editing customer: ${customer.name}`);
      } else {
        alert('Customer not found.');
      }
    })
    .catch(error => {
      console.error("Error editing customer:", error);
      alert("An error occurred while editing customer details.");
    });
};
// Close Popup
window.closePopup = function() {
  const popup = document.querySelector(".popup");
  if (popup) {
    popup.remove();
  }
};

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
