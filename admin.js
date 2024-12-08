// Import the shared Firebase instance
import { db } from './firebaseConfig.js';
import { ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

document.getElementById("add-customer-button").addEventListener("click", () => {
  const name = document.getElementById("customer-name").value.trim();
  const pageName = document.getElementById("page-name").value.trim();
  const packageName = document.getElementById("package-name").value;
  const startDate = document.getElementById("start-date").value;
  const packageDays = parseInt(document.getElementById("package-days").value);
  const packagePrice = parseFloat(document.getElementById("package-price").value);
  const customerPaid = parseFloat(document.getElementById("customer-paid").value);

  if (!name || !pageName || !startDate || !packageDays || !packagePrice || !customerPaid) {
    alert("Please fill in all customer details.");
    return;
  }

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
    endDate: endDate.toISOString().split("T")[0]
  })
  .then(() => {
    alert("Customer added successfully!");
    location.reload();
  })
  .catch(error => console.error("Error adding customer:", error));
});

window.deleteCustomer = function (key) {
  remove(ref(db, `customers/${key}`))
    .then(() => {
      alert("Customer deleted successfully!");
    })
    .catch(error => console.error("Error deleting customer:", error));
};
