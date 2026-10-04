/* =========================================================
   ALMAJLIS RESTAURANT WEBSITE
   COMPLETE SCRIPT
========================================================= */


/* =========================================================
   GLOBAL CART
========================================================= */

let orderCart = JSON.parse(
    localStorage.getItem("almajlisCart")
) || [];


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       BASIC ELEMENTS
    ===================================================== */

    const preloader =
        document.querySelector(".preloader");

    const header =
        document.querySelector(".header");

    const menuToggle =
        document.querySelector(".menu-toggle");

    const mobileMenu =
        document.querySelector(".mobile-menu");

    const mobileClose =
        document.querySelector(".mobile-close");


    /* =====================================================
       PRELOADER
    ===================================================== */

    window.addEventListener("load", () => {

        setTimeout(() => {

            if (preloader) {
                preloader.classList.add("hide");
            }

        }, 700);

    });


    /* =====================================================
       HEADER SCROLL
    ===================================================== */

    function updateHeader() {

        if (!header) return;

        if (window.scrollY > 50) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    }

    window.addEventListener(
        "scroll",
        updateHeader
    );

    updateHeader();


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    function openMobileMenu() {

        if (!mobileMenu) return;

        mobileMenu.classList.add("active");

        document.body.classList.add(
            "menu-open"
        );

    }


    function closeMobileMenu() {

        if (!mobileMenu) return;

        mobileMenu.classList.remove("active");

        document.body.classList.remove(
            "menu-open"
        );

    }


    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            openMobileMenu
        );

    }


    if (mobileClose) {

        mobileClose.addEventListener(
            "click",
            closeMobileMenu
        );

    }


    document
        .querySelectorAll(".mobile-menu a")
        .forEach(link => {

            link.addEventListener(
                "click",
                closeMobileMenu
            );

        });


    /* =====================================================
       MODAL
    ===================================================== */

    const modal =
        document.querySelector(".modal");

    const modalClose =
        document.querySelector(".modal-close");

    const modalOk =
        document.querySelector(".modal-ok");


    function openModal() {

        if (!modal) return;

        modal.classList.add("active");

        document.body.classList.add(
            "modal-open"
        );

    }


    function closeModal() {

        if (!modal) return;

        modal.classList.remove("active");

        document.body.classList.remove(
            "modal-open"
        );

    }


    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeModal
        );

    }


    if (modalOk) {

        modalOk.addEventListener(
            "click",
            closeModal
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    closeModal();

                }

            }
        );

    }


    /* =====================================================
       GALLERY LIGHTBOX
    ===================================================== */

    const galleryItems =
        document.querySelectorAll(
            ".gallery-item"
        );


    let lightbox = null;


    function createLightbox() {

        if (lightbox) return;


        lightbox =
            document.createElement("div");

        lightbox.className =
            "custom-lightbox";


        lightbox.innerHTML = `
            <button
                class="lightbox-close"
                aria-label="Close image">

                <i class="fa-solid fa-xmark"></i>

            </button>

            <img
                class="lightbox-image"
                src=""
                alt="Gallery image">
        `;


        document.body.appendChild(
            lightbox
        );


        lightbox.addEventListener(
            "click",
            event => {

                if (
                    event.target === lightbox ||
                    event.target.closest(
                        ".lightbox-close"
                    )
                ) {

                    closeLightbox();

                }

            }
        );

    }


    function openLightbox(
        imageSrc,
        altText
    ) {

        createLightbox();


        const image =
            lightbox.querySelector(
                ".lightbox-image"
            );


        image.src = imageSrc;

        image.alt =
            altText || "Gallery image";


        lightbox.classList.add(
            "active"
        );

        document.body.classList.add(
            "lightbox-open"
        );

    }


    function closeLightbox() {

        if (!lightbox) return;

        lightbox.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "lightbox-open"
        );

    }


    galleryItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const image =
                    item.querySelector("img");

                if (!image) return;

                openLightbox(
                    image.src,
                    image.alt
                );

            }
        );

    });


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeMobileMenu();

                closeModal();

                closeLightbox();

                closeCart();

                closeOrderForm();

            }

        }
    );


    /* =====================================================
       SMOOTH SCROLL
    ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute("href");


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) return;


                    event.preventDefault();


                    const headerHeight =
                        header
                            ? header.offsetHeight
                            : 0;


                    const position =
                        target
                            .getBoundingClientRect()
                            .top +
                        window.scrollY -
                        headerHeight;


                    window.scrollTo({

                        top: position,

                        behavior: "smooth"

                    });

                }
            );

        });


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const sections =
        document.querySelectorAll(
            "section[id]"
        );


    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );


    function updateActiveNavigation() {

        let currentSection = "";


        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 180;


            const sectionBottom =
                sectionTop +
                section.offsetHeight;


            if (
                window.scrollY >= sectionTop &&
                window.scrollY < sectionBottom
            ) {

                currentSection =
                    section.id;

            }

        });


        navLinks.forEach(link => {

            link.classList.remove(
                "active"
            );


            if (
                link.getAttribute("href") ===
                "#" + currentSection
            ) {

                link.classList.add(
                    "active"
                );

            }

        });

    }


    window.addEventListener(
        "scroll",
        updateActiveNavigation
    );


    updateActiveNavigation();


    /* =====================================================
       MENU SYSTEM
    ===================================================== */

    const menuGrid =
        document.querySelector(
            ".menu-grid"
        );


    const menuTabs =
        document.querySelectorAll(
            ".menu-tab"
        );


    let currentCategory = "all";


    function normalizeCategory(
        category
    ) {

        return String(
            category || ""
        )
            .trim()
            .toLowerCase();

    }


    function getWebsiteCategory(
        category
    ) {

        const value =
            normalizeCategory(category);


        if (
            value === "mandi" ||
            value === "mandi rice"
        ) {

            return "mandi";

        }


        if (
            value === "grill" ||
            value === "grills" ||
            value === "bbq"
        ) {

            return "grill";

        }


        if (
            value === "rice" ||
            value === "rice dishes"
        ) {

            return "rice";

        }


        if (
            value === "dessert" ||
            value === "desserts" ||
            value === "sweet"
        ) {

            return "dessert";

        }


        return value;

    }


    function escapeHtml(value) {

        return String(value ?? "")
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


    function createDatabaseMenuCard(
        item
    ) {

        const article =
            document.createElement(
                "article"
            );


        article.className =
            "menu-card database-menu-card";


        article.dataset.category =
            getWebsiteCategory(
                item.category
            );


        const name =
            item.name ||
            "Menu Item";


        const price =
            Number(item.price);


        const formattedPrice =
            Number.isFinite(price)
                ? price.toLocaleString("en-BD")
                : String(item.price || "0");


        const description =
            item.description ||
            "A delicious Almajlis specialty.";


        const image =
            item.image ||
            "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=90";


        article.innerHTML = `

            <div class="menu-image">

                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(name)}"
                    loading="lazy">

                <span class="menu-tag">
                    ALMAJLIS SPECIAL
                </span>

            </div>

            <div class="menu-card-content">

                <div class="menu-title-row">

                    <h3>
                        ${escapeHtml(name)}
                    </h3>

                    <strong class="price">
                        ৳ ${escapeHtml(formattedPrice)}
                    </strong>

                </div>

                <p>
                    ${escapeHtml(description)}
                </p>

                <button
                    class="menu-button"
                    type="button">

                    <i class="fa-solid fa-plus"></i>

                    Add to Order

                </button>

            </div>
        `;


        return article;

    }


    function applyCurrentMenuFilter() {

        const cards =
            document.querySelectorAll(
                ".menu-card"
            );


        cards.forEach(card => {

            const category =
                normalizeCategory(
                    card.dataset.category
                );


            if (
                currentCategory === "all" ||
                category === currentCategory
            ) {

                card.style.display = "";

                setTimeout(() => {

                    card.classList.add(
                        "show"
                    );

                }, 20);

            } else {

                card.style.display =
                    "none";

                card.classList.remove(
                    "show"
                );

            }

        });

    }


    menuTabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                menuTabs.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                tab.classList.add(
                    "active"
                );


                currentCategory =
                    normalizeCategory(
                        tab.dataset.category
                    );


                applyCurrentMenuFilter();

            }
        );

    });


    /* =====================================================
       LOAD DATABASE MENU
    ===================================================== */

    async function loadDatabaseMenu() {

        if (!menuGrid) return;


        try {

            const response =
                await fetch(
                    "/api/menu"
                );


            if (!response.ok) {

                throw new Error(
                    "Menu API request failed."
                );

            }


            const data =
                await response.json();


            /*
               Server returns an ARRAY:
               [
                 { id, name, price, ... }
               ]

               We also support:
               { menu: [...] }
               just in case.
            */

            let menuData = [];


            if (Array.isArray(data)) {

                menuData = data;

            } else if (
                data &&
                Array.isArray(data.menu)
            ) {

                menuData = data.menu;

            } else if (
                data &&
                Array.isArray(data.data)
            ) {

                menuData = data.data;

            }


            if (menuData.length === 0) {

                console.log(
                    "No database menu items found."
                );

                return;

            }


            menuGrid
                .querySelectorAll(
                    ".database-menu-card"
                )
                .forEach(card => {
                    card.remove();
                });


            menuData.forEach(item => {

                const card =
                    createDatabaseMenuCard(
                        item
                    );

                menuGrid.appendChild(
                    card
                );

            });


            setupOrderButtons();

            setupMenuReveal();

            applyCurrentMenuFilter();


            console.log(
                "Database menu loaded:",
                menuData.length
            );


        } catch (error) {

            console.error(
                "Failed to load database menu:",
                error
            );

        }

    }


    /* =====================================================
       MENU REVEAL
    ===================================================== */

    function setupMenuReveal() {

        const cards =
            document.querySelectorAll(
                ".menu-card"
            );


        cards.forEach(
            (card, index) => {

                if (
                    card.dataset.revealReady ===
                    "true"
                ) {

                    return;

                }


                card.dataset.revealReady =
                    "true";


                card.style.transitionDelay =
                    `${index * 0.08}s`;

            }
        );

    }


    setupMenuReveal();


    /* =====================================================
       RESERVATION
    ===================================================== */

    const reservationForm =
        document.querySelector(
            ".reservation-form"
        );


    if (reservationForm) {

        reservationForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                openModal();

            }
        );

    }


    /* =====================================================
       RESERVATION DATE
    ===================================================== */

    const dateInput =
        document.querySelector(
            'input[name="date"]'
        );


    if (dateInput) {

        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                today.getDate()
            ).padStart(
                2,
                "0"
            );


        dateInput.min =
            `${year}-${month}-${day}`;

    }


    /* =====================================================
       RESERVATION TIME
    ===================================================== */

    const timeInput =
        document.querySelector(
            'input[name="time"]'
        );


    if (timeInput) {

        timeInput.min = "11:00";

        timeInput.max = "23:00";

    }


    /* =====================================================
       PHONE INPUT
    ===================================================== */

    const phoneInputs =
        document.querySelectorAll(
            'input[name="phone"], #customerPhone'
        );


    phoneInputs.forEach(input => {

        input.addEventListener(
            "input",
            () => {

                input.value =
                    input.value.replace(
                        /[^0-9+ ]/g,
                        ""
                    );

            }
        );

    });


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const backToTop =
        document.querySelector(
            ".back-to-top"
        );


    function updateBackToTop() {

        if (!backToTop) return;


        if (window.scrollY > 500) {

            backToTop.classList.add(
                "show"
            );

        } else {

            backToTop.classList.remove(
                "show"
            );

        }

    }


    window.addEventListener(
        "scroll",
        updateBackToTop
    );


    updateBackToTop();


    if (backToTop) {

        backToTop.addEventListener(
            "click",
            () => {

                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );

    }


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".section, .feature, .gallery-item, .reservation-info, .reservation-form"
        );


    if (
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "revealed"
                                );


                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(
            element => {

                observer.observe(
                    element
                );

            }
        );

    } else {

        revealElements.forEach(
            element => {

                element.classList.add(
                    "revealed"
                );

            }
        );

    }


    /* =====================================================
       HERO PARALLAX
    ===================================================== */

    const hero =
        document.querySelector(
            ".hero"
        );


    if (hero) {

        window.addEventListener(
            "scroll",
            () => {

                const scrollY =
                    window.scrollY;


                if (
                    scrollY <
                    window.innerHeight
                ) {

                    hero.style.backgroundPosition =
                        `center ${scrollY * 0.15}px`;

                }

            }
        );

    }


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    document
        .querySelectorAll(
            ".current-year"
        )
        .forEach(element => {

            element.textContent =
                new Date().getFullYear();

        });


    /* =====================================================
       IMAGE ERROR
    ===================================================== */

    document
        .querySelectorAll("img")
        .forEach(image => {

            image.addEventListener(
                "error",
                () => {

                    image.style.opacity =
                        "0.5";

                    image.alt =
                        "Image unavailable";

                }
            );

        });


    /* =====================================================
       EMPTY # LINKS
    ===================================================== */

    document
        .querySelectorAll(
            'a[href="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                }
            );

        });


    /* =====================================================
       LOAD MENU
    ===================================================== */

    loadDatabaseMenu();


    console.log(
        "%c ALMAJLIS ",
        "color:#d4af37;font-size:20px;font-weight:bold;"
    );

    console.log(
        "Almajlis website initialized successfully."
    );

});


