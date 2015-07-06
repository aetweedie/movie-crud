var routes = require('routes')();
var fs = require('fs');
var db = require('monk')('localhost/movies');
var movies = db.get('movies');
var qs = require('qs');
var view = require('mustache');
var mime = require('mime');

routes.addRoute ('/movies', function (req, res, url) {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'text/html');
      movies.find({}, function (err, docs) {
        var file = fs.readFileSync('templates/movies/index.html');
        var template = view.render(file.toString(), { movies: docs });
        res.end(template);
      });
    }
  if (req.method === 'POST') {
    var data = '';
    req.on ('data', function (chunk) {
      data += chunk;
    });
    req.on('end', function() {
      var movie = qs.parse(data);
      movies.insert(movie, function (err, doc) {
        if (err) throw (err);
        res.writeHead(302, {'location': '/movies'});
        res.end();
      });
    });
  }
});

routes.addRoute('/movies/new', function(req, res, url) {
  res.setHeader('Content-Type', 'text/html');
    var file = fs.readFileSync('templates/movies/new.html');
    var template = view.render(file.toString(), {});
    res.end(template);
});

routes.addRoute ('/movies/:id', function (req, res, url) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    url = url.params.id;
    movies.findOne({_id: url}, function (err, docs) {
      var file = fs.readFileSync('templates/movies/show.html');
      var template = view.render(file.toString(), {
        title: docs.title,
        director: docs.director,
        year: docs.year,
        rating: docs.rating,
        posterUrl: docs.posterUrl
        });
      res.end(template);
    });
  }
});

routes.addRoute('/movies/:id/edit', function (req, res, url) {
  if (req.method === 'GET') {
    movies.findOne({ _id: url.params.id }, function(err, doc) {
      if (err) console.log(err);
      var file = fs.readFileSync('templates/movies/edit.html');
      var template = view.render(file.toString(), doc);
      res.end(template);
    });
  }
});

routes.addRoute('/movies/:id/update', function (req, res, url) {
  if (req.method === 'POST') {
    var data = '';
    req.on('data', function (chunk) {
      data += chunk;
    });
    req.on('end', function () {
      var movie = qs.parse(data);
      movies.update({_id: url.params.id}, movie, function(err, doc) {
        if (err) console.log(err);
        res.writeHead(302, {'Location': '/movies'});
        res.end();
      });
    });
  }
});

routes.addRoute('/movies/:id/delete', function(req, res, url){
  if (req.method === 'POST') {
    res.setHeader('Content-Type', 'text/html');
    movies.remove({_id: url.params.id}, function (err, doc) {
      if (err) console.log(err);
      res.writeHead (302, {location: '/movies'});
      res.end();
    });
  }
});

routes.addRoute ('/public/*', function(req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url));
  fs.readFile ('.' + req.url, function(err, file){
    if (err) {
      res.setHeader('Content-Type', 'text/html');
      res.end('404');
    }
    res.end(file);
  });
});

routes.addRoute('/', function (req, res, url) {
  if (req.method === 'GET') {
    movies.find({}, function(err, doc) {
      if (err) console.log(err);
      var file = fs.readFileSync('templates/movies/landing.html');
      var template = view.render(file.toString(), doc);
      res.end(template);
    });
  }
});

module.exports = routes;
