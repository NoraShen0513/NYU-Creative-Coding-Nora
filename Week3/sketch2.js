let numRows = 10;
let numCols = 10;
let w;
let h;
let r=50;


function setup(){
    createCanvas(windowWidth, windowHeight);

    w = width/numCols
    h = height/numRows

    rectMode(CENTER);
    angleMode(DEGREES);

    colorMode(HSB);
    
    stroke(255);
    strokeWeight(1);
    noFill();
}


function draw(){
    
    stroke(255);
    strokeWeight(1);
    noFill();

    background(0);
    let t = 0.95;

    for(let startX = 0; startX <= numCols; startX++){
        let x = startX * w;

        line(x, 0, lerp(x, mouseX, t),lerp(0, mouseY, t));
        line(x, height,lerp(x, mouseX, t),lerp(height, mouseY, t));
    }

    for(let startY = 0; startY <= numRows; startY++){
        let y = startY * h;

        line(0, y, lerp(0, mouseX, t),lerp(y, mouseY, t));
        line(width, y,lerp(width, mouseX, t),lerp(y, mouseY, t));
    }

    let frameCount = 8;

    push();

    rectMode(CORNER);
    for (let i = 1; i <= frameCount; i++) {
        let progress = i / (frameCount + 1);

        let frameT = 1 - pow(1 - progress, 2);

        let left = lerp(0, mouseX, frameT);
        let right = lerp(width, mouseX, frameT);
        let top = lerp(0, mouseY, frameT);
        let bottom = lerp(height, mouseY, frameT);

        rect(left, top, right - left, bottom - top);
    }

    pop();

    fill(135,100,100);
    noStroke();
    textFont('Courier New', 30);
    text('EXIT', mouseX-35, mouseY+8);

}
