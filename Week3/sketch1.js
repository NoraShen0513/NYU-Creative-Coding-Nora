let r = 0;
let w = 0;
let lerpedMouseX = 0;
let color = 0;

function setup(){
    createCanvas(windowWidth, windowHeight);

    rectMode(CENTER);
    angleMode(DEGREES);

    //background(0);
    colorMode(HSB);
    
    stroke(255);
    strokeWeight(2);
    noFill();
}


function draw(){
    color = map (lerpedMouseX, 0, width, 0,100);
    background(color);

    lerpedMouseX = lerp(lerpedMouseX, mouseX, 0.05)

    r = lerpedMouseX;
    // r = map(lerpedMouseX, 0, width, 0, 360);
    w = map(lerpedMouseX, 0, width, 0, width / 2);

    translate(width/2,height/2);
    rotate(r);
    scale(0.5);

    line(0,0,300,0);
    ellipse(300,0,w,w);
    textFont('Courier New',100)
    text('Dream', -500, 0);


    translate(300,0);
    rotate(r);
    scale(1.5);

    line(0,0,300,0);
    ellipse(300,0,w,w);
    

}
