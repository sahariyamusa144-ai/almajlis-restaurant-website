/* =========================
   ALMAJLIS ADMIN DASHBOARD
========================= */

const navItems =
    document.querySelectorAll(
        ".admin-nav-item"
    );

const sections =
    document.querySelectorAll(
        ".admin-section"
    );

const pageTitle =
    document.getElementById(
        "pageTitle"
    );


/* =========================
   NAVIGATION
========================= */

navItems.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const sectionId =
                button.dataset.section;


            navItems.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


            sections.forEach(section => {

                section.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            const target =
                document.getElementById(
                    sectionId
                );


            if (target) {

                target.classList.add(
                    "active"
                );

            }


            if (
                sectionId ===
                "ordersSection"
            ) {

                pageTitle.textContent =
                    "Orders";

                loadOrders();

            }


            else if (
                sectionId ===
                "menuSection"
            ) {

                pageTitle.textContent =
                    "Menu";

            }


            else {

                pageTitle.textContent =
                    "Dashboard";

            }

        }
    );

});


/* =========================
   LOAD ORDERS
========================= */

async function loadOrders() {

    const container =
        document.getElementById(
            "ordersContainer"
        );


    container.innerHTML = `
        <div class="orders-loading">
            Loading orders...
        </div>
    `;


    try {

        const response =
            await fetch(
                "/api/orders"
            );


        if (
            response.status === 401
        ) {

            window.location.href =
                "login.html";

            return;

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load orders."
            );

        }


        displayOrders(
            data.orders
        );


        updateStatistics(
            data.orders
        );


    } catch (error) {

        console.error(
            "Orders error:",
            error
        );


        container.innerHTML = `
            <div class="orders-empty">
                <span>!</span>
                <h3>
                    Could not load orders
                </h3>
                <p>
                    Please make sure the server
                    is running.
                </p>
            </div>
        `;

    }

}


/* =========================
   DISPLAY ORDERS
========================= */

function displayOrders(
    orders
) {

    const container =
        document.getElementById(
            "ordersContainer"
        );


    if (
        !orders ||
        orders.length === 0
    ) {

        container.innerHTML = `
            <div class="orders-empty">

                <span>◈</span>

                <h3>
                    No Orders Yet
                </h3>

                <p>
                    Customer orders will appear
                    here when they place an order.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML = "";


    orders.forEach(order => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "order-card";


        const orderDate =
            new Date(
                order.created_at
            );


        const formattedDate =
            orderDate.toLocaleString(
                "en-BD",
                {
                    dateStyle:
                        "medium",

                    timeStyle:
                        "short"
                }
            );


        let itemsHTML = "";


        order.items.forEach(
            item => {

                const itemTotal =
                    item.price *
                    item.quantity;


                itemsHTML += `
                    <div class="order-item">

                        <span>

                            ${escapeHTML(
                                item.name
                            )}

                            <small>
                                × ${item.quantity}
                            </small>

                        </span>

                        <strong>
                            ৳${itemTotal.toLocaleString()}
                        </strong>

                    </div>
                `;

            }
        );


        card.innerHTML = `

            <div class="order-card-header">

                <div>

                    <span class="order-number">
                        ORDER #${order.id}
                    </span>

                    <span class="order-date">
                        ${formattedDate}
                    </span>

                </div>


                <span
                    class="order-status ${getStatusClass(order.status)}"
                >
                    ${escapeHTML(order.status)}
                </span>

            </div>


            <div class="order-card-body">


                <div class="customer-details">

                    <h3>
                        ${escapeHTML(
                            order.customer_name
                        )}
                    </h3>


                    <p>
                        📞
                        ${escapeHTML(
                            order.phone
                        )}
                    </p>


                    <p>
                        📍
                        ${escapeHTML(
                            order.address
                        )}
                    </p>


                    ${
                        order.note
                        ? `
                        <p class="customer-note">
                            ✦
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
                        ORDER ITEMS
                    </h4>

                    ${itemsHTML}

                </div>


            </div>


            <div class="order-card-footer">


                <div class="order-total">

                    <span>
                        TOTAL
                    </span>

                    <strong>
                        ৳${Number(
                            order.total
                        ).toLocaleString()}
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
                                order.status ===
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
                                order.status ===
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
                                order.status ===
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
                                order.status ===
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


        container.appendChild(
            card
        );

    });


    setupStatusChanges();

}


/* =========================
   UPDATE STATUS
========================= */

function setupStatusChanges() {

    const selects =
        document.querySelectorAll(
            ".status-select"
        );


    selects.forEach(select => {

        select.addEventListener(
            "change",
            async function () {

                const orderId =
                    this.dataset.orderId;

                const status =
                    this.value;


                try {

                    const response =
                        await fetch(
                            `/api/orders/${orderId}/status`,
                            {
                                method:
                                    "PATCH",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        status:
                                            status
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !data.success
                    ) {

                        throw new Error(
                            data.message
                        );

                    }


                    loadOrders();


                } catch (error) {

                    console.error(
                        "Status update error:",
                        error
                    );


                    alert(
                        "Could not update order status."
                    );

                }

            }
        );

    });

}


/* =========================
   STATISTICS
========================= */

function updateStatistics(
    orders
) {

    const total =
        orders.length;


    const pending =
        orders.filter(
            order =>
                order.status ===
                "Pending"
        ).length;


    const completed =
        orders.filter(
            order =>
                order.status ===
                "Completed"
        ).length;


    const sales =
        orders
            .filter(
                order =>
                    order.status !==
                    "Cancelled"
            )
            .reduce(
                (
                    sum,
                    order
                ) =>
                    sum +
                    Number(
                        order.total
                    ),
                0
            );


    document.getElementById(
        "totalOrders"
    ).textContent =
        total;


    document.getElementById(
        "pendingOrders"
    ).textContent =
        pending;


    document.getElementById(
        "completedOrders"
    ).textContent =
        completed;


    document.getElementById(
        "totalSales"
    ).textContent =
        `৳${sales.toLocaleString()}`;


    document.getElementById(
        "orderBadge"
    ).textContent =
        pending;

}


/* =========================
   STATUS CLASS
========================= */

function getStatusClass(
    status
) {

    return status
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

}


/* =========================
   SECURITY
========================= */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


/* =========================
   REFRESH
========================= */

document
    .getElementById(
        "refreshOrders"
    )
    .addEventListener(
        "click",
        loadOrders
    );


/* =========================
   LOGOUT
========================= */

document
    .getElementById(
        "logoutButton"
    )
    .addEventListener(
        "click",
        async () => {

            try {

                await fetch(
                    "/api/logout",
                    {
                        method:
                            "POST"
                    }
                );

            } catch (error) {

                console.error(
                    error
                );

            }


            window.location.href =
                "login.html";

        }
    );


/* =========================
   INITIAL LOAD
========================= */

loadOrders();