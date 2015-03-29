var terrainApp = angular.module('terrainApp', []);



terrainApp.controller('TerrainCtrl', function ($scope){
    
    var ds = new DiamondSquare({name: 'heightmap', prng: Math.seedrandom});
    
    $scope.showstats = false;
    $scope.stats = false;
    
    $scope.presets = [
            'None', 'Outer water'
    ];
    $scope.selectedPreset = "None";

    $scope.settings = {
        seed: ds.settings.seed,
        size: ds.settings.size,
        roughness: ds.settings.roughness,
        smoothness: ds.settings.smoothness,
        min: ds.settings.min,
        max: ds.settings.max
    };
    
    $scope.randomSeed = function(){
        $scope.settings.seed = ds.randomSeed();
    };
    
    
    $scope.warning = {
        size: false,
        smoothness: false
    };
    
    // watch size; give warning if large
    $scope.$watch(
            function(scope){return scope.settings.size;},
            function(newSize, oldSize){
                if(newSize > 9 && !$scope.warning.size){
                    $scope.warning.size = 'Warning: setting size > 9 will impact execution speed.';
                } else if (newSize <= 9 && $scope.warning.size) {
                    $scope.warning.size = false;
                }
            }        
    );
    
    // watch smoothness; give warning if large
    $scope.$watch(
            function(scope){return scope.settings.smoothness;},
            function(newSmooth, oldSmooth){
                var max;
                if($scope.settings.size <= 5){
                    max = 2400;
                } else if ($scope.settings.size > 9) {
                    max = 0;
                } else {
                    max = Math.floor(2400 / Math.pow(4,($scope.settings.size-5)));
                }
                if(newSmooth > max && !$scope.warning.smoothness){
                   $scope.warning.smoothness = 'Warning: setting smoothness too high at this size will impact execution speed.';
                } else if (newSmooth <= max && $scope.warning.smoothness){
                   $scope.warning.smoothness = false;
                }
                
            }
    );

    
    var canvas = document.getElementById('map');
    var render = new CanvasRenderer(canvas, ds.map, 'heightmap');
    
    $scope.generate = function(){
        var startTime, genTime, genDelta, renderDelta, totalDelta;

        startTime = new Date().getTime();
        
        // make the heightmap
        ds.setSettings($scope.settings);
        ds.createMap();
        
        if($scope.selectedPreset === "Outer water"){
            ds.setColumns({first:0, last:0}).setRows({first:0, last:0});
        }
        ds.make();
        
        genTime  = new Date().getTime();
        genDelta = genTime - startTime;

        // render the heightmap
        render.setMap(ds.map);
        render.render();
        
        renderDelta = new Date().getTime() - genTime;
        totalDelta  = renderDelta + genDelta;
        
        var dimension = ds.settings.dimension;
        
        // output stats
        var statsInfo = 
                  "Size: " + dimension*dimension + " pixels (" + dimension + " x " + dimension + "). \n"+ 
                  "Generated in: " + genDelta + " ms. \n" +
                  "Rendered in: " + renderDelta + " ms. \n"+
                  "Total elapsed: " + totalDelta + " ms. \n";
        
        $scope.statsInfo = statsInfo;
        
    };
    
});