/* =========================================================
   CART ELEMENTS
========================================================= */

const orderCartElement =
    document.getElementById(
        "orderCart"
    );

const cartOverlay =
    document.getElementById(
        "cartOverlay"
    );

const cartClose =
    document.getElementById(
        "cartClose"
    );

const floatingCart =
    document.getElementById(
        "floatingCart"
    );

const cartItems =
    document.getElementById(
        "cartItems"
    );

const cartTotal =
    document.getElementById(
        "cartTotal"
    );

const cartCount =
    document.getElementById(
        "cartCount"
    );

const checkoutButton =
    document.getElementById(
        "checkoutButton"
    );


/* =========================================================
   CART SAVE
========================================================= */

function saveCart() {

    localStorage.setItem(
        "almajlisCart",
        JSON.stringify(orderCart)
    );

}


/* =========================================================
   OPEN CART
========================================================= */

function openCart() {

    if (!orderCartElement) return;

    orderCartElement.classList.add(
        "active"
    );


    if (cartOverlay) {

        cartOverlay.classList.add(
            "active"
        );

    }


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE CART
========================================================= */

function closeCart() {

    if (orderCartElement) {

        orderCartElement.classList.remove(
            "active"
        );

    }


    if (cartOverlay) {

        cartOverlay.classList.remove(
            "active"
        );

    }


    document.body.style.overflow =
        "";

}


/* =========================================================
   CART EVENTS
========================================================= */

if (floatingCart) {

    floatingCart.addEventListener(
        "click",
        openCart
    );

}


if (cartClose) {

    cartClose.addEventListener(
        "click",
        closeCart
    );

}


if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        closeCart
    );

}


