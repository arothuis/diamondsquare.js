/*
 * DiamondSquare.js 0.2
 * (c) 2015 A. Rothuis (@arothuis)
 * License: MIT
 */

(function () {
    this.DiamondSquare = (function () {
        
        DiamondSquare.prototype.defaultSettings = {
            roughness: 2500,
            smoothness: 2,
            seed: false,
            size: 9,
            min: 0,
            max: 255,
            prng: false
        };
        
        DiamondSquare.prototype.callbacks = {
            perPoint: []
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
         * @returns {DiamondSquare}
         */
        DiamondSquare.prototype.setSettings = function (settings){
            for(var s in settings){
                if(this.settings[s] !== 'undefined'){
                    this.settings[s] = settings[s];
                }
            }
            
            this.settings.size = this.settings.size << 0;
            this.settings.mid = ((this.settings.min + this.settings.max) / 2) << 0;
            
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
         * Function to retrieve the size factor of any given map. Can be used to
         * determine if an existing map complies to the required 2^N+1 structure.
         * @param {object} map
         * @returns {Number} Sizefactor
         */
        DiamondSquare.prototype.getSizeFactor = function(map){
            var size = Math.log(map.length-1) / Math.log(2);
            return size;
        };
        
        /**
         * Adds a function to be executed per point during runtime. The callback
         * will be given the following parameters: x, y, value. 
         * 
         * The callback has to return a Number, the value that is going to be set.
         * 
         * @param {function} callback
         * @returns {DiamondSquare}
         */
        DiamondSquare.prototype.addCallbackPerPoint = function(callback){
            var callback = (typeof(callback) !== 'array') ? [callback] : callback;
            for(var i = 0; i < callback.length; i++){
                this.callbacks.perPoint.push(callback[i]);
            }
            return this;
        };
        /**
         * Removes all callbacks to be executed per point.
         * @returns {DiamondSquare}
         */
        DiamondSquare.prototype.removeAllCallbacksPerPoint = function(){
            this.callbacks.perPoint = [];
            return this;
        };
        
        /**
         * Runs the set callbacks if there are any.
         * @param {string} callbackName Name of the callback type: i.e. 'perPoint'
         * @param {int} x
         * @param {int} y
         * @param {int} value
         * @returns {int} The value to be set for the point.
         */
        DiamondSquare.prototype.runCallbacks = function(callbackName, x, y, value){
            if(typeof(this.callbacks[callbackName]) !== 'undefined'){
                for(var i = 0; i < this.callbacks[callbackName].length; i++){
                    var newValue = this.callbacks[callbackName][i](x, y, value);
                    if(typeof (newValue) !== 'number'){
                        console.log("Warning: Your callback should be returning a number. Ignoring your callback.");
                    } else {
                        value = newValue;
                    }
                }
            }
            return value;
        };
        
        /**
         * Creates a grid. Uses factor as dimension if isDimension is true. Else,
         * it generates a dimension based on factor as N in 2^N+1 (a prerequisite
         * for the Diamond-Square algorithm to work).
         * 
         * @param {int} factor Dimension or N in 2^N+1
         * @param {boolean} isDimension Whether to use factor as dimension or generate one from it
         * @returns {DiamondSquare}
         */
        DiamondSquare.prototype.createMap = function (factor, isDimension){
            factor = (factor != null) ? factor : this.settings.size;
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
         * Predefines given rows or columns in the map. Called via setDefinedValues method.
         * Accepts text or integers to determine which row or column should be filled.
         * 
         * @param {object} rowsOrColumns The specific columns or rows, formatted as: { [x|y|name] : [value], ... }
         * @param {string} type Whether it set "columns" or "rows"
         * @param {boolean} override Whether existing values should be overridden
         * @returns {DiamondSquare}
         */
        DiamondSquare.prototype.setRowsOrColumns = function (rowsOrColumns, type, override){
            override = (override != null) ? override : true;
            var define;
            
            for(var key in rowsOrColumns){
                if(rowsOrColumns.hasOwnProperty(key)){
                    var value = rowsOrColumns[key];
                    switch(key.toLowerCase()){
                        case 'first':
                            define = 0;
                            break;
                        case 'last':
                            define = this.settings.maxKey;
                            break;
                        case 'mid':
                        case 'center':
                            define = this.settings.maxKey/2;
                            break;
                        default:
                            define = key;
                            break;
                    };
                    if(define <= this.settings.maxKey && define >= 0){
                        if(type.toLowerCase() === 'row'){
                            for(var x = 0; x <= this.settings.maxKey; x++){
                                this.setPoint(x, define, value, override);
                            }
                        } else {
                            for(var y = 0; y <= this.settings.maxKey; y++){
                                this.setPoint(define, y, value, override);
                            }
                        }
                    }
                }
            }
            return this;
        };
        
        /**
         * Set a column or multiple columns, identifiable by name or number with certain values.
         * Names are: first, mid, last.
         * 
         * @param {object} columnsAndValues Object containing columns and values of format {name|number : value}
         * @param {boolean} override Whether existing values should be overridden
         * @returns {DiamondSquare}
         */
        DiamondSquare.prototype.setColumns = function(columnsAndValues, override){
            this.setRowsOrColumns(columnsAndValues, 'columns', override);
            return this;
            
        };
        
        /**
         * Set a column or multiple columns, identifiable by name or number with certain values.
         * Names are: first, mid, last. 
         * 
         * @param {object} rowsAndValues Object containing rows and values of format {name|number : value}
         * @param {boolean} override Whether existing values should be overridden
         * @returns {DiamondSquare}
         */
        DiamondSquare.prototype.setRows = function(rowsAndValues, override){
            this.setRowsOrColumns(rowsAndValues, 'row', override);
            return this;
            
        };
        
        /**
         * Predefines given specific points in the map. Called via setDefinedValues method.
         * @param {object} specified The specific values, formatted as: { [x] : { [y] : [value], ... }
         * @param {boolean} override Whether existing values should be overridden
         * @returns {DiamondSquare}
         */
        DiamondSquare.prototype.setPoints = function (specified, override){
            override = (override != null) ? override : true;
            for(var x in specified){
                if(specified.hasOwnProperty(x)){
                    for(var y in specified[x]){
                        if(specified[x].hasOwnProperty(y)){
                            var value = specified[x][y];
                            if(x <= this.settings.maxKey && x >= 0 &&
                               y <= this.settings.maxKey && y >= 0 ){
                                this.setPoint(x, y, value, override);
                            }
                        }
                    }
                }
            }
            return this;
        };

        /**
         * Set given named points in the map. Called via setDefinedValues method.
         * @param {type} named The named values, formatted as: { [name] : [value], ... }
         * @returns {DiamondSquare}
         */
        DiamondSquare.prototype.setNamedPoints = function (named, override){
            override = (override != null) ? override : true;
            var dim = this.settings.maxKey;
            for(var name in named){
                if(named.hasOwnProperty(name)){
                    var value = named[name];
                    switch(name.toLowerCase()){
                        case 'n':
                            this.setPoint(dim/2, 0, value, override);
                            break;
                        case 'ne':
                            this.setPoint(dim, 0, value, override);
                            break;
                        case 'e':
                            this.setPoint(dim, dim/2, value, override);
                            break;
                        case 'se':
                            this.setPoint(dim, dim, value, override);
                            break;
                        case 's':
                            this.setPoint(dim/2, dim, value, override);
                            break;
                        case 'sw':
                            this.setPoint(0, dim, value, override);
                            break;
                        case 'w':
                            this.setPoint(0, dim/2, value, override);
                            break;
                        case 'nw':
                            this.setPoint(0, 0, value, override);
                            break;
                        case 'center':
                        case 'mid':
                            this.setPoint(dim/2, dim/2, value, override);
                            break;
                    }
                }
            }
            return this;
        };
        
        
        /**
         * Sets a point on the map. 
         * @param {int} x
         * @param {int} y 
         * @param {int} value The value that has to be set at specified key in the map
         * @param {boolean} override Whether existing values should be overridden
         * @returns {DiamondSquare.map}
         */
        DiamondSquare.prototype.setPoint = function(x, y, value, override) {
            override = (override != null) ? override : false;
            value    = (value != null) ? this.limit(value) : this.randomNum();
            value    = value << 0;

            if(!override){
                if(this.map[x][y] === null){
                    this.map[x][y] = this.runCallbacks('perPoint', x, y, value);
                }
            } else {
                this.map[x][y] = this.runCallbacks('perPoint', x, y, value);
            }
            return this.map[x][y];
        };
        
        /**
         * Sets the initial values: the outer squares (center to nw, ne, se and sw) 
         * and the four outer diamonds (center to n, w, s, e).
         * 
         * Then initiates the recursive midpoint replacement algorithm.
         * 
         * @returns {DiamondSquare}
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
         * @param {int} dimension The dimension of the squares and diamonds in which points will be set.
         * @returns {DiamondSquare}
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
         * @param {int} factor How many times it should iterate over the map.
         * @returns {DiamondSquare}
         */
        DiamondSquare.prototype.smoothen = function (factor) {
            var total = 0, amount = 0;

            factor = (factor != null) ? factor : 3;

            for (var i = 0; i < factor; i++) {
                for (var x = 0; x < this.settings.dimension; x++) {
                    for (var y = 0; y < this.settings.dimension; y++) {
                        this.smoothenPoint(x, y);
                    }
                }
            }
            return this;
        };
        
        /**
         * Smoothens a certain point out based on it's horizontal and vertical neighbors.
         * @param {int} x
         * @param {int} y
         * @returns {DiamondSquare}
         */
        DiamondSquare.prototype.smoothenPoint = function(x,y){
            var total = 0,
                amount = 0;
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
            if (this.map[x][y] !== null){
                total += this.map[x][y];
                amount++;
            }
            this.setPoint(x, y, total / amount, true);
        };
        
        /**
         * Starts the displacement algorithm and smoothens the values.
         * Uses this.settings, set via constructor and this.setSettings.
         * 
         * @returns {DiamondSquare}
         */
        DiamondSquare.prototype.make = function(){
            if(typeof this.map !== 'undefined'){
                this.startDisplacement(); 
                this.smoothen(this.settings.smoothness);
            } else {
                throw "No map has been defined yet. Please insert or create a map first.";
            }
            return this.map;
        };
        
        return DiamondSquare;
    })();
}).call(this);
