/*
 DiamondSquare.js 0.1
 (c) 2015 A. Rothuis (@arothuis)
 License: MIT
*/

(function () {
    this.DiamondSquare = (function () {
        
        DiamondSquare.prototype.defaultSettings = {
            name: 0,
            roughness: 2500,
            smoothness: 1,
            seed: false,
            size: 9,
            min: 0,
            max: 255,
            prng: false
        };

        /**
         * Constructor. Sets this.settings to default settings, 
         * overridden by given settings as object.
         * 
         * 
         * @param {object} settings { settingKey : settingValue, ... }
         * @returns {diamondsquare_L8.DiamondSquare}
         */
        function DiamondSquare(settings) {
            this.settings = this.defaultSettings;
            if(typeof(settings) === 'object'){
                this.setSettings(settings);
            }
        }
        
        /**
         * Iterates through the given settings, changing each setting if
         * it exist. 
         * 
         * Checks if a pseudo-random number generator function is set.
         * If not, it can't use seeds. If it is set, it will use the given seed or
         * generate a new seed.
         * 
         * 
         * @param {Object} settings Settings formatted as: { settingKey : settingValue, ... }
         * @returns {diamondsquare_L8.DiamondSquare.prototype}
         */
        DiamondSquare.prototype.setSettings = function (settings){
            for(var s in settings){
                if(this.settings[s] !== 'undefined'){
                    this.settings[s] = settings[s];
                }
                switch(s){
                    case 'min':
                    case 'max':
                        this.settings.mid = Math.floor((this.settings.min + this.settings.max) / 2);
                        break;           
                }
            }
            if(!this.settings.prng){
                if(typeof(console) !== 'undefined'){
                    console.log('DS: Missing prng function. Not using seed.');
                }
                this.settings.seed = false;
                this.prng = Math.random;
            } else {
                this.settings.seed = (this.settings.seed !== false) ? this.settings.seed : this.randomSeed();
                this.prng = this.settings.prng(this.settings.seed);
            }
            
            return this;
        };
        
        /**
         * Utility for keeping values within the set bounds (this.settings.min and this.settings.max)
         * Sets value to max if higher than max, sets value to min if lower than min
         * Rounds down the value if it is within bounds
         * 
         * @param {int} value
         * @returns {int} Rounded down or limited value
         */
        DiamondSquare.prototype.limit = function (value){
            var type = typeof(value);
            if(type !== 'number' && value != parseInt(value, 10)){
                throw "Type error: value '"+ value + "' is of type '"+ type + "', expected: 'number' || 'integer'";
            }
            if (value > this.settings.max){
                value = this.settings.max;
            } else if (value < this.settings.min){
                value = this.settings.min;
            }
            return value;
        };
        
        /**
         * Generates random seed.
         * @returns {string} Random seed.
         */
        DiamondSquare.prototype.randomSeed = function () {
            return Math.random().toString(36).slice(2);
        };
        
        /**
         * Random number generator, picks a random number between this.settings.max and this.settings.min.
         * Adds/subtracts a given value if desired. 
         * 
         * @param {boolean} inclusive Whether the max/min should be included in the possible numbers
         * @param {int} modify Adds to or subtracts from the random value
         * @returns {int} Random number
         */
        DiamondSquare.prototype.randomNum = function(inclusive, modify){
            inclusive = inclusive != null ? inclusive : true;
            modify  = modify != null ? modify : 0;
            var maxVal = this.settings.max;
            var minVal = this.settings.min;
            if(inclusive){
                maxVal++;
                minVal--;
            }
            return this.prng() * (maxVal - minVal) + minVal - modify;
        };

        /**
         * Creates a grid. Uses factor as dimension if isDimension is true. Else,
         * it generates a dimension based on factor as N in 2^N+1 (a prerequisite
         * for the Diamond-Square algorithm to work).
         * 
         * @param {int} factor Dimension or N in 2^N+1
         * @param {boolean} isDimension Whether to use factor as dimension or generate one from it
         * @returns {diamondsquare_L8.DiamondSquare.prototype}
         */
        DiamondSquare.prototype.createMap = function (factor, isDimension){
            var dim, map; 
            var row = Array();

            if(isDimension === true){
                dim = factor;
            } else {
                dim = Math.pow(2, factor)+1;
            }
            map = new Array(dim);
            
            // create entries per row, else every row is changed when one row changes
            for(var x = 0; x < dim; x++){
                map[x] = new Array(dim);
                for(var y = 0; y < dim; y++){
                    map[x][y] = null;
                }
            }
            this.settings.dimension = map.length;
            this.settings.maxKey    = map.length-1;
            this.map = map;
            
            return this;
        };
        
        /**
         * Generates a value to displace averaged value in algorithm 
         * based on the set amount of displacement, the total amount of points, 
         * the mid value and the roughness.
         * 
         * Called by startDisplacement and midpointDisplacement methods.
         * 
         * @param {int} amount To what extent displacement occurs
         * @returns {int} The displacement value used to set points
         */
        DiamondSquare.prototype.displace = function (amount){
           return (Math.floor(this.randomNum(true, this.settings.mid)*(amount / this.settings.maxKey*2*this.settings.roughness/1000)));
        };
        
        /**
         * Sets a point on the map. Can, optionally, override already set points.
         * @param {int} x
         * @param {int} y 
         * @param {int} value The value that has to be set at specified key in the map
         * @param {boolean} override Whether already set points have to be overriden
         * @returns {diamondsquare_L8.DiamondSquare.prototype@arr;@arr;map}
         */
        DiamondSquare.prototype.setPoint = function(x, y, value, override) {
            override = (override != null) ? override : false;
            value    = (value != null) ? this.limit(value) : Math.floor(this.randomNum());
            
            if(!override){
                if(this.map[x][y] === null){
                    this.map[x][y] = value;
                }
            } else {
                this.map[x][y] = value;
            }
            return this.map[x][y];
        };
        
        /**
         * Sets the initial values: the outer squares (center to nw, ne, se and sw) 
         * and the four outer diamonds (center to n, w, s, e).
         * 
         * Then initiates the recursive midpoint replacement algorithm.
         * 
         * @returns {diamondsquare_L8.DiamondSquare.prototype}
         */
        DiamondSquare.prototype.startDisplacement = function(){
            var nw, ne, se, sw, center, dim = this.settings.maxKey;
            
            nw = this.setPoint(0, 0);
            ne = this.setPoint(dim, 0);
            se = this.setPoint(dim, dim);
            sw = this.setPoint(0, dim);
            center = this.setPoint(dim/2, dim/2, (nw + ne + se + sw) / 4);
            
            this.setPoint(dim/2, dim, (sw + se + center + center) / 4);
            this.setPoint(dim/2, 0, (nw + ne + center + center) / 4);
            this.setPoint(dim, dim/2, (ne + se + center + center) / 4);
            this.setPoint(0, dim/2, (nw + sw + center + center) / 4);
            this.midpointDisplacement(this.settings.maxKey);

            return this;
        };
        
        /**
         * Recursive midpoint displacement algorithm called by startDisplacement.
         * Keeps setting points in diamonds and squares of the given dimension 
         * in the map until the dimension is smaller than 1 point. Then, we have
         * set all the points in the map.
         * 
         * @param {type} dimension The dimension of the squares and diamonds in which points will be set.
         * @returns {diamondsquare_L8.DiamondSquare.prototype}
         */
        DiamondSquare.prototype.midpointDisplacement = function(dimension){
            var newDim = dimension / 2,
                nw, ne, se, sw, center, i, j, x, y, mid, out;
            
            if (newDim > 1){
                for(i = newDim; i < this.settings.dimension; i += newDim){
                    for(j = newDim; j < this.settings.dimension; j += newDim){

                        // corners
                        nw = this.map[i - newDim][j - newDim];
                        ne = this.map[i][j - newDim];
                        se = this.map[i][j];
                        sw = this.map[i-newDim][j];
                        
                        mid = newDim/2;
                        out = newDim*2;
                        x = i - mid;
                        y = j - mid;
                        
                        // center
                        center = this.setPoint(x, y, (nw + ne + se + sw) / 4 + this.displace(dimension));
                        // n
                        if (j - out + mid > 0){
                            this.setPoint(x, j - newDim, (nw + ne + center + this.map[x][j-dimension+mid]) / 4 + this.displace(dimension));
                        } else {
                            this.setPoint(x, j - newDim, (nw + ne + center) / 3 + this.displace(dimension));
                        }
                        // s
                        if (j + mid < this.keyDim){
                            this.setPoint(x, j, (sw + se + center + this.map[x][j + mid]) / 4 + this.displace(dimension));
                        }  else {
                            this.setPoint(x, j, (sw + se + center) / 3 + this.displace(dimension));
                        }
                        // e
                        if(i + mid < this.keyDim){
                            this.setPoint(i, y, (ne + se + center + this.map[i + mid][y]) / 4 + this.displace(dimension));
                        }else{
                            this.setPoint(i, y, (ne + se + center) / 3 + this.displace(dimension));
                        }
                        // w
                        if (i - out + mid > 0){
                            this.setPoint(i - newDim, y, (nw + sw + center + this.map[i - dimension + mid][y])/ 4 + this.displace(dimension));
                        } else {
                            this.setPoint(i - newDim, y, (nw + sw + center) / 3 + this.displace(dimension));
                        }
                    }
                }
                this.midpointDisplacement(newDim);
            }
            return this;
        };
        /**
         * Iterate over the map, averaging each point with its neighbors' values.
         * @param {type} factor How many times it should iterate over the map.
         * @returns {diamondsquare_L8.DiamondSquare.prototype}
         */
        DiamondSquare.prototype.smoothen = function (factor) {
            var total = 0, amount = 0;

            factor = (factor != null) ? factor : 3;

            for (var i = 0; i < factor; i++) {
                for (var x = 0; x < this.settings.dimension; x++) {
                    for (var y = 0; y < this.settings.dimension; y++) {
                        if (typeof (this.map[x][y - 1]) !== 'undefined') {
                            total += this.map[x][y - 1];
                            amount++;
                        }
                        if (typeof (this.map[x + 1]) !== 'undefined') {
                            total += this.map[x + 1][y];
                            amount++;
                        }
                        if (typeof (this.map[x - 1]) !== 'undefined') {
                            total += this.map[x - 1][y];
                            amount++;
                        }
                        if (typeof (this.map[x][y + 1]) !== 'undefined') {
                            total += this.map[x][y + 1];
                            amount++;
                        }
                        this.map[x][y] = total / amount;
                        total = 0;
                        amount = 0;
                    }
                }
            }
            return this;
        };
        
        /**
         * Creates a map, starts the displacement algorithm and smoothens the values.
         * Uses this.settings, set via constructor and/or this.setSettings.
         * 
         * @returns {diamondsquare_L8.DiamondSquare.prototype}
         */
        DiamondSquare.prototype.make = function(){
            this.createMap(this.settings.size);
            this.startDisplacement(); 
            this.smoothen(this.settings.smoothness);
            return this;
        };
        
        return DiamondSquare;
    })();
}).call(this);
