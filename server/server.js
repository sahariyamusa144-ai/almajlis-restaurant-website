// ======================================================
// ALMAJLIS RESTAURANT SERVER
// ======================================================

const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const multer = require("multer");
const fs = require("fs");

// Upload folder
const uploadDir = path.join(__dirname, "..", "uploads");

// Folder না থাকলে তৈরি করবে
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1E9) + ext;

        cb(null, uniqueName);
    }
});

// Only image files
const upload = multer({
    storage: storage,

    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.test(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed."));
        }
    }
});
const app = express();
const PORT = 3000;

// ======================================================
// DATABASE
// ======================================================

const db = new Database(
    path.join(__dirname, "almajlis.db")
);

db.pragma("journal_mode = WAL");

// ======================================================
// CREATE MENU TABLE
// ======================================================

db.prepare(`
    CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

// ======================================================
// CREATE ORDERS TABLE
// ======================================================

db.prepare(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        note TEXT,
        items TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(uploadDir));
app.use(
    session({
        secret: "almajlis-secret-key-change-later",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// ======================================================
// ADMIN AUTHENTICATION
// ======================================================

const ADMIN_USERNAME = "moderator";

const ADMIN_PASSWORD_HASH =
    "$2b$10$G57yVlofgvIdZdACP55u5usGUGQb8Solvw8sk2xXLv8b/jTeblAYy";

// ======================================================
// AUTH MIDDLEWARE
// ======================================================

function requireLogin(req, res, next) {

    if (req.session && req.session.loggedIn) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "Unauthorized"
    });
}

// ======================================================
// LOGIN
// ======================================================

app.post("/api/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        if (
            username !== ADMIN_USERNAME ||
            !password
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const validPassword =
            await bcrypt.compare(
                password,
                ADMIN_PASSWORD_HASH
            );

        if (!validPassword) {

            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });

        }

        req.session.loggedIn = true;
        req.session.username = ADMIN_USERNAME;

        res.json({
            success: true,
            message: "Login successful."
        });

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Login failed."
        });

    }

});

// ======================================================
// CHECK LOGIN
// ======================================================

app.get("/api/check-login", (req, res) => {

    if (
        req.session &&
        req.session.loggedIn
    ) {

        return res.json({
            loggedIn: true,
            username: req.session.username
        });

    }

    res.json({
        loggedIn: false
    });

});

// ======================================================
// LOGOUT
// ======================================================

app.post("/api/logout", (req, res) => {

    req.session.destroy(() => {

        res.json({
            success: true
        });

    });

});

// ======================================================
// GET MENU
// PUBLIC
// ======================================================

// ======================================================
// ADD MENU ITEM
// ADMIN ONLY
// WITH PHOTO UPLOAD
// ======================================================

app.post(
    "/api/menu",
    requireLogin,
    upload.single("image"),
    (req, res) => {

        try {

            const {
                name,
                price,
                category,
                description
            } = req.body;

            if (
                !name ||
                price === undefined ||
                !category
            ) {

                // যদি validation fail করে এবং photo upload হয়ে থাকে,
                // তাহলে uploaded photo delete করে দেবে
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(400).json({
                    success: false,
                    message:
                        "Name, price and category are required."
                });

            }

            // Uploaded image path
            const image = req.file
                ? `/uploads/${req.file.filename}`
                : "";

            const result = db.prepare(`
                INSERT INTO menu
                (
                    name,
                    price,
                    category,
                    description,
                    image
                )
                VALUES (?, ?, ?, ?, ?)
            `).run(
                name,
                Number(price),
                category,
                description || "",
                image
            );

            res.json({
                success: true,
                message: "Menu item added successfully.",
                id: result.lastInsertRowid,
                image: image
            });

        } catch (error) {

            console.error("ADD MENU ERROR:", error);

            // Error হলে uploaded photo delete
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (deleteError) {
                    console.error(
                        "IMAGE DELETE ERROR:",
                        deleteError
                    );
                }
            }

            res.status(500).json({
                success: false,
                message: "Could not add menu item."
            });

        }

    }
);

// ======================================================
// CUSTOMER ORDER
// PUBLIC
// ======================================================
// ======================================================
// EDIT MENU ITEM
// ADMIN ONLY
// ======================================================

app.put(
    "/api/menu/:id",
    requireLogin,
    upload.single("image"),
    (req, res) => {

        try {

            const id = Number(req.params.id);

            const {
                name,
                price,
                category,
                description
            } = req.body;

            if (
                !id ||
                !name ||
                price === undefined ||
                !category
            ) {

                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(400).json({
                    success: false,
                    message:
                        "Name, price and category are required."
                });

            }

            // Find existing menu item
            const existing = db.prepare(`
                SELECT *
                FROM menu
                WHERE id = ?
            `).get(id);

            if (!existing) {

                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(404).json({
                    success: false,
                    message: "Menu item not found."
                });

            }

            // Keep old image if no new image uploaded
            let image = existing.image || "";

            // If new image uploaded
            if (req.file) {

                image = `/uploads/${req.file.filename}`;

                // Delete old uploaded image
                if (
                    existing.image &&
                    existing.image.startsWith("/uploads/")
                ) {

                    const oldImagePath = path.join(
                        __dirname,
                        "..",
                        existing.image
                    );

                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }

                }

            }

            db.prepare(`
                UPDATE menu
                SET
                    name = ?,
                    price = ?,
                    category = ?,
                    description = ?,
                    image = ?
                WHERE id = ?
            `).run(
                name,
                Number(price),
                category,
                description || "",
                image,
                id
            );

            res.json({
                success: true,
                message: "Menu item updated successfully.",
                image: image
            });

        } catch (error) {

            console.error("EDIT MENU ERROR:", error);

            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (deleteError) {
                    console.error(
                        "IMAGE DELETE ERROR:",
                        deleteError
                    );
                }
            }

            res.status(500).json({
                success: false,
                message: "Could not update menu item."
            });

        }

    }
);


// ======================================================
// DELETE MENU ITEM
// ADMIN ONLY
// ======================================================

app.delete(
    "/api/menu/:id",
    requireLogin,
    (req, res) => {

        try {

            const id = Number(req.params.id);

            if (!id) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid menu ID."
                });

            }

            // Find menu item first
            const existing = db.prepare(`
                SELECT *
                FROM menu
                WHERE id = ?
            `).get(id);

            if (!existing) {

                return res.status(404).json({
                    success: false,
                    message: "Menu item not found."
                });

            }

            // Delete database record
            db.prepare(`
                DELETE FROM menu
                WHERE id = ?
            `).run(id);

            // Delete uploaded image
            if (
                existing.image &&
                existing.image.startsWith("/uploads/")
            ) {

                const imagePath = path.join(
                    __dirname,
                    "..",
                    existing.image
                );

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }

            }

            res.json({
                success: true,
                message: "Menu item deleted successfully."
            });

        } catch (error) {

            console.error("DELETE MENU ERROR:", error);

            res.status(500).json({
                success: false,
                message: "Could not delete menu item."
            });

        }

    }
);
app.post("/api/orders", (req, res) => {

    try {

        const {
            customer_name,
            phone,
            address,
            note,
            items
        } = req.body;

        // ------------------------------
        // VALIDATION
        // ------------------------------

        if (
            !customer_name ||
            !phone ||
            !address
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Please fill in all required fields."
            });

        }

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Your order is empty."
            });

        }

        // ------------------------------
        // CALCULATE TOTAL
        // ------------------------------

        let total = 0;

        items.forEach(item => {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 1;

            total +=
                price * quantity;

        });

        // ------------------------------
        // SAVE ORDER
        // ------------------------------

        const statement = db.prepare(`
            INSERT INTO orders
            (
                customer_name,
                phone,
                address,
                note,
                items,
                total,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = statement.run(
            String(customer_name).trim(),
            String(phone).trim(),
            String(address).trim(),
            String(note || "").trim(),
            JSON.stringify(items),
            total,
            "Pending"
        );

        console.log(
            `New order received: #${result.lastInsertRowid}`
        );

        res.status(201).json({

            success: true,

            orderId:
                result.lastInsertRowid,

            message:
                "Order placed successfully."

        });

    } catch (error) {

        console.error(
            "ORDER ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Could not place your order."

        });

    }

});

