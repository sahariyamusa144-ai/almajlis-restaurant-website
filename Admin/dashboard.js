// ======================================================
// ALMAJLIS ADMIN DASHBOARD
// Dashboard + Orders + Menu Management
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================================
    // ELEMENTS
    // ======================================================

    const navItems =
        document.querySelectorAll(".admin-nav-item");

    const sections =
        document.querySelectorAll(".admin-section");

    const pageTitle =
        document.getElementById("pageTitle");

    const logoutButton =
        document.getElementById("logoutButton");

    const refreshOrdersButton =
        document.getElementById("refreshOrders");

    const ordersContainer =
        document.getElementById("ordersContainer");

    const orderBadge =
        document.getElementById("orderBadge");

    const totalOrders =
        document.getElementById("totalOrders");

    const pendingOrders =
        document.getElementById("pendingOrders");

    const completedOrders =
        document.getElementById("completedOrders");

    const totalSales =
        document.getElementById("totalSales");


    // ======================================================
    // MENU ELEMENTS
    // ======================================================

    const addMenuBtn =
        document.getElementById("addMenuBtn");

    const menuFormCard =
        document.getElementById("menuFormCard");

    const menuForm =
        document.getElementById("menuForm");

    const menuFormTitle =
        document.getElementById("menuFormTitle");

    const menuId =
        document.getElementById("menuId");

    const menuName =
        document.getElementById("menuName");

    const menuPrice =
        document.getElementById("menuPrice");

    const menuCategory =
        document.getElementById("menuCategory");

    const menuDescription =
        document.getElementById("menuDescription");

    const menuImage =
        document.getElementById("menuImage");

    const imagePreviewWrapper =
        document.getElementById(
            "imagePreviewWrapper"
        );

    const menuImagePreview =
        document.getElementById(
            "menuImagePreview"
        );

    const removeImageBtn =
        document.getElementById(
            "removeImageBtn"
        );

    const cancelMenuBtn =
        document.getElementById(
            "cancelMenuBtn"
        );

    const closeMenuFormBtn =
        document.getElementById(
            "closeMenuFormBtn"
        );

    const saveMenuBtn =
        document.getElementById(
            "saveMenuBtn"
        );

    const adminMenuList =
        document.getElementById(
            "adminMenuList"
        );

    const menuCount =
        document.getElementById(
            "menuCount"
        );


    // ======================================================
    // NAVIGATION
    // ======================================================

    navItems.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    button.dataset.section;

                // Remove active from all
                navItems.forEach(item => {
                    item.classList.remove("active");
                });

                sections.forEach(section => {
                    section.classList.remove("active");
                });

                // Activate clicked button
                button.classList.add("active");

                const targetSection =
                    document.getElementById(target);

                if (targetSection) {
                    targetSection.classList.add("active");
                }

                // Change title
                if (pageTitle) {

                    if (
                        target === "dashboardSection"
                    ) {
                        pageTitle.textContent =
                            "Dashboard";
                    }

                    else if (
                        target === "ordersSection"
                    ) {
                        pageTitle.textContent =
                            "Orders";
                    }

                    else if (
                        target === "menuSection"
                    ) {
                        pageTitle.textContent =
                            "Menu";
                    }

                }

                // Load correct section
                if (
                    target === "ordersSection"
                ) {
                    loadOrders();
                }

                if (
                    target === "menuSection"
                ) {
                    loadMenu();
                }

            }
        );

    });


    // ======================================================
    // LOGOUT
    // ======================================================

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                try {

                    await fetch(
                        "/api/logout",
                        {
                            method: "POST",
                            credentials: "include"
                        }
                    );

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                }

                window.location.href =
                    "/admin/login.html";

            }
        );

    }


    // ======================================================
    // LOAD ORDERS
    // ======================================================

    async function loadOrders() {

        if (!ordersContainer) {
            return;
        }

        ordersContainer.innerHTML = `
            <div class="orders-loading">
                Loading orders...
            </div>
        `;

        try {

            const response =
                await fetch(
                    "/api/orders",
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );

            if (response.status === 401) {

                window.location.href =
                    "/admin/login.html";

                return;

            }

            if (!response.ok) {

                throw new Error(
                    "Could not load orders."
                );

            }

            const orders =
                await response.json();

            console.log(
                "Orders:",
                orders
            );

            displayOrders(orders);

            updateStatistics(orders);

        } catch (error) {

            console.error(
                "ORDER LOAD ERROR:",
                error
            );

            ordersContainer.innerHTML = `
                <div class="orders-empty">
                    <h3>Could not load orders</h3>
                    <p>
                        Please refresh the page
                        and try again.
                    </p>
                </div>
            `;

        }

    }


    // ======================================================
    // DISPLAY ORDERS
    // ======================================================

    function displayOrders(orders) {

        if (!Array.isArray(orders)) {
            orders = [];
        }

        if (orders.length === 0) {

            ordersContainer.innerHTML = `
                <div class="orders-empty">
                    <h3>No Orders Yet</h3>
                    <p>
                        Customer orders will appear here.
                    </p>
                </div>
            `;

            if (orderBadge) {
                orderBadge.textContent = "0";
                orderBadge.style.display = "none";
            }

            return;
        }

        const pendingCount =
            orders.filter(order =>
                String(order.status || "")
                    .toLowerCase() === "pending"
            ).length;

        if (orderBadge) {

            orderBadge.textContent =
                pendingCount;

            orderBadge.style.display =
                pendingCount > 0
                    ? "inline-flex"
                    : "none";

        }


        ordersContainer.innerHTML = "";


        orders.forEach(order => {

            let items = [];

            if (Array.isArray(order.items)) {
                items = order.items;
            }

            else if (
                typeof order.items === "string"
            ) {

                try {

                    items =
                        JSON.parse(
                            order.items
                        );

                } catch {

                    items = [];

                }

            }


            const status =
                order.status ||
                "Pending";

            const total =
                Number(order.total) || 0;


            const card =
                document.createElement("div");

            card.className =
                "order-card";


            const itemsHTML =
                items.map(item => {

                    const name =
                        escapeHTML(
                            item.name ||
                            item.title ||
                            "Food"
                        );

                    const quantity =
                        Number(
                            item.quantity ||
                            item.qty ||
                            1
                        );

                    const price =
                        Number(item.price) || 0;


                    return `
                        <div class="order-item">

                            <div>
                                <strong>
                                    ${name}
                                </strong>

                                <span>
                                    × ${quantity}
                                </span>
                            </div>

                            <strong>
                                ৳${(
                                    price *
                                    quantity
                                ).toFixed(2)}
                            </strong>

                        </div>
                    `;

                }).join("");


            card.innerHTML = `

                <div class="order-card-header">

                    <div>

                        <div class="order-number">
                            Order #${order.id}
                        </div>

                        <div class="order-date">
                            ${formatDate(
                                order.created_at
                            )}
                        </div>

                    </div>

                    <div class="
                        order-status
                        ${getStatusClass(status)}
                    ">
                        ${escapeHTML(status)}
                    </div>

                </div>


                <div class="order-card-body">

                    <div class="customer-details">

                        <h4>
                            Customer Details
                        </h4>

                        <p>
                            <strong>Name:</strong>
                            ${escapeHTML(
                                order.customer_name ||
                                ""
                            )}
                        </p>

                        <p>
                            <strong>Phone:</strong>
                            ${escapeHTML(
                                order.phone ||
                                ""
                            )}
                        </p>

                        <p>
                            <strong>Address:</strong>
                            ${escapeHTML(
                                order.address ||
                                ""
                            )}
                        </p>

                        ${
                            order.note
                            ? `
                                <p>
                                    <strong>Note:</strong>
                                    ${escapeHTML(
                                        order.note
                                    )}
                                </p>
                            `
                            : ""
                        }

                    </div>


                    <div class="order-items">

                        <h4>
                            Order Items
                        </h4>

                        ${
                            itemsHTML ||
                            `
                                <div class="order-item">
                                    No items found
                                </div>
                            `
                        }

                    </div>

                </div>


                <div class="order-card-footer">

                    <div class="order-total">

                        Total:
                        <strong>
                            ৳${total.toFixed(2)}
                        </strong>

                    </div>


                    <div class="order-actions">

                        <select
                            class="status-select"
                            data-order-id="${order.id}"
                        >

                            <option
                                value="Pending"
                                ${
                                    status ===
                                    "Pending"
                                    ? "selected"
                                    : ""
                                }
                            >
                                Pending
                            </option>

                            <option
                                value="Preparing"
                                ${
                                    status ===
                                    "Preparing"
                                    ? "selected"
                                    : ""
                                }
                            >
                                Preparing
                            </option>

                            <option
                                value="Completed"
                                ${
                                    status ===
                                    "Completed"
                                    ? "selected"
                                    : ""
                                }
                            >
                                Completed
                            </option>

                            <option
                                value="Cancelled"
                                ${
                                    status ===
                                    "Cancelled"
                                    ? "selected"
                                    : ""
                                }
                            >
                                Cancelled
                            </option>

                        </select>

                    </div>

                </div>

            `;


            ordersContainer.appendChild(card);

        });


        setupStatusChanges();

    }


    // ======================================================
    // UPDATE ORDER STATUS
    // ======================================================

    function setupStatusChanges() {

        const selects =
            document.querySelectorAll(
                ".status-select"
            );


        selects.forEach(select => {

            select.addEventListener(
                "change",
                async () => {

                    const orderId =
                        select.dataset.orderId;

                    const status =
                        select.value;

                    select.disabled = true;


                    try {

                        const response =
                            await fetch(
                                `/api/orders/${orderId}/status`,
                                {
                                    method: "PATCH",

                                    credentials:
                                        "include",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            status
                                        })

                                }
                            );


                        if (
                            response.status ===
                            401
                        ) {

                            window.location.href =
                                "/admin/login.html";

                            return;

                        }


                        const data =
                            await response.json();


                        if (
                            !response.ok ||
                            !data.success
                        ) {

                            throw new Error(
                                data.message ||
                                "Status update failed."
                            );

                        }


                        await loadOrders();


                    } catch (error) {

                        console.error(
                            "STATUS ERROR:",
                            error
                        );

                        alert(
                            "Could not update order status."
                        );

                        await loadOrders();

                    }

                }
            );

        });

    }


    // ======================================================
    // REFRESH ORDERS
    // ======================================================

    if (refreshOrdersButton) {

        refreshOrdersButton.addEventListener(
            "click",
            loadOrders
        );

    }


    // ======================================================
    // DASHBOARD STATISTICS
    // ======================================================

    function updateStatistics(orders) {

        const total =
            orders.length;

        const pending =
            orders.filter(order =>
                String(order.status || "")
                    .toLowerCase() ===
                "pending"
            ).length;

        const completed =
            orders.filter(order =>
                String(order.status || "")
                    .toLowerCase() ===
                "completed"
            ).length;

        const sales =
            orders
                .filter(order =>
                    String(order.status || "")
                        .toLowerCase() !==
                    "cancelled"
                )
                .reduce(
                    (sum, order) =>
                        sum +
                        (
                            Number(order.total) ||
                            0
                        ),
                    0
                );


        if (totalOrders) {
            totalOrders.textContent =
                total;
        }

        if (pendingOrders) {
            pendingOrders.textContent =
                pending;
        }

        if (completedOrders) {
            completedOrders.textContent =
                completed;
        }

        if (totalSales) {
            totalSales.textContent =
                `৳${sales.toFixed(0)}`;
        }

    }


    // ======================================================
    // MENU - OPEN ADD FORM
    // ======================================================

    if (addMenuBtn) {

        addMenuBtn.addEventListener(
            "click",
            () => {

                resetMenuForm();

                if (menuFormTitle) {
                    menuFormTitle.textContent =
                        "Add New Menu";
                }

                if (menuFormCard) {
                    menuFormCard.style.display =
                        "block";
                }

                menuFormCard?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    }


    // ======================================================
    // MENU - CLOSE FORM
    // ======================================================

    function closeMenuForm() {

        if (menuFormCard) {
            menuFormCard.style.display =
                "none";
        }

        resetMenuForm();

    }


    if (cancelMenuBtn) {

        cancelMenuBtn.addEventListener(
            "click",
            closeMenuForm
        );

    }


    if (closeMenuFormBtn) {

        closeMenuFormBtn.addEventListener(
            "click",
            closeMenuForm
        );

    }


    // ======================================================
    // RESET MENU FORM
    // ======================================================

    function resetMenuForm() {

        if (menuForm) {
            menuForm.reset();
        }

        if (menuId) {
            menuId.value = "";
        }

        if (menuFormTitle) {
            menuFormTitle.textContent =
                "Add New Menu";
        }

        if (imagePreviewWrapper) {
            imagePreviewWrapper.style.display =
                "none";
        }

        if (menuImagePreview) {
            menuImagePreview.src = "";
        }

        if (menuImage) {
            menuImage.value = "";
        }

    }


    // ======================================================
    // MENU IMAGE PREVIEW
    // ======================================================

    if (menuImage) {

        menuImage.addEventListener(
            "change",
            () => {

                const file =
                    menuImage.files &&
                    menuImage.files[0];

                if (!file) {
                    return;
                }

                const reader =
                    new FileReader();


                reader.onload =
                    event => {

                        if (menuImagePreview) {

                            menuImagePreview.src =
                                event.target.result;

                        }

                        if (imagePreviewWrapper) {

                            imagePreviewWrapper.style.display =
                                "block";

                        }

                    };


                reader.readAsDataURL(file);

            }
        );

    }


    // ======================================================
    // REMOVE IMAGE
    // ======================================================

    if (removeImageBtn) {

        removeImageBtn.addEventListener(
            "click",
            () => {

                if (menuImage) {
                    menuImage.value = "";
                }

                if (menuImagePreview) {
                    menuImagePreview.src = "";
                }

                if (imagePreviewWrapper) {
                    imagePreviewWrapper.style.display =
                        "none";
                }

            }
        );

    }


    // ======================================================
    // SAVE / UPDATE MENU
    // ======================================================

    if (menuForm) {

        menuForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const id =
                    menuId
                        ? menuId.value.trim()
                        : "";


                const formData =
                    new FormData();


                formData.append(
                    "name",
                    menuName.value.trim()
                );

                formData.append(
                    "price",
                    menuPrice.value
                );

                formData.append(
                    "category",
                    menuCategory.value
                );

                formData.append(
                    "description",
                    menuDescription.value.trim()
                );


                if (
                    menuImage &&
                    menuImage.files &&
                    menuImage.files[0]
                ) {

                    formData.append(
                        "image",
                        menuImage.files[0]
                    );

                }


                const url =
                    id
                        ? `/api/menu/${id}`
                        : "/api/menu";


                const method =
                    id
                        ? "PUT"
                        : "POST";


                if (saveMenuBtn) {

                    saveMenuBtn.disabled =
                        true;

                    saveMenuBtn.textContent =
                        id
                            ? "Updating..."
                            : "Saving...";

                }


                try {

                    const response =
                        await fetch(
                            url,
                            {
                                method,
                                credentials:
                                    "include",
                                body:
                                    formData
                            }
                        );


                    if (
                        response.status ===
                        401
                    ) {

                        window.location.href =
                            "/admin/login.html";

                        return;

                    }


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Could not save menu."
                        );

                    }


                    alert(
                        id
                            ? "Menu updated successfully."
                            : "Menu added successfully."
                    );


                    closeMenuForm();

                    await loadMenu();


                } catch (error) {

                    console.error(
                        "MENU SAVE ERROR:",
                        error
                    );

                    alert(
                        error.message ||
                        "Could not save menu."
                    );

                } finally {

                    if (saveMenuBtn) {

                        saveMenuBtn.disabled =
                            false;

                        saveMenuBtn.textContent =
                            "Save Menu";

                    }

                }

            }
        );

    }


    // ======================================================
    // LOAD MENU
    // ======================================================

    async function loadMenu() {

        if (!adminMenuList) {
            return;
        }


        adminMenuList.innerHTML = `
            <div class="menu-loading">
                Loading menu...
            </div>
        `;


        try {

            const response =
                await fetch(
                    "/api/menu",
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Could not load menu."
                );

            }


            const menu =
                await response.json();


            console.log(
                "Menu:",
                menu
            );


            renderMenu(menu);


        } catch (error) {

            console.error(
                "MENU LOAD ERROR:",
                error
            );


            adminMenuList.innerHTML = `
                <div class="menu-loading">
                    Could not load menu.
                </div>
            `;

        }

    }


    // ======================================================
    // RENDER MENU
    // ======================================================

    function renderMenu(menu) {

        if (!Array.isArray(menu)) {
            menu = [];
        }


        if (menuCount) {

            menuCount.textContent =
                `${menu.length} ${
                    menu.length === 1
                        ? "item"
                        : "items"
                }`;

        }


        if (menu.length === 0) {

            adminMenuList.innerHTML = `
                <div class="menu-loading">
                    <h3>No Menu Items</h3>
                    <p>
                        Click "+ Add Menu"
                        to add your first dish.
                    </p>
                </div>
            `;

            return;

        }


        adminMenuList.innerHTML = "";


        menu.forEach(item => {

            const card =
                document.createElement("div");

            card.className =
                "admin-menu-card";


            let imageHTML = "";


            if (item.image) {

                imageHTML = `
                    <img
                        src="${escapeHTML(
                            getImageURL(
                                item.image
                            )
                        )}"
                        alt="${escapeHTML(
                            item.name
                        )}"
                    >
                `;

            }

            else {

                imageHTML = `
                    <div class="
                        admin-menu-image-placeholder
                    ">
                        No Image
                    </div>
                `;

            }


            card.innerHTML = `

                <div class="admin-menu-image">

                    ${imageHTML}

                </div>


                <div class="admin-menu-info">

                    <span class="
                        admin-menu-category
                    ">
                        ${escapeHTML(
                            item.category ||
                            "Other"
                        )}
                    </span>


                    <h3 class="
                        admin-menu-name
                    ">
                        ${escapeHTML(
                            item.name
                        )}
                    </h3>


                    <div class="
                        admin-menu-price
                    ">
                        ৳${(
                            Number(item.price) ||
                            0
                        ).toFixed(0)}
                    </div>


                    <p class="
                        admin-menu-description
                    ">
                        ${escapeHTML(
                            item.description ||
                            ""
                        )}
                    </p>


                    <div class="
                        admin-menu-actions
                    ">

                        <button
                            type="button"
                            class="menu-edit-btn"
                            data-id="${item.id}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="menu-delete-btn"
                            data-id="${item.id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `;


            adminMenuList.appendChild(card);

        });


        setupMenuButtons();

    }


    // ======================================================
    // MENU EDIT / DELETE BUTTONS
    // ======================================================

    function setupMenuButtons() {

        const editButtons =
            document.querySelectorAll(
                ".menu-edit-btn"
            );

        const deleteButtons =
            document.querySelectorAll(
                ".menu-delete-btn"
            );


        // EDIT
        editButtons.forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;


                    try {

                        const response =
                            await fetch(
                                "/api/menu",
                                {
                                    credentials:
                                        "include"
                                }
                            );


                        const menu =
                            await response.json();


                        const item =
                            menu.find(
                                menuItem =>
                                    String(
                                        menuItem.id
                                    ) ===
                                    String(id)
                            );


                        if (!item) {

                            alert(
                                "Menu item not found."
                            );

                            return;

                        }


                        openEditMenu(item);


                    } catch (error) {

                        console.error(
                            "EDIT ERROR:",
                            error
                        );

                        alert(
                            "Could not open menu item."
                        );

                    }

                }
            );

        });


        // DELETE
        deleteButtons.forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.id;


                    const confirmed =
                        confirm(
                            "Are you sure you want to delete this menu item?"
                        );


                    if (!confirmed) {
                        return;
                    }


                    button.disabled =
                        true;

                    button.textContent =
                        "Deleting...";


                    try {

                        const response =
                            await fetch(
                                `/api/menu/${id}`,
                                {
                                    method:
                                        "DELETE",

                                    credentials:
                                        "include"
                                }
                            );


                        if (
                            response.status ===
                            401
                        ) {

                            window.location.href =
                                "/admin/login.html";

                            return;

                        }


                        const data =
                            await response.json();


                        if (
                            !response.ok ||
                            !data.success
                        ) {

                            throw new Error(
                                data.message ||
                                "Delete failed."
                            );

                        }


                        await loadMenu();


                    } catch (error) {

                        console.error(
                            "DELETE ERROR:",
                            error
                        );

                        alert(
                            error.message ||
                            "Could not delete menu."
                        );


                        button.disabled =
                            false;

                        button.textContent =
                            "Delete";

                    }

                }
            );

        });

    }


    // ======================================================
    // OPEN EDIT MENU
    // ======================================================

    function openEditMenu(item) {

        if (menuFormCard) {
            menuFormCard.style.display =
                "block";
        }


        if (menuFormTitle) {
            menuFormTitle.textContent =
                "Edit Menu";
        }


        if (menuId) {
            menuId.value =
                item.id || "";
        }


        if (menuName) {
            menuName.value =
                item.name || "";
        }


        if (menuPrice) {
            menuPrice.value =
                item.price || "";
        }


        if (menuCategory) {
            menuCategory.value =
                item.category || "";
        }


        if (menuDescription) {
            menuDescription.value =
                item.description || "";
        }


        if (item.image) {

            if (menuImagePreview) {

                menuImagePreview.src =
                    getImageURL(
                        item.image
                    );

            }


            if (imagePreviewWrapper) {

                imagePreviewWrapper.style.display =
                    "block";

            }

        }


        menuFormCard?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    // ======================================================
    // IMAGE URL
    // ======================================================

    function getImageURL(image) {

        if (!image) {
            return "";
        }


        const value =
            String(image).trim();


        if (
            value.startsWith("http://") ||
            value.startsWith("https://")
        ) {

            return value;

        }


        if (
            value.startsWith("/uploads/")
        ) {

            return value;

        }


        if (
            value.startsWith("uploads/")
        ) {

            return "/" + value;

        }


        if (
            value.startsWith("/images/")
        ) {

            return value;

        }


        if (
            value.startsWith("images/")
        ) {

            return "/" + value;

        }


        return "/" +
            value.replace(
                /^\/+/,
                ""
            );

    }


    // ======================================================
    // HTML ESCAPE
    // ======================================================

    function escapeHTML(value) {

        return String(
            value ?? ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }


    // ======================================================
    // STATUS CLASS
    // ======================================================

    function getStatusClass(status) {

        switch (
            String(status || "")
                .toLowerCase()
        ) {

            case "pending":
                return "status-pending";

            case "preparing":
                return "status-preparing";

            case "completed":
                return "status-completed";

            case "cancelled":
                return "status-cancelled";

            default:
                return "status-pending";

        }

    }


    // ======================================================
    // DATE FORMAT
    // ======================================================

    function formatDate(value) {

        if (!value) {
            return "";
        }


        const date =
            new Date(
                String(value)
                    .replace(
                        " ",
                        "T"
                    )
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return escapeHTML(
                value
            );

        }


        return date.toLocaleString(
            "en-BD",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );

    }


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    loadOrders();

    loadMenu();

});