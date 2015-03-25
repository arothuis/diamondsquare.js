(function () {
    this.CanvasRenderer = (function () {
        function CanvasRenderer(canvas, map) {
            this.setCanvas(canvas);
            this.setMap(map);
        }
        
        CanvasRenderer.prototype.setCanvas = function (canvas){
            this.canvas = canvas;
        };
        
        CanvasRenderer.prototype.setMap = function(map){
            this.map = map;
        };
        
        CanvasRenderer.prototype.setPixel = function(imageData, x, y, r, g, b, a){
            var index = (x + y * imageData.width) * 4;
            imageData.data[index+0] = r;
            imageData.data[index+1] = g;
            imageData.data[index+2] = b;
            imageData.data[index+3] = a;
        };
        // @todo: make this customizable
        CanvasRenderer.prototype.getColor = function(mapValue){
            var r, g, b;
            var tint = (mapValue)/100;
            
            var waterLevel = 100;
            var grassLevel = waterLevel+6;
            
            if(mapValue < waterLevel){
                r = tint * 20 + 20;
                g = tint * 60 + 30;
                b = tint * 120 + 80;
            } else if(mapValue >= waterLevel && mapValue <= grassLevel){
                r = tint * 194;
                g = tint * 178;
                b = tint * 128;
            }  else {
                r = tint * 40;
                g = tint * 120;
                b = tint * 20;
            }
            
            return {r: r, g: g, b: b};
        };
        
        CanvasRenderer.prototype.render = function(){
            var cx = this.canvas.getContext("2d");
            
            this.canvas.width  = this.map.length;
            this.canvas.height = this.map.length;

            var imageData = cx.createImageData(this.canvas.width, this.canvas.height);

            for(var x = 0; x < this.map.length; x++){
                for(var y = 0; y < this.map.length; y++){
                    var color = this.getColor(this.map[x][y]);
                    this.setPixel(imageData, x, y, color.r, color.g, color.b, 255);
                }
            }
            cx.putImageData(imageData, 0, 0);
        };
        
        return CanvasRenderer;
    })();
}).call(this);