// ======================================================
// GET ORDERS
// ADMIN ONLY
// ======================================================

app.get(
    "/api/orders",
    requireLogin,
    (req, res) => {

        try {

            const orders = db.prepare(`
                SELECT *
                FROM orders
                ORDER BY id DESC
            `).all();

            const formattedOrders =
                orders.map(order => {

                    let items = [];

                    try {
                        items =
                            JSON.parse(
                                order.items
                            );
                    } catch {
                        items = [];
                    }

                    return {
                        ...order,
                        items
                    };

                });

            res.json(formattedOrders);

        } catch (error) {

            console.error(
                "GET ORDERS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Could not load orders."
            });

        }

    }
);

// ======================================================
// UPDATE ORDER STATUS
// ADMIN ONLY
// ======================================================

app.patch(
    "/api/orders/:id/status",
    requireLogin,
    (req, res) => {

        try {

            const {
                status
            } = req.body;

            const allowedStatuses = [
                "Pending",
                "Preparing",
                "Completed",
                "Cancelled"
            ];

            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid order status."
                });

            }

            const result = db.prepare(`
                UPDATE orders
                SET status = ?
                WHERE id = ?
            `).run(
                status,
                Number(req.params.id)
            );

            if (result.changes === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Order not found."
                });

            }

            res.json({
                success: true
            });

        } catch (error) {

            console.error(
                "STATUS UPDATE ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Could not update order status."
            });

        }

    }
);

// ======================================================
// SERVE WEBSITE
// ======================================================

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "..",
            "index.html"
        )
    );

});

// ======================================================
// START SERVER
// ======================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Almajlis server running at http://localhost:${PORT}`
        );

    }
);