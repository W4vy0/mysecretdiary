let page = 1;
let unlocked = false;

// DOM
const diaryEl = document.getElementById("diary");
const pageImage = document.getElementById("pageImage");
const lockEl = document.getElementById("lock");
const keyEl = document.getElementById("key");
const heartBtn = document.getElementById("heartBtn");

const bgm = document.getElementById("bgm");
const bgmBtn = document.getElementById("bgmBtn");

// 오디오 (mysecretdiary 폴더 안에 파일 있어야 함)
const pageSound = new Audio("page.mp3");   // 페이지 넘김
const clickSound = new Audio("click.mp3"); // 딸깍(자물쇠에 갖다대면)
pageSound.preload = "auto";
clickSound.preload = "auto";

// 볼륨
bgm.volume = 0.55;
pageSound.volume = 0.75;
clickSound.volume = 0.95;

// ---------------------------
// BGM 토글 (버튼 클릭으로만 재생 가능)
// ---------------------------
bgm.addEventListener("error", () => {
  alert("❌ bgm.mp3를 못 찾거나 재생 실패!\n- mysecretdiary 폴더 안에 bgm.mp3가 있는지\n- 파일명이 bgm.mp3가 맞는지(대소문자 포함)\n- 업로드 후 Commit 했는지 확인해줘.");
});

bgmBtn.addEventListener("click", async () => {
  try {
    if (bgm.paused) {
      await bgm.play();
      bgmBtn.textContent = "🔇";
    } else {
      bgm.pause();
      bgmBtn.textContent = "🔊";
    }
  } catch (e) {
    alert("❌ 브금 재생이 막혔어.\n모바일/사파리면 버튼을 다시 눌러줘!\n\n에러: " + e);
  }
});

// ---------------------------
// 페이지 UI 업데이트
// ---------------------------
function resetKeyPosition() {
  // CSS 위치로 되돌림
  keyEl.style.left = "";
  keyEl.style.top = "";
  keyEl.style.animation = "";
  keyEl.style.cursor = "grab";
}

function updateUI() {
  pageImage.src = `${page}.png`;

  if (page === 1) {
    lockEl.style.display = "block";
    keyEl.style.display = "block";
    heartBtn.style.display = "none";
    unlocked = false;
    resetKeyPosition();
    return;
  }

  if (page >= 2 && page <= 5) {
    lockEl.style.display = "none";
    keyEl.style.display = "none";
    heartBtn.style.display = "block";
    return;
  }

  // page === 6
  lockEl.style.display = "none";
  keyEl.style.display = "none";
  heartBtn.style.display = "none";
}

// ---------------------------
// 💗 하트 클릭 → 다음 페이지 + 페이지 소리
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

function isOverLock() {
  const keyRect = keyEl.getBoundingClientRect();
  const lockRect = lockEl.getBoundingClientRect();

  const keyCX = keyRect.left + keyRect.width / 2;
  const keyCY = keyRect.top + keyRect.height / 2;

  return (
    keyCX >= lockRect.left &&
    keyCX <= lockRect.right &&
    keyCY >= lockRect.top &&
    keyCY <= lockRect.bottom
  );
}

keyEl.addEventListener("pointerdown", (e) => {
  if (page !== 1 || unlocked) return;

  dragging = true;
  keyEl.setPointerCapture(e.pointerId);

  // 현재 위치를 px로 고정
  const rect = keyEl.getBoundingClientRect();
  const diaryRect = diaryEl.getBoundingClientRect();

  startX = e.clientX;
  startY = e.clientY;

  keyStartLeft = rect.left - diaryRect.left;
  keyStartTop = rect.top - diaryRect.top;

  keyEl.style.animation = "none";
  keyEl.style.cursor = "grabbing";
  keyEl.style.left = `${keyStartLeft}px`;
  keyEl.style.top = `${keyStartTop}px`;
});

keyEl.addEventListener("pointermove", (e) => {
  if (!dragging) return;

  const diaryRect = diaryEl.getBoundingClientRect();
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  let newLeft = keyStartLeft + dx;
  let newTop = keyStartTop + dy;

  // 영역 제한(살짝만)
  newLeft = Math.max(-20, Math.min(newLeft, diaryRect.width - 40));
  newTop = Math.max(-20, Math.min(newTop, diaryRect.height - 40));

  keyEl.style.left = `${newLeft}px`;
  keyEl.style.top = `${newTop}px`;

  // 자물쇠 위로 들어오면 딸깍 + 페이지 넘김 (1번만)
  if (!unlocked && isOverLock()) {
    unlocked = true;

    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});

    pageSound.currentTime = 0;
    pageSound.play().catch(() => {});

    page = 2;
    updateUI();
  }
});

function endDrag() {
  if (!dragging) return;
  dragging = false;

  keyEl.style.cursor = "grab";
  keyEl.releasePointerCapture?.();

  // 실패하면 원위치
  if (page === 1 && !unlocked) resetKeyPosition();
}

keyEl.addEventListener("pointerup", endDrag);
keyEl.addEventListener("pointercancel", endDrag);

// 초기
updateUI();

// ✅ 주석은 이렇게 써야 해: // 설명
