const config = require('./config/config');
// const path = require('path')
var express = require('express');
var session = require('express-session');
const app = express();

var indexRouter = require('./routes/index');
var yesRouter = require('./routes/yes.js');

/*
app.use(express.static(path.join(__dirname, '../build')))
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'))
  })
*/

app.use(session({
    secret: "laskfaslkf",
    resave: true,
    saveUninitialized: true
}));

app.use('/', indexRouter);
app.use('/yes', yesRouter);

app.listen(config.serverPort, () => console.log(`running on ${config.serverPort}`));

module.exports = app;
