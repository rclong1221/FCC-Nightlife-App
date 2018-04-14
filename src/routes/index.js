'use strict'

const path = process.cwd()
const Search = require(path + '/src/controllers/searchController.server.js')

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next()
		} else {
			res.redirect('/login')
		}
	}

	function loggedIn (req) {
		return (req.isAuthenticated()) ? true : false
	}

	app.route('/')
		.get(function (req, res) {
			res.render('index', {loggedIn: loggedIn(req)})
		})

	app.route('/login')
		.get(function (req, res) {
			res.render('login', {loggedIn: loggedIn(req)})
		})

	app.route('/logout')
		.get(function (req, res) {
			req.logout()
			res.redirect('/')
		})

	app.route('/api/user/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.twitter)
		})

	app.route('/auth/twitter')
		.get(passport.authenticate('twitter'))

	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter', {
			successRedirect: '/redirect',
			failureRedirect: '/login'
		}))

	app.route('/search/')
		.get(function (req, res) {
			res.render('search', {loggedIn: loggedIn(req)})
		})

	app.route('/api/search/')
		.post(Search.getBusinesses)

	app.route('/api/:id/going/')
		.post(isLoggedIn, Search.updateGoing)

	app.route('/redirect')
		.get(function (req, res) {
			res.render('redirect', {loggedIn: loggedIn(req)})
		})
}
