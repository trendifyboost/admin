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

  if (!name || !pageName || !startDate || isNaN(packageDays) || isNaN(packagePrice) || isNaN(customerPaid)) {
    alert("Please fill in all customer details correctly.");
    return;
  }

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
          <td>${key} <span style="color: ${dotColor}; font-weight: bold;">●</span></td>
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

    // সব কাস্টমার ভ্যালু স্টোর করে একটি HTML section তৈরি
    const detailsHTML = `
      <p><strong>Name:</strong> ${customer.name}</p>
      <p><strong>Page Name:</strong> ${customer.pageName}</p>
      <p><strong>Package:</strong> ${customer.packageName}</p>
      <p><strong>Start Date:</strong> ${customer.startDate}</p>
      <p><strong>Package Duration:</strong> ${customer.packageDays} Days</p>
      <p><strong>Package Price:</strong> $${customer.packagePrice}</p>
      <p><strong>Paid Amount:</strong> $${customer.customerPaid}</p>
    `;
    
    document.getElementById('customerDetails').innerHTML = detailsHTML;

    $('#customerModal').modal('show');

    document.getElementById('downloadPdfBtn').onclick = function () {
      const doc = new jsPDF();

      doc.setFontSize(14);
      doc.text(`Customer Details for ${key}`, 10, 10);

      const lineHeight = 10;
      let yPos = 20;

      const customerData = [
        `Name: ${customer.name}`,
        `Page Name: ${customer.pageName}`,
        `Package: ${customer.packageName}`,
        `Start Date: ${customer.startDate}`,
        `Package Duration: ${customer.packageDays} Days`,
        `Package Price: $${customer.packagePrice}`,
        `Paid Amount: $${customer.customerPaid}`
      ];

      customerData.forEach((line) => {
        doc.text(line, 10, yPos);
        yPos += lineHeight;
      });

      doc.save(`${key}_CustomerDetails.pdf`);
      $('#customerModal').modal('hide');
    };
  }
};

// Initial load
loadCustomers();
