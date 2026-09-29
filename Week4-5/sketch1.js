let exportSvg = false;
let armCount = 26; 
let layerCount = 18; 

function keyPressed() {
  if (key === "s" || key === "S") {
    exportSvg = true;
  }
}

function setup() {
  createCanvas(576, 384);

  stroke(0);
  strokeWeight(0.7);
  noFill();
}

function draw() {
  background(255);

    if (exportSvg) {
    beginRecordSvg("lissajous-grid.svg");
  }

  translate(width / 2, height / 2);

  let rayCount = 72;
  let layerCount = 3;
  let turns = 1.7; 
  let stretch = map(mouseX, 0, width, 0.7, 1.2);

  stroke(0);
  strokeWeight(0.45);

  for (let i = 0; i < rayCount; i++) {
    let progress = i / (rayCount - 1);

    let baseAngle = progress * TWO_PI * turns;
    let startRadius = 4 + pow(progress, 2.2) * 78;

    let baseLength = lerp(28, 200, pow(progress, 1.35)) * stretch;

    for (let layer = 0; layer < layerCount; layer++) {
      let offset = map(layer, 0, layerCount - 1, -0.035, 0.035);

      let innerAngle = baseAngle + offset;
      let x1 = cos(innerAngle) * startRadius;
      let y1 = sin(innerAngle) * startRadius;

      let outerAngle = baseAngle - progress * 0.35 + offset;

      let variation = map(noise(i * 0.18, layer * 3), 0, 1, -28, 28);
      let endRadius = startRadius + baseLength + variation;

      let x2 = cos(outerAngle) * endRadius;
      let y2 = sin(outerAngle) * endRadius;

      line(x1, y1, x2, y2);
    }
  }

    if (exportSvg) {
    endRecordSvg();
    exportSvg = false;
  }
}