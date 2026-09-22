let r = 0;
let w = 0;
let lerpedMouseX = 0;
let color = 0;
let backButton;

function setup(){
    createCanvas(windowWidth, windowHeight);

    rectMode(CENTER);
    angleMode(DEGREES);

    //background(0);
    colorMode(HSB);
    
    stroke(255);
    strokeWeight(2);
    noFill();

    backButton = createButton("← Back");

    backButton.position(20, 20);

    backButton.mousePressed(() => {
        window.location.href = "Week3.html";
    });

    backButton.style("font-family", "Courier New");
    backButton.style("font-size", "14px");
    backButton.style("padding", "6px 10px");
    backButton.style("background", "transparent");
    backButton.style("color", "#c0c0c0");
    backButton.style("border", "transparent");
}

function drawNoiseCircles(nodeX, nodeY) {
    let circleCount = 3;

    let progress = map(lerpedMouseX, 0, width, 0, 1);

    for (let i = 0; i < circleCount; i++) {
        let originalSize = 30 + i * 25;

        let targetX = map(noise(i * 0.4, 0),0,1,-width / 2,width / 2);
        let targetY = map(noise(i * 0.4, 10),0,1,-height / 2,height / 2);

        let offsetX = lerp(0, targetX, progress);
        let offsetY = lerp(0, targetY, progress);

        let finalSize = width * map(noise(i * 0.4, 20),0,1,0.5,2);

        let circleSize = lerp(originalSize,finalSize,progress);

        ellipse(nodeX + offsetX, nodeY + offsetY, circleSize, circleSize);
  }
}


function draw(){
    lerpedMouseX = lerp(lerpedMouseX, mouseX, 0.05)
    
    backgroundcolor = map (lerpedMouseX, 0, width, 0,100);
    background(backgroundcolor);

    r = constrain(lerpedMouseX,0,10000);
    // r = map(lerpedMouseX, 0, width, 0, 360);
    w = map(lerpedMouseX, 0, width, 0, width / 2);

    push();

    translate(width/2,height/2);
    rotate(r);
    scale(0.5);

    line(0,0,300,0);
    drawNoiseCircles(300, 0, 0);
    // ellipse(300,0,w,w);


    translate(300,0);
    rotate(r);
    scale(1.5);

    line(0,0,300,0);
    drawNoiseCircles(300, 0);
    // ellipse(300,0,w,w);

    translate(300,0);
    rotate(r);
    scale(2);

    line(0,0,300,0);
    drawNoiseCircles(300, 0);
    // ellipse(300,0,w,w);

    pop();

    push();

    translate(width / 2, height * 0.3);
    rotate(-r);

    let textScale = map(lerpedMouseX,0,width,0,1);

    scale(textScale);

    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textFont("Courier New");
    textSize(100);
    text("Dream", 0, 0);

    pop();
    

}
