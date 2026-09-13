function setup(){
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB);
}


function draw(){
    background(0);

    let n=25
    let m=6

    x1 = random(30,width-100);
    y1 = random (50,height/6);

    x2 = random(50,width-50);
    y2 = random (height/6, height/3);

    x3 = random(50,width-50);
    y3 = random (height/3,height/2);

    x4 = random(100,width-100);
    y4 = random (height/2,height/1.5);

    x5 = random(100,width-100);
    y5 = random (height/1.5,height/1.2);

    x6 = random(100,width-100); 
    y6 = random (height/1.2,height-30);

    stroke(255);
    line(x1, y1+n, x2, y2-n);
    line(x2, y2+n, x3, y3-n);
    line(x3, y3+n, x4, y4-n);
    line(x4, y4+n, x5, y5-n);
    line(x5, y5+n, x6, y6-n);

    textFont('Courier New', 32);
    fill(255);
    noStroke();
    text('Love...', x1-70, y1+m);
    text('love!', x2-40, y2+m);
    text('Joy', x3-30, y3+m);
    text('Torment', x4-70, y4+m);
    text('Sweet rapture', x5-100, y5+m);
    text('Cruel anxiety', x6-120, y6+m);
    
    noLoop()
}

function mouseClicked(){
    redraw();
}