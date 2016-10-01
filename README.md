# diamondsquare.js
A Javascript library for generating maps and applying the [diamond-square algorithm](http://en.wikipedia.org/wiki/Diamond-square_algorithm) to them.

## Notice
This library, a working implementation of the diamond square algorithm, is a toy library and is no longer maintained.

## How to use

### Basics
To start, instantiate the DiamondSquare object. The constructor accepts an object filled with named settings. Diamondsquare.js does not include a seeded pseudo-random number generator (prng). Diamondsquare.js is compatible with: [seedrandom by David Bau](https://github.com/davidbau/seedrandom).

```js
// Default settings, no seedfunction.
var ds = new DiamondSquare();

// Ddefault settings, seedfunction (include seedrandom.js before initializing DiamondSquare).
var ds = new DiamondSquare({prng: Math.seedrandom});

// Instantiate with custom settings.
var settings = {
    roughness: 1000,            // to what extent each point in the map will differ from its neighbor
    smoothness: 2,              // to what extent the roughness should be smoothened
    seed: 'hello world',        // what seed to be used
    size: 8,                    // size exponent, N in dimension = 2^N + 1 (a requirement for the diamond-square algorithm)
    min: 1,                     // the minimum value a point in the map can have 
    max: 1000,                  // the maximum value a point in the map can have
    prng: Math.seedrandom,      // the pseudo-random number generator function to use
}
var ds = new DiamondSquare(settings);

// Change settings after initialization.
var ds = new DiamondSquare();
ds.setSettings(settings);

// After instantiation, create a map and start the algorithm.
ds.createMap();
ds.make();
```
### Setting specific points
After creating a map, you can set certain points on the map either before or after
running the algorithm. If you want to override already set points, you need to set the
second parameter (override) to true. It is false by default.

You can use the setColumns and setRows methods to set 
a whole row or column to a specific value.

```js
// Setting the first, the middle and the last columns (line on the X axis).
var columns = {
    first: 0,
    mid: 255,
    last: 0,
};
ds.setColumns(columns);

// You could also set specific columns.
var columns = {
    20: 255,
    21: 0,
    22: 255
};
ds.setColumns(columns);

// The same goes for rows.
var rows = {
    first: 100,
    22: 50,
    25: 1
};
ds.setRows(rows);

// Override existing points.
ds.setRows(rows, true);
```

Another possibility is to set certain points by name: n, ne, e, se, s, sw, w, nw, mid, center.
Mid and center refer to the same point on the map.
```js

// Setting north, south and mid.
var named = {
    n: 0,
    s: 0,
    mid: 150
};

// Also override existing points.
ds.setNamedPoints(named, true);

```

To set specific points by their coordinates, you can use the setPoints method. 
The syntax follows a coordinates structure: {x : { y : value }, ... }. 

```js
// Setting a couple of points: (0,0) to 250, (5,10) to 0 and (10,5) to 100.
var points = {
    0: { 0 : 250 },
    5: { 10 : 0 },
    10: { 5 : 100 }
}
ds.setPoints(points);
```
A single point can be set via the setPoints method.

```js
ds.setPoints(0,5, 255);
```
### Callbacks
DiamondSquare.js allows you to run callback functions during the algorithm. Using the
addCallbackPerPoint method you can add one or multiple callbacks to the generation process.
Your callback function will receive the following parameters: x, y and value. 
The callback MUST return a value or an exception will be thrown. The return value will
be used as the value to set for a point.

If you add multiple callbacks, the callbacks will run in sequence.

```js
// Make a high diagonal line in the map.
var diagonalMountain = function(x, y, value){
    if(x === y){
        return value*2;
    }
};

// Console.log on which points we are dealing with high values.
var heightChecker = function(x, y, value){
    if(value > 225){
        console.log(x, y, value);
    }
    return value;
}

ds.addCallbackPerPoint(diagonalMountain, heightChecker);

```
Remove all callbacks by calling the removeAllCallbacksPerPoint method: `ds.removeAllCallbacksPerPoint()`.

## Contact
You can find me on Twitter ([@arothuis](http://www.twitter.nl/arothuis)) and on the [interwebs](http://www.arothuis.nl).

## Thanks
Inspired by the awesome work of [Amit Patel](http://www.redblobgames.com/) and the diamond-square implementations of [Loktar] (http://www.somethinghitme.com/2009/12/06/terrain-generation-with-canvas-and-javascript/), [Boxley] (http://www.paulboxley.com/blog/2011/03/terrain-generation-mark-one) and [srchea] (http://srchea.com/terrain-generation-the-diamond-square-algorithm-and-three-js).
