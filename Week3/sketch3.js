let backButton;

let cellSize = 30;
let words = "THE FOOL THAT DOESN'T BELONG TO THIS ERA. " +
  "THE MYSTERIOUS RULER ABOVE THE GRAY FOG. " +
  "THE KING OF YELLOW AND BLACK WHO WIELDS GOOD LUCK. ";

function setup() {
    createCanvas(windowWidth, windowHeight);

    textSize(18);
    textAlign(CENTER, CENTER);
    textFont('Courier New');

    fill(255);
    noStroke();

    backButton = createButton("← Back");

    backButton.position(20, 25);

    backButton.mousePressed(() => {
        window.location.href = "Week3.html";
    });

    backButton.style("font-family", "Courier New");
    backButton.style("font-size", "14px");
    backButton.style("padding", "6px 10px");
    backButton.style("background", "transparent");
    backButton.style("color", "#ff0000");
    backButton.style("border", "transparent");
}

function drawSymbol(x, y, col, row) {
  push();

  translate(x, y);
  noFill();
  stroke(255);

  let symbolType = floor(noise(col * 0.7, row * 0.7) * 4);

  if (symbolType == 0) {
    line(-8, 0, 8, 0);
    line(0, -8, 0, 8);
  }

  if (symbolType == 1) {
    rectMode(CENTER);
    rect(0, 0, 14, 14);
  }

  if (symbolType == 2) {
    circle(0, 0, 14);
    line(-7, 7, 7, -7);
  }

  if (symbolType == 3) {
    triangle(0, -8, -8, 8, 8, 8);
  }

  pop();
}



function draw() {
  background(0);
  let progress = constrain(map(mouseX, 0, width, 0, 1), 0, 1);

  let numCols = width / cellSize;
  let numRows = height / cellSize;

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
        
        let changePoint = noise(col * 0.3, row * 0.3);

        let x = col * cellSize + cellSize / 2;
        let y = row * cellSize + cellSize / 2;

        let index = (row * floor(numCols) + col) % words.length;
        let currentLetter = words[index];

        if (progress < changePoint) {
            text(currentLetter, x, y);
        } else {
            drawSymbol(x, y, col, row);
        }
    }
  }
}