var inactiveTime = 0;
var intervalFunc = function() {
  inactiveTime = inactiveTime + 1;
  if (inactiveTime == 30000) {
    var ans = confirm('Hey there! Are you still planning to buy something?');
    if (ans) {
      inactiveTime = 0;
    } else {
      inactiveTime = 0;
    }
  }
};
var interval = setInterval(intervalFunc, 1000);

var Store = function(serverUrl) {
  this.serverUrl = serverUrl;
  this.stock = {};
  this.cart = {};
  this.onUpdate = null;
};

//Order Constuctor function
var Order = function() {
  this.client_id = "";
  this.cart = {};
  this.total = 0;
};

/** Method that returns a random integer from min to maz */
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/** Method that calculates that total amount due in the cart */
function calculateTotal(store) {
  var total = 0;
  for (var item in store.cart)
    total = parseInt(store.cart[item] * store.stock[item].price);

  return total;
}

Store.prototype.addItemToCart = function(itemName) {
  if (this.stock[itemName].quantity != 0) {
    //check if stock is available

    if (this.cart.hasOwnProperty(itemName))
      this.cart[itemName] = this.cart[itemName] + 1;
    else this.cart[itemName] = 1;

    this.stock[itemName].quantity--; //decreasing stock

    this.onUpdate(itemName);
  }
};

Store.prototype.removeItemFromCart = function(itemName) {
  if (this.cart.hasOwnProperty(itemName)) {
    this.cart[itemName] = this.cart[itemName] - 1;

    //Delete if No. of items becomes zero
    if (this.cart[itemName] == 0) delete this.cart[itemName];

    this.stock[itemName].quantity++; //increasing stock

    this.onUpdate(itemName);
  }
};

var store = new Store('http://localhost:3000');

store.onUpdate = function(itemName) {
  if (itemName == undefined) {
    renderProductList(document.getElementById('productView'), this);
  } else {
    var productDOM = document.getElementById('product-' + itemName);
    renderProduct(productDOM, store, itemName);
  }
  renderMenu(document.getElementById("menuView"), store);
  renderCart(document.getElementById("modal-content"), store);

};


/**
 * Method used for making AJAX calls
 */
var ajaxGet = function(url, onSuccess, onError) {
  var count = 0;
  var sendRequest = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    //Setting up event callbacks
    xhr.onload = function() {
      if (xhr.status == 200) {
        //Converting payload to JS object
        var result = JSON.parse(xhr.responseText);
        count = 0;
        onSuccess(result);
      } else {
        if (count > 3) onError(xhr.status);
        else {
          count++;
          sendRequest();
        }
      }
    };
    xhr.ontimeout = function() {
      if (count > 3) onError(xhr.status);
      else {
        count++;
        sendRequest();
      }
    };
    xhr.timeout = 5000; // Wait at most 5000 ms for a response
    console.log('Sending request ' + xhr);
    xhr.send();
  };
  return sendRequest;
};

/**
 * Ajax post call
 */
var ajaxPost = function(url, data, onSuccess, onError) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");

  //Setting up event callbacks
  xhr.onload = function() {
    if (xhr.status == 200) {
      //Converting payload to JS object
      var result = JSON.parse(xhr.responseText);
      onSuccess(result);
    } else {
      onError(xhr.status);
    }
  };

  xhr.ontimeout = function() {
    onError(xhr.status);
  };

  xhr.timeout = 5000; // Wait at most 5000 ms for a response
  console.log("Sending request " + xhr);
  xhr.send(JSON.stringify(data));
};

//Mapping between index and Product key
var productMap = [
  'Box1',
  'Box2',
  'Clothes1',
  'Clothes2',
  'Jeans',
  'Keyboard',
  'KeyboardCombo',
  'Mice',
  'PC1',
  'PC2',
  'PC3',
  'Tent'
];

var dispayed = [];

//Function called when Add to cart button is pressed
function onClickAddToCartButton(itemName) {
  clearInterval(interval);
  inactiveTime = 0;
  interval = setInterval(intervalFunc, 1000);
  store.addItemToCart(itemName);
}

//Function called when Remove from cart button is pressed
function onClickRemoveFromCartButton(itemName) {
  clearInterval(interval);
  inactiveTime = 0;
  interval = setInterval(intervalFunc, 1000);
  // console.log(itemName);
  store.removeItemFromCart(itemName);
}

//Task 6 -- Show Cart
function showCart(cart) {
  clearInterval(interval);
  inactiveTime = 0;
  interval = setInterval(intervalFunc, 1000);
  var modalOverlay = document.getElementById("modal-overlay")
  modalOverlay.style.display = "block";
  var cartModal = document.getElementById("modal")
  cartModal.style.display = "block";
  renderCart(document.getElementById("modal-content"), store)
}
//Event listner for show cart buttons.
document.getElementById('btn-show-cart').addEventListener('click', function() {
  onClickShowCartButton();
});

function onClickShowCartButton() {
  showCart(store.cart);
}

/* Assignment - 3 */

