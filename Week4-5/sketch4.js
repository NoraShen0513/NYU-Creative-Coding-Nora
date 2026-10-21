let exportSvg = false;
let needsRedraw = true;

let symmetry = 7;
let layerCount = 7;
let pointCount = 420;

let phase;
let mainWave;
let smallWave;
let twistAmount;

function setup() {
  createCanvas(576, 576);

  stroke(0);
  strokeWeight(0.45);
  noFill();

  generatePattern();
}

function draw() {
  if (!needsRedraw && !exportSvg) {
    return;
  }

  background(255);

  if (exportSvg) {
    beginRecordSvg(
      "rotational-guilloche.svg"
    );
  }

  push();

  translate(
    width / 2,
    height / 2
  );

  drawGuilloche();

  pop();

  if (exportSvg) {
    endRecordSvg();
    exportSvg = false;
  }

  needsRedraw = false;
}

function mousePressed() {
  generatePattern();
  needsRedraw = true;
}

function keyPressed() {
  if (key === "s" || key === "S") {
    exportSvg = true;
    needsRedraw = true;
  }
}

function generatePattern() {

  symmetry = random([
    5,
    6,
    7,
    8,
    9
  ]);

  phase = random(TWO_PI);

  mainWave = random(30, 42);

  smallWave = random(6, 13);

  twistAmount = random(0.04, 0.09);
}

function drawGuilloche() {
  for (
    let layer = 0;
    layer < layerCount;
    layer++
  ) {

    let middleOffset =
      layer -
      (layerCount - 1) / 2;

    let baseRadius =
      155 +
      middleOffset * 10;

    let layerPhase =
      phase +
      middleOffset * 0.12;

    beginShape();

    for (
      let i = 0;
      i <= pointCount;
      i++
    ) {
      let angle = map(
        i,
        0,
        pointCount,
        0,
        TWO_PI
      );

      let wave1 =
        mainWave *
        sin(
          symmetry * angle +
          layerPhase
        );


      let wave2 =
        smallWave *
        sin(
          symmetry *
          2 *
          angle -
          layerPhase * 1.5
        );

      let radius =
        baseRadius +
        wave1 +
        wave2;

      let twist =
        twistAmount *
        sin(
          symmetry * angle +
          layerPhase
        );

      let finalAngle =
        angle + twist;

      let x =
        cos(finalAngle) *
        radius;

      let y =
        sin(finalAngle) *
        radius;

      vertex(x, y);
    }

    endShape();
  }
}