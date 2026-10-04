const Database = require("better-sqlite3");

const db = new Database("almajlis.db");


// Add one menu item
const addMenu = db.prepare(`
    INSERT INTO menu
    (name, price, category, description, image)
    VALUES (?, ?, ?, ?, ?)
`);


// Test menu item
addMenu.run(
    "Chicken Mandi",
    850,
    "mandi",
    "Juicy chicken served with aromatic Arabian rice.",
    "images/chicken-mandi.jpg"
);


console.log("Chicken Mandi added successfully!");


// Show all menu items
const menuItems = db.prepare(`
    SELECT * FROM menu
`).all();

console.log(menuItems);


db.close();