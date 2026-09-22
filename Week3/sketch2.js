let numRows = 10;
let numCols = 10;
let w;
let h;
let lerpedMouseX;
let lerpedMouseY;
let backButton;

function setup(){
    createCanvas(windowWidth, windowHeight);

    w = width/numCols
    h = height/numRows

    lerpedMouseX = width / 2;
    lerpedMouseY = height / 2;

    rectMode(CENTER);
    // angleMode(DEGREES);

    colorMode(HSB);
    
    stroke(255);
    strokeWeight(1);
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


function draw(){
    lerpedMouseX = lerp(lerpedMouseX, mouseX, 0.2);
    lerpedMouseY = lerp(lerpedMouseY, mouseY, 0.2);
    
    stroke(255);
    strokeWeight(1);
    noFill();

    background(0);
    let t = 0.95;

    for(let startX = 0; startX <= numCols; startX++){
        let x = startX * w;

        line(x, 0, lerp(x, lerpedMouseX, t),lerp(0, lerpedMouseY, t));
        line(x, height,lerp(x, lerpedMouseX, t),lerp(height, lerpedMouseY, t));
    }

    for(let startY = 0; startY <= numRows; startY++){
        let y = startY * h;

        line(0, y, lerp(0, lerpedMouseX, t),lerp(y, lerpedMouseY, t));
        line(width, y,lerp(width, lerpedMouseX, t),lerp(y, lerpedMouseY, t));
    }

    let frameAmount = 8;

    push();

    rectMode(CORNER);
    for (let i = 1; i <= frameAmount; i++) {
        let progress = i / (frameAmount + 1);

        let frameT = 1 - pow(1 - progress, 2);

        let left = lerp(0, lerpedMouseX, frameT);
        let right = lerp(width, lerpedMouseX, frameT);
        let top = lerp(0, lerpedMouseY, frameT);
        let bottom = lerp(height, lerpedMouseY, frameT);

        rect(left, top, right - left, bottom - top);
    }

    pop();

    fill(135,100,100);
    noStroke();
    textFont('Courier New', 30);
    textAlign(CENTER, CENTER);
    text('EXIT', lerpedMouseX, lerpedMouseY);

}
