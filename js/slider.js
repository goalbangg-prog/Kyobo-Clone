// ============================================
// 메인 배너 / 우측 배너 독립 슬라이더
// ============================================

const mainBanners = [
  "img/banner/banner1.jpg",
  "img/banner/banner2.jpg",
  "img/banner/banner3.jpg",
  "img/banner/banner4.jpg",
  "img/banner/banner5.jpg"
];

const sideBanners = [
  {
    image: "img/banner/right banner1.jpg",
    label: "바로펀딩",
    title: "일본 아마존 분야 1위!<br>초고속 주식 투자법"
  },
  {
    image: "img/banner/right banner2.jpg",
    label: "오늘의 책",
    title: "공부에도 가속도가<br>붙을 수 있다!"
  },
  {
    image: "img/banner/right banner3.jpg",
    label: "추천 도서",
    title: "도시를 읽는<br>새로운 인문학 수업"
  }
];

function initHeroSlider() {
  const heroImage = document.querySelector("#heroImage");
  const prev = document.querySelector("#heroPrev");
  const next = document.querySelector("#heroNext");
  const pause = document.querySelector("#heroPause");
  const page = document.querySelector("#heroPage");

  if (!heroImage) return;

  let mainIndex = 0;
  let mainTimer = null;
  let isPlaying = true;

  function renderMain() {
    heroImage.src = mainBanners[mainIndex];

    if (page) {
      page.textContent =
        `${mainIndex + 1} / ${mainBanners.length}`;
    }
  }

  function nextMain() {
    mainIndex =
      (mainIndex + 1) %
      mainBanners.length;

    renderMain();
  }

  function prevMain() {
    mainIndex =
      (mainIndex - 1 + mainBanners.length) %
      mainBanners.length;

    renderMain();
  }

  function startMainAuto() {
    clearInterval(mainTimer);

    mainTimer =
      setInterval(
        nextMain,
        5000
      );
  }

  next?.addEventListener("click", () => {
    nextMain();

    if (isPlaying) {
      startMainAuto();
    }
  });

  prev?.addEventListener("click", () => {
    prevMain();

    if (isPlaying) {
      startMainAuto();
    }
  });

  pause?.addEventListener("click", () => {
    isPlaying = !isPlaying;

    pause.textContent =
      isPlaying ? "Ⅱ" : "▶";

    if (isPlaying) {
      startMainAuto();
    } else {
      clearInterval(mainTimer);
    }
  });

  renderMain();
  startMainAuto();
}


function initSideSlider() {
  const sideImage =
    document.querySelector("#sidePromoImage");

  const sideLabel =
    document.querySelector("#sidePromoLabel");

  const sideTitle =
    document.querySelector("#sidePromoTitle");

  const dots =
    document.querySelector("#sidePromoDots");

  if (!sideImage) return;

  let sideIndex = 0;
  let sideTimer = null;

  function renderSide() {
    const banner =
      sideBanners[sideIndex];

    sideImage.src =
      banner.image;

    if (sideLabel) {
      sideLabel.textContent =
        banner.label;
    }

    if (sideTitle) {
      sideTitle.innerHTML =
        banner.title;
    }

    if (dots) {
      dots.innerHTML =
        sideBanners
          .map(
            (_, index) =>
              `
                <button
                  type="button"
                  class="${index === sideIndex ? "active" : ""}"
                  data-index="${index}"
                  aria-label="${index + 1}번째 우측 배너"
                ></button>
              `
          )
          .join("");
    }
  }

  function nextSide() {
    sideIndex =
      (sideIndex + 1) %
      sideBanners.length;

    renderSide();
  }

  function startSideAuto() {
    clearInterval(sideTimer);

    sideTimer =
      setInterval(
        nextSide,
        4300
      );
  }

  dots?.addEventListener("click", event => {
    const button =
      event.target.closest(
        "button[data-index]"
      );

    if (!button) return;

    sideIndex =
      Number(
        button.dataset.index
      );

    renderSide();
    startSideAuto();
  });

  renderSide();
  startSideAuto();
}


export function initMainSlider() {
  initHeroSlider();
  initSideSlider();
}
