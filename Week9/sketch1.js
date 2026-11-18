// Week 9 — Gaze Dialogue
// 视频背景、手势选词、眼睛回应与声音

const W = 960;
const H = 720;

// 数值越大，视频像素块越粗
const CELL = 16;

const MAX_LOOK_X = 30;
const MAX_LOOK_Y = 15;
const FONT = '"Press Start 2P", monospace';

const C = {
  bg: "#1a1a1a",
  panel: "#33265e",
  purple: "#806ff6",
  pale: "#efedff",
  dim: "#a69bc8",
  line: "#574a88",
  ink: "#251c49"
};

const WORDS = [
  { word: "I", note: "C4" },
  { word: "SEE", note: "D4" },
  { word: "YOU", note: "E4" },
  { word: "STILL", note: "G4" },
  { word: "HERE", note: "A4" },
  { word: "AGAIN", note: "C5" }
];

const QUESTIONS = [
  "WHO IS LOOKING WHEN THE ROOM IS EMPTY?",
  "CAN A GAZE REMAIN AFTER YOU LEAVE?",
  "DO YOU SEE ME, OR MY REFLECTION?",
  "WHAT DOES THE SCREEN REMEMBER OF YOU?",
  "IF I BLINK, ARE YOU STILL HERE?"
];

const REPLIES = [
  "I HAVE BEEN HERE THE WHOLE TIME.",
  "SOMEONE IS ALWAYS ON THE OTHER SIDE.",
  "THE IMAGE REMAINS WHEN YOU LOOK AWAY.",
  "I CAN ONLY ANSWER BY LOOKING BACK."
];

let tiles = [];

let cameraButton;
let statusText;

let video = null;
let videoPixels;
let handPose = null;
let hands = [];
let handCallbacks = 0;

let cameraOn = false;
let starting = false;
let synth = null;

let cursor = {
  x: W / 2,
  y: H / 2,
  visible: false
};

let pinchHeld = false;
let handLastSeen = 0;

let eyeX = 0;
let eyeY = 0;
let blinkAt = -1000;

let question = QUESTIONS[0];
let draft = [];
let spoken = "...";
let answer = "...";

let flashIndex = -1;
let flashAt = -1000;

function setup() {
  const canvas = createCanvas(W, H);
  canvas.parent("stage");

  pixelDensity(1);
  frameRate(24);
  textFont(FONT);
  textAlign(CENTER, CENTER);
  noSmooth();

  // 缩小的视频用于读取每一格的亮度。
  videoPixels = createGraphics(W / CELL, H / CELL);
  videoPixels.pixelDensity(1);
  videoPixels.noSmooth();

  cameraButton = document.getElementById("cameraButton");
  statusText = document.getElementById("status");
  cameraButton.addEventListener("click", toggleCamera);

  const tileW = 244;
  const tileH = 68;
  const gapX = 18;
  const gapY = 16;
  const startX =
    (W - (tileW * 3 + gapX * 2)) / 2;

  for (let i = 0; i < WORDS.length; i++) {
    tiles.push({
      ...WORDS[i],
      x: startX + (i % 3) * (tileW + gapX),
      y: 355 + floor(i / 3) * (tileH + gapY),
      w: tileW,
      h: tileH
    });
  }

  question = random(QUESTIONS);
}

function draw() {
  background(C.bg);

  updateHandCursor();
  updateGaze();

  // 图层顺序：视频 → 问题 → 眼睛 → 词 → 字幕 → 光标
  drawPixelVideo();
  drawQuestion();
  drawEye();
  drawTiles();
  drawSubtitles();

  if (cursor.visible) {
    drawCursor();
  }
}

// 视频保持原始比例铺满画布。
// 同一个变换也会用于手指坐标，保证二者对齐。
function cameraTransform() {
  if (
    !video ||
    !video.elt ||
    !video.elt.videoWidth
  ) {
    return null;
  }

  const vw = video.elt.videoWidth;
  const vh = video.elt.videoHeight;

  const scale = max(
    W / vw,
    H / vh
  );

  return {
    vw,
    vh,
    scale,
    offsetX: (W - vw * scale) / 2,
    offsetY: (H - vh * scale) / 2
  };
}

