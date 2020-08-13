//Imports
const express = require('express');
const db = require('../db'); //TODO2 - if throws an error go ahead and add ./ .js
const { ExpressError, NotFoundError } = require('../expressError');

//Router
const companiesRouter = new express.Router();

/** Returns all companies. Add the actual return obj data - */
companiesRouter.get('/', async function (req, res, next) {
    console.log('/companies - GET')
    try {
        const results = await db.query('SELECT code, name FROM companies;')
        const companies = results.rows
        if (companies.length === 0) {
            throw new ExpressError('no companies found')
        }
        return res.json({ companies })// TODO  - check formatting
    }
    catch (error) {
        return next(error)
    }
})

/** Returns a company. */
companiesRouter.get('/:code', async function (req, res, next) {
    console.log('/companies/:code - GET')
    try {
        let code = req.params.code
        // console.log(code)
        const results = await db.query(`
            SELECT code, name, description 
            FROM companies 
            WHERE code = $1;`, [code])
        // console.log(results)
        const company = results.rows[0]
        // console.log(company)
        if (!company) {
            throw new NotFoundError()
        }
        return res.json({ company })// TODO  - check formatting
    }
    catch (error) {
        return next(error)
    }
})

/** Adds a new company. */
companiesRouter.post('/', async function (req, res, next) {
    console.log('/companies/ - POST')
    try {
        //destructure to code, name and company 
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

/** Adds a new company. */
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


/** Edit an existing company */
/*
PUT /companies/[code]
Edit existing company.
Should return 404 if company cannot be found.
Needs to be given JSON like: {name, description}
Returns update company object: {company: {code, name, description}}
*/

/** Delete a company */
/*
DELETE /companies/[code]
Deletes company.
Should return 404 if company cannot be found.
Returns {status: "deleted"}
*/


//Export
module.exports = companiesRouter;