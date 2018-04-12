require('dotenv').config();

const uuid = require('node-uuid');

const bcryptHelper = require('./bcrypt-helper').bcryptHelper;
const express = require('express');
const app = express();
const url = require('url');

var cookieSession = require('cookie-session')
var UserDal = require('./dals/user-dal');

app.use(express.static('public'));

app.use(cookieSession({
	genid: function (req) {
		return uuid();
	},
	keys: [process.env.SESSION_SECRET],
	maxAge: 24 * 60 * 60 * 1000, //1 day
	secure: false
}));

var isUserLoggedIn = (request, response, next) => {
	if (!request.session.user_id) {
		response.redirect('/login');
	} else {
		next();
	}
};

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", isUserLoggedIn, (request, response) => {

	response.sendFile(__dirname + '/views/index.html')
})

app.get("/login", (request, response, next) => {
	if (request.session.user_id) {
		response.redirect('/');
	} else {
		next();
	}
}, (request, response) => {

	response.sendFile(__dirname + '/views/logIn.html')
})

app.get('/logout', (req, res) => {
	if (req.session.user_id) {
		res.clearCookie('user_sid');
	}

	res.redirect('/login');
});

app.get("/authenticate", (request, response) => {

	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;

	let errorMessage = `You are trying to login with an incorrect user or password. Please try again.`;
	new UserDal().getUser(query.user, function (error, data) {

		if (error) {
			//TODO: handle error
		} else if (data) {
			bcryptHelper.comparePassword(query.password, data.password._, function (error, equals) {

				if (equals) {

					request.session.user_id = data.RowKey._;
					response.status(200).send(data.RowKey._);//todo: token
				}
				else {

					response.status(401).send(errorMessage);
				}
			});
		}
		else {
			response.status(401).send(errorMessage);
		}
	});
});

app.get("/signin", (request, response) => {

	response.sendFile(__dirname + '/views/signIn.html')
});

app.get("/signInUser", (request, response) => {

	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;

	if (!query.password) {

		response.status(400).send(`The password is required.`);
		return;
	}

	if (!query.user) {

		response.status(400).send(`The user is required.`);
		return
	}

	var passwordValidator = require('password-validator');
	var schema = new passwordValidator();

	schema
		.is().min(8)                                    // Minimum length 8
		.is().max(100)                                  // Maximum length 100
		.has().uppercase()                              // Must have uppercase letters
		.has().lowercase()                              // Must have lowercase letters
		.has().digits()                                 // Must have digits
		.has().not().spaces();                          // Should not have spaces

	if (!schema.validate(query.password)) {

		response.status(401).send(`The password criteria doesn't match.`);

		return;
	}

	var userDal = new UserDal();

	userDal.exist(query.user, function (error, exists) {

		if (error) {
			//TODO: handle error
		}
		else if (exists) {

			//TODO: duplicate error
			response.status(401).send(`You are trying to sigin with an existing user. Please try again.`);

		}
		else {

			bcryptHelper.cryptPassword(query.password, function (error, passwordHash) {

				userDal.create(query.user, passwordHash, function (error) {

					if (error == null) {

						response.redirect('/login');
					}
					else {

					}
				});
			});
		}
	});
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
	console.log(`Your app is listening on port ${listener.address().port}`)
})