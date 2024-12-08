// Add Customer Functionality
document.getElementById("add-customer-button").addEventListener("click", () => {
  const name = document.getElementById("customer-name").value.trim();
  const pageName = document.getElementById("page-name").value.trim();
  const packageName = document.getElementById("package-name").value.trim();
  const startDate = document.getElementById("start-date").value;
  const packageDays = parseInt(document.getElementById("package-days").value);
  const packagePrice = parseFloat(document.getElementById("package-price").value);
  const customerPaid = parseFloat(document.getElementById("customer-paid").value);

  // Check if all fields are filled
  if (!name || !pageName || !startDate || !packageDays || !packagePrice || !customerPaid) {
    alert("Please fill in all customer details.");
    return;
  }

  // Calculate remaining amount
  const remaining = packagePrice - customerPaid;
  
  // Calculate end date
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + packageDays);

  // Make sure the name is URL-safe (replace spaces or special characters)
  const safeName = name.replace(/[^a-zA-Z0-9]/g, "_");

  // Reference to the customer data in the Firebase Realtime Database
  const customerRef = ref(db, `customers/${safeName}`);

  // Save data to Firebase Realtime Database
  set(customerRef, {
    pageName,
    packageName,
    startDate,
    packageDays,
    packagePrice,
    customerPaid,
    remaining,
    endDate: endDate.toISOString().split("T")[0] // Format the end date as YYYY-MM-DD
  })
    .then(() => {
      alert("Customer added successfully!");
      location.reload(); // Reload the page after successful addition
    })
    .catch(error => {
      console.error("Error adding customer:", error);
    });
});

// Delete Customer
window.deleteCustomer = function (key) {
  remove(ref(db, `customers/${key}`))
    .then(() => {
      alert("Customer deleted successfully!");
      location.reload();
    })
    .catch(error => console.error("Error deleting customer:", error));
};

// Fetch and Display All Customers
const customerList = document.getElementById("customer-list");
const customersRef = ref(db, "customers");

get(customersRef)
  .then(snapshot => {
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
      console.log("No customers found in the database.");
    }
  })
  .catch(error => console.error("Error fetching customers:", error));
