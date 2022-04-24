const five = require('johnny-five');
const _ = require('lodash');
const moment = require('moment');
const request = require('request');

const WeatherDisplay = function(lcd) {
  this.lcd = lcd;

  // Current weather data (http://openweathermap.org/current)
  // http://openweathermap.org/weather-data
  //
  // Examples:
  // http://api.openweathermap.org/data/2.5/weather?units=metric&q=Taipei
  this._fetchWeatherData = function(callback) {
    const querystring = require('querystring');
    const qs = querystring.stringify({
      'APPID': process.env.APPID || '<YOUR_APPID>',
      'units': 'metric', // metric or imperial
      'q': 'Taipei' // city
    });
    const url = 'http://api.openweathermap.org/data/2.5/weather?' + qs;
    request(url, function(err, rsp, body) {
      if (err || rsp.statusCode !== 200) {
        err = err || new Error(body);
      }

      const data = JSON.parse(body);
      callback(err, data);
    });
  };
};

WeatherDisplay.prototype.load = function() {
  const lcd = this.lcd;

  lcd.clear();
  lcd.cursor(0, 0).print('Loading...');

  this._fetchWeatherData(function(err, data) {
    lcd.clear();

    if (err) {
      lcd.cursor(0, 0).print('Loading data failed.');
      return;
    }

    const name = _.get(data, 'name');
    const dt = moment(_.get(data, 'dt') * 1000).format('YYYY-MM-DD hh:mm:ss');
    const weather = _.get(data, 'weather[0].main');
    const temp = _.get(data, 'main.temp').toFixed(1);
    const tempMin = _.get(data, 'main.temp_min').toFixed(1);
    const tempMax = _.get(data, 'main.temp_max').toFixed(1);
    const humidity = _.get(data, 'main.humidity');
    const windSpeed = _.get(data, 'wind.speed') * 3600 / 1000; // m/s -> km/h

    lcd.cursor(0, 0).print(dt);
    lcd.cursor(1, 0).print(name + ' (' + weather + ')');
    lcd.cursor(2, 0).print('T:' + temp + ' (' + tempMin + '-' + tempMax + ')');
    lcd.cursor(3, 0).print('H:' + humidity + '%  W:' + windSpeed + 'km/h');
  });
};

const board = new five.Board();

board.on('ready', function () {
  // I2C LCD, PCF8574
  const lcd = new five.LCD({
    controller: 'PCF8574',
    rows: 4,
    cols: 20
  });
  const weatherDisplay = new WeatherDisplay(lcd);

  this.repl.inject({
    lcd: lcd,
    weatherDisplay: weatherDisplay
  });

  weatherDisplay.load();
});