function drawPixelVideo() {
  if (
    !cameraOn ||
    !video ||
    video.elt.readyState < 2
  ) {
    return;
  }

  const t = cameraTransform();
  if (!t) return;

  // 先将原始视频按比例缩到小画布中。
  videoPixels.background(C.bg);

  videoPixels.image(
    video,
    t.offsetX / CELL,
    t.offsetY / CELL,
    (t.vw * t.scale) / CELL,
    (t.vh * t.scale) / CELL
  );

  videoPixels.loadPixels();

  const levels = [
    "#100d19",
    "#1e1930",
    "#332654",
    "#564487",
    "#8573b7",
    "#c5bce0"
  ];

  noStroke();

  for (let row = 0; row < H / CELL; row++) {
    for (let col = 0; col < W / CELL; col++) {
      const i =
        4 * (row * (W / CELL) + col);

      const r = videoPixels.pixels[i];
      const g = videoPixels.pixels[i + 1];
      const b = videoPixels.pixels[i + 2];

      const light =
        0.21 * r +
        0.72 * g +
        0.07 * b;

      const level = constrain(
        floor(light / 43),
        0,
        5
      );

      // 在这里镜像视频画面。
      const x = W - (col + 1) * CELL;
      const y = row * CELL;

      // 每个像素块的底色由亮度决定。
      fill(levels[level]);
      rect(x, y, CELL, CELL);

      // 亮处再增加方块或圆点纹理。
      if (light > 52) {
        const d = constrain(
          map(light, 52, 245, 3, 11),
          3,
          11
        );

        fill(
          220,
          211,
          255,
          45 + level * 14
        );

        if ((row + col) % 5 === 0) {
          circle(
            x + CELL / 2,
            y + CELL / 2,
            d
          );
        } else {
          rect(
            x + (CELL - d) / 2,
            y + (CELL - d) / 2,
            d,
            d
          );
        }
      }
    }
  }

  // 轻微压暗视频，让前景文字更清楚。
  fill(10, 8, 19, 58);
  rect(0, 0, W, H);
}

function drawQuestion() {
  noStroke();

  fill(15, 12, 24, 225);
  rect(56, 12, 848, 76);

  fill(C.purple);
  textSize(9);
  text(
    "THE EYE ASKS / 01",
    W / 2,
    28
  );

  fill(C.pale);
  textSize(13);
  text(
    question,
    W / 2,
    62
  );
}

function drawEye() {
  const cx = W / 2;
  const cy = 216;

  const elapsed = millis() - blinkAt;

  const blink =
    elapsed >= 0 && elapsed < 260
      ? 1 - 0.91 * sin(PI * elapsed / 260)
      : 1;

  push();

  translate(cx, cy);
  scale(1, blink);

  pixelEye(
    0, 0,
    250, 94,
    C.purple
  );

  pixelEye(
    0, 0,
    243, 87,
    C.pale
  );

  pixelDisk(
    eyeX, eyeY,
    68,
    C.ink
  );

  pixelDisk(
    eyeX, eyeY,
    47,
    C.purple
  );

  pixelDisk(
    eyeX + 2,
    eyeY + 2,
    24,
    C.ink
  );

  noStroke();
  fill(C.pale);
  rect(
    eyeX - 25,
    eyeY - 30,
    9,
    9
  );

  pop();
}

function pixelEye(cx, cy, halfW, halfH, col) {
  noStroke();
  fill(col);

  for (
    let x = -halfW;
    x <= halfW;
    x += 7
  ) {
    const heightAtX =
      halfH *
      (1 - pow(abs(x) / halfW, 1.55));

    rect(
      cx + x,
      cy - heightAtX,
      7,
      heightAtX * 2
    );
  }
}

function pixelDisk(cx, cy, r, col) {
  noStroke();
  fill(col);

  for (
    let y = -r;
    y <= r;
    y += 7
  ) {
    for (
      let x = -r;
      x <= r;
      x += 7
    ) {
      if (x * x + y * y <= r * r) {
        rect(
          cx + x,
          cy + y,
          7,
          7
        );
      }
    }
  }
}

function drawTiles() {
  const hover = cursor.visible
    ? targetAt(cursor.x, cursor.y)
    : null;

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];

    const active =
      (hover && hover.index === i) ||
      (
        flashIndex === i &&
        millis() - flashAt < 280
      );

    stroke(C.purple);
    strokeWeight(2);
    fill(active ? C.purple : C.panel);

    rect(
      tile.x,
      tile.y,
      tile.w,
      tile.h
    );

    noStroke();
    fill(active ? C.ink : C.pale);
    textSize(17);

    text(
      tile.word,
      tile.x + tile.w / 2,
      tile.y + tile.h / 2
    );
  }

  noStroke();
  fill(15, 12, 24, 230);
  rect(234, 524, 492, 29);

  fill(C.pale);
  textSize(8);

  text(
    "PINCH TO CHOOSE / RELEASE BEFORE THE NEXT WORD",
    W / 2,
    539
  );
}

