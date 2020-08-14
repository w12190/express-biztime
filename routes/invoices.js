//Imports
const express = require('express');
const db = require('../db');
const { ExpressError, NotFoundError } = require('../expressError');

//Router
const invoicesRouter = new express.Router();

/**
 * Route serving JSON of all invoices in DB.
 * Returns JSON of all invoices in DB. {invoices: [{id, comp_code}, ...]}
 * */
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


/**
 * Route serving JSON of one invoice in the DB.
 * Accepts the ID of the invoice, returns the invoice data in JSON.
* Returns ({invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}})
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
    // console.log('invoice: ', invoice.id)

    if (invoice.length === 0) {
      throw new NotFoundError('No invoices found.')
    }

    //Query #2
    const companyResult = await db.query(
      `SELECT code, name, description
        FROM companies
        WHERE code = $1;`, [invoice.company]
    )
    const company = companyResult.rows[0]

    //Building invoice object
    invoice.company = company


    return res.json({ invoice })
  }
  catch (error) {
    return next(error)
  }
})

/**
 * Route that adds a new invoice to the DB
 * Accepts the company code and amount of the invoice, returns JSON for the new invoice.
 * Returns {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
*/
invoicesRouter.post('/', async function (req, res, next) {
  console.log('/invoices - POST')

  try {
    const { comp_code, amt } = req.body

    const invoiceResult = await db.query(
      `INSERT INTO invoices (comp_code, amt)
         VALUES ($1, $2)
         RETURNING id, comp_code, amt, paid, add_date, paid_date;`,
      [comp_code, amt]
    )

    if (invoiceResult.rows.length === 0) {
      throw new ExpressError('Unable to add invoice.')
    }
    const invoice = invoiceResult.rows[0]

    return res.json({ invoice })
  }
  catch (error) {
    return next(error)
  }

})

/** Route updates and returns an invoice.
 * Returns {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
invoicesRouter.put('/:id', async function (req, res, next) {
  console.log('/invoices - PUT')
  try {
    const invoiceId = req.params.id
    const { amt } = req.body

    const invoiceResult = await db.query(
      `UPDATE invoices
         SET amt = $1
         WHERE id = $2
         RETURNING id, comp_code, amt, paid, add_date, paid_date;`,
      [amt, invoiceId]
    )

    if (invoiceResult.rows.length === 0) {
      throw new NotFoundError(`Unable to find invoice #${id}`)
    }
    const invoice = invoiceResult.rows[0]

    return res.json({ invoice })
  }
  catch (error) {
    return next(error)
  }
})


/** Route that deletes an invoice.
 * If invoice cannot be found, returns a 404.
 * Returns: { status: "deleted" }
 */
invoicesRouter.delete("/:id", async function (req, res, next) {
  console.log("/invoices/:id - DELETE")

  try {
    const invoiceId = req.params.id
    const result = await db.query(
      `DELETE FROM invoices
          WHERE id = $1
          RETURNING id`,
      [invoiceId]
    )
    // NotFoundError because you want to throw a 404
    if (result.rows.length === 0) {
      throw new NotFoundError(`Not found: ${invoiceId}`)
    }
    return res.json({ status: "deleted" })

  } catch (error) {
    return next(error)
  }

})



//Export
module.exports = invoicesRouter;