process.env.NODE_ENV = "test"

const request = require("supertest")

const app = require("../app");

let db = require("../db")

let company = {code:"apple", name:"Apple", description:"technology company"};

beforeEach(async function(){
    // await db.query("DELETE FROM ")
})

afterEach(function(){

})

/**GET list of companies returns {companies:[{code, name}]} */
describe("GET/companies", function(){
    test("Get a list of companies", async function(){
        const resp = await request(app).get("/companies");
        expect(resp.body).toEqual({
            companies: [{company}]
        })
    })
})