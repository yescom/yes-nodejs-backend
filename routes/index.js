var express = require('express');
var router = express.Router();

const config = require('../config/config');

/* GET home page. */
router.get('/', (req, res) => {
  acUrl = new URL(config.yes.ac_uri);
  acUrl.searchParams.set('client_id', config.yes.client_id);
  res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>adhocdoc</title>
  </head>
  <body>
  <p>
  Mit meiner Bank identifizieren <a href="${acUrl.toString()}">yes®</a>
  </p>
  </body>
  </html>`);
    // add &prompt=select_account the url to always show bank selection
});

module.exports = router;