/* =========================================================
   UPDATE CART
========================================================= */

function updateCart() {

    if (!cartItems) return;


    cartItems.innerHTML = "";


    if (
        orderCart.length === 0
    ) {

        cartItems.innerHTML = `
            <div class="empty-cart">

                <span>🛒</span>

                <p>
                    Your order is empty
                </p>

                <small>
                    Add delicious dishes from our menu.
                </small>

            </div>
        `;


        if (cartTotal) {

            cartTotal.textContent =
                "৳0";

        }


        if (cartCount) {

            cartCount.textContent =
                "0";

        }


        return;

    }


    let total = 0;

    let totalQuantity = 0;


    orderCart.forEach(
        (item, index) => {

            const price =
                Number(item.price) || 0;


            const quantity =
                Number(item.quantity) || 1;


            const itemTotal =
                price * quantity;


            total += itemTotal;

            totalQuantity += quantity;


            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.className =
                "cart-item";


            const safeName =
                escapeCartHtml(
                    item.name
                );


            const safeImage =
                escapeCartHtml(
                    item.image || ""
                );


            cartItem.innerHTML = `

                <img
                    src="${safeImage}"
                    alt="${safeName}"
                    class="cart-item-image"
                    onerror="this.src='https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=300&q=80'"
                >

                <div class="cart-item-info">

                    <h4>
                        ${safeName}
                    </h4>

                    <div class="cart-item-price">
                        ৳${price.toLocaleString()}
                        × ${quantity}
                    </div>

                    <div class="cart-item-controls">

                        <button
                            type="button"
                            onclick="decreaseCartItem(${index})">

                            −

                        </button>

                        <span>
                            ${quantity}
                        </span>

                        <button
                            type="button"
                            onclick="increaseCartItem(${index})">

                            +

                        </button>

                        <button
                            type="button"
                            class="cart-remove"
                            onclick="removeCartItem(${index})">

                            ×

                        </button>

                    </div>

                </div>
            `;


            cartItems.appendChild(
                cartItem
            );

        }
    );


    if (cartTotal) {

        cartTotal.textContent =
            `৳${total.toLocaleString()}`;

    }


    if (cartCount) {

        cartCount.textContent =
            totalQuantity;

    }

}


