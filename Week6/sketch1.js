let foods = [];
let foodTypes = ["fishball", "mushroom", "tomato", "fishTofu", "greens", "lotus"];
let potX, potY, potR;
let cookSeconds = 7;

function setup() {
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  createCanvas(windowWidth, windowHeight);
  setPotSize();

  let starters = [
    ["fishball", -0.52, -0.37],
    ["mushroom", -0.45, 0.32],
    ["fishTofu", -0.52, -0.05],
    ["tomato", 0.42, -0.38],
    ["greens", 0.60, 0.11],
    ["lotus", 0.39, 0.52]
  ];

  for (let item of starters) {
    addFood(potX + item[1] * potR, potY + item[2] * potR, item[0]);
  }
}

function setPotSize() {
  potX = width / 2;
  potY = height / 2;
  potR = min(width, height) * 0.44;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setPotSize();
}

function draw() {
  background(250, 249, 245);
  drawPot();
  drawBubbles();

  for (let food of foods) {
    food.cookTime += min(deltaTime, 100) / 1000;
    drawFood(food);
  }

  drawDividerAndRim();
}

function dividerX(y) {
  let t = constrain((y - (potY - potR)) / (2 * potR), 0, 1);
  return potX - sin(TWO_PI * t) * potR * 0.18;
}

function drawPot() {
  noStroke();

  fill(216, 192, 151);
  circle(potX, potY, potR * 2.14);

  fill(168, 127, 78);
  circle(potX, potY, potR * 2.075);

  fill(239, 220, 179);
  circle(potX, potY, potR * 2);

  fill(197, 47, 43);
  beginShape();

  for (let step = 0; step <= 80; step++) {
    let y = potY - potR + step * (2 * potR / 80);
    vertex(dividerX(y), y);
  }

  for (let step = 0; step <= 80; step++) {
    let a = HALF_PI + step * PI / 80;
    vertex(potX + cos(a) * potR, potY + sin(a) * potR);
  }

  endShape(CLOSE);
}

function drawBubbles() {
  noStroke();

  for (let i = 0; i < 18; i++) {
    let a = i * 2.399;
    let d = potR * (0.26 + (i % 5) * 0.13);
    let size = potR * (0.012 + 0.008 * (1 + sin(frameCount * 0.045 + i)));

    fill(255, 246, 220, 110);
    circle(potX + cos(a) * d, potY + sin(a) * d, size);
  }
}

function drawDividerAndRim() {
  noFill();
  stroke(135, 93, 60);
  strokeWeight(potR * 0.025);
  strokeCap(ROUND);

  beginShape();
  for (let step = 0; step <= 80; step++) {
    let y = potY - potR + step * (2 * potR / 80);
    vertex(dividerX(y), y);
  }
  endShape();

  stroke(241, 208, 151);
  circle(potX, potY, potR * 2.075);
  noStroke();
}

function addFood(x, y, type = random(foodTypes)) {
  foods.push({
    type: type,
    u: (x - potX) / potR,
    v: (y - potY) / potR,
    side: x < dividerX(y) ? "spicy" : "bone",
    scale: random(0.28, 0.34),
    angle: random(-0.24, 0.24),
    phase: random(TWO_PI),
    cookTime: 0
  });
}

function foodPosition(food) {
  return {
    x: potX + food.u * potR
      + sin(frameCount * 0.015 + food.phase) * potR * 0.006,
    y: potY + food.v * potR
      + cos(frameCount * 0.020 + food.phase) * potR * 0.008
  };
}

function mousePressed() {
  if (dist(mouseX, mouseY, potX, potY) > potR * 0.91) return;

  for (let i = foods.length - 1; i >= 0; i--) {
    let food = foods[i];
    let p = foodPosition(food);

    if (dist(mouseX, mouseY, p.x, p.y) < food.scale * potR * 0.66) {
      if (food.cookTime >= cookSeconds) foods.splice(i, 1);
      return;
    }
  }

  addFood(mouseX, mouseY);
}

function keyPressed() {
  if (key === "c" || key === "C") foods = [];
}

function foodColor(food, r, g, b) {
  let cooked = constrain(food.cookTime / cookSeconds, 0, 1);
  let target = food.side === "spicy"
    ? color(164, 48, 41)
    : color(105, 87, 68);
  let amount = food.side === "spicy" ? 0.24 : 0.14;

  return lerpColor(color(r, g, b), target, cooked * amount);
}

