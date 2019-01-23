var MongoClient = require('mongodb').MongoClient;	// require the mongodb driver

/**
 * Uses mongodb v3.1.9 - [API Documentation](http://mongodb.github.io/node-mongodb-native/3.1/api/)
 * StoreDB wraps a mongoDB connection to provide a higher-level abstraction layer
 * for manipulating the objects in our bookstore app.
 */
function StoreDB(mongoUrl, dbName){
	if (!(this instanceof StoreDB)) return new StoreDB(mongoUrl, dbName);
	this.connected = new Promise(function(resolve, reject){
		MongoClient.connect(
			mongoUrl,
			{
				useNewUrlParser: true
			},
			function(err, client){
				if (err) reject(err);
				else {
					console.log('[MongoClient] Connected to '+mongoUrl+'/'+dbName);
					resolve(client.db(dbName));
				}
			}
		)
	});
}

StoreDB.prototype.getProducts = function(queryParams){
	return this.connected.then(function(db) {
		let query = {};
		if (queryParams.minPrice) {
			query["price"] = {$gte: parseInt(queryParams.minPrice)}
		} 
		if (queryParams.maxPrice) {
			query["price"] = {$lte: parseInt(queryParams.maxPrice)}
		}

		if(queryParams.minPrice && queryParams.maxPrice) {
			query["price"] = {$lte: parseInt(queryParams.maxPrice), $gte: parseInt(queryParams.minPrice) }
		}
		if(queryParams.category) {
			query["category"] = queryParams.category;
		}

		let prod = db.products.find(query).toArray();
		let productsObject = {}
		if(prod.length != 0 ) {
			for(product in prod ) {
				productObject[product._id] =  {
					"lable" : product.lable,
					"price" : product.price,
					"quantity" : product.quantity,
					"imageUrl" : product.imageUrl,
				}
			}
		}
		return productsObject;
	});	
}


StoreDB.prototype.addOrder = function(order) {
	return this.connected.then(function(db) {
	  //Adding order to 'orders' collection
	  var objectId;
	  db.collection("orders").insert(order, function(err, orders) {
		if (err) console.log(err);
		objectId = orders[0]._id;
	  });
  
	  // Decrementing quantities from the 'products' collection
	  for (var item in order.cart) {
		db.collection("products").findOneAndUpdate(
		  { _id: item },
		  { $inc: { quantity: parseInt(order.cart[item]) * -1 } }
		);
	  }
	  return objectId;
	});
  };

module.exports = StoreDB;