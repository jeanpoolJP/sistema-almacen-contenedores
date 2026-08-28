// scripts\crear-password.js

const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.error("Debes proporcionar una contraseña.");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

console.log("\nHash generado:\n");
console.log(hash);