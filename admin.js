// Import Firebase modules
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
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${key}</td>
          <td>
            <button onclick="viewCustomer('${key}')">View</button>
            <button onclick="deleteCustomer('${key}')">Delete</button>
          </td>
        `;
        customerList.appendChild(row);
      });
    }
  });
}

// Delete Customer
window.deleteCustomer = function (key) {
  remove(ref(db, `customers/${key}`)).then(() => {
    alert("Customer deleted successfully!");
    loadCustomers();
  });
};

// View Customer Details
window.viewCustomer = async function (key) {
  const { jsPDF } = window.jspdf;

  const snapshot = await get(ref(db, `customers/${key}`));

  if (snapshot.exists()) {
    const customer = snapshot.val();

    const detailsHTML = `
      <p><strong>Name:</strong> ${key}</p>
      <p><strong>Page:</strong> ${customer.pageName}</p>
      <p><strong>Package:</strong> ${customer.packageName}</p>
      <p><strong>Start Date:</strong> ${customer.startDate}</p>
      <p><strong>End Date:</strong> ${customer.endDate}</p>
    `;
    
    document.getElementById('customerDetails').innerHTML = detailsHTML;

    // Bootstrap Modal open করার জন্য
    $('#customerModal').modal('show');

    // Download Button Click Handler
    document.getElementById('downloadPdfBtn').onclick = function () {
      const doc = new jsPDF();

      doc.setFontSize(14);
      doc.text(`Customer: ${key}`, 10, 10);
      doc.text(`Page: ${customer.pageName}`, 10, 20);
      doc.text(`Package: ${customer.packageName}`, 10, 30);
      doc.text(`Start Date: ${customer.startDate}`, 10, 40);

      // Save PDF
      doc.save(`${key}_CustomerDetails.pdf`);
      $('#customerModal').modal('hide');  // Close modal
    };
  }
};

// Initial Load of Customer Data
loadCustomers();
