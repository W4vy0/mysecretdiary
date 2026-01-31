let page = 1;
let unlocked = false;

// DOM
const pageImage = document.getElementById("pageImage");
const lockEl = document.getElementById("lock");
const keyEl = document.getElementById("key");
const heartBtn = document.getElementById("heartBtn");

const bgm = document.getElementById("bgm");
const bgmBtn = document.getElementById("bgmBtn");

// 오디오 (파일은 루트에 있어야 함)
const pageSound = new Audio("page.mp3");   // 페이지 넘김
const clickSound = new Audio("click.mp3"); // 딸깍(자물쇠에 갖다대면)
pageSound.preload = "auto";
clickSound.preload = "auto";

// 볼륨(원하면 조절)
bgm.volume = 0.45;
pageSound.volume = 0.5;
clickSound.volume = 0.9;

// ---------------------------
// BGM 토글 (브라우저 정책상 '클릭'으로만 재생 가능)
// ---------------------------
const bgm = document.getElementById("bgm");
const bgmBtn = document.getElementById("bgmBtn");
bgm.volume = 0.6;
bgm.preload = "auto";

// 파일이 실제로 로딩되는지 체크
bgm.addEventListener("canplaythrough", () => {
  console.log("✅ BGM loaded OK");
});

bgm.addEventListener("error", () => {
  alert("❌ bgm.mp3를 찾거나 재생할 수 없어!\n- 파일이 같은 폴더(루트)에 있는지\n- 이름이 bgm.mp3가 맞는지(대소문자 포함)\n- 업로드 후 Commit 했는지 확인해줘.");
});

bgmBtn.addEventListener("click", async () => {
  try {
    if (bgm.paused) {
      // iOS/모바일에서 안정적으로 하려고 currentTime 건드림
      bgm.currentTime = bgm.currentTime || 0;
      await bgm.play();
      bgmBtn.textContent = "🔇";
    } else {
      bgm.pause();
      bgmBtn.textContent = "🔊";
    }
  } catch (e) {
    alert("❌ 브금 재생이 막혔어.\n1) 버튼을 다시 눌러보기\n2) 파일이 bgm.mp3 맞는지\n3) 콘솔(F12) 에러 확인\n\n에러: " + e);
  }
});
// ---------------------------
// 페이지 UI 업데이트
// ---------------------------
function updateUI() {
  pageImage.src = `${page}.png`;

  // 1페이지: 열쇠/자물쇠 보이고, 하트 숨김
  if (page === 1) {
    lockEl.style.display = "block";
    keyEl.style.display = "block";
    heartBtn.style.display = "none";
    unlocked = false;
    resetKeyPosition();
    return;
  }

  // 2~5페이지: 하트 보이고, 열쇠/자물쇠 숨김
  if (page >= 2 && page <= 5) {
    lockEl.style.display = "none";
    keyEl.style.display = "none";
    heartBtn.style.display = "block";
    return;
  }

  // 6페이지: 하트도 숨김 (엔딩 고정)
  if (page === 6) {
    lockEl.style.display = "none";
    keyEl.style.display = "none";
    heartBtn.style.display = "none";
  }
}

// ---------------------------
// 💗 하트 클릭 → 다음 페이지 + 페이지 소리
// (2,3,4,5에서만 보임)
// ---------------------------
heartBtn.addEventListener("click", () => {
  if (page >= 2 && page <= 5) {
    pageSound.currentTime = 0;
    pageSound.play().catch(() => {});
    page += 1;
    updateUI();
  }
});

// ---------------------------
// 1페이지: 열쇠 드래그 → 자물쇠에 닿으면 딸깍 + 2페이지로
// ---------------------------
let dragging = false;
let startX = 0, startY = 0;
let keyStartLeft = 0, keyStartTop = 0;

// 원래 위치 저장(리셋용)
const keyBase = { left: 18, top: 52 }; // %는 CSS에 있지만 JS는 px로 리셋할 거라 초기화 함수에서 계산

function resetKeyPosition() {
  // CSS의 top/left를 그대로 쓰려면 style 제거가 가장 안정적
  keyEl.style.left = "";
  keyEl.style.top = "";
  keyEl.style.transform = "";
}

function getCenterRect(el) {
  const r = el.getBoundingClientRect();
  return {
    cx: r.left + r.width / 2,
    cy: r.top + r.height / 2,
    r
  };
}

function isOverLock() {
  const keyRect = keyEl.getBoundingClientRect();
  const lockRect = lockEl.getBoundingClientRect();

  // 열쇠 중심이 자물쇠 영역 안에 들어오면 성공 처리
  const keyCX = keyRect.left + keyRect.width / 2;
  const keyCY = keyRect.top + keyRect.height / 2;

  return (
    keyCX >= lockRect.left &&
    keyCX <= lockRect.right &&
    keyCY >= lockRect.top &&
    keyCY <= lockRect.bottom
  );
}

// 포인터(마우스/터치) 이벤트로 드래그 구현
keyEl.addEventListener("pointerdown", (e) => {
  if (page !== 1 || unlocked) return;

  dragging = true;
  keyEl.setPointerCapture(e.pointerId);
  keyEl.style.animation = "none";
  keyEl.style.cursor = "grabbing";

  const rect = keyEl.getBoundingClientRect();
  startX = e.clientX;
  startY = e.clientY;
  keyStartLeft = rect.left;
  keyStartTop = rect.top;

  // 위치를 '고정(px)'로 바꾸기 위해 현재 좌표를 absolute 기준으로 환산
  const diaryRect = document.getElementById("diary").getBoundingClientRect();
  keyEl.style.left = `${keyStartLeft - diaryRect.left}px`;
  keyEl.style.top = `${keyStartTop - diaryRect.top}px`;
});

keyEl.addEventListener("pointermove", (e) => {
  if (!dragging) return;

  const diaryRect = document.getElementById("diary").getBoundingClientRect();
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  let newLeft = (keyStartLeft - diaryRect.left) + dx;
  let newTop = (keyStartTop - diaryRect.top) + dy;

  // 다이어리 영역 밖으로 너무 나가지 않게 살짝 제한
  newLeft = Math.max(-20, Math.min(newLeft, diaryRect.width - 40));
  newTop = Math.max(-20, Math.min(newTop, diaryRect.height - 40));

  keyEl.style.left = `${newLeft}px`;
  keyEl.style.top = `${newTop}px`;

  // 자물쇠 위에 올라오면(처음 1번만) 딸깍
  if (!unlocked && isOverLock()) {
    unlocked = true;

    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});

    // 2페이지로 넘어가며 넘김 소리도 같이
    pageSound.currentTime = 0;
    pageSound.play().catch(() => {});

    page = 2;
    updateUI();
  }
});

keyEl.addEventListener("pointerup", () => {
  if (!dragging) return;
  dragging = false;

  keyEl.style.cursor = "grab";
  keyEl.style.animation = ""; // CSS 애니메이션 복귀(페이지 1일 때만 의미)

  // 잠금 해제 실패면 원위치로
  if (page === 1 && !unlocked) {
    resetKeyPosition();
  }
});

keyEl.addEventListener("pointercancel", () => {
  dragging = false;
  if (page === 1 && !unlocked) resetKeyPosition();
});

// 초기
updateUI();
