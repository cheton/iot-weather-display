# LCD Weather Display
LCD Weather Display with Johnny-Five


![lcd-weather-display.jpg](lcd-weather-display.jpg)

### Breadboard for "LCD - I2C PCF8574"
![docs/breadboard/lcd-i2c-PCF8574.png](docs/breadboard/lcd-i2c-PCF8574.png)

### Demo
TBD


Run with:
```bash
node index.js
```

The `index.js` file:
```js
var five = require('johnny-five');
var board = new five.Board();
var _ = require('lodash');
var moment = require('moment');
var request = require('request');

// Current weather data (http://openweathermap.org/current)
// http://openweathermap.org/weather-data
//
// Examples:
// http://api.openweathermap.org/data/2.5/weather?units=metric&q=Taipei
var getCurrentWeatherData = function(callback) {
    var querystring = require('querystring');
    var qs = querystring.stringify({
        'units': 'metric', // metric or imperial
        'q': 'Taipei' // city
    });
    var url = 'http://api.openweathermap.org/data/2.5/weather?' + qs;
    request(url, function(err, rsp, body) {
        if (err || rsp.statusCode !== 200) {
            return;
        }

        var data = JSON.parse(body);
        callback(data);
    });
};

board.on('ready', function() {
    // I2C LCD, PCF8574
    var lcd = new five.LCD({
        controller: 'PCF8574',
        rows: 4,
        cols: 20
    });

    this.repl.inject({
        lcd: lcd
    });

    lcd.clear();

    getCurrentWeatherData(function(data) {
        var name = _.get(data, 'name');
        var dt = moment(_.get(data, 'dt') * 1000).format('YYYY-MM-DD hh:mm:ss');
        var weather = _.get(data, 'weather[0].main');
        var temp = _.get(data, 'main.temp').toFixed(1);
            tempMin = _.get(data, 'main.temp_min').toFixed(1),
            tempMax = _.get(data, 'main.temp_max').toFixed(1);
        var humidity = _.get(data, 'main.humidity');
        var windSpeed = _.get(data, 'wind.speed') * 3600 / 1000; // m/s -> km/h

        lcd.cursor(0, 0).print(dt);
        lcd.cursor(1, 0).print(name + ' (' + weather + ')');
        lcd.cursor(2, 0).print('T:' + temp + ' (' + tempMin + '-' + tempMax + ')');
        lcd.cursor(3, 0).print('H:' + humidity + '%  W:' + windSpeed + 'km/h');
    });

});
```
