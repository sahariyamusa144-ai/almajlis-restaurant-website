const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = 3000;

// =========================
// DATABASE
// =========================

const db = new Database(path.join(__dirname, "almajlis.db"));

db.prepare(`
    CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT,
        description TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

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

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "almajlis-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// =========================
// UPLOADS
// =========================

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage
});

app.use("/uploads", express.static(uploadDir));

// =========================
// ADMIN LOGIN
// =========================

const ADMIN_USERNAME = "moderator";

const ADMIN_PASSWORD_HASH =
    "$2b$10$G57yVlofgvIdZdACP55u5usGUGQb8Solvw8sk2xXLv8b/jTeblAYy";

function requireAdmin(req, res, next) {
    if (req.session && req.session.admin) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "Unauthorized"
    });
}

// =========================
// LOGIN
// =========================

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        if (username !== ADMIN_USERNAME) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            ADMIN_PASSWORD_HASH
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        req.session.admin = true;
        req.session.username = username;

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

// =========================
// CHECK LOGIN
// =========================

app.get("/api/check-login", (req, res) => {
    if (req.session && req.session.admin) {
        return res.json({
            loggedIn: true,
            username: req.session.username
        });
    }

    res.json({
        loggedIn: false
    });
});

// =========================
// LOGOUT
// =========================

app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({
            success: true,
            message: "Logged out successfully."
        });
    });
});

// =========================
// ADD MENU
// =========================

app.post(
    "/api/menu",
    requireAdmin,
    upload.single("image"),
    (req, res) => {
        try {
            const {
                name,
                price,
                category,
                description
            } = req.body;

            if (!name || !price) {
                return res.status(400).json({
                    success: false,
                    message: "Name and price are required."
                });
            }

            let image = "";

            if (req.file) {
                image = "/uploads/" + req.file.filename;
            }

            const result = db.prepare(`
                INSERT INTO menu
                (name, price, category, description, image)
                VALUES (?, ?, ?, ?, ?)
            `).run(
                name,
                Number(price),
                category || "",
                description || "",
                image
            );

            res.json({
                success: true,
                id: result.lastInsertRowid
            });
        } catch (error) {
            console.error("ADD MENU ERROR:", error);

            res.status(500).json({
                success: false,
                message: "Could not add menu."
            });
        }
    }
);

// =========================
// UPDATE MENU
// =========================

app.put(
    "/api/menu/:id",
    requireAdmin,
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

            let image = existing.image;

            if (req.file) {
                image = "/uploads/" + req.file.filename;
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
                category || "",
                description || "",
                image,
                id
            );

            res.json({
                success: true,
                message: "Menu updated successfully."
            });
        } catch (error) {
            console.error("UPDATE MENU ERROR:", error);

            res.status(500).json({
                success: false,
                message: "Could not update menu."
            });
        }
    }
);

// =========================
// DELETE MENU
// =========================

app.delete(
    "/api/menu/:id",
    requireAdmin,
    (req, res) => {
        try {
            const id = Number(req.params.id);

            db.prepare(`
                DELETE FROM menu
                WHERE id = ?
            `).run(id);

            res.json({
                success: true,
                message: "Menu deleted successfully."
            });
        } catch (error) {
            console.error("DELETE MENU ERROR:", error);

            res.status(500).json({
                success: false,
                message: "Could not delete menu."
            });
        }
    }
);

// =========================
// CUSTOMER ORDERS
// =========================

app.post("/api/orders", (req, res) => {
    try {
        const {
            customer_name,
            phone,
            address,
            note,
            items,
            total
        } = req.body;

        if (
            !customer_name ||
            !phone ||
            !address ||
            !items ||
            total === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required order information."
            });
        }

        const result = db.prepare(`
            INSERT INTO orders
            (
                customer_name,
                phone,
                address,
                note,
                items,
                total
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            customer_name,
            phone,
            address,
            note || "",
            typeof items === "string"
                ? items
                : JSON.stringify(items),
            Number(total)
        );

        res.json({
            success: true,
            order_id: result.lastInsertRowid,
            message: "Order placed successfully."
        });
    } catch (error) {
        console.error("ORDER ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Could not place order."
        });
    }
});

// =========================
// ADMIN ORDERS
// =========================

app.get(
    "/api/orders",
    requireAdmin,
    (req, res) => {
        try {
            const orders = db.prepare(`
                SELECT *
                FROM orders
                ORDER BY id DESC
            `).all();

            res.json(orders);
        } catch (error) {
            console.error("ORDERS ERROR:", error);

            res.status(500).json({
                success: false,
                message: "Could not load orders."
            });
        }
    }
);

// =========================
// UPDATE ORDER STATUS
// =========================

app.patch(
    "/api/orders/:id/status",
    requireAdmin,
    (req, res) => {
        try {
            const id = Number(req.params.id);
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: "Status is required."
                });
            }

            db.prepare(`
                UPDATE orders
                SET status = ?
                WHERE id = ?
            `).run(status, id);

            res.json({
                success: true,
                message: "Order status updated."
            });
        } catch (error) {
            console.error("STATUS ERROR:", error);

            res.status(500).json({
                success: false,
                message: "Could not update order status."
            });
        }
    }
);

// =========================
// ADMIN LOGIN PAGE
// =========================

app.get("/admin/login.html", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "..",
            "admin",
            "login.html"
        )
    );
});

// =========================
// STATIC WEBSITE
// =========================

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

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
    console.log(
        `Almajlis server running at http://localhost:${PORT}`
    );
});