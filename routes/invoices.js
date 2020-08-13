//Imports
const express = require('express');
const db = require('../db'); 
const { ExpressError, NotFoundError } = require('../expressError');

//Router
const invoicesRouter = new express.Router();

/** Returns all invoices (like {invoices: [{id, comp_code}, ...]}). */
invoicesRouter.get('/', async function (req, res, next) {
    console.log('/invoices - GET (all)')
    try {
        const results = await db.query(
          `SELECT id, comp_code
           FROM invoices;`
          )
        const invoices = results.rows
        if (invoices.length === 0) {
            throw new ExpressError('No invoices found.')
        }
        return res.json({ invoices })
    }
    catch (error) {
        return next(error)
    }
})


/**  Returns a specified invoice
 * ({invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}})
 */

invoicesRouter.get('/:id', async function (req, res, next) {
  console.log('/invoices - GET (one entry)')
  try {
      const invoiceId = req.params.id

      //Query #1
      const invoiceResult = await db.query(
        `SELECT id, amt, paid, add_date, paid_date, comp_code AS company
         FROM invoices
         WHERE id = $1;`, [invoiceId]
        )
      const invoice = invoiceResult.rows[0]
      console.log('invoice: ' + invoice.id)

      //Query #2
      const companyResult = await db.query(
        `SELECT code, name, description
        FROM companies
        WHERE code = $1;`, [invoice.company]
      )
      const company = companyResult.rows[0]

      //Building invoice object
      invoice.company = company

      if (invoice.length === 0) {
          throw new ExpressError('No invoices found.')
      }
      return res.json({ invoice })
  }
  catch (error) {
      return next(error)
  }
})

/** Adds an invoice.
 * {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
*/
invoicesRouter.post('/', async function (req, res, next) {
  console.log('/invoices - POST')
  try {
      const {comp_code, amt} = req.body

      const invoiceResult = await db.query(
        `INSERT INTO invoices (comp_code, amt)
         VALUES ($1, $2)
         RETURNING id, comp_code, amt, paid, add_date, paid_date;`, [comp_code, amt]
      )

      if (invoiceResult.rows.length === 0) {
          throw new ExpressError('Unable to add invoice.')
      }
      let invoice = invoiceResult.rows[0]

      return res.json({ invoice })
  }
  catch (error) {
      return next(error)
  }
})

/** Updates and returns an invoice.
 * {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
invoicesRouter.put('/:id', async function (req, res, next) {
  console.log('/invoices - PUT')
  try {
      let invoiceId = req.params.id
      const {amt} = req.body

      const invoiceResult = await db.query(
        `UPDATE invoices
         SET amt = $1
         WHERE id = $2
         RETURNING id, comp_code, amt, paid, add_date, paid_date;`, [amt, invoiceId]
      )

      if (invoiceResult.rows.length === 0) {
          throw new NotFoundError(`Unable to find invoice #${id}`)
      }
      let invoice = invoiceResult.rows[0]

      return res.json({ invoice })
  }
  catch (error) {
      return next(error)
  }
})

//Export
module.exports = invoicesRouter;