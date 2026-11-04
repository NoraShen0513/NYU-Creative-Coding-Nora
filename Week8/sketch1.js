let time = 0;

function setup() {
  createCanvas(420, 620);
  pixelDensity(5);
  frameRate(30);
  strokeWeight(1);
}

function draw() {
  background(0);

  push();
  translate(width / 2, height / 2);
  scale(1.3);

  stroke(255, 85);

  for (let i = 0; i < 10000; i++) {
    let x = i % 200;
    let y = i / 43;

    let wave = 5 * cos(x / 14) * cos(y / 30);
    let depth = y / 8 - 13;

    let distance =
      (wave * wave + depth * depth) / 59 + 4;

    let length =
      60 +
      wave *
      (3 + 4 / distance *
        sin(distance * distance - time * 2));

    let angle = distance / 2 - time / 18;

    let pointX = length * sin(angle);
    let pointY = (length + distance * 9) * cos(angle);

    point(pointX, pointY);
  }

  pop();

  time += PI / 20;
}