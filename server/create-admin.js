const bcrypt = require("bcryptjs");

const username = "moderator";
const password = "Musa@12345";

const hashedPassword = bcrypt.hashSync(password, 10);

console.log("Moderator account created!");
console.log("Username:", username);
console.log("Password:", password);
console.log("Password Hash:", hashedPassword);