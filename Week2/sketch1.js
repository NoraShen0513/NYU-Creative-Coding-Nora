let rectColor;

function setup(){
    createCanvas(windowWidth, windowHeight);
    //rectMode(CENTER);
    background(0);
    colorMode(HSB);
    //rectColor = color(random(185, 255), random(80, 100), random(90, 100));
}


function draw(){
    for (let x = 0; x < width; x += 100) {
        for (let y = 0; y < height; y += 100) {
            rectColor = color(random(185, 255), random(80, 100), random(90, 100));
            fill(rectColor);
            noStroke();
            rect(x,y,100,100);
        }
    }
    noLoop();
}
