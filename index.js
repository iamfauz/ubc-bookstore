// Require dependencies
var path = require('path');
var express = require('express');
var StoreDB = require('./StoreDB');

// Declare application parameters
var PORT = process.env.PORT || 3000;
var STATIC_ROOT = path.resolve(__dirname, './public');

// Defining CORS middleware to enable CORS.
// (should really be using "express-cors",
// but this function is provided to show what is really going on when we say "we enable CORS")
function cors(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS,PUT");
  	next();
}

// Instantiate an express.js application
var app = express();
var db = StoreDB('mongodb://localhost:27017','cpen400a-bookstore');

// Configure the app to use a bunch of middlewares
app.use(express.json());							// handles JSON payload
app.use(express.urlencoded({ extended : true }));	// handles URL encoded payload
app.use(cors);										// Enable CORS

app.use('/', express.static(STATIC_ROOT));			// Serve STATIC_ROOT at URL "/" as a static resource

// Configure '/products' endpoint
app.get('/products', function(request, response) {

	let Query = {};
	if(request.query.maxPrice) {
		Query["maxPrice"] = request.query.maxPrice;
	}
	if(request.query.minPrice) {
		Query["minPrice"] = request.query.minPrice;
	}
	if(request.query.category) {
		Query["category"] = request.query.category;
	}

	db.getProducts(Query).then((products) => {
		//response.status = 200;
		response.json(products);
	}).catch((err) => {
		response.status(500).send(err);
	});

});

/* -------------------- TASK 8 ----------------------------*/

// Configure '/checkout' endpoint
app.post("/checkout", function(request, response) {
	var order = request.body;
  
	//Sanitizing request
	if (typeof order.client_id !== "string") response.status(500).send("Error..");
  
	if (typeof order.cart !== "object") response.status(500).send("Error.."); //maybe check if object is of type 'Cart'?
  
	if (typeof order.total !== "number") response.status(500).send("Error..");
  
	var promise = db.addOrder(order);
	promise
	  .then(function(id) {
		response.json({ _id: id });
	  })
	  .catch(function(err) {
		response.status(500).send("Error..");
	  });
  });

// Start listening on TCP port
app.listen(PORT, function(){
    console.log('Express.js server started, listening on PORT '+PORT);
});