const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const PressureModel = require('./pressure.model');

mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('hello');
});

app.post('/pressure', async (req, res) => {
  const { pressure } = req.body;
  
  const newPressure = new PressureModel({
    time: new Date(),
    pressure
  });

  await newPressure.save();

  res.send({ newPressure });
});

app.get('/pressure', async (req, res) => {
  const allPressures = await PressureModel.find();
  res.send({ allPressures });
})

app.all('*', (req, res) => {
  res.status(404).send('Page not found.');
});

async function fetchHTML(url) {
  const { data } = await axios.get(url);
  return cheerio.load(data);
}

async function fetchNewData() {  
  
  // poll ARM IP for fresh data
  const $ = await fetchHTML('http://10.1.11.151');

  // scrape pressure readings
  const h3 = $('h3').first().text();

  const reg = new RegExp('Current Pressure in System: (.+) psi');
  const regExec = reg.exec(h3);
  const p = Number(regExec[1]);

  // save to DB
  const newPressure = new PressureModel({
    time: new Date(),
    pressure: p
  });
  await newPressure.save();

  console.debug('new pressure recorded ' + p + ' at ' + new Date().toLocaleTimeString());
}

app.listen(3000, () => {
  console.log('server running on 3000');

  setInterval( fetchNewData, 2000 );
});