require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const body_parser = require('body-parser');
const app = express();
const urlParser = require('url');
const ShortURL = require('./models/urlSchema');

app.use(body_parser.urlencoded({ extended: false }));

// Basic Configuration
const port = process.env.PORT || 4000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// we don't want to start our server before the db is ready.
//  that is why we have put it inside connection.on.
mongoose.connection.on('open', () => {
  app.listen(port, function () {
    console.log(`Listening on port ${port}`);
  });
})

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let global_url;

app.post('/api/shorturl/new', (req, res) => {
  let url = req.body.url;

  // checking with dns if the address is valid or not.
  dns.lookup(urlParser.parse(url).hostname, (err, address) => {
    if (!address) {
      res.send({ error: 'invalid url' });

    } else {
      // creating a mongoose record in accordance with the defined schema.
      const record = new ShortURL({
        original_url: url
      });
      record.save()
      global_url = url;
      res.redirect('/api/shorturl/new');
    };
  })

});


app.get('/api/shorturl/new', cors(), (req, res) => {

  ShortURL.find({ original_url: global_url }, function (err, docs) {
    if (!err) {
      let obj = {
        "original_url": docs[0].original_url,
        "short_url": docs[0].short_url
      }
      res.send(obj);
    }
    else {
      throw err;
    }
  });

});


app.get('/api/shorturl/:urlId', (req, res) => {
  let id = req.params['urlId'];

  ShortURL.find({ short_url: id }, (err, docs) => {
    if (!err) {
      res.redirect(docs[0].original_url)
    } else {
      throw err;
    }
  })
});