function drawSubtitles() {
  stroke(C.line);
  strokeWeight(2);
  fill(C.panel);
  rect(70, 561, 820, 117);

  noStroke();
  textAlign(LEFT, CENTER);

  fill(C.purple);
  textSize(10);
  text("YOU >", 90, 586);

  fill(C.pale);
  text(
    draft.length
      ? draft.join(" ") + " _"
      : "...",
    170,
    586
  );

  fill(C.purple);
  text("EYE >", 90, 614);

  fill(C.pale);
  text(
    answer,
    170,
    614
  );

  fill(C.dim);
  textSize(8);
  text(
    "LAST LINE: " + spoken,
    90,
    649
  );

  textAlign(CENTER, CENTER);

  const say = sayBox();

  const hoverSay =
    cursor.visible &&
    inBox(
      cursor.x,
      cursor.y,
      say
    );

  stroke(C.purple);
  strokeWeight(2);
  fill(
    hoverSay
      ? C.purple
      : C.ink
  );

  rect(
    say.x,
    say.y,
    say.w,
    say.h
  );

  noStroke();
  fill(
    hoverSay
      ? C.ink
      : C.pale
  );

  textSize(9);
  text(
    "SAY >",
    say.x + say.w / 2,
    say.y + say.h / 2
  );
}

function drawCursor() {
  const x = cursor.x;
  const y = cursor.y;

  // 紫色光圈标记食指尖的位置。
  noFill();
  stroke(C.purple);
  strokeWeight(3);
  circle(x, y, 34);

  stroke(C.pale);
  strokeWeight(2);

  rect(
    x - 12,
    y - 12,
    24,
    24
  );

  line(x - 19, y, x - 8, y);
  line(x + 8, y, x + 19, y);
  line(x, y - 19, x, y - 8);
  line(x, y + 8, x, y + 19);

  noStroke();
  fill(C.purple);
  rect(x - 3, y - 3, 6, 6);
}

function updateHandCursor() {
  if (
    !cameraOn ||
    !hands.length ||
    !video
  ) {
    if (
      cameraOn &&
      millis() - handLastSeen > 550
    ) {
      cursor.visible = false;
      pinchHeld = false;

      statusText.textContent = handCallbacks === 0
        ? "MODEL STARTED / NO DETECTION CALLBACKS"
        : "MODEL RUNNING / NO HAND / FRAMES " + handCallbacks;
    }

    return;
  }

  const kp = hands[0].keypoints;

  if (
    !kp ||
    !kp[0] ||
    !kp[4] ||
    !kp[8] ||
    !kp[9]
  ) {
    return;
  }

  const t = cameraTransform();
  if (!t) return;

  handLastSeen = millis();

  const thumb = kp[4];
  const tip = kp[8];

  // 与 drawPixelVideo() 使用同样的缩放、
  // 居中裁切、水平镜像。
  const targetX =
    W -
    (
      t.offsetX +
      tip.x * t.scale
    );

  const targetY =
    t.offsetY +
    tip.y * t.scale;

  cursor.x = targetX;
  cursor.y = targetY;

  cursor.visible =
    targetX >= 0 &&
    targetX <= W &&
    targetY >= 0 &&
    targetY <= H;

  const palm = max(
    25,
    dist(
      kp[0].x,
      kp[0].y,
      kp[9].x,
      kp[9].y
    )
  );

  const pinch =
    dist(
      thumb.x,
      thumb.y,
      tip.x,
      tip.y
    ) / palm;

  statusText.textContent =
    pinch < 0.42
      ? "HAND FOUND / PINCH DETECTED"
      : "HAND FOUND / MOVE THE PURPLE CURSOR AND PINCH";

  if (
    pinch < 0.42 &&
    !pinchHeld
  ) {
    pinchHeld = true;
    chooseAt(
      cursor.x,
      cursor.y
    );
  } else if (pinch > 0.65) {
    pinchHeld = false;
  }
}

function updateGaze() {
  const targetX = cursor.visible
    ? map(
        cursor.x,
        0, W,
        -MAX_LOOK_X,
        MAX_LOOK_X
      )
    : 0;

  const targetY = cursor.visible
    ? map(
        cursor.y,
        0, H,
        -MAX_LOOK_Y,
        MAX_LOOK_Y
      )
    : 0;

  eyeX = lerp(
    eyeX,
    targetX,
    0.12
  );

  eyeY = lerp(
    eyeY,
    targetY,
    0.12
  );
}

function inBox(x, y, box) {
  return (
    x >= box.x &&
    x <= box.x + box.w &&
    y >= box.y &&
    y <= box.y + box.h
  );
}

function sayBox() {
  return {
    x: 760,
    y: 626,
    w: 106,
    h: 38
  };
}

function targetAt(x, y) {
  for (let i = 0; i < tiles.length; i++) {
    if (
      inBox(
        x,
        y,
        tiles[i]
      )
    ) {
      return { index: i };
    }
  }

  return null;
}

function chooseAt(x, y) {
  if (
    inBox(
      x,
      y,
      sayBox()
    )
  ) {
    speak();
    return;
  }

  const hit = targetAt(x, y);

  if (hit) {
    chooseWord(hit.index);
  }
}

