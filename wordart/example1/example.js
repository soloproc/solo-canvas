/*
The MIT License (MIT)

Copyright (c) 2016 @mnmxmx http://codepen.io/mnmxmx/pen/JKoYyd

Permission is hereby granted, free of charge, to any person 
obtaining a copy of this software and associated documentation 
files (the "Software"), to deal in the Software without restriction,
 including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of 
the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall 
be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.

*/
//webfont
WebFontConfig = {
    google: {
        families: ['Limelight::latin']
    }
};
(function() {
    var wf = document.createElement('script');
    wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();


window.onload = function() {
    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        canvasBg = document.createElement("canvas"),
        contextBg = canvasBg.getContext("2d"),
        text = document.getElementById("text"),
        textWidth = text.offsetWidth,
        boxes = document.querySelectorAll(".box"),
        control = document.querySelector(".control"),
        width,
        height,
        linesR = [],
        linesL = [],
        size = 180,

        keyword = text.value,
        density = 8,
        ease = 6,
        flexibility = 20,
        roughness = 2,
        getRoughness = false,

        colorPallete = ["#e38", "#f96", "#08a", "#f8a"],
        mouse = {
            radius: Math.pow(30, 2),
            x: 0,
            y: 0,
            differentX: 0,
            differentY: 0,
            different: 0
        };

    //utils
    function norm(value, min, max) {
        return (value - min) / (max - min);
    }

    function lerp(norm, min, max) {
        return (max - min) * norm + min;
    }

    function map(value, sourceMin, sourceMax, destMin, destMax) {
        return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function Line(x, y) {
        this.x = this.originX = x;
        this.y = this.originY = y;
        this.lineRx = 6 + roughness * Math.random();
        this.lineRy = 10;
        this.lineLx = 2 + roughness * Math.random();
        this.lineLy = 3;
        this.distMouseX = this.distOriginX = 0;
        this.distMouseY = this.distOriginY = 0;
        this.distM = 0;
        this.color = colorPallete[Math.floor(Math.random() * colorPallete.length)];
    }

    Line.prototype.update = function(r) {
        if (getRoughness) {
            this.lineRx = 6 + roughness * Math.random();
            this.lineLx = 2 + roughness * Math.random();
        }

        this.distMouseX = mouse.x - this.x;
        this.distMouseY = mouse.y - this.y;

        this.distM = this.distMouseX * this.distMouseX + this.distMouseY * this.distMouseY;

        this.distOriginX = this.originX - this.x;
        this.distOriginY = this.originY - this.y;

        if (this.distM < mouse.radius) {
            var angle = Math.atan2(mouse.differentY, mouse.differentX);
            this.x = this.originX + Math.cos(angle) * r * (mouse.different + flexibility) / mouse.radius;
            this.y = this.originY + Math.sin(angle) * r * (mouse.different + flexibility) / mouse.radius;
        } else {
            this.x += this.distOriginX * 1 / ease;
            this.y += this.distOriginY * 1 / ease;
        }
    }

    function setText() {
        contextBg.clearRect(0, 0, width, height);
        contextBg.font = "bold " + size + "px Limelight"
        contextBg.fillText(keyword, (width - contextBg.measureText(keyword).width + textWidth) / 2, (height + size) / 2 - 25);
    }

    function getPixel() {
        var imageData = contextBg.getImageData(0, 0, width, height),
            buffer32 = new Uint32Array(imageData.data.buffer);
        for (var h = 0; h < height; h += density) {
            for (var w = 0; w < width; w += density) {
                if (buffer32[w + h * width]) {
                    linesR.push(new Line(w, h));
                    linesL.push(new Line(w + 1, h + 1));
                }
            }
        }
    }

    window.onresize = function() {
        linesR = [];
        linesL = [];
        init();
    }

    var bars = [];
    for (var i = 1, len = boxes.length; i < len; i++) {
        bars[i] = boxes[i].children[1].children[0];
    }



    bars[1].style.left = map(density, 7, 11, 0, textWidth) + "px";
    bars[2].style.left = map(ease, 3, 60, 0, textWidth) + "px";
    bars[3].style.left = map(roughness, 0, 6, 0, textWidth) + "px";
    bars[4].style.left = map(flexibility, 8, 90, 0, textWidth) + "px";


    init();
    draw();

    function init() {
        width = canvas.width = canvasBg.width = window.innerWidth;
        height = canvas.height = canvasBg.height = window.innerHeight;
        control.style.height = height + "px";
        setText();
        getPixel();
    }

    function draw() {
        context.clearRect(0, 0, width, height);
        for (var i = 0, len = linesR.length; i < len; i++) {
            var pR = linesR[i];
            pR.update(110);
            context.strokeStyle = pR.color;
            context.beginPath();
            context.lineWidth = 2.5;
            context.globalAlpha = .4;
            context.moveTo(pR.originX + pR.lineRx * 2, pR.originY - pR.lineRy * 2);
            context.quadraticCurveTo(pR.x, pR.y, pR.originX - pR.lineRx, pR.originY + pR.lineRy);
            context.stroke();

            var pL = linesL[i];
            pL.update(30);
            context.lineWidth = 2;
            context.globalAlpha = 1;
            context.beginPath();
            context.moveTo(pL.originX - pL.lineLx, pL.originY - pL.lineLy);
            context.quadraticCurveTo(pL.x, pL.y, pL.originX + pL.lineLx, pL.originY + pL.lineLy);
            context.stroke();
        }
        requestAnimationFrame(draw);
    }

    text.onchange = function() {
        keyword = text.value;
        linesR = [];
        linesL = [];
        setText();
        getPixel();
    }

    for (var i = 1, len = boxes.length; i < len; i++) {
        boxes[i].addEventListener("mousedown", mouseDown, false);
        boxes[i].addEventListener("mousedown", mouseMove, false);
    }

    function mouseDown(e) {
        this.addEventListener("mousemove", mouseMove, false);
        this.addEventListener("mouseup", mouseUp, false);
    }

    function mouseMove(e) {
        var bar = this.children[1].children[0];
        var mouseX = clamp(e.clientX - 20, 0, textWidth);
        bar.style.left = mouseX + "px";
        if (this === boxes[1]) {

            //density
            density = Math.round(map(mouseX, 0, textWidth, 7, 11));
            linesR = [];
            linesL = [];
            setText();
            getPixel();

        } else if (this === boxes[2]) {

            //easing
            ease = map(mouseX, 0, textWidth, 3, 60);

        } else if (this === boxes[3]) {

            //roughness
            getRoughness = true;
            roughness = map(mouseX, 0, textWidth, 0, 6);

        } else if (this === boxes[4]) {

            //flexibility
            flexibility = map(mouseX, 0, textWidth, 8, 90);

        }
    }

    function mouseUp(e) {
        this.removeEventListener("mousemove", mouseMove, false);
        setTimeout(function() {
            getRoughness = false
        }, 10);
    }

    window.addEventListener("mousemove", function(e) {
        var mouse_x = mouse.x;
        var mouse_y = mouse.y;

        mouse.x = e.clientX;
        mouse.y = e.clientY;

        mouse.differentX = mouse.x - mouse_x;
        mouse.differentY = mouse.y - mouse_y;
        mouse.different = mouse.differentX * mouse.differentX + mouse.differentY * mouse.differentY;
        if (mouse.different > 180) {
            mouse.different = 40;
        } else if (10 <= mouse.different <= 40) {
            mouse.different = 40;
        } else if (mouse.different < 10) {
            mouse.different = 0;
        }
    }, false);
}