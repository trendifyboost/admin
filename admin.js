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

 // Toggle the form visibility
  document.getElementById("toggle-form-button").addEventListener("click", () => {
    const formContainer = document.getElementById("customer-form-container");
    if (formContainer.style.display === "none" || formContainer.style.display === "") {
      formContainer.style.display = "block"; // Show the form
    } else {
      formContainer.style.display = "none"; // Hide the form
    }
  });

  // Add Customer functionality
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

    const remainingAmount = packagePrice - customerPaid;

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
      remainingAmount,
      endDate: endDate.toISOString().split('T')[0]
    })
    .then(() => {
      alert("Customer added successfully!");
      document.getElementById("customer-form-container").style.display = "none"; // Hide form after submission
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

// Generate Receipt PDF Function
function generateReceiptPDF() {
  const { jsPDF } = window.jspdf; // jsPDF এর রেফারেন্স পাওয়া
  const pdf = new jsPDF();

  // পপআপে থাকা তথ্যগুলো সংগ্রহ করা
  const popupText = document.getElementById("popup-text").innerText;

  // PDF এ কনটেন্ট যোগ করা
  pdf.text(popupText, 10, 10);

  // PDF ডাউনলোড করা
  pdf.save("customer-receipt.pdf");
}

// View Customer Details
window.viewCustomer = function (key) {
  get(ref(db, `customers/${key}`)).then(snapshot => {
    if (snapshot.exists()) {
      const customer = snapshot.val();
      const popup = document.getElementById("popup-modal");
      const popupText = document.getElementById("popup-text");

      popupText.innerHTML = `
        <strong>Name:</strong> ${key}<br>
        <strong>Page:</strong> ${customer.pageName}<br>
        <strong>Package:</strong> ${customer.packageName}<br>
        <strong>Start Date:</strong> ${customer.startDate}<br>
        <strong>End Date:</strong> ${customer.endDate}<br>
        <strong>Package Days:</strong> ${customer.packageDays}<br>
        <strong>Package Price:</strong> ${customer.packagePrice}<br>
        <strong>Paid Amount:</strong> ${customer.customerPaid}<br>
        <strong>Remaining Amount:</strong> ${customer.remainingAmount}
      `;

      let downloadButton = document.getElementById("download-receipt-button");
if (!downloadButton) {
  downloadButton = document.createElement("button");
  downloadButton.id = "download-receipt-button";
  downloadButton.innerText = "Print";
  downloadButton.classList.add("download-button"); // Add a CSS class for styling

  downloadButton.addEventListener("click", generateReceiptPDF);
  popup.appendChild(downloadButton); // Ensure `popup` is a valid DOM element
}


      popup.style.display = "flex";

      function closeModal() {
        popup.style.display = "none";
        if (downloadButton && downloadButton.parentElement) {
          downloadButton.remove();
        }
        window.removeEventListener("click", windowClickHandler);
      }

      document.querySelector(".close-button").onclick = closeModal;

      function windowClickHandler(event) {
        if (event.target === popup) {
          closeModal();
        }
      }

      window.addEventListener("click", windowClickHandler);

    } else {
      alert("Customer data not found.");
    }
  }).catch(error => console.error("Error viewing customer:", error));
};

// Initial load
loadCustomers();
