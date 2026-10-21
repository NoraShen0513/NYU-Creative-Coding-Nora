let frames = {};
let characterX, characterY;
let mode = "day";
let modeStarted = 0;
let skyProgress = 0;
let facing = "right";
let walkDistance = 0;
let stars = [];
let ready = false;

async function setup() {
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";

  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  noStroke();

  characterX = width * 0.5;
  characterY = height * 0.62;
  modeStarted = millis();

  let groups = {
    idle: ["初始", "呼吸1", "呼吸2"],
    left: ["向左走1", "向左走2", "向左走3", "向左走4"],
    right: ["向右走1", "向右走2", "向右走3", "向右走4"],
    sleep: ["睡着0", "睡着1", "睡着2", "睡着3", "睡着4", "睡着5"],
    wake: ["苏醒1", "苏醒2", "苏醒3"]
  };

  try {
    for (let group of Object.keys(groups)) {
      frames[group] = await Promise.all(
        groups[group].map(name =>
          loadImage(
            "assets/" +
            encodeURIComponent("苹果乐-" + name + ".PNG")
          )
        )
      );
    }

    ready = true;
  } catch (error) {
    console.error("图片加载失败，请检查 assets 文件夹：", error);
    setHint("图片加载失败：请用 Live Server 打开，并检查 assets 文件夹");
  }

  randomSeed(26);

  for (let i = 0; i < 32; i++) {
    stars.push({
      x: random(0.05, 0.95),
      y: random(0.06, 0.59),
      size: random(2, 5)
    });
  }
}

function draw() {
  let mouseTime = constrain(mouseX / width, 0, 1);
  let nextMode = mouseTime < 0.5 ? "day" : "night";

  if (nextMode !== mode) {
    mode = nextMode;
    modeStarted = millis();
    walkDistance = 0;

    setHint(
      mode === "day"
        ? "白天 · 方向键 / WASD 移动 · 鼠标向右进入夜晚"
        : "夜晚 · 苹果乐在原地睡着 · 鼠标向左唤醒"
    );
  }

  skyProgress = lerp(skyProgress, mouseTime, 0.055);
  drawEnvironment(skyProgress);

  if (!ready) return;

  let size = spriteSize();
  let elapsed = millis() - modeStarted;

  let waking =
    mode === "day" &&
    elapsed < 420 &&
    modeStarted > 0;

  let movement =
    mode === "day" && !waking
      ? moveCharacter(size)
      : false;

  let currentFrame;

  if (mode === "night") {
    if (elapsed < 420) {
      let step = min(floor(elapsed / 140), 2);
      currentFrame = frames.wake[2 - step];
    } else {
      let step =
        floor((elapsed - 420) / 430) %
        frames.sleep.length;

      currentFrame = frames.sleep[step];
    }

  } else if (waking) {
    let step = min(floor(elapsed / 140), 2);
    currentFrame = frames.wake[step];

  } else if (movement) {
    let walkSequence = [0, 1, 2, 3, 2, 1];
    let step =
      floor(walkDistance / (size * 0.09)) %
      walkSequence.length;

    currentFrame = frames[facing][walkSequence[step]];

  } else {
    let sequence = [0, 1, 2, 1];
    let step = floor(millis() / 320) % sequence.length;

    currentFrame = frames.idle[sequence[step]];
  }

  drawShadow(size, skyProgress);
  image(currentFrame, characterX, characterY, size, size);
}

function moveCharacter(size) {
  let dx =
    Number(
      keyIsDown(RIGHT_ARROW) ||
      keyIsDown("d") ||
      keyIsDown("D")
    ) -
    Number(
      keyIsDown(LEFT_ARROW) ||
      keyIsDown("a") ||
      keyIsDown("A")
    );

  let dy =
    Number(
      keyIsDown(DOWN_ARROW) ||
      keyIsDown("s") ||
      keyIsDown("S")
    ) -
    Number(
      keyIsDown(UP_ARROW) ||
      keyIsDown("w") ||
      keyIsDown("W")
    );

  if (dx === 0 && dy === 0) return false;

  if (dx > 0) facing = "right";
  if (dx < 0) facing = "left";

  let length = sqrt(dx * dx + dy * dy);
  let distance =
    min(width, height) *
    0.34 *
    min(deltaTime / 1000, 0.05);

  let oldX = characterX;
  let oldY = characterY;

  characterX = constrain(
    characterX + dx / length * distance,
    size * 0.37,
    width - size * 0.37
  );

  characterY = constrain(
    characterY + dy / length * distance,
    max(size * 0.37, height * 0.28),
    min(height - size * 0.37, height * 0.78)
  );

  let moved = dist(oldX, oldY, characterX, characterY);
  walkDistance += moved;

  return moved > 0.01;
}

function spriteSize() {
  return min(height * 0.58, width * 0.38, 480);
}

function drawEnvironment(t) {
  let top = lerpColor(
    color(166, 218, 235),
    color(20, 33, 66),
    t
  );

  let horizon = lerpColor(
    color(255, 220, 182),
    color(75, 78, 119),
    t
  );

  let bands = 65;
  let skyHeight = height * 0.79;

  for (let i = 0; i < bands; i++) {
    fill(lerpColor(top, horizon, i / (bands - 1)));
    rect(
      0,
      skyHeight * i / bands,
      width,
      skyHeight / bands + 1
    );
  }

  fill(255, 246, 197, 235 * (1 - t));
  circle(
    width * 0.18,
    height * 0.20,
    min(width, height) * 0.13
  );

  fill(248, 247, 226, 220 * t);
  circle(
    width * 0.80,
    height * 0.19,
    min(width, height) * 0.10
  );

  for (let star of stars) {
    fill(255, 249, 223, 200 * t * t);
    circle(
      star.x * width,
      star.y * height,
      star.size
    );
  }

  fill(
    lerpColor(
      color(207, 228, 184),
      color(47, 68, 83),
      t
    )
  );
  rect(0, height * 0.79, width, height * 0.21);

  fill(
    lerpColor(
      color(226, 236, 204),
      color(65, 80, 97),
      t
    )
  );
  ellipse(
    width * 0.5,
    height * 0.88,
    width * 1.40,
    height * 0.28
  );
}

function drawShadow(size, t) {
  fill(40, 50, 55, 34 + 28 * t);
  ellipse(
    characterX,
    characterY + size * 0.34,
    size * 0.62,
    size * 0.075
  );
}

function setHint(message) {
  const hint = document.getElementById("hint");
  if (hint) hint.textContent = message;
}

function keyPressed() {
  if (
    [LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, " "]
      .includes(key)
  ) {
    return false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  let size = spriteSize();

  characterX = constrain(
    characterX,
    size * 0.37,
    width - size * 0.37
  );

  characterY = constrain(
    characterY,
    max(size * 0.37, height * 0.28),
    min(height - size * 0.37, height * 0.78)
  );
}