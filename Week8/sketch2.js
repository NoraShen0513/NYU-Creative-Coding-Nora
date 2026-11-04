const BLUE = "#0022FF";
const BALLOON_SIZE = 600;
const BALLOON_R = 285;
const PIXEL = 10;

let pMapper;
let balloonMap;
let balloonSurface;
let testMode = false;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  frameRate(30);

  balloonSurface = createGraphics(BALLOON_SIZE, BALLOON_SIZE);
  balloonSurface.pixelDensity(1);

  pMapper = createProjectionMapper(this);
  balloonMap = pMapper.createQuadMap(BALLOON_SIZE, BALLOON_SIZE);
}

function draw() {
  background(0);

  if (testMode) {
    drawBalloonTest();
  } else {
    drawTide(balloonSurface, millis() * 0.001);
  }

  balloonMap.displayTexture(balloonSurface);
}

function waterline(x, t) {
  let cycle = ((t + 2) % 8) / 8;
  let tide = (1 - cos(TWO_PI * cycle)) / 2;

  let level = lerp(710, -110, tide);
  let swell = 46 * sin(x * 0.013 - t * 3.1);
  let chop = 13 * sin(x * 0.035 + t * 5.2);

  return level + swell + chop;
}

function pixelNoise(a, b) {
  let n = sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - floor(n);
}

function drawTide(pg, t) {
  pg.background(0);

  let ctx = pg.drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.arc(
    BALLOON_SIZE / 2,
    BALLOON_SIZE / 2,
    BALLOON_R,
    0,
    TWO_PI
  );
  ctx.clip();

  pg.noStroke();

  for (let col = 0; col < BALLOON_SIZE / PIXEL; col++) {
    let x = col * PIXEL;
    let edge =
      floor(waterline(x + PIXEL / 2, t) / PIXEL) * PIXEL;

    pg.fill(BLUE);
    pg.rect(x, edge, PIXEL, BALLOON_SIZE - edge);

    for (let row = 0; row < 4; row++) {
      let chance = [1, 0.9, 0.68, 0.23][row];
      let flicker = pixelNoise(col, row + floor(t * 8));

      if (flicker < chance) {
        pg.fill(255);
        pg.rect(x, edge + row * PIXEL, PIXEL, PIXEL);
      }
    }

    if (pixelNoise(col, floor(t * 9) + 80) > 0.78) {
      pg.fill(255);
      pg.rect(
        x,
        edge - PIXEL * 2,
        PIXEL * 0.55,
        PIXEL * 0.55
      );
    }
  }

  pg.fill(255, 170);

  for (let i = 0; i < 95; i++) {
    let x =
      (i * 137 + t * (28 + (i % 5) * 9)) %
      BALLOON_SIZE;

    let y =
      (i * 173 + t * (18 + (i % 4) * 6)) %
      BALLOON_SIZE;

    if (y > waterline(x, t) + 55) {
      let size = i % 7 === 0 ? 5 : 3;

      pg.rect(
        floor(x / PIXEL) * PIXEL,
        floor(y / PIXEL) * PIXEL,
        size,
        size
      );
    }
  }

  ctx.restore();
}

function drawBalloonTest() {
  let pg = balloonSurface;

  pg.background(0);
  pg.noStroke();
  pg.fill(BLUE);
  pg.circle(
    BALLOON_SIZE / 2,
    BALLOON_SIZE / 2,
    BALLOON_R * 2
  );

  pg.stroke(255);
  pg.strokeWeight(2);
  pg.noFill();
  pg.line(300, 300 - BALLOON_R, 300, 300 + BALLOON_R);
  pg.line(300 - BALLOON_R, 300, 300 + BALLOON_R, 300);

  pg.noStroke();
  pg.fill(255);
  pg.textAlign(CENTER, CENTER);
  pg.textSize(20);
  pg.text("BALLOON", 300, 265);
}

function keyPressed() {
  if (key === "t" || key === "T") testMode = !testMode;
  if (key === "c" || key === "C") pMapper.toggleCalibration();
  if (key === "f" || key === "F") fullscreen(!fullscreen());
  if (key === "s" || key === "S") pMapper.save("balloon-map.json");
  if (key === "l" || key === "L") pMapper.load("balloon-map.json");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}