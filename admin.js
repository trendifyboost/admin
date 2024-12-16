import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCO2KsBx8UVttuQVpePMkDdebLxC1uSI1A",
  authDomain: "nasimul-islam-dggumx.firebaseapp.com",
  databaseURL: "https://nasimul-islam-dggumx-default-rtdb.firebaseio.com",
  projectId: "nasimul-islam-dggumx",
  storageBucket: "nasimul-islam-dggumx.appspot.com",
  messagingSenderId: "482637964405",
  appId: "1:482637964405:web:d6282975958cc1e641c43c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM Elements
const addCustomerButton = document.getElementById("add-customer-button");
const customerList = document.getElementById("customer-list");
const popupModal = document.getElementById("popup-modal");
const popupText = document.getElementById("popup-text");
const closeButton = document.querySelector(".close-button");
const downloadButton = document.getElementById("download-receipt-button");
const logoutButton = document.getElementById("logout-button");

// Add Customer
addCustomerButton.addEventListener("click", () => {
  const customerName = document.getElementById("customer-name").value;
  const pageName = document.getElementById("page-name").value;
  const packageName = document.getElementById("package-name").value;
  const startDate = document.getElementById("start-date").value;
  const packageDays = parseInt(document.getElementById("package-days").value);
  const packagePrice = parseInt(document.getElementById("package-price").value);
  const customerPaid = parseInt(document.getElementById("customer-paid").value);
  const endDate = calculateEndDate(startDate, packageDays);

  if (
    customerName &&
    pageName &&
    packageName &&
    startDate &&
    !isNaN(packageDays) &&
    !isNaN(packagePrice) &&
    !isNaN(customerPaid)
  ) {
    const customerRef = push(ref(db, "Customers"));
    set(customerRef, {
      customerName,
      pageName,
      packageName,
      startDate,
      endDate,
      packageDays,
      packagePrice,
      customerPaid,
    }).then(() => {
      alert("Customer added successfully!");
      clearInputs();
    });
  } else {
    alert("Please fill in all fields correctly!");
  }
});

// Calculate End Date
function calculateEndDate(startDate, days) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

// Clear Inputs
function clearInputs() {
  document.getElementById("customer-name").value = "";
  document.getElementById("page-name").value = "";
  document.getElementById("package-name").value = "Boosting";
  document.getElementById("start-date").value = "";
  document.getElementById("package-days").value = "";
  document.getElementById("package-price").value = "";
  document.getElementById("customer-paid").value = "";
}

// Fetch Customers
function fetchCustomers() {
  const customersRef = ref(db, "Customers");
  onValue(customersRef, (snapshot) => {
    customerList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const customerKey = childSnapshot.key;
      const customerData = childSnapshot.val();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${customerData.customerName}</td>
        <td><button class="view-details" data-key="${customerKey}">View Details</button></td>
      `;
      customerList.appendChild(row);
    });

    document.querySelectorAll(".view-details").forEach((button) => {
      button.addEventListener("click", (event) => {
        const key = event.target.getAttribute("data-key");
        showCustomerDetails(key);
      });
    });
  });
}

// Show Customer Details
function showCustomerDetails(key) {
  const customerRef = ref(db, `Customers/${key}`);
  onValue(customerRef, (snapshot) => {
    const customer = snapshot.val();
    const details = `
      Name: ${customer.customerName}\n
      Page Name: ${customer.pageName}\n
      Package: ${customer.packageName}\n
      Start Date: ${customer.startDate}\n
      End Date: ${customer.endDate}\n
      Package Days: ${customer.packageDays}\n
      Package Price: ${customer.packagePrice}\n
      Customer Paid: ${customer.customerPaid}
    `;
    popupText.textContent = details;
    popupModal.style.display = "block";

    downloadButton.onclick = () => {
      generatePDF(details, customer.customerName);
    };
  });
}

// Generate PDF
function generatePDF(details, customerName) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(`Customer Details: ${customerName}`, 10, 10);
  doc.text(details, 10, 20);
  doc.save(`${customerName}-details.pdf`);
}

// Close Modal
closeButton.addEventListener("click", () => {
  popupModal.style.display = "none";
});

// Logout
logoutButton.addEventListener("click", () => {
  window.location.href = "index.html";
});

// Fetch Customers on Page Load
fetchCustomers();
