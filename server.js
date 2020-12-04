require('dotenv').config({ path: 'variables.env' });
const path = require("path")
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dialog = require('./functions/index.js');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "client", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});
app.post('/chat', (req, res) => {
  const { queryInput } = req.body;
  console.log(queryInput);
  dialog.dialogflowGateway(req,res);
});
app.set('port', process.env.PORT || 8000);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});