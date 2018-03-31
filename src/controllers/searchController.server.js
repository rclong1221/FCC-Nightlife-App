const User = require('../models/users.js').User
const Business = require('../models/businesses.js')
const Request = require('request')

const Fake = {
    "businesses": [
        {
            "id": "pike-place-chowder-seattle",
            "name": "Pike Place Chowder",
            "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/ijju-wYoRAxWjHPTCxyQGQ/o.jpg",
            "is_closed": false,
            "url": "https://www.yelp.com/biz/pike-place-chowder-seattle?adjust_creative=C45P3lkycWxqVMzN6wN4Ag&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=C45P3lkycWxqVMzN6wN4Ag",
            "review_count": 5517,
            "categories": [
                {
                    "alias": "seafood",
                    "title": "Seafood"
                },
                {
                    "alias": "tradamerican",
                    "title": "American (Traditional)"
                },
                {
                    "alias": "soup",
                    "title": "Soup"
                }
            ],
            "rating": 4.5,
            "coordinates": {
                "latitude": 47.609411,
                "longitude": -122.341191
            },
            "transactions": [
                "delivery",
                "pickup"
            ],
            "price": "$$",
            "location": {
                "address1": "1530 Post Aly",
                "address2": "Ste 11",
                "address3": "",
                "city": "Seattle",
                "zip_code": "98101",
                "country": "US",
                "state": "WA",
                "display_address": [
                    "1530 Post Aly",
                    "Ste 11",
                    "Seattle, WA 98101"
                ]
            },
            "phone": "+12062672537",
            "display_phone": "(206) 267-2537",
            "distance": 1841.434454091374
        },
        {
            "id": "paseo-caribbean-food-fremont-seattle-2",
            "name": "Paseo Caribbean Food - Fremont",
            "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/_MvvxQSIoXtdI3FlT-SpXA/o.jpg",
            "is_closed": false,
            "url": "https://www.yelp.com/biz/paseo-caribbean-food-fremont-seattle-2?adjust_creative=C45P3lkycWxqVMzN6wN4Ag&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=C45P3lkycWxqVMzN6wN4Ag",
            "review_count": 4609,
            "categories": [
                {
                    "alias": "caribbean",
                    "title": "Caribbean"
                },
                {
                    "alias": "cuban",
                    "title": "Cuban"
                },
                {
                    "alias": "sandwiches",
                    "title": "Sandwiches"
                }
            ],
            "rating": 4.5,
            "coordinates": {
                "latitude": 47.65849,
                "longitude": -122.35031
            },
            "transactions": [
                "delivery",
                "pickup"
            ],
            "price": "$",
            "location": {
                "address1": "4225 Fremont Ave N",
                "address2": "",
                "address3": "",
                "city": "Seattle",
                "zip_code": "98103",
                "country": "US",
                "state": "WA",
                "display_address": [
                    "4225 Fremont Ave N",
                    "Seattle, WA 98103"
                ]
            },
            "phone": "+12065457440",
            "display_phone": "(206) 545-7440",
            "distance": 3830.483626032356
        }
    ],
    "total": 4400,
    "region": {
        "center": {
            "longitude": -122.3355102539,
            "latitude": 47.6254190476
        }
    }
}

class Search {
  static getBusinesses(req, res) {
    // Get Yelp responses
    // To decrease the load on Yelp's servers, we limit our query
    // to a low number on server side
    var options = {
      method: 'GET',
      url: 'https://api.yelp.com/v3/businesses/search',
      type: 'json',
      qs: { category: 'nightlife', location: req.body.location, limit: 20 },
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
        res.json({ empty: true })

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

            res.json(returnData)
          })
      }
    })

    // Get business likes
    // let returnData = {
    //   "businesses": Fake.businesses,
    //   "going": null
    // }
    //
    // let x = returnData.businesses.map((d, index) => { return d.id })
    //
    // Business.find({ 'yelp_id': { $in: x } })
    //   .exec(function (err, data) {
    //     if (err) throw err
    //
    //     returnData.going = returnData.businesses.map((d) => {
    //       return (x.includes(d.yelp_id)) ? d.going : []
    //     })
    //
    //     res.json(returnData)
    //   })
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
          res.json(b)
        } else {
          if (data.going.includes(uid)) {
            data.going = data.going.filter(function (user) {
              return user !== uid
            })
          } else { data.going.push(uid) }
          data.save(function (err) {
            if (err) throw err
          })
          res.json(data)
        }
      })
  }
}

module.exports = Search
