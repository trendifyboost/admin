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

  // ফায়ারবেস থেকে ডেটা ফেচ করা
  const snapshot = await get(ref(db, `customers/${key}`));
  if (snapshot.exists()) {
    const customer = snapshot.val();

    // PDF ডকুমেন্ট তৈরি করা
    const doc = new jsPDF();

    // লোগো ইমেজ যুক্ত করা (উপরে বাম পাশ)
    const logo = "image/logo.png";
    const signature = "image/si.png";
    const ro = "image/ro.png";
    const bk = "image/bk.png";
    const na = "image/na.png";
    const up = "image/up.png";
    const qr = "image/qr.png";

    // লোগো যোগ করা
    const logoImage = new Image();
    logoImage.src = logo;
    logoImage.onload = function () {
      doc.addImage(logoImage, "PNG", 10, 10, 30, 30);

      // ডান পাশে যোগাযোগের তথ্য যোগ করা
      doc.setFontSize(10);
      doc.text("Number: 01983000739", 140, 15);
      doc.text("Email: trendifyboost@hotmail.com", 140, 20);
      doc.text("Address: 3la, gagan babu road, Khulna", 140, 25);

      // মাঝখানে কাস্টমার ডিটেইলস যোগ করা
      doc.setFontSize(12);
      doc.text("Customer Details:", 80, 50);
      doc.text("-----------------", 80, 55);
      doc.text(`Name: ${key}`, 80, 65);
      doc.text(`Page: ${customer.pageName}`, 80, 70);
      doc.text(`Package: ${customer.packageName}`, 80, 75);
      doc.text(`Start Date: ${customer.startDate}`, 80, 80);
      doc.text(`End Date: ${customer.endDate}`, 80, 85);

      // ফুটারে কলম ও কন্টেইনার তৈরি করা
      // সিগনেচার কন্টেইনার
      const signatureImage = new Image();
      signatureImage.src = signature;
      signatureImage.onload = function () {
        doc.addImage(signatureImage, "PNG", 20, 240, 40, 30);
        doc.text("Nasimu Islam Sheikh", 25, 275);

        // Send Money কন্টেইনার
        doc.text("Send Money", 90, 245);
        const paymentLogos = [ro, bk, na, up];
        let xOffset = 85;
        paymentLogos.forEach((logoSrc, index) => {
          const logoImage = new Image();
          logoImage.src = logoSrc;
          logoImage.onload = function () {
            doc.addImage(logoImage, "PNG", xOffset, 250, 20, 20);
            xOffset += 25;
          };
        });
        doc.text("+8801642832777", 95, 275);

        // QR কোড কন্টেইনার
        const qrImage = new Image();
        qrImage.src = qr;
        qrImage.onload = function () {
          doc.addImage(qrImage, "PNG", 160, 240, 30, 30);

          // ফুটারের ইউআরএল যোগ করা
          doc.setFontSize(10);
          doc.text("trendifyboost.github.io/agency", 80, 290);

          // PDF ডাউনলোড করানো
          doc.save(`${key}_Customer_Memo.pdf`);
        };
      };
    };
  } else {
    alert("Customer not found!");
  }
};


// Initial load
loadCustomers();
