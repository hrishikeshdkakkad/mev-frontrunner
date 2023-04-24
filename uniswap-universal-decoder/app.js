const express = require("express");
const { decodeExecute } = require("./universalDecoder");
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/", (req, res) => {
  console.log(req.body, "req.body");
  const result = decodeExecute(req.body);
  res.status(200).json(result);
});

app.listen(30000, () => {
  console.log("Server listening on port 30000");
});