/* =========================================================
   CART HTML ESCAPE
========================================================= */

function escapeCartHtml(value) {

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


/* =========================================================
   INCREASE ITEM
========================================================= */

function increaseCartItem(index) {

    if (!orderCart[index]) return;


    orderCart[index].quantity =
        Number(
            orderCart[index].quantity
        ) + 1;


    saveCart();

    updateCart();

}


/* =========================================================
   DECREASE ITEM
========================================================= */

function decreaseCartItem(index) {

    if (!orderCart[index]) return;


    if (
        Number(orderCart[index].quantity) > 1
    ) {

        orderCart[index].quantity--;

    } else {

        orderCart.splice(
            index,
            1
        );

    }


    saveCart();

    updateCart();

}


/* =========================================================
   REMOVE ITEM
========================================================= */

function removeCartItem(index) {

    if (!orderCart[index]) return;


    orderCart.splice(
        index,
        1
    );


    saveCart();

    updateCart();

}


/* =========================================================
   ADD TO ORDER
========================================================= */

function setupOrderButtons() {

    const orderButtons =
        document.querySelectorAll(
            ".menu-button"
        );


    orderButtons.forEach(button => {

        /*
           Prevent duplicate event listeners.
        */

        if (
            button.dataset.cartReady ===
            "true"
        ) {

            return;

        }


        button.dataset.cartReady =
            "true";


        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();


                const card =
                    button.closest(
                        ".menu-card"
                    );


                if (!card) return;


                const nameElement =
                    card.querySelector(
                        "h3"
                    );


                const priceElement =
                    card.querySelector(
                        ".price"
                    );


                const imageElement =
                    card.querySelector(
                        ".menu-image img"
                    );


                if (
                    !nameElement ||
                    !priceElement
                ) {

                    return;

                }


                const name =
                    nameElement.textContent
                        .trim();


                const priceText =
                    priceElement.textContent
                        .replace(
                            /[^\d.]/g,
                            ""
                        );


                const price =
                    Number(priceText);


                if (
                    !name ||
                    !Number.isFinite(price)
                ) {

                    return;

                }


                const image =
                    imageElement
                        ? imageElement.src
                        : "";


                /*
                   Find existing item.
                */

                const existingItem =
                    orderCart.find(
                        item =>
                            item.name === name
                    );


                if (existingItem) {

                    existingItem.quantity++;

                } else {

                    orderCart.push({

                        name: name,

                        price: price,

                        image: image,

                        quantity: 1

                    });

                }


                saveCart();

                updateCart();

                openCart();


                /*
                   Button feedback.
                */

                const originalHTML =
                    button.innerHTML;


                button.innerHTML =
                    '<i class="fa-solid fa-check"></i> ADDED';


                button.classList.add(
                    "added"
                );


                setTimeout(
                    () => {

                        button.innerHTML =
                            originalHTML;

                        button.classList.remove(
                            "added"
                        );

                    },
                    1200
                );

            }
        );

    });

}


