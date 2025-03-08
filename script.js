let db;
let request = indexedDB.open("computerDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore("computers", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    if (document.title.includes("Inventory")) loadComputers();
    if (document.title.includes("Edit")) loadEditData();
    if (document.title.includes("View")) loadViewData();
};

function getIDfromURL() {
    let params = new URLSearchParams(window.location.search);
    return Number(params.get("id"));
}

// ✅ **Edit Page: ID অনুযায়ী ডাটা লোড এবং Update ফর্ম**
function loadEditData() {
    let id = getIDfromURL();
    let tx = db.transaction("computers", "readonly").objectStore("computers").get(id);
    tx.onsuccess = function (event) {
        let data = event.target.result;
        if (data) {
            $("#edit_id").val(data.id);
            $("#edit_author").val(data.author);
            $("#edit_brand").val(data.brand);
            $("#edit_name").val(data.name);
            $("#edit_last_service").val(data.last_service);
            $("#edit_description").val(data.description);
        }
    };
}

// ✅ **Edit Page: Update Data**
$("#editForm").submit(function (event) {
    event.preventDefault();
    let id = Number($("#edit_id").val());
    let updatedData = {
        id: id,
        author: $("#edit_author").val(),
        brand: $("#edit_brand").val(),
        name: $("#edit_name").val(),
        last_service: $("#edit_last_service").val(),
        description: $("#edit_description").val()
    };
    let tx = db.transaction("computers", "readwrite").objectStore("computers").put(updatedData);
    tx.onsuccess = () => location.href = "index.html";
});

// ✅ **View Page: ID অনুযায়ী ডাটা লোড**
function loadViewData() {
    let id = getIDfromURL();
    let tx = db.transaction("computers", "readonly").objectStore("computers").get(id);
    tx.onsuccess = function (event) {
        let data = event.target.result;
        if (data) {
            $("#viewDetails").html(`
            <h4>${data.name} (${data.brand})</h4>
            <p><strong>Author:</strong> ${data.author}</p>
            <p><strong>Brand:</strong> ${data.brand}</p>
            <p><strong>Computer Name:</strong> ${data.name}</p>
            <p><strong>Last Service Date:</strong> ${data.last_service}</p>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Entry ID:</strong> ${data.id}</p>
            `);
        } else {
            $("#viewDetails").html(`<p class="text-danger">No data found!</p>`);
        }
    };
}

// ✅ **List Page: ডাটা লোড এবং Delete**
function loadComputers() {
    let tx = db.transaction("computers", "readonly").objectStore("computers").getAll();
    tx.onsuccess = (e) => {
        let rows = e.target.result.map(c => `
            <tr>
                <td>${c.author}</td>
                <td>${c.brand}</td>
                <td>${c.name}</td>
                <td>${c.last_service}</td>
                <td>
                    <a href="view.html?id=${c.id}" class="btn btn-info btn-sm">View</a>
                    <a href="edit.html?id=${c.id}" class="btn btn-warning btn-sm">Edit</a>
                    <button class="btn btn-danger btn-sm" onclick="deleteComputer(${c.id})">Delete</button>
                </td>
            </tr>`).join("");
        $("#computerList").html(rows);
    };
}

// ✅ **Delete Function**
function deleteComputer(id) {
    let tx = db.transaction("computers", "readwrite").objectStore("computers").delete(id);
    tx.onsuccess = () => loadComputers();
}

// ✅ **New Data Save**
$("#computerForm").submit(function (event) {
    event.preventDefault();
    let tx = db.transaction("computers", "readwrite").objectStore("computers");
    tx.add({
        author: $("#author").val(),
        brand: $("#brand").val(),
        name: $("#name").val(),
        last_service: $("#last_service").val(),
        description: $("#description").val()
    }).onsuccess = () => location.href = "index.html";
});
