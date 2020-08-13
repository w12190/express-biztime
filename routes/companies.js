//Imports
const express = require('express');
const db = require('../db'); //TODO2 - if throws an error go ahead and add ./ .js
const {  ExpressError, NotFoundError, UnauthorizedError, BadRequestError, ForbiddenError, } = require('../expressError');

//Router
const companiesRouter = new express.Router();

/** Returns all companies. */
companiesRouter.get('/', async function(req, res, next){
    console.log('/companies - GET')
    try{
        const results = await db.query('SELECT code, name FROM companies;')
        const companies = results.rows
        if (companies.length === 0){
            throw new ExpressError('no companies found')
        }
        return res.json({companies})// TODO  - check formatting
    }
    catch(error){
        return next(error)
    }
})

/** Returns a company. */
companiesRouter.get('/:code', async function(req, res, next){
    console.log('/companies/:code - GET')
    try{
        let code = req.params.code
    // console.log(code)
        const results = await db.query(`SELECT code, name, description FROM companies WHERE code = $1;`, [code])
    // console.log(results)
        const company = results.rows[0]
    // console.log(company)
        if (!company){
            throw new NotFoundError()
        }
        return res.json({company})// TODO  - check formatting
    }
    catch(error){
        return next(error)
    }
})

/** Adds a new company. */
companiesRouter.post('/', async function(req, res, next){
    console.log('/companies/ - POST')
    try{
        let companyData = req.body
        const results = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`, [companyData.code, companyData.name, companyData.description])
        const company = results.rows[0]
        if (!company){
            throw new ExpressError('company was not created')
        }
        return res.status(201).json({company}) // Returns obj of new company: {company: {code, name, description}}
    }
    catch(error){
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