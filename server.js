'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Specify a directory for static resources

app.use(express.static('./public'));
// define our method-override reference

app.use(methodOverride('_method'));
// Set the view engine for server-side templating
app.set('view engine', 'ejs');
// Use app cors
app.use(cors());

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
// Array
let simpsons = [];
// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/', homePageHandler);
app.get('/favorite-qoutes', renderFavorite);
app.post('/favorite-qoutes', favoriteHandler);
app.delete('/favorite-quotes/:id',deleteHandler);
app.put('/favorite-quotes/:id',updateHandler);
// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --
function homePageHandler(req, res) {
    let url = 'https://thesimpsonsquoteapi.glitch.me/quotes?count=10';
    superagent.get(url).set('User-Agent', '1.0').then(data => {
        // console.log(data.body);
        data.body.forEach(x => {
            simpsons.push(new Simpson(x.character, x.quote, x.image, x.characterDirection));
        })
        // console.log(simpsons);
        res.render('index', { data: simpsons });
    })
}
function favoriteHandler(req, res) {
    let data = req.body;
    let SQL = 'INSERT INTO simpsons (character,quote,image,direction) VALUES ($1,$2,$3,$4) RETURNING *;'
    let values = [data.character, data.quote, data.image, data.direction];
    client.query(SQL, values).then(data => {
        res.redirect('/');
        // res.redirect('/favorite-qoutes');
    })
}
function renderFavorite(req, res) {
let SQL = 'SELECT * FROM simpsons;';
client.query(SQL).then(Result =>{
    // console.log("dataaaaaaaaaaaaaa",Result.rows);
     res.render('/favorite-qoutes',{data : Result.rows});
});
}
function deleteHandler(req,res){
    let SQL = 'DELETE FROM simpsons WHERE id=$1;';
let value = req.params.id;
client.query(SQL,value).then(()=> res.redirect('/'));
}
function updateHandler(req,res){
    let SQL = 'UPDATE simpsons SET character=$1, quote=$2 , image=$3 , direction=$4 WHERE id=$5;';
    let values=[req.body.character,req.body.quote,req.body.image,req.body.direction,req.params.id];
    client.query(SQL,values).then(()=> res.redirect('/'));
}
// helper functions
function Simpson(character, quote, image, direction) {
    this.character = character;
    this.quote = quote;
    this.image = image;
    this.direction = direction;
    // simpsons.push(this);
};
// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);
