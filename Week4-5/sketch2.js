let exportSvg = false;
let cols = 7;
let rows = 5;

function keyPressed() {
  if (key === "s" || key === "S") {
    exportSvg = true;
  }
}

function setup() {
  createCanvas(576, 384);

  stroke(0);
  strokeWeight(0.55);
  noFill();
}

function draw() {
    background(255);

    if (exportSvg) {
    beginRecordSvg("lissajous-grid.svg");
    }

  let cellW = width / cols;
  let cellH = height / rows;

  let mousePhase = map(mouseX, 0, width, -PI / 3, PI / 3);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {

      let centerX = col * cellW + cellW / 2;
      let centerY = row * cellH + cellH / 2;

      let xFrequency = row + 1;
      let yFrequency = row + 2;

      let phase = map(col, 0, cols - 1, -PI / 2, PI / 2);
      phase += mousePhase;

      push();
      translate(centerX, centerY);

      drawLissajous(
        xFrequency,
        yFrequency,
        phase,
        cellW * 0.4,
        cellH * 0.4
      );

      pop();
    }
  }
    if (exportSvg) {
    endRecordSvg();
    exportSvg = false;
  }
}

function drawLissajous(xFrequency, yFrequency, phase, sizeX, sizeY) {
  beginShape();

  for (let t = 0; t <= TWO_PI; t += 0.02) {
    let x = sin(xFrequency * t + phase) * sizeX;
    let y = sin(yFrequency * t) * sizeY;

    vertex(x, y);
  }

  endShape();
}