/** Method that renders a new product DOM */
function renderProduct(container, storeInstance, itemName) {
  //Clearing container
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  var product = document.createElement('div');
  product.className = 'productBox';

  // console.log(itemName);
  //Craeting image node
  var img = document.createElement('img');
  img.src = storeInstance.stock[itemName].imageUrl;

  //Craeting itemname node
  var item = document.createElement('p');
  var itemText = document.createTextNode(itemName);
  item.appendChild(itemText);

  //Creating price node
  var price = document.createElement('div');
  price.className = 'price';
  var priceText = document.createTextNode(storeInstance.stock[itemName].price);
  price.appendChild(priceText);

  //Creating add button node
  if (storeInstance.stock[itemName].quantity != 0) {
    var buttonAdd = document.createElement('button');
    buttonAdd.className = 'btn-add';
    var buttonAddText = document.createTextNode('Add To Cart');
    buttonAdd.addEventListener('click', function() {
      onClickAddToCartButton(itemName);
    });
    buttonAdd.appendChild(buttonAddText);
  }
  //Creating remove button node
  if (storeInstance.cart.hasOwnProperty(itemName)) {
    var buttonRemove = document.createElement('button');
    buttonRemove.className = 'btn-remove';
    var buttonRemoveText = document.createTextNode('Remove From Cart');
    buttonRemove.addEventListener('click', function() {
      onClickRemoveFromCartButton(itemName);
    });
    buttonRemove.appendChild(buttonRemoveText);
  }

  product.appendChild(img);
  product.appendChild(item);
  product.appendChild(price);

  if (storeInstance.stock[itemName].quantity != 0) {
    product.appendChild(buttonAdd);
  }

  if (storeInstance.cart.hasOwnProperty(itemName))
    product.appendChild(buttonRemove);

  container.appendChild(product);
}

/** Method that renders a new productList DOM */
function renderProductList(container, storeInstance) {
  //Clearing container
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  var productList = document.createElement('ul');
  productList.id = 'productList';

  for (let i = 0; i < productMap.length; i++) {
    //Create product DOM (li element)
    var product = document.createElement('li');
    product.id = 'product-' + productMap[i];
    product.className = 'product';

    renderProduct(product, storeInstance, productMap[i]);

    productList.appendChild(product); //Add product li to productList (ul)
  }

  container.appendChild(productList);
}

function renderCart(container, storeInstance) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  // Create the headings
  var cartTable = document.createElement('table');
  cartTable.id = 'cartTable';
  var headings = document.createElement('tr');
  var h1 = document.createElement('th');
  h1.innerHTML = 'Item';
  var h2 = document.createElement('th');
  h2.innerHTML = 'Quantity';
  var h3 = document.createElement('th');
  h3.innerHTML = 'Add';
  var h4 = document.createElement('th');
  h4.innerHTML = 'Remove';

  //Populate the table
  headings.appendChild(h1);
  headings.appendChild(h2);
  headings.appendChild(h3);
  headings.appendChild(h4);

  cartTable.appendChild(headings);
  var price = 0
  for (item in storeInstance.cart) {
    //Create the elements
    var itemRow = document.createElement('tr');
    var itemNameCell = document.createElement('td');
    var itemQuantityCell = document.createElement('td');
    var addButtonCell = document.createElement('td');
    var subButtonCell = document.createElement('td');
    var addButton = document.createElement('button');
    var addButtonText = document.createTextNode('+');
    var subButton = document.createElement('button');
    var subButtonText = document.createTextNode('-');

    //Populate the elements
    itemNameCell.innerHTML = item;
    itemQuantityCell.innerHTML = storeInstance.cart[item];

    addButton.addEventListener('click', function() {
      onClickAddToCartButton(item);
    });
    subButton.addEventListener('click', function() {
      onClickRemoveFromCartButton(item);
    });
    addButton.appendChild(addButtonText);
    subButton.appendChild(subButtonText);
    addButtonCell.appendChild(addButton);
    subButtonCell.appendChild(subButton);
    itemRow.appendChild(itemNameCell);
    itemRow.appendChild(itemQuantityCell);
    itemRow.appendChild(addButtonCell);
    itemRow.appendChild(subButtonCell);
    cartTable.appendChild(itemRow);

    var itemPrice = storeInstance.stock[item].price * storeInstance.stock[item].quantity
    price = price + itemPrice

  }
  var priceRow = document.createElement('tr');
  var priceCell = document.createElement('td');
  priceCell.innerHTML = "Total Price : " + price
  priceRow.appendChild(priceCell)
  cartTable.appendChild(priceRow)

  //Checkout button 
  var checkoutButtonCell = document.createElement('td');
  var checkoutButton = document.createElement('button');
  var checkoutButtonText = document.createTextNode('Checkout');
  checkoutButton.appendChild(checkoutButtonText)
  checkoutButtonCell.appendChild(checkoutButton)
  checkoutButton.addEventListener('click', function() { 
    this.disabled = true
    storeInstance.checkOut(onSync)
    this.disabled = false
  });

  cartTable.appendChild(checkoutButtonCell)

  container.appendChild(cartTable);
}

document.getElementById('btn-hide-cart').addEventListener('click', function() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('modal').style.display = 'none';
});

Store.prototype.synchWithServer = function(onSync) {
  ajaxGet(
    this.serverUrl + '/products',
    function(response) {
      console.log(response);
      var delta = getDelta(this.stock, response);
      this.stock = response;
      if (onSync){
        onSync(delta);
      }
      this.onUpdate()
    },
    function(error) {
      console.log(error);
    }
  )();
}

Store.prototype.queryProducts = function(query, callback){
	var self = this;
	var queryString = Object.keys(query).reduce(function(acc, key){
			return acc + (query[key] ? ((acc ? '&':'') + key + '=' + query[key]) : '');
		}, '');
	ajaxGet(this.serverUrl+"/products?"+queryString,
		function(products){
			Object.keys(products)
				.forEach(function(itemName){
					var rem = products[itemName].quantity - (self.cart[itemName] || 0);
					if (rem >= 0){
						self.stock[itemName].quantity = rem;
					}
					else {
						self.stock[itemName].quantity = 0;
						self.cart[itemName] = products[itemName].quantity;
						if (self.cart[itemName] === 0) delete self.cart[itemName];
					}
					
					self.stock[itemName] = Object.assign(self.stock[itemName], {
						price: products[itemName].price,
						label: products[itemName].label,
						imageUrl: products[itemName].imageUrl
					});
				});
			self.onUpdate();
			callback(null, products);
		},
		function(error){
			callback(error);
		}
	)();
}

function renderMenu(container, storeInstance){
	while (container.lastChild) container.removeChild(container.lastChild);
	if (!container._filters) {
		container._filters = {
			minPrice: null,
			maxPrice: null,
			category: ''
		};
		container._refresh = function(){
			storeInstance.queryProducts(container._filters, function(err, products){
					if (err){
						alert('Error occurred trying to query products');
						console.log(err);
					}
					else {
						displayed = Object.keys(products);
						renderProductList(document.getElementById('productView'), storeInstance);
					}
				});
		}
	}

	var box = document.createElement('div'); container.appendChild(box);
		box.id = 'price-filter';
		var input = document.createElement('input'); box.appendChild(input);
			input.type = 'number';
			input.value = container._filters.minPrice;
			input.min = 0;
			input.placeholder = 'Min Price';
			input.addEventListener('blur', function(event){
				container._filters.minPrice = event.target.value;
				container._refresh();
			});

		input = document.createElement('input'); box.appendChild(input);
			input.type = 'number';
			input.value = container._filters.maxPrice;
			input.min = 0;
			input.placeholder = 'Max Price';
			input.addEventListener('blur', function(event){
				container._filters.maxPrice = event.target.value;
				container._refresh();
			});

	var list = document.createElement('ul'); container.appendChild(list);
		list.id = 'menu';
		var listItem = document.createElement('li'); list.appendChild(listItem);
			listItem.className = 'menuItem' + (container._filters.category === '' ? ' active': '');
			listItem.appendChild(document.createTextNode('All Items'));
			listItem.addEventListener('click', function(event){
				container._filters.category = '';
				container._refresh()
			});
	var CATEGORIES = [ 'Clothing', 'Technology', 'Office', 'Outdoor' ];
	for (var i in CATEGORIES){
		var listItem = document.createElement('li'); list.appendChild(listItem);
			listItem.className = 'menuItem' + (container._filters.category === CATEGORIES[i] ? ' active': '');
			listItem.appendChild(document.createTextNode(CATEGORIES[i]));
			listItem.addEventListener('click', (function(i){
				return function(event){
					container._filters.category = CATEGORIES[i];
					container._refresh();
				}
			})(i));
	}
}


Store.prototype.checkOut = function() {
  //Creating order
  let order = new Order();
  order.client_id = getRndInteger(0, 1000).toString();
  order.cart = store.cart;
  order.total = calculateTotal(store);

  //Making POST Ajax call for checkout
  ajaxPost(
    this.serverUrl+"/checkout",
    order,
    function(response) {
      console.log(response);
      alert("Order Placed Succesfully");
      store.cart = {};
      store.onUpdate();
    },
    function(error) {
      console.log(error);
      alert(
        "Error: Your order could not be placed at this time. Please, try again later"
      );
    }
  );
};

function getDelta(prevStock, newStock) {
  var delta = {};
  for(var i = 0, len = productMap.length; i < len; i++) {
    var product = productMap[i];
    var prevData = prevStock[product] || {};
    var newData = newStock[product];

    if (prevData.price !== newData.price || prevData.quantity !== newData.quantity) {
      delta[product] = {}
      if (prevData.price !== newData.price) {
        delta[product].price = newData.price - (prevData.price || 0);
      }
      if (prevData.quantity !== newData.quantity) {
        delta[product].quantity = newData.quantity - (prevData.quantity || 0)
      }
    }
  }
  return delta;
}


store.synchWithServer(function(delta){
  for(let i = 0; i < Object.keys(delta).length; i++){
    displayed[i] = Object.keys(delta)[i];
  }
});

