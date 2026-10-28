const DETAIL = 3; // 改成 3 会更细致；改成 1 会有更明显的像素颗粒
const FACE_SIZE = 240;

let screens = {};
let catalog = [];

let eyeX = 0;
let eyeY = 0;
let targetX = 0;
let targetY = 0;
let nextLook = 0;
let eyeResponse = 300;

function setup() {
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";

  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noSmooth();
  frameRate(30);

  screens = {
    stars: createGraphics(240 * DETAIL, 240 * DETAIL),
    contours: createGraphics(240 * DETAIL, 240 * DETAIL),
    signal: createGraphics(240 * DETAIL, 240 * DETAIL),
    eye: createGraphics(360 * DETAIL, 190 * DETAIL),
    blue: createGraphics(160 * DETAIL, 190 * DETAIL)
  };

  for (let pg of Object.values(screens)) {
    pg.pixelDensity(1);
    pg.textFont("monospace");
    pg.noSmooth();
  }

  randomSeed(32);

  for (let i = 0; i < 125; i++) {
    catalog.push({
      x: random(12, 228),
      y: random(30, 218),
      phase: random(TWO_PI),
      size: random() < 0.1 ? 3 : 2
    });
  }
}

function draw() {
  let seconds = millis() / 1000;

  drawStars(screens.stars, seconds);
  drawContours(screens.contours, seconds);
  drawSignal(screens.signal, seconds);
  drawEye(screens.eye);

  screens.blue.background(0, 0, 255);

  drawPreview();
}

function drawHeader(pg, title, number) {
  pg.noStroke();
  pg.fill(231);
  pg.textSize(11);

  pg.textAlign(LEFT, TOP);
  pg.text(title, 10, 8);

  pg.textAlign(RIGHT, TOP);
  pg.text(number, FACE_SIZE - 10, 8);

  pg.stroke(120);
  pg.strokeWeight(1);
  pg.line(10, 25, FACE_SIZE - 10, 25);
}

// 立方体的第一个面：星图
function drawStars(pg, t) {
  pg.reset();
  pg.background(5, 7, 11);
  pg.scale(DETAIL);

  pg.stroke(53, 65, 78);
  pg.strokeWeight(1);

  for (let n = 24; n < 240; n += 24) {
    pg.line(n, 29, n, 225);
    pg.line(10, n + 5, 230, n + 5);
  }

  pg.noStroke();

  for (let star of catalog) {
    let light =
      110 + 130 * (0.5 + 0.5 * sin(t * 0.7 + star.phase));

    pg.fill(light);
    pg.rect(
      floor(star.x),
      floor(star.y),
      star.size,
      star.size
    );
  }

  let tracked = catalog[17];
  let x = floor(tracked.x + sin(t * 0.9) * 3);
  let y = floor(tracked.y + cos(t * 0.8) * 3);

  pg.noFill();
  pg.stroke(238);
  pg.rect(x - 9, y - 9, 18, 18);
  pg.line(x - 14, y, x - 7, y);
  pg.line(x + 7, y, x + 14, y);

  pg.stroke(180);
  let scanX = 10 + (t * 18) % 220;
  pg.line(scanX, 28, scanX, 226);

  drawHeader(pg, "STAR CATALOG", "01 / 03");

  pg.noStroke();
  pg.fill(220);
  pg.textAlign(LEFT, TOP);
  pg.textSize(10);
  pg.text("RA  14:27:09", 10, 228);
}

// 第二个面：等高线扫描
function drawContours(pg, t) {
  pg.reset();
  pg.background(5, 7, 11);
  pg.scale(DETAIL);

  pg.noFill();
  pg.strokeWeight(1);

  let cx = 121 + sin(t * 0.19) * 8;
  let cy = 130 + cos(t * 0.15) * 5;

  for (let ring = 0; ring < 10; ring++) {
    pg.stroke(70 + ring * 17);
    pg.beginShape();

    for (let step = 0; step <= 96; step++) {
      let a = TWO_PI * step / 96;
      let r = 12 + ring * 10;

      let bend =
        4 * sin(a * 3 + t * 0.45 + ring * 0.35);

      let organic =
        7 * (
          noise(
            2 + cos(a) * 0.9 + ring * 0.14,
            2 + sin(a) * 0.9,
            t * 0.08
          ) - 0.5
        );

      pg.vertex(
        floor(cx + cos(a) * (r + bend + organic)),
        floor(cy + sin(a) * (r + bend + organic) * 0.87)
      );
    }

    pg.endShape();
  }

  pg.noStroke();
  pg.fill(235);
  pg.rect(floor(cx) - 2, floor(cy) - 2, 4, 4);

  drawHeader(pg, "SURFACE SCAN", "02 / 03");

  pg.noStroke();
  pg.fill(220);
  pg.textAlign(LEFT, TOP);
  pg.textSize(10);
  pg.text(
    "ELEV  +" + nf(floor(52 + sin(t * 0.7) * 8), 3),
    10,
    228
  );
}

