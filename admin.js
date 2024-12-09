// Add Customer Functionality
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
      loadCustomers(); // Updated: Call the loadCustomers function instead of reloading the page
    })
    .catch(error => {
      console.error("Error adding customer:", error);
    });
});

// Delete Customer Functionality
window.deleteCustomer = function (key) {
  remove(ref(db, `customers/${key}`))
    .then(() => {
      alert("Customer deleted successfully!");
      loadCustomers(); // Refresh customer list after deletion
    })
    .catch(error => console.error("Error deleting customer:", error));
};

// Fetch and Display All Customers
function loadCustomers() {
  const customerList = document.getElementById("customer-list");
  const customersRef = ref(db, "customers");

  get(customersRef)
    .then(snapshot => {
      customerList.innerHTML = ""; // Clear previous rows
      if (snapshot.exists()) {
        const customers = snapshot.val();
        Object.keys(customers).forEach(key => {
          const customer = customers[key];

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${key}</td>
            <td>${customer.pageName}</td>
            <td>${customer.packageName}</td>
            <td>${customer.startDate}</td>
            <td>${customer.packageDays}</td>
            <td>${customer.packagePrice}</td>
            <td>${customer.customerPaid}</td>
            <td>${customer.remaining}</td>
            <td>${customer.endDate}</td>
            <td><button onclick="deleteCustomer('${key}')">Delete</button></td>
          `;

          customerList.appendChild(row);
        });
      } else {
        console.log("No customers found.");
      }
    })
    .catch(error => console.error("Error fetching customers:", error));
}

// Initial Load of Customers
loadCustomers();
