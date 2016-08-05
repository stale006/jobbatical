var express = require('express');
var pg = require("pg");
var router = express.Router();

var conString = "pg://bauizhhf5c:gdyiohbzp1@assignment.codsssqklool.eu-central-1.rds.amazonaws.com:5432/bauizhhf5c_db";

var client = new pg.Client(conString);
client.connect();

/* GET active users listing. */
router.get('/', function(req, res, next) {


  if(!!req.query.id && Number.isInteger( parseInt(req.query.id) )) {
    var id = parseInt(req.query.id);
    var per_page = 5;
    var user = {};

    var getUser = client.query(`SELECT users.id, users.created_at,	users.name FROM users WHERE users.id = ${id}`);

    var getCompany = function(user) {
      var getCompanyQuery = client.query(`SELECT DISTINCT companies.id, companies.created_at,	companies.name, teams.contact_user FROM companies, teams
        WHERE companies.id = teams.company_id AND teams.user_id = ${id} ORDER BY companies.created_at LIMIT ${per_page}
        `);

      getCompanyQuery.on('end', function(result) {
        user.companies = result.rows;
        getCreatedListings(user);
      });
    }

    var getCreatedListings = function(user) {
      var getCreatedListingsQuery = client.query(`SELECT DISTINCT listings.id, listings.created_at,	listings.name, listings.description FROM listings
         WHERE listings.created_by = ${id} ORDER BY listings.created_at LIMIT ${per_page}
        `);

      getCreatedListingsQuery.on('end', function(result) {
        user.createdListings = result.rows;
        getApplications(user);
      });
    }

    var getApplications = function(user) {
      var getApplicationsQuery = client.query(`SELECT DISTINCT applications.id, applications.created_at, applications.cover_letter,
        applications.listing_id, listings.id AS listings_id, listings.name AS listings_name, listings.description AS listings_description
         FROM applications, listings
         WHERE applications.user_id = ${id} AND listings.id = applications.listing_id
         ORDER BY applications.created_at LIMIT ${per_page}
        `);

      getApplicationsQuery.on('end',function(result){
        user.applications = result.rows;
        client.end();
        res.send('User -> ' + JSON.stringify(user, null, "    ") );
      });

    }

    getUser.on('end', function(result){
      user = result.rows[0];
      console.log("user", result.rows);
      getCompany(user)
    });

    getUser.on('error', function(error) {
      //handle the error
      res.send('Cannot Find the user ' + error );

    });

  } else {
    res.send('User not found' );
  }

});

module.exports = router;