// 第三个面：信号波形
function drawSignal(pg, t) {
  pg.reset();
  pg.background(5, 7, 11);
  pg.scale(DETAIL);

  pg.stroke(58);
  pg.strokeWeight(1);

  for (let x = 12; x < 240; x += 24) {
    pg.line(x, 30, x, 220);
  }

  for (let y = 60; y < 240; y += 55) {
    pg.line(10, y, 230, y);
  }

  for (let band = 0; band < 3; band++) {
    pg.noFill();
    pg.stroke(245 - band * 40);
    pg.strokeWeight(band === 1 ? 2.3 : 1.3);
    pg.beginShape();

    for (let x = 10; x <= 230; x += 2) {
      let baseline = 63 + band * 61;

      let wave = sin(
        x * (0.095 + band * 0.025) -
        t * (1.5 + band * 0.42)
      );

      let small =
        sin(x * 0.31 + t * 1.7 + band) * 2;

      let spike =
        band === 1
          ? pow(max(0, sin(t * 0.43)), 10) * 13
          : 0;

      pg.vertex(
        x,
        floor(baseline + wave * (9 + spike) + small)
      );
    }

    pg.endShape();
  }

  let scanX = 10 + (t * 26) % 220;

  pg.stroke(235);
  pg.strokeWeight(1);
  pg.line(scanX, 30, scanX, 220);

  drawHeader(pg, "SIGNAL MONITOR", "03 / 03");

  pg.noStroke();
  pg.fill(220);
  pg.textAlign(LEFT, TOP);
  pg.textSize(10);
  pg.text(
    "HZ  " + nf(floor(54 + 7 * sin(t * 1.1)), 3),
    10,
    228
  );
}

function updateGaze() {
  let now = millis();

  if (now >= nextLook) {
    targetX = random(-46, 46);
    targetY = random(-12, 12);

    eyeResponse =
      random() < 0.42
        ? 65
        : random(450, 1000);

    nextLook = now + random(650, 2600);
  }

  let step =
    1 - exp(-min(deltaTime, 50) / eyeResponse);

  eyeX = lerp(eyeX, targetX, step);
  eyeY = lerp(eyeY, targetY, step);
}

// 墙上的眼睛
function drawEye(pg) {
  updateGaze();

  pg.reset();
  pg.background(5, 7, 11);
  pg.scale(DETAIL);

  let ctx = pg.drawingContext;
  ctx.save();

  // 放大的眼睛轮廓
  ctx.beginPath();
  ctx.moveTo(4, 95);
  ctx.bezierCurveTo(92, -18, 268, -18, 356, 95);
  ctx.bezierCurveTo(268, 208, 92, 208, 4, 95);
  ctx.closePath();

  ctx.fillStyle = "#f0f0f0";
  ctx.fill();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#d7d7d7";
  ctx.stroke();

  // 后面的纹理和瞳孔只画在眼睛内部
  ctx.clip();

  pg.noStroke();

  // 很浅的横向扫描纹理
  for (let yy = 18; yy < 178; yy += 11) {
    pg.fill(221);
    pg.rect(0, yy, 360, 0.5);
  }

  // 固定的细小颗粒，不会每帧乱闪
  for (let i = 0; i < 85; i++) {
    let px = (i * 97 + 41) % 360;
    let py = (i * 53 + 23) % 190;

    pg.fill(211);
    pg.rect(px, py, 0.7, 0.7);
  }

  let x = floor(180 + eyeX);
  let y = floor(95 + eyeY);

  // 规整的同心圆瞳孔，没有高光
  pg.fill(6, 8, 12);
  pg.circle(x, y, 112);

  pg.fill(240);
  pg.circle(x, y, 74);

  pg.fill(6, 8, 12);
  pg.circle(x, y, 54);

  ctx.restore();
}

// 只负责在电脑上预览五块画面
function drawPreview() {
  background(0);

  let gap = max(12, min(width, height) * 0.025);

  let scaleFactor = min(
    (width - gap * 4) / (240 * 3),
    (height - gap * 3) / (190 + 240)
  );

  let topWidth =
    (360 + 160) * scaleFactor + gap;

  let bottomWidth =
    240 * 3 * scaleFactor + gap * 2;

  let totalHeight =
    (190 + 240) * scaleFactor + gap;

  let y = (height - totalHeight) / 2;
  let topX = (width - topWidth) / 2;
  let bottomX = (width - bottomWidth) / 2;

  image(
    screens.eye,
    topX,
    y,
    360 * scaleFactor,
    190 * scaleFactor
  );

  image(
    screens.blue,
    topX + 360 * scaleFactor + gap,
    y,
    160 * scaleFactor,
    190 * scaleFactor
  );

  y += 190 * scaleFactor + gap;

  image(
    screens.stars,
    bottomX,
    y,
    240 * scaleFactor,
    240 * scaleFactor
  );

  image(
    screens.contours,
    bottomX + 240 * scaleFactor + gap,
    y,
    240 * scaleFactor,
    240 * scaleFactor
  );

  image(
    screens.signal,
    bottomX + 480 * scaleFactor + gap * 2,
    y,
    240 * scaleFactor,
    240 * scaleFactor
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}