const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const mysql = require('mysql');
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + '/dist/mean')));
app.use(session({
	secret: "jalksdgsmlcjgmfslgd794533lk",
	saveUninitialized: true,
	resave: false
}))
//mysql connection
const conn = mysql.createConnection({
	host : 'sql12.freemysqlhosting.net',
	database : 'sql12249402',
	user : 'sql12249402',
	password : 'HmT3WKIckr'
});
conn.connect((err) => {
	if(err) throw err;
	console.log('mySql database connected!');
});
// angular ui 
app.get('/', (req, res, next) => {
	res.sendFile(path.join(__dirname));
});
//list product item
app.get('/api/product', (req, res) => {
	res.send(JSON.stringify(
		[{ "id": 1, "name": "HeadPhone"  },
		{ "id": 2, "name": "Battery"  },
		{ "id": 3, "name": "Iphone"  },
		{ "id": 4, "name": "Lapto"  },
		{ "id": 5, "name": "Speaker"  }]
	));
});
// login post
app.post('/api/login', async (req, res) => {
	const {email, password} = req.body;
	if(email.length != 0 && password.length !=0){
		const sql = "SELECT * FROM users WHERE email = '"+ email +"' && password = '"+ password +"'";
		conn.query(sql, (err, result) => {
			if(err) throw err;
			if(result.length !== 0){
				res.send(JSON.stringify({"success":true, "msg":"successfully logined!"}));
				req.session.user = email;
				req.session.save();
			}
			else{
				res.send(JSON.stringify({"success":false, "msg":"Invalid username or password!", "class": "bg-warning font-weight-bold text-center alert text-dark"}));
			}
		})
	}
	else{
		res.send(JSON.stringify({"success":false, "msg":"Please fill all your credential!", "class": "bg-danger font-weight-bold text-center alert text-white"}));
	}
});
//login resgister
app.post('/api/register' , (req, res) => {
	const {full_name, email, password} = req.body;
	if(full_name.length != 0 && email.length != 0 && password.length !=0){
		const sql = "INSERT INTO users (full_name, email, password) VALUES ('"+full_name+"','"+email+"', '"+password+"')";
		conn.query(sql, (err, result) => {
			if(err) throw err;
			res.send(JSON.stringify(
				{"success":true,"message":"your data has been registered successfully!","class":"bg-success font-weight-bold text-center alert text-white"}
			))
		});
		const insert = "INSERT INTO user_profile ( email ) VALUES ('"+email+"')";
		conn.query(insert, (err, data) => {
			if(err) throw err;
		})
	}else{
		res.send(JSON.stringify(
			{"success":false,"message":"Please fill your credential!","class":"bg-danger font-weight-bold text-center alert text-white"}
		))
	}
});
// isloggedin
app.get('/api/isloggedin', (req, res) => {
	res.json(
		{ status: !!req.session.user }
	)
});
// prodcut items creating
app.post('/api/createproducts', (req, res) => {
	const { p_name, p_model, p_cost, p_height, p_weight, p_length, p_width } = req.body;
	if (p_name.length != 0 && p_model.length != 0 && p_cost.length != 0 && p_height.length != 0 && p_weight.length != 0 && p_length.length != 0 && p_width.length != 0){
		const sql = "INSERT INTO products (p_name, model, cost, height, weight, length, width) VALUES ('"+p_name+"','"+p_model+"','"+p_cost+"','"+p_height+"','"+p_weight+"','"+p_length+"','"+p_width+"')";
		conn.query(sql, (err, results) => {
			if(err) throw err;
			res.send(JSON.stringify(
				{"status":true,"msg":"Your Products successfully insterted!","class":"bg-success font-weight-bold text-center alert text-white"}
			))
		})
	} else {
		res.send(JSON.stringify(
			{"status":false,"msg":"Please fill all fields!","class":"bg-danger font-weight-bold text-center alert text-white"}
		))
	}
})
// editable Product
app.post('/api/editableproduct', (req, res) => {
	const sql = "SELECT * FROM products WHERE product_id = '"+req.body.product_id+"'";
	conn.query(sql, (err, result) => {
		if(err) throw err;
		res.send(JSON.stringify(result));
	})
});
// product update
app.post('/api/updateproduct', (req, res) => {
	const sql = "UPDATE products SET p_name = '"+req.body.u_name+"', model = '"+req.body.u_model+"', cost = '"+req.body.u_cost+"', height = '"+req.body.u_height+"', weight = '"+req.body.u_weight+"', length = '"+req.body.u_length+"', width = '"+req.body.u_width+"' WHERE product_id = '"+req.body.product_id+"'";
	conn.query(sql, (err, result) => {
		if(err) throw err;
		res.send(JSON.stringify(
			{"status":true,"msg":"Your procut has Updated!","class":"bg-success font-weight-bold text-center alert text-white"}
		))
	})
})
// product removal
app.post('/api/removeproduct', (req, res) => {
	const sql = "DELETE FROM products WHERE product_id = '"+req.body.product_id+"'";
	conn.query(sql, (err, data) => {
		if(err) throw err;
		res.send(JSON.stringify(
			{"status":true,"msg":"Your procut has deleted!","class":"bg-danger font-weight-bold text-center alert text-white"}
		))
	});
})
// product items getting
app.get('/api/productitems', (req, res) => {
	const sql = "SELECT * FROM products";
	conn.query(sql, (err, result) => {
		if(err) throw err;
		res.send(JSON.stringify(result))
	})
});
// profileDetail getting
app.post('/api/profiledetail', (req, res) => {
	const sql = "SELECT * FROM user_profile WHERE email = '"+req.body.email+"'";
	conn.query(sql, (err, result) => {
		if(err) throw err;
		res.send(JSON.stringify(result))
	})
})
// profileDetail setting into DB
app.post('/api/updateprofile', (req, res) => {
	console.log(req.body);
	// const new_sql = "UPDATE users SET email = '"+req.body.email+"'";
	// conn.query(new_sql, (err, result) => {
	// 	if (err) throw err;
	// });
	const sql = "UPDATE user_profile SET first_name = '"+req.body.first_name+"', last_name = '"+req.body.last_name+"', phone_number = '"+req.body.phone_number+"', date_of_birth = '"+req.body.date_of_birth+"', age = '"+req.body.age+"', gender = '"+req.body.gender+"', address = '"+req.body.address+"' WHERE email = '"+req.body.email+"'";
	conn.query(sql, (err, data) => {
		if (err) throw err;
		res.send(JSON.stringify({"status": true}))
	})
});
//log out
app.get('/api/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) throw err;
		res.send(JSON.stringify({"status": true}))
	});
});
// session data
app.get('/api/data', (req, res) => {
	if(req.session.user != undefined) {
		res.send(JSON.stringify({"status": true, "userId": req.session.user }))
	} else {
		res.send(JSON.stringify({"status": false, "userId": req.session.user }))
	}
})
// server listening
// app.listen(1200, (err) => {
// 	if (err) throw err;
// 	console.log('Express Server Running at 1200!');
// });
