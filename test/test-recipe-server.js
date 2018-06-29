'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Recipes', function () {
  before(function(){
    return runServer();
  });
  after(function() {
    return closeServer();
  });
  it('should list items on GET', function () {
    return chai
      .request(app)
      .get('/recipes')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');

        // because we create three items on app load
        expect(res.body.length).to.be.at.least(1);
        // each item should be an object with key/value pairs
        // for `id`, `name` and `checked`.
        const expectedKeys = ['id', 'name', 'ingredients'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  it('should add an item on POST', function () {
    const newItem = { name: 'cake', ingredients: ['chocolate', 'eggs']};
    return chai
      .request(app)
      .post('/recipes')
      .send(newItem)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'name', 'ingredients');
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(
          Object.assign(newItem, {id: res.body.id })
        );
      });
  });

  // PUT recipes test 

  it('should update items on PUT', function() {
    // test update item
    const newUpdate = {
      name: 'chocolate egg cake',
      ingredients: ['chocolate', 'more chocolate', 'eggs']
    };

    return  (
      chai
        .request(app)
        .get('/recipes')
        .then(function(res) {
          newUpdate.id = res.body[0].id;
          return chai
            .request(app)
            .put(`/recipes/${newUpdate.id}`)
            .send(newUpdate);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.deep.equal(newUpdate);
        })
    );
  });

  // DELETE recipes test

  it('should delete recipe on DELETE', function() {
    return (
      chai 
        .request(app)
        .get('/recipes')
        .then(function(res) {
          return chai.request(app).delete(`/recipes/${res.body[0].id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        })
    )
  })

});