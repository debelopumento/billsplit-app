var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../server.js')


var should = chai.should()
var app = server.app
var storage = server.storage

const faker = require('faker')
const mongoose = require('mongoose')
var Bills = require('../models.js').Bills

chai.use(chaiHttp)


describe('index page', function() {
  it('exists', function(done) {
    chai.request(app)
      .get('/')
      .end(function(err, res) {
        res.should.have.status(200)
        res.should.be.html
        done()
    })
  })


  /*
  it('should list all/up-to-100 bills in database', function(done) {
	//let res
	chai.request(app)
		.get('/bills')
		.then(function(err, res) {
			console.log(101, err, res)
			res.should.have.status(200)
			res.body.bills.should.have.length.of.at.least(1)
			Bills
			.count()
			.then(function(count) {
				res.body.bills.should.have.length.of(count)
				done()
			})
   	})
    .catch(function (e) {
      console.log(103, e)
    })
  })
  */
  

  
  it('should delete a bill', function() {
  	let bill
  	Bills
  	.findOne()
  	.exec()
  	.then(function(_bill) {
  		console.log(105, _bill)
      bill = _bill
  		return chai.request(app).delete(`/bills/${bill.id}`)
  	})
  	.then(function(res) {
  		res.should.have.status(204)
  		return Bills.findById(bill.id).exec()
  	})
  	.then(function(_bill) {
  		should.not.exist(_bill)
  	})
  })
  



})

	
