var express = require('express');
var pg = require("pg");
var router = express.Router();

var conString = "pg://bauizhhf5c:gdyiohbzp1@assignment.codsssqklool.eu-central-1.rds.amazonaws.com:5432/bauizhhf5c_db";

var client = new pg.Client(conString);
client.connect();

/* GET active users listing. */
router.get('/', function(req, res, next) {

  var page = !!req.query.page && Number.isInteger( parseInt(req.query.page) ) ? parseInt(req.query.page)  : 1;
  var per_page = 5;

  //var query = client.query("SELECT id, created_at,name FROM users INNER JOIN applications ON applications.user_id = users.id");
  var query = client.query(`
    	SELECT users.id, users.created_at,	users.name, COUNT(applications.listing_id) AS count, array_agg(listings.name) AS listings
    	FROM users
    	LEFT JOIN applications ON users.id=applications.user_id AND applications.created_at > NOW() - INTERVAL '7 days'
    	LEFT JOIN listings ON users.id=listings.created_by
    	GROUP BY users.id
      ORDER BY count DESC
      LIMIT ${per_page}
    	OFFSET ${page}
    	`);


  query.on("row", function (row, result) {
      result.addRow(row);
  });
  query.on("end", function (result) {
      console.log(JSON.stringify(result.rows, null, "    "));
      client.end();
      res.send('ActiveUsers -> ' + JSON.stringify(result.rows, null, "    ") );
  });
});

module.exports = router;
