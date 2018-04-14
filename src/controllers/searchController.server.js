const User = require('../models/users.js').User
const Business = require('../models/businesses.js')
const Request = require('request')

class Search {
  static getBusinesses(req, res) {
    // Get Yelp responses
    // To decrease the load on Yelp's servers, we limit our query
    // to a low number on server side
    var options = {
      method: 'GET',
      url: 'https://api.yelp.com/v3/businesses/search',
      type: 'json',
      qs: { category: 'nightlife', location: req.body.location, limit: 50 },
      headers: {
        'postman-token': 'ac2a1b10-5ce0-d01d-9480-6a706a42a88b',
        'cache-control': 'no-cache',
        authorization: `Bearer ${process.env.YELP_KEY}`
      }
    }

    Request(options, function (error, response, body) {
      if (error) throw new Error(error)
      if (!body) console.error("No body")
      else if (!JSON.parse(body).businesses) {
        return res.json({ empty: true })

      } else {
        let returnData = {
          "businesses": JSON.parse(body).businesses,
          "going": null
        }

        let x = returnData.businesses.map((d, index) => { return d.id })

        Business.find({ 'yelp_id': { $in: x } })
          .exec(function (err, data) {
            if (err) throw err

            returnData.going = returnData.businesses.map((d) => {
              return (x.includes(d.yelp_id)) ? d.going : []
            })

            return res.json(returnData)
          })
      }
    })
  }

  static updateGoing(req, res) {
    let yelp_id = req.body.yelp_id
    let uid = req.user.twitter.id
    Business.findOne({ yelp_id: yelp_id })
      .exec(function (err, data) {
        if (err) throw err
        if (data === null) {
          let b = new Business({
            yelp_id: yelp_id,
            going: [uid]
          })
          b.save(function (err) {
            if (err) throw err
          })
          return res.json(b)
        } else {
          if (data.going.includes(uid)) {
            data.going = data.going.filter(function (user) {
              return user !== uid
            })
          } else { data.going.push(uid) }
          data.save(function (err) {
            if (err) throw err
          })
          return res.json(data)
        }
      })
  }
}

module.exports = Search