async function ensureSound() {
  if (typeof Tone === "undefined") {
    statusText.textContent =
      "TONE.JS DID NOT LOAD / CHECK YOUR CONNECTION";
    return false;
  }

  try {
    await Tone.start();

    if (!synth) {
      synth = new Tone.PolySynth(
        Tone.Synth
      ).toDestination();

      synth.set({
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.02,
          decay: 0.16,
          sustain: 0.22,
          release: 0.7
        }
      });

      synth.volume.value = -10;
    }

    return true;
  } catch (err) {
    statusText.textContent =
      "SOUND COULD NOT START: " +
      err.message;

    return false;
  }
}

async function chooseWord(i) {
  if (draft.length >= 7) {
    draft.shift();
  }

  draft.push(
    WORDS[i].word
  );

  flashIndex = i;
  flashAt = millis();
  blinkAt = millis();

  if (await ensureSound()) {
    synth.triggerAttackRelease(
      WORDS[i].note,
      "8n"
    );
  }
}

async function speak() {
  if (!draft.length) {
    statusText.textContent =
      "CHOOSE AT LEAST ONE WORD FIRST";
    return;
  }

  spoken = draft.join(" ");

  if (draft.includes("YOU")) {
    answer =
      "I WAS ALREADY LOOKING AT YOU.";
  } else if (draft.includes("STILL")) {
    answer =
      "YES. EVEN WHEN YOU LOOK AWAY.";
  } else {
    answer = random(REPLIES);
  }

  draft = [];
  blinkAt = millis();

  let next = random(QUESTIONS);

  if (QUESTIONS.length > 1) {
    while (next === question) {
      next = random(QUESTIONS);
    }
  }

  question = next;

  if (await ensureSound()) {
    synth.triggerAttackRelease(
      ["C4", "E4", "G4"],
      "4n"
    );
  }
}

// 鼠标点击仍可用于不开摄像头时测试。
function mousePressed() {
  if (
    mouseX >= 0 &&
    mouseX < W &&
    mouseY >= 0 &&
    mouseY < H
  ) {
    chooseAt(
      mouseX,
      mouseY
    );
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
    speak();
  }
}

async function toggleCamera() {
  if (cameraOn) {
    stopCamera();
    return;
  }

  if (starting) return;

  starting = true;
  cameraButton.disabled = true;
  statusText.textContent =
    "REQUESTING CAMERA...";

  try {
    await ensureSound();

    video = createCapture(VIDEO);
    video.hide();

    await new Promise(
      (resolve, reject) => {
        if (
          video.elt.readyState >= 1
        ) {
          resolve();
          return;
        }

        const timeout = setTimeout(
          () => reject(
            new Error(
              "Camera timed out"
            )
          ),
          15000
        );

        video.elt.addEventListener(
          "loadedmetadata",
          () => {
            clearTimeout(timeout);
            resolve();
          },
          { once: true }
        );

        video.elt.addEventListener(
          "error",
          () => {
            clearTimeout(timeout);
            reject(
              new Error(
                "Camera error"
              )
            );
          },
          { once: true }
        );
      }
    );

    // 先显示视频；模型加载期间也能看到背景。
    cameraOn = true;

    statusText.textContent =
      "LOADING HAND MODEL...";

    if (typeof ml5 === "undefined") {
      throw new Error(
        "ml5 did not load"
      );
    }

    if (!handPose) {
      handPose = await ml5.handPose({
        maxHands: 1
      });
    }

    // 关键：等内部检测器加载完成
    if (handPose.ready) {
      await handPose.ready;
    }

    handPose.detectStart(video, gotHands);

    handLastSeen = millis();

    cameraButton.textContent =
      "STOP CAMERA";

    statusText.textContent =
      "CAMERA ON / SHOW ONE HAND TO THE CAMERA";
  } catch (err) {
    stopCamera();

    statusText.textContent =
      "CAMERA ERROR: " +
      err.message;

    console.error(err);
  } finally {
    starting = false;
    cameraButton.disabled = false;
  }
}

function gotHands(results) {
  handCallbacks++;
  hands = results || [];
}

function stopCamera() {
  if (
    handPose &&
    handPose.detectStop
  ) {
    handPose.detectStop();
  }

  if (video) {
    const stream =
      video.elt &&
      video.elt.srcObject;

    if (stream) {
      stream
        .getTracks()
        .forEach(
          track => track.stop()
        );
    }

    video.remove();
    video = null;
  }

  hands = [];
  cameraOn = false;
  cursor.visible = false;
  pinchHeld = false;

  if (cameraButton) {
    cameraButton.textContent =
      "START CAMERA + SOUND";
  }

  if (statusText) {
    statusText.textContent =
      "CAMERA OFF / CLICK WORDS TO TEST";
  }
}