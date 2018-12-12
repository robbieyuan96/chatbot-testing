// Ensure environment variables are read.
require("dotenv");
require('dotenv').config({
    path: "app/.env",
})

const jest = require("jest");
let argv = process.argv.slice(2);

jest.run(argv);