/* =========================================================
   CUSTOMER ORDER FORM
========================================================= */

const orderFormOverlay =
    document.getElementById(
        "orderFormOverlay"
    );

const orderFormClose =
    document.getElementById(
        "orderFormClose"
    );

const customerOrderForm =
    document.getElementById(
        "customerOrderForm"
    );

const checkoutItems =
    document.getElementById(
        "checkoutItems"
    );

const checkoutTotal =
    document.getElementById(
        "checkoutTotal"
    );

const placeOrderButton =
    document.getElementById(
        "placeOrderButton"
    );

const customerName =
    document.getElementById(
        "customerName"
    );

const customerPhone =
    document.getElementById(
        "customerPhone"
    );

const customerAddress =
    document.getElementById(
        "customerAddress"
    );

const customerNote =
    document.getElementById(
        "customerNote"
    );


/* =========================================================
   OPEN ORDER FORM
========================================================= */

function openOrderForm() {

    if (
        orderCart.length === 0
    ) {

        alert(
            "Your order is empty."
        );

        return;

    }


    closeCart();

    renderCheckoutSummary();


    if (orderFormOverlay) {

        orderFormOverlay.classList.add(
            "active"
        );

    }


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE ORDER FORM
========================================================= */

function closeOrderForm() {

    if (orderFormOverlay) {

        orderFormOverlay.classList.remove(
            "active"
        );

    }


    document.body.style.overflow =
        "";

}


/* =========================================================
   ORDER FORM CLOSE BUTTON
========================================================= */

if (orderFormClose) {

    orderFormClose.addEventListener(
        "click",
        closeOrderForm
    );

}


if (orderFormOverlay) {

    orderFormOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                orderFormOverlay
            ) {

                closeOrderForm();

            }

        }
    );

}


