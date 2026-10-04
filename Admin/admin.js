const API_URL = "/api/menu";

const menuForm =
    document.getElementById("menuForm");

const message =
    document.getElementById("message");

const menuList =
    document.getElementById("menuList");


// =====================================
// SAVE MENU ITEM
// =====================================

if (menuForm) {

    menuForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById("name").value.trim();

            const price =
                document.getElementById("price").value.trim();

            const category =
                document.getElementById("category").value;

            const description =
                document.getElementById("description").value.trim();

            const image =
                document.getElementById("image").value.trim();


            if (
                !name ||
                !price ||
                !category ||
                !description ||
                !image
            ) {

                showMessage(
                    "Please fill in all fields.",
                    "error"
                );

                return;
            }


            const menuItem = {

                name: name,

                price: Number(price),

                category: category,

                description: description,

                image: image

            };


            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials: "include",

                            body:
                                JSON.stringify(menuItem)
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to save menu item."
                    );

                }


                showMessage(
                    "Menu item saved successfully! ✅",
                    "success"
                );


                menuForm.reset();


                loadMenu();


            } catch (error) {

                console.error(error);

                showMessage(
                    "Could not save menu item. Make sure the server is running.",
                    "error"
                );

            }

        }
    );

}


// =====================================
// LOAD MENU
// =====================================

async function loadMenu() {

    if (!menuList) {
        return;
    }


    try {

        const response =
            await fetch(
                API_URL,
                {
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            menuList.innerHTML =
                "<p>Could not load menu.</p>";

            return;
        }


        if (
            !data.menu ||
            data.menu.length === 0
        ) {

            menuList.innerHTML =
                "<p>No menu items yet.</p>";

            return;
        }


        menuList.innerHTML = "";


        data.menu.forEach(function (item) {

            const div =
                document.createElement("div");

            div.className =
                "menu-item";


            div.innerHTML = `

                <img
                    src="${item.image}"
                    alt="${item.name}"
                    onerror="this.style.display='none'"
                >

                <div class="menu-info">

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        ${item.description}
                    </p>

                    <p>
                        Category:
                        ${item.category}
                    </p>

                    <div class="menu-price">
                        ৳${item.price}
                    </div>

                </div>

            `;


            menuList.appendChild(div);

        });


    } catch (error) {

        console.error(error);

        menuList.innerHTML =
            "<p>Server connection failed.</p>";

    }

}


// =====================================
// MESSAGE
// =====================================

function showMessage(text, type) {

    if (!message) {

        alert(text);

        return;
    }


    message.textContent =
        text;


    if (type === "success") {

        message.style.color =
            "green";

    } else {

        message.style.color =
            "red";

    }

}


// =====================================
// LOGOUT
// =====================================

function logout() {

    window.location.href =
        "login.html";

}


// =====================================
// LOAD MENU WHEN DASHBOARD OPENS
// =====================================

loadMenu();