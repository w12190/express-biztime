/** BizTime express application. */

/** Imports */
const morgan = require('morgan')
const express = require('express')
const companiesRouter = require('./routes/companies.js') //Router
const { NotFoundError} = require("./expressError")

const app = express()



/****** Middleware */
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('dev'))
app.use('/companies', companiesRouter) //Router
// TODO add middleware for login



/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  const notFoundError = new NotFoundError();
  return next(notFoundError);
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  // the default status is 500 Internal Server Error
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

/** Export */
module.exports = app;
