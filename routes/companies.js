//Imports
const express = require('express');
const db = require('../db');
const { ExpressError, NotFoundError } = require('../expressError');

//Router
const companiesRouter = new express.Router();

/**
* Route serving JSON of data on a specific company.
* Accepts the company code, returns that company's data in JSON.
*/
companiesRouter.get('/', async function (req, res, next) {
    console.log('/companies - GET')
    try {
        const results = await db.query('SELECT code, name FROM companies;')
        const companies = results.rows
        if (companies.length === 0) {
            throw new ExpressError('no companies found')
        }
        return res.json({ companies })
    }
    catch (error) {
        return next(error)
    }
})


/**
* Route serving JSON of data on a specific company.
* Accepts the company code, returns that company's data in JSON.
*/
companiesRouter.get('/:code', async function (req, res, next) {
    console.log('/companies/:code - GET')
    try {
        let code = req.params.code
        // console.log(code)

        // query company
        const cResults = await db.query(`
            SELECT code, name, description 
            FROM companies 
            WHERE code = $1;`, [code])

        const company = cResults.rows[0]
        // console.log('this is company', company)

        //query company's invoices
        const iResult = await db.query(`
            SELECT id, comp_code, amt, paid, add_date, paid_date
            FROM invoices
            WHERE comp_code = $1`, [code]
            )

        const invoices = iResult.rows
        // console.log("rows", invoices)    

        company.invoices = invoices
        if (!company) {
            throw new NotFoundError()
        }
        return res.json({ company })
    }
    catch (error) {
        return next(error)
    }
})

/**
* Route that adds a new company to the DB.
* Accepts then returns the company code, name, and description in JSON if added successfully.
*/
companiesRouter.post('/', async function (req, res, next) {
    console.log('/companies/ - POST')
    try {
        let { code, name, description } = req.body
        const results = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description;`, 
            [code, name, description])
        const company = results.rows[0]
        if (!company) {
            throw new ExpressError('company was not created')
        }
        return res.status(201).json({ company }) // Returns obj of new company: {company: {code, name, description}}
    }
    catch (error) {
        return next(error)
    }
})

/**
 * Route that updates an existing company's name and description in the DB.
 * Accepts URL param of company's code and JSON of a company's name and description, returns obj containing that if update successful.
 */
companiesRouter.put('/:code', async function (req, res, next) {
    console.log('/companies/:code - PUT')
    try {
        const { name, description } = req.body
        const result = await db.query(
            `UPDATE companies
            SET name=$1,
                description=$2
            WHERE code=$3
            RETURNING code, name, description;`,
            [name, description, req.params.code]
        )
        const company = result.rows[0]

        if (!result) {
            throw new ExpressError(`Not found: ${req.params.code}`)
        }
        return res.json({ company })
    }
    catch (error) {
        return next(error)
    }
})


/**
* Route that deletes a company's entry in the database.
* Accepts a company's code, then returns it if delete was successfully.
*/
companiesRouter.delete('/:code', async function (req, res, next) {
    console.log('/companies/:code - DELETE')

    try {
        const company = req.params.code
        const result = await db.query(
            `DELETE FROM companies
            WHERE code = $1
            RETURNING code`,
            [req.params.code]
        )
        //r.r.l - array
        if (result.rows.length === 0) {
            throw new ExpressError(`Not Found: ${company}`)
        }
        return res.json({ status: "deleted" })

    } catch (error) {
        return next(error)
    }
})

//Export
module.exports = companiesRouter;