/* =========================================================
   CHECKOUT SUMMARY
========================================================= */

function renderCheckoutSummary() {

    if (!checkoutItems) return;


    checkoutItems.innerHTML = "";


    let total = 0;


    orderCart.forEach(item => {

        const price =
            Number(item.price) || 0;


        const quantity =
            Number(item.quantity) || 1;


        const itemTotal =
            price * quantity;


        total += itemTotal;


        const element =
            document.createElement(
                "div"
            );


        element.className =
            "checkout-item";


        element.innerHTML = `

            <span>
                ${escapeCartHtml(item.name)}
                × ${quantity}
            </span>

            <span class="checkout-item-price">
                ৳${itemTotal.toLocaleString()}
            </span>

        `;


        checkoutItems.appendChild(
            element
        );

    });


    if (checkoutTotal) {

        checkoutTotal.textContent =
            `৳${total.toLocaleString()}`;

    }

}


/* =========================================================
   PROCEED TO ORDER
========================================================= */

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        openOrderForm
    );

}


/* =========================================================
   PLACE ORDER
========================================================= */

if (customerOrderForm) {

    customerOrderForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                customerName
                    ? customerName.value.trim()
                    : "";


            const phone =
                customerPhone
                    ? customerPhone.value.trim()
                    : "";


            const address =
                customerAddress
                    ? customerAddress.value.trim()
                    : "";


            const note =
                customerNote
                    ? customerNote.value.trim()
                    : "";


            /* Required fields */

            if (
                !name ||
                !phone ||
                !address
            ) {

                alert(
                    "Please complete all required fields."
                );

                return;

            }


            /* Empty cart */

            if (
                orderCart.length === 0
            ) {

                alert(
                    "Your order is empty."
                );

                return;

            }


            /* Button loading */

            if (placeOrderButton) {

                placeOrderButton.disabled =
                    true;

                placeOrderButton.innerHTML =
                    "<span>PROCESSING...</span>";

            }


            try {

                /*
                   IMPORTANT:
                   The response variable is correctly
                   created here.
                */

                const response =
                    await fetch(
                        "/api/orders",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    customer_name:
                                        name,

                                    phone:
                                        phone,

                                    address:
                                        address,

                                    note:
                                        note,

                                    items:
                                        orderCart

                                })

                        }
                    );


                /*
                   Try to read server response.
                */

                const data =
                    await response.json();


                /*
                   Check server result.
                */

                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Order failed."
                    );

                }


                console.log(
                    "Order successfully placed:",
                    data.orderId
                );


                /* Close form */

                closeOrderForm();


                /* Empty cart */

                orderCart = [];


                saveCart();

                updateCart();


                /* Reset customer form */

                customerOrderForm.reset();


                /* Success animation */

                const successOverlay =
                    document.getElementById(
                        "orderSuccessOverlay"
                    );


                if (successOverlay) {

                    successOverlay.classList.add(
                        "active"
                    );


                    setTimeout(
                        () => {

                            successOverlay.classList.remove(
                                "active"
                            );

                        },
                        5000
                    );

                }


            } catch (error) {

                console.error(
                    "ORDER SUBMISSION ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Sorry! We could not place your order right now. Please try again."
                );

            } finally {

                if (placeOrderButton) {

                    placeOrderButton.disabled =
                        false;


                    placeOrderButton.innerHTML = `
                        <span>PLACE ORDER</span>
                        <span class="order-arrow">→</span>
                    `;

                }

            }

        }
    );

}


/* =========================================================
   INITIAL CART
========================================================= */

updateCart();

setupOrderButtons();


/* =========================================================
   FINAL STARTUP
========================================================= */

console.log(
    "%c ALMAJLIS CART READY ",
    "color:#d4af37;font-size:18px;font-weight:bold;"
);

console.log(
    "Cart and order system initialized successfully."
);