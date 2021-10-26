const express = require('express');

var musicMap = new Map();
const service = express();
service.use(express.json());


const port = 8443;
service.listen(port, () => {
  console.log(`We're live on port ${port}!`);
});