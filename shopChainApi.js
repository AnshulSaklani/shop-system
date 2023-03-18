let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Methods",
		"GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
	);
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});
//const port = 2410;
var port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

let { data } = require("./shopChainData.js");
let fs = require("fs");
let fname = "data.json";

app.get("/resetData", function(req,res){
	let shopData = JSON.stringify(data);
	fs.writeFile(fname, shopData, function(err) {
		if (err) res.status(404).send(err);
		else res.send("Data in file is reset");
	});
})

app.get("/shops", function(req, res){
	fs.readFile(fname, "utf8", function(err, data){
		if(err) res.status(404).send(err);
		else {
			let dataArray = JSON.parse(data);
			res.send(dataArray.shops);
		}
	});
});

app.post("/shops", function(req,res){
	let body = req.body;
	fs.readFile(fname, "utf8", function(err, data) {
		if (err) res.status(404).send(err);
		else {
			let dataArray = JSON.parse(data);
			let maxid = dataArray.shops.reduce((acc,curr) => (curr.shopId > acc ? curr.shopId : acc), 0);
			let newid = maxid + 1;
			let newShop = { ...body, shopId:newid };
			dataArray.shops.push(newShop);
			let data1 = JSON.stringify(dataArray);
			fs.writeFile(fname, data1, function (err) {
				if(err) res.status(404).send(err);
				else res.send(newShop);
			});
		}
	});
});

app.get("/products", function(req, res){
	fs.readFile(fname, "utf8", function(err, data){
		if(err) res.status(404).send(err);
		else {
			let dataArray = JSON.parse(data);
			res.send(dataArray.products);
		}
	});
});

app.post("/products", function(req,res){
	let body = req.body;
	fs.readFile(fname, "utf8", function(err, data) {
		if (err) res.status(404).send(err);
		else {
			let dataArray = JSON.parse(data);
			let maxid = dataArray.products.reduce((acc,curr) => (curr.productId > acc ? curr.productId : acc), 0);
			let newid = maxid + 1;
			let newProduct = { ...body, productId:newid };
			dataArray.products.push(newProduct);
			let data1 = JSON.stringify(dataArray);
			fs.writeFile(fname, data1, function (err) {
				if(err) res.status(404).send(err);
				else res.send(newProduct);
			});
		}
	});
});

app.put("/products/:productId", function(req,res){
	let body = req.body;
	let productId = +req.params.productId;
	fs.readFile(fname, "utf8", function(err, data) {
		if (err) res.status(404).send(err);
		else {
			let dataArray = JSON.parse(data);
			let index = dataArray.products.findIndex(st => Number(st.productId) === Number(productId));
			if (index>=0) {
				let updatedProduct = {...dataArray.products[index],...body};
				dataArray.products[index] = updatedProduct;
				let data1 = JSON.stringify(dataArray);
				fs.writeFile(fname, data1, function (err) {
				if(err) res.status(404).send(err);
				else res.send(updatedProduct);
			});
			}
			else res.status(404).send("No product found");
		}
	});
});

app.get("/purchases", function(req, res){
	fs.readFile(fname, "utf8", function(err, data){
		if(err) res.status(404).send(err);
		else {
			let dataArray = JSON.parse(data);
			res.send(dataArray.purchases);
		}
	});
});

app.get("/purchases/shops/:shopId", function(req, res){
	let shopId = +req.params.shopId;
	fs.readFile(fname, "utf8", function(err, data){
		if(err) res.status(404).send(err);
		else {
			let dataArray = JSON.parse(data);
			let arr1 = dataArray.purchases.filter((st) => st.shopId === shopId);
			res.send(arr1);
		}
	});
});

app.get("/purchases/products/:productid", function(req, res){
	let productid = +req.params.productid;
	fs.readFile(fname, "utf8", function(err, data){
		if(err) res.status(404).send(err);
		else {
			let dataArray = JSON.parse(data);
			let arr1 = dataArray.purchases.filter((st) => st.productid === productid);
			res.send(arr1);
		}
	});
});

app.get("/purchases", function(req, res) {
	let st1 = req.query.shop;
	let pr1 = req.query.product;
	let sort = req.query.sort;
	let arr1 = data.purchases;

	if(st1) {
		arr1 = arr1.filter((a) => a.shopId === st1);
	}
	if(pr1) {
		arr1 = arr1.filter((a) => car.productid === pr1);
	}
	if(sort) {
		arr1 = (sort === "QtyAsc") ? arr1.sort((a1, a2) => a1.quantity - a2.quantity) :
		(sort === "QtyDesc") ? arr1.sort((a1, a2) => a2.quantity - a1.quantity) :
		(sort === "ValueAsc") ? arr1.sort((a1, a2) => (a1.price*a1.quantity) - (a2.price*a2.quantity)) :
		(sort === "ValueDesc") ? arr1.sort((a1, a2) => (a2.price*a2.quantity) - (a1.price*a1.quantity)) :
		arr1;
	}
	res.send(arr1);
});

app.get("/totalPurchase/shop/:id", function(req, res){
	let shopId = +req.params.id;
	fs.readFile(fname, "utf8", function(err, data){
		if(err) res.status(404).send(err);
		else {
			let dataArray = JSON.parse(data);
			let arr1 = dataArray.purchases.filter((st) => st.shopId === shopId);
			let prodArr = arr1.reduce((acc,curr) => (acc.find(a => a === Number(curr.productid))) ? acc : [...acc, Number(curr.productid)], []);
			let arr2 = [];
			for(let i=0; i<prodArr.length; i++) {
				let id = prodArr[i];
				let totalQty = arr1.reduce((acc, curr) => (curr.productid === id) ? acc + curr.quantity : acc, 0);
				let price = arr1.reduce((acc, curr) => (curr.productid === id) ? curr.price : acc, 0);
				let name =  dataArray.products.reduce((acc, curr) => (Number(curr.productId) === id) ? curr.productName : acc, "");
				let category =  dataArray.products.reduce((acc, curr) => (Number(curr.productId) === id) ? curr.category : acc, "");
				let desc =  dataArray.products.reduce((acc, curr) => (Number(curr.productId) === id) ? curr.description : acc, "");
				let purjson = {};
				purjson.productid = prodArr[i];
				purjson.TotalQuantity = totalQty;
				purjson.price = price;
				purjson.productName = name;
				purjson.category = category;
				purjson.description = desc;
				arr2.push(purjson);
			}
			res.send(arr2);
		}
	});
});
app.get("/totalPurchase/product/:id", function(req, res){
	let productid = +req.params.id;
	fs.readFile(fname, "utf8", function(err, data){
		if(err) res.status(404).send(err);
		else {
			let dataArray = JSON.parse(data);
			let arr1 = dataArray.purchases.filter((st) => st.productid === productid);
			let totalPurchase = arr1.reduce((acc,curr) => (acc = curr.quantity + acc), 0);
			res.sendStatus(totalPurchase);
		}
	});
});

app.post("/purchases", function(req,res){
	let body = req.body;
	fs.readFile(fname, "utf8", function(err, data) {
		if (err) res.status(404).send(err);
		else {
			let dataArray = JSON.parse(data);
			let maxid = dataArray.purchases.reduce((acc,curr) => (curr.purchaseId > acc ? curr.purchaseId : acc), 0);
			let newid = maxid + 1;
			let newPurchase = { ...body, purchaseId:newid };
			dataArray.purchases.push(newPurchase);
			let data1 = JSON.stringify(dataArray);
			fs.writeFile(fname, data1, function (err) {
				if(err) res.status(404).send(err);
				else res.send(newPurchase);
			});
		}
	});
});
