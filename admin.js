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

  const remainingAmount = packagePrice - customerPaid; // কত টাকা বাকি আছে সেটি হিসাব

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
    remainingAmount, // বাকি টাকা ডাটাবেজে যোগ করুন
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
window.viewCustomer = function (key) {
  get(ref(db, `customers/${key}`)).then(snapshot => {
    if (snapshot.exists()) {
      const customer = snapshot.val();
      const popup = document.getElementById("popup-modal");
      const popupText = document.getElementById("popup-text");

      // Update the text with customer details
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

      // Display the modal
      popup.style.display = "flex";

      // Close the modal when the close button is clicked
      document.querySelector(".close-button").onclick = () => {
        popup.style.display = "none";
      };

      // Close the modal when clicked outside the content
      window.onclick = (event) => {
        if (event.target === popup) {
          popup.style.display = "none";
        }
      };
    } else {
      alert("Customer data not found.");
    }
    // Add a download button below the popup modal
const popup = document.getElementById("popup-modal");
const downloadButton = document.createElement("button");
downloadButton.innerText = "Download Receipt";
downloadButton.style.marginTop = "10px";
downloadButton.addEventListener("click", generateReceiptPDF);
popup.appendChild(downloadButton);

// Function to generate the receipt PDF
function generateReceiptPDF() {
    const popupText = document.getElementById("popup-text");

    // Load the background image
    const backgroundImage = new Image();
    backgroundImage.src = "image/print.png"; // Path to your A4-sized background image

    backgroundImage.onload = () => {
        // Create a canvas for html2canvas
        html2canvas(popupText, {
            scale: 2 // High resolution
        }).then(canvas => {
            const popupImage = canvas.toDataURL("image/png"); // Capture popup content as an image

            // Create a PDF with jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("p", "mm", "a4"); // Portrait, millimeters, A4 size

            // Add the background image to the PDF
            pdf.addImage(backgroundImage, "PNG", 0, 0, 210, 297); // Full-page background

            // Add the captured popup content to the PDF
            pdf.addImage(popupImage, "PNG", 10, 50, 190, 0); // Dynamically adjust content position

            // Save the PDF
            pdf.save("Customer_Receipt.pdf");
        });
    };

    backgroundImage.onerror = () => {
        alert("Failed to load the background image.");
    };
}

  }).catch(error => console.error("Error viewing customer:", error));
};
function showModal() {
    const modal = document.querySelector(".modal");
    modal.style.display = "flex"; // Use flex to center it properly
}

function closeModal() {
    const modal = document.querySelector(".modal");
    modal.style.display = "none";
}

// Initial load
loadCustomers();
