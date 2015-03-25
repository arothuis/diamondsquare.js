# diamondsquare.js
A Javascript Library for the diamond-square algorithm to create procedural maps.

## Example
Click here for a  [simple example](http://www.arothuis.nl/projects/diamondsquare/) of what you can do with diamondsquare.js.

## How to use
To start, initialize the DiamondSquare object. The constructor accepts an object filled with named settings. Diamondsquare.js does not include a seeded pseudo-random number generator (prng). Diamondsquare.js is compatible with: [seedrandom by David Bau](https://github.com/davidbau/seedrandom).

```js
// default settings, no seedfunction
var ds = new DiamondSquare();

// default settings, seedfunction (include seedrandom.js before initializing DiamondSquare)
var ds = new DiamondSquare({prng: Math.seedrandom});

// initialize with custom settings
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

// change settings after initialization
var ds = new DiamondSquare();
ds.setSettings(settings);

// after initialization, start the algorithm
ds.make();
```

### Thanks
Inspired by the awesome work of [Amit Patel](http://www.redblobgames.com/) and diamond-square implementations of [Loktar] (http://www.somethinghitme.com/2009/12/06/terrain-generation-with-canvas-and-javascript/), [Boxley] (http://www.paulboxley.com/blog/2011/03/terrain-generation-mark-one) and [srchea] (http://srchea.com/terrain-generation-the-diamond-square-algorithm-and-three-js).
