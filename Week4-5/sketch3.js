let exportSvg = false;

let lineCount = 40;
let stepsPerDirection = 105;
let stepSize = 0.03;

let stopStrength = 0.04;

let a;
let b;
let c;
let d;

let seeds = [];
let currentSeed = 0;

let presets = [
  {
    a: -2.24,
    b: 0.43,
    c: -0.65,
    d: -2.43
  },
  {
    a: -2.7,
    b: -0.09,
    c: -0.86,
    d: -2.2
  },
  {
    a: 1.4,
    b: -2.3,
    c: 2.4,
    d: -2.1
  },
  {
    a: -2.0,
    b: -2.0,
    c: -1.2,
    d: 2.0
  },
  {
    a: 1.7,
    b: 1.7,
    c: 0.6,
    d: 1.2
  }
];

function setup() {
  createCanvas(576, 576);

  stroke(0);
  strokeWeight(0.4);
  noFill();

  generateAttractor();
}

function draw() {
  background(255);

  if (exportSvg) {
    beginRecordSvg("de-jong-flow-field.svg");
  }

  drawStreamlines();

  if (exportSvg) {
    endRecordSvg();
    exportSvg = false;
  }
}

function mousePressed() {
  generateAttractor();
}

function keyPressed() {
  if (key === "s" || key === "S") {
    exportSvg = true;
  }
}

function generateAttractor() {
  let selected = random(presets);

  a = selected.a + random(-0.09, 0.09);
  b = selected.b + random(-0.09, 0.09);
  c = selected.c + random(-0.09, 0.09);
  d = selected.d + random(-0.09, 0.09);

  currentSeed = floor(random(100000));

  randomSeed(currentSeed);
  noiseSeed(currentSeed);

  seeds = [];

  for (let i = 0; i < lineCount; i++) {
    let ring = i % 3;

    let angle =
      map(i, 0, lineCount, 0, TWO_PI) +
      ring * 0.35;

    let radiusX;
    let radiusY;

    if (ring === 0) {
      radiusX = 0.5;
      radiusY = 0.35;
    } else if (ring === 1) {
      radiusX = 1.0;
      radiusY = 0.72;
    } else {
      radiusX = 1.55;
      radiusY = 1.1;
    }

    radiusX += random(-0.12, 0.12);
    radiusY += random(-0.12, 0.12);

    let x = cos(angle) * radiusX;
    let y = sin(angle) * radiusY;

    seeds.push({
      x: x,
      y: y
    });
  }
}

function drawStreamlines() {
  for (let i = 0; i < seeds.length; i++) {
    let seed = seeds[i];

    let backwardPoints = traceLine(
      seed.x,
      seed.y,
      -1,
      i
    );

    let forwardPoints = traceLine(
      seed.x,
      seed.y,
      1,
      i
    );

    backwardPoints.reverse();

    if (forwardPoints.length > 0) {
      forwardPoints.shift();
    }

    let completeLine =
      backwardPoints.concat(forwardPoints);

    if (completeLine.length < 2) {
      continue;
    }

    beginShape();

    for (let point of completeLine) {
      let screenPoint = convertToScreen(
        point.x,
        point.y
      );

      vertex(
        screenPoint.x,
        screenPoint.y
      );
    }

    endShape();
  }
}

function traceLine(startX, startY, direction, lineIndex) {
  let points = [];

  let x = startX;
  let y = startY;

  for (
    let step = 0;
    step < stepsPerDirection;
    step++
  ) {
    let field = deJongField(x, y);

    let strength = sqrt(
      field.x * field.x +
      field.y * field.y
    );

    if (strength < stopStrength) {
      break;
    }

    if (
      x < -2.35 ||
      x > 2.35 ||
      y < -2.35 ||
      y > 2.35
    ) {
      break;
    }

    points.push({
      x: x,
      y: y
    });

    let angle = atan2(
      field.y,
      field.x
    );

    let noiseValue = noise(
      x * 0.7 + lineIndex * 0.04,
      y * 0.7
    );

    let curl = map(
      noiseValue,
      0,
      1,
      -0.08,
      0.08
    );

    angle += curl;

    x +=
      cos(angle) *
      stepSize *
      direction;

    y +=
      sin(angle) *
      stepSize *
      direction;
  }

  return points;
}

function deJongField(x, y) {
  let targetX =
    sin(a * y) -
    cos(b * x);

  let targetY =
    sin(c * x) -
    cos(d * y);

  return {
    x: targetX - x,
    y: targetY - y
  };
}

function convertToScreen(x, y) {
  let scaleAmount =
    min(width, height) * 0.41;

  return {
    x: width / 2 + x * scaleAmount,
    y: height / 2 + y * scaleAmount
  };
}