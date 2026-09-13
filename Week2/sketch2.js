let colorMiddle;
let from;
let to;

function setup(){
    createCanvas(windowWidth, windowHeight);
    background(0);
    colorMode(HSB);
}


function draw(){

    let from = color(225, 75, 100);
    let to = color(30, 75, 100);

    for (let y = 0; y < height; y += 1) {
        let n = map(y, 0, height, 0, 1);
        let colorMiddle = lerpColor(from, to, n);

        fill(colorMiddle);
        noStroke();
        rect(0,y,width,10);
    }

    if (mouseIsPressed === true){
        n2 = map (mouseY,0,height,0,1);
        let colorToday = lerpColor(from,to,n2);
        background(colorToday);

        textSize(32);
        fill(255);
        noStroke();
        text('Today’s color', width/2-120, height/2);
    }

}