function drawFood(food) {
  let p = foodPosition(food);
  let s = potR * food.scale;

  push();
  translate(p.x, p.y);
  rotate(food.angle + sin(frameCount * 0.012 + food.phase) * 0.025);
  noStroke();

  if (food.type === "fishball") {
    // 一颗鱼丸
    fill(foodColor(food, 216, 188, 147));
    circle(0, s * 0.04, s * 0.95);

    fill(foodColor(food, 251, 236, 204));
    circle(0, 0, s * 0.88);

    fill(foodColor(food, 255, 250, 227));
    ellipse(-s * 0.14, -s * 0.19, s * 0.33, s * 0.15);

  } else if (food.type === "mushroom") {
    // 俯视香菇，中央是 X 形花刀
    fill(foodColor(food, 110, 68, 49));
    ellipse(0, s * 0.025, s * 1.10, s * 1.02);

    fill(foodColor(food, 166, 101, 62));
    ellipse(-s * 0.025, -s * 0.035, s * 0.99, s * 0.92);

    fill(foodColor(food, 193, 123, 76));
    ellipse(-s * 0.13, -s * 0.19, s * 0.58, s * 0.40);

    fill(foodColor(food, 250, 221, 173));
    quad(
      -s * 0.35, -s * 0.27,
      -s * 0.27, -s * 0.35,
       s * 0.34,  s * 0.25,
       s * 0.26,  s * 0.33
    );
    quad(
      -s * 0.35,  s * 0.25,
      -s * 0.27,  s * 0.33,
       s * 0.34, -s * 0.27,
       s * 0.26, -s * 0.35
    );

  } else if (food.type === "tomato") {
    // 番茄切片
    fill(foodColor(food, 171, 45, 48));
    ellipse(0, 0, s * 1.10, s * 1.02);

    fill(foodColor(food, 245, 113, 94));
    ellipse(0, 0, s * 0.95, s * 0.89);

    fill(foodColor(food, 255, 163, 132));
    ellipse(0, 0, s * 0.74, s * 0.70);

    for (let i = 0; i < 4; i++) {
      let a = TWO_PI * i / 4 + PI / 4;

      fill(foodColor(food, 195, 51, 53));
      ellipse(
        cos(a) * s * 0.23,
        sin(a) * s * 0.22,
        s * 0.30,
        s * 0.23
      );

      fill(foodColor(food, 255, 218, 153));
      ellipse(
        cos(a) * s * 0.27,
        sin(a) * s * 0.25,
        s * 0.075,
        s * 0.045
      );
    }

    fill(foodColor(food, 255, 197, 163));
    beginShape();
    for (let i = 0; i < 8; i++) {
      let a = TWO_PI * i / 8 - HALF_PI;
      let r = i % 2 === 0 ? s * 0.23 : s * 0.11;
      vertex(cos(a) * r, sin(a) * r);
    }
    endShape(CLOSE);

  } else if (food.type === "fishTofu") {
    // 两块鱼豆腐
    drawFishTofu(food, -s * 0.22, -s * 0.14, s * 0.68);
    drawFishTofu(food, s * 0.19, s * 0.17, s * 0.72);

  } else if (food.type === "greens") {
    // 三片青菜叶
    push();
    translate(-s * 0.13, s * 0.18);
    rotate(-0.45);
    drawLeaf(food, s * 0.85, s * 0.26, 68, 133, 77);
    pop();

    push();
    translate(s * 0.13, s * 0.18);
    rotate(0.43);
    drawLeaf(food, s * 0.88, s * 0.27, 83, 151, 83);
    pop();

    drawLeaf(food, s * 0.98, s * 0.24, 115, 178, 91);

    fill(foodColor(food, 213, 223, 157));
    beginShape();
    vertex(-s * 0.24, s * 0.12);
    vertex(-s * 0.13, s * 0.42);
    vertex(0, s * 0.53);
    vertex(s * 0.13, s * 0.42);
    vertex(s * 0.24, s * 0.12);
    vertex(s * 0.06, s * 0.18);
    vertex(0, s * 0.47);
    vertex(-s * 0.06, s * 0.18);
    endShape(CLOSE);

  } else if (food.type === "lotus") {
    // 藕片
    fill(foodColor(food, 186, 143, 103));
    circle(0, s * 0.035, s * 1.10);

    fill(foodColor(food, 249, 231, 194));
    circle(0, 0, s * 1.04);

    fill(foodColor(food, 255, 243, 211));
    circle(-s * 0.07, -s * 0.08, s * 0.82);

    let soup = food.side === "spicy"
      ? color(197, 47, 43)
      : color(239, 220, 179);

    fill(soup);
    for (let i = 0; i < 6; i++) {
      let a = TWO_PI * i / 6 - HALF_PI;
      ellipse(
        cos(a) * s * 0.31,
        sin(a) * s * 0.31,
        s * 0.19,
        s * 0.23
      );
    }
    circle(0, 0, s * 0.17);
  }

  pop();
}

function drawFishTofu(food, x, y, size) {
  push();
  translate(x, y);
  rotate(-0.13);
  rectMode(CENTER);

  fill(foodColor(food, 198, 133, 65));
  rect(0, size * 0.09, size, size, size * 0.13);

  fill(foodColor(food, 243, 188, 95));
  rect(0, 0, size, size * 0.92, size * 0.13);

  fill(foodColor(food, 255, 218, 137));
  rect(
    -size * 0.09,
    -size * 0.13,
    size * 0.59,
    size * 0.44,
    size * 0.12
  );

  pop();
}

function drawLeaf(food, length, halfWidth, r, g, b) {
  fill(foodColor(food, r, g, b));
  beginShape();

  for (let i = 0; i <= 16; i++) {
    let t = i / 16;
    vertex(
      cubic(0, -halfWidth * 1.25, -halfWidth * 1.2, 0, t),
      cubic(0, -length * 0.21, -length * 0.81, -length, t)
    );
  }

  for (let i = 0; i <= 16; i++) {
    let t = i / 16;
    vertex(
      cubic(0, halfWidth * 1.2, halfWidth * 1.15, 0, t),
      cubic(-length, -length * 0.83, -length * 0.23, 0, t)
    );
  }

  endShape(CLOSE);

  fill(foodColor(food, 184, 211, 126));
  triangle(
    0, -length * 0.07,
    -halfWidth * 0.05, -length * 0.67,
    0, -length * 0.94
  );
}

function cubic(a, b, c, d, t) {
  let inv = 1 - t;

  return inv * inv * inv * a
    + 3 * inv * inv * t * b
    + 3 * inv * t * t * c
    + t * t * t * d;
}