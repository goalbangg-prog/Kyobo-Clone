import {
  initMainSlider
} from "./slider.js";


import {
  loadCuratedBookSection,
  loadCuratedTodayBooks,
  loadCuratedMdBooks,
  loadCuratedBestBooks
} from "./books.js";


import {
  curatedBooks
} from "./curated-books.js";


import {
  searchBooks,
  getHighResThumbnail
} from "./api.js";


// ============================================
// 메인페이지 실행 관리자
// ============================================
//
// main.js는 "무슨 기능을 어떤 순서로 실행할지"만 관리합니다.
//
// 실제로 어떤 책을 보여줄지는
// curated-books.js에서 수정하면 됩니다.
// ============================================


initMainSlider();


// --------------------------------------------
// 오늘의 선택
// --------------------------------------------

await loadCuratedTodayBooks(
  curatedBooks.today
);


// --------------------------------------------
// MD 추천
// --------------------------------------------

await loadCuratedMdBooks(
  curatedBooks.md
);


// --------------------------------------------
// 출판사 추천
// --------------------------------------------

await loadCuratedBookSection(
  "#publisherBooks",
  curatedBooks.publisher
);


// --------------------------------------------
// 트렌드+
// --------------------------------------------

await loadCuratedBookSection(
  "#trendBooks",
  curatedBooks.trend
);


// --------------------------------------------
// 북 퍼포먼스
// --------------------------------------------

await loadCuratedBookSection(
  "#performanceBooks",
  curatedBooks.performance
);


// --------------------------------------------
// 사람들이 많이 찾고 있어요
// --------------------------------------------

await loadCuratedBookSection(
  "#popularBooks",
  curatedBooks.popular
);


// --------------------------------------------
// AI 추천 Picks
// --------------------------------------------

await loadCuratedBookSection(
  "#aiBooks",
  curatedBooks.aiPicks,
  {
    showMeta: true
  }
);


// --------------------------------------------
// 베스트
// --------------------------------------------

await loadCuratedBestBooks(
  curatedBooks.best
);


// --------------------------------------------
// 바로출판 POD
// --------------------------------------------

await loadCuratedBookSection(
  "#podBooks",
  curatedBooks.pod
);


// --------------------------------------------
// 교보문고 Only
// --------------------------------------------

await loadCuratedBookSection(
  "#onlyBooks",
  curatedBooks.only
);


// ============================================
// 검색
// ============================================

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const searchTarget = document.querySelector("#searchTarget");
const searchPreview = document.querySelector("#searchPreview");

const searchBookList = document.querySelector("#searchBookList");
const searchBookDetail = document.querySelector("#searchBookDetail");

const searchPeople = document.querySelector("#searchPeople");
const searchEvents = document.querySelector("#searchEvents");

const closeSearchPreview = document.querySelector("#closeSearchPreview");

const searchBooksPrev = document.querySelector("#searchBooksPrev");
const searchBooksNext = document.querySelector("#searchBooksNext");
const searchBooksPage = document.querySelector("#searchBooksPage");

const searchEventsPrev = document.querySelector("#searchEventsPrev");
const searchEventsNext = document.querySelector("#searchEventsNext");
const searchEventsPage = document.querySelector("#searchEventsPage");


let searchTimer = null;

let currentSearchBooks = [];
let currentBookPage = 0;

const BOOKS_PER_PAGE = 3;


// --------------------------------------------
// 이벤트 데모 데이터
// Kakao Book API에는 이벤트 API가 없으므로
// UI 동작을 보여주기 위한 예시 데이터
// --------------------------------------------

const demoEvents = [
  {
    title: "독서 습관 만들기 이벤트",
    subtitle: "매일 읽고 리워드 받기",
    emoji: "📚"
  },
  {
    title: "새학기 추천도서 기획전",
    subtitle: "학생·학부모 추천",
    emoji: "🎒"
  },
  {
    title: "이달의 책 특별전",
    subtitle: "주목할 신간을 만나보세요",
    emoji: "✨"
  },
  {
    title: "교보문고 회원 혜택",
    subtitle: "온라인 전용 이벤트",
    emoji: "🎁"
  }
];

let currentEventPage = 0;
const EVENTS_PER_PAGE = 2;


// --------------------------------------------
// ISBN
// --------------------------------------------

function getSearchIsbn(book) {

  if (!book?.isbn) {
    return "";
  }

  const values = book.isbn.trim().split(" ");

  return values[values.length - 1];
}


// --------------------------------------------
// 가격
// --------------------------------------------

function formatSearchPrice(book) {

  const value =
    book.sale_price > 0
      ? book.sale_price
      : book.price;


  if (!value) {
    return "";
  }


  return `${value.toLocaleString()}원`;
}


// --------------------------------------------
// 장바구니 아이콘
// --------------------------------------------

function getCartSvg() {

  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M3 4h2l1.4 8.1a2 2 0 0 0 2 1.7h8.5a2 2 0 0 0 1.9-1.5L20 7H7"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="9" cy="18" r="1.2" fill="currentColor"/>
      <circle cx="17" cy="18" r="1.2" fill="currentColor"/>
    </svg>
  `;
}


// --------------------------------------------
// 상세 렌더링
// --------------------------------------------

function renderSearchDetail(book) {

  if (!book) {
    searchBookDetail.innerHTML = "";
    return;
  }


  const isbn = getSearchIsbn(book);
  const author = book.authors?.join(", ") || "";
  const publisher = book.publisher || "";
  const price = formatSearchPrice(book);

  const description =
    book.contents ||
    "도서 소개가 제공되지 않았습니다.";


  searchBookDetail.innerHTML = `
    <a
      class="search-detail-link"
      href="sub.html?isbn=${encodeURIComponent(isbn)}"
    >

      <div class="search-detail-top">

        <div class="search-detail-cover">
          ${
            book.thumbnail
              ? `
                <img
                  src="${getHighResThumbnail(book.thumbnail, 320)}"
                  alt="${book.title}"
                >
              `
              : `
                <div class="search-no-image">
                  이미지 없음
                </div>
              `
          }
        </div>


        <div class="search-detail-info">
          <h3>${book.title}</h3>

          <p>
            ${author}
            ${publisher ? ` · ${publisher}` : ""}
          </p>

          ${
            price
              ? `<strong>${price}</strong>`
              : ""
          }
        </div>

      </div>


      <p class="search-detail-description">
        ${description}
      </p>

    </a>
  `;
}


// --------------------------------------------
// 도서 페이지네이션
// --------------------------------------------

function getCurrentBookPageItems() {

  const start =
    currentBookPage * BOOKS_PER_PAGE;

  return currentSearchBooks.slice(
    start,
    start + BOOKS_PER_PAGE
  );
}


function updateBookPaginationLabel() {

  if (!currentSearchBooks.length) {
    searchBooksPage.textContent = "00 - 00";
    return;
  }


  const start =
    currentBookPage * BOOKS_PER_PAGE + 1;

  const end =
    Math.min(
      start + BOOKS_PER_PAGE - 1,
      currentSearchBooks.length
    );


  searchBooksPage.textContent =
    `${String(start).padStart(2, "0")} - ${String(end).padStart(2, "0")}`;
}


// --------------------------------------------
// 왼쪽 목록
// --------------------------------------------

function renderSearchList() {

  const books =
    getCurrentBookPageItems();

  searchBookList.innerHTML = "";


  if (!books.length) {

    searchBookList.innerHTML = `
      <div class="search-empty">
        검색 결과가 없습니다.
      </div>
    `;

    renderSearchDetail(null);
    updateBookPaginationLabel();

    return;
  }


  books.forEach(
    (book, index) => {

      const isbn = getSearchIsbn(book);
      const author = book.authors?.join(", ") || "";
      const price = formatSearchPrice(book);


      const row =
        document.createElement("div");

      row.className = "search-book-row";


      const link =
        document.createElement("a");

      link.className = "search-book-item";
      link.href = `sub.html?isbn=${encodeURIComponent(isbn)}`;


      link.innerHTML = `
        <div class="search-book-thumb">
          ${
            book.thumbnail
              ? `
                <img
                  src="${getHighResThumbnail(book.thumbnail, 320)}"
                  alt="${book.title}"
                >
              `
              : ""
          }
        </div>

        <div class="search-book-copy">
          <strong>${book.title}</strong>
          <span>${author}</span>
          ${price ? `<b>${price}</b>` : ""}
        </div>
      `;


      const cartButton =
        document.createElement("button");

      cartButton.type = "button";
      cartButton.className = "search-cart-button";
      cartButton.setAttribute("aria-label", "장바구니 담기");
      cartButton.innerHTML = getCartSvg();


      cartButton.addEventListener(
        "click",
        event => {

          event.stopPropagation();
          event.preventDefault();

          cartButton.classList.add("is-added");

          setTimeout(
            () =>
              cartButton.classList.remove("is-added"),
            900
          );
        }
      );


      link.addEventListener(
        "mouseenter",
        () => {

          document
            .querySelectorAll(".search-book-item")
            .forEach(
              element =>
                element.classList.remove("is-active")
            );

          link.classList.add("is-active");

          renderSearchDetail(book);
        }
      );


      if (index === 0) {
        link.classList.add("is-active");
      }


      row.appendChild(link);
      row.appendChild(cartButton);

      searchBookList.appendChild(row);
    }
  );


  renderSearchDetail(books[0]);
  updateBookPaginationLabel();
}


// --------------------------------------------
// 관련 인물
// --------------------------------------------

function renderRelatedPeople(
  books,
  keyword
) {

  const names = [
    ...new Set(
      books.flatMap(
        book =>
          book.authors || []
      )
    )
  ]
    .filter(Boolean)
    .slice(0, 2);


  if (!names.length) {

    searchPeople.innerHTML = `
      <span class="search-muted">
        "${keyword}" 관련 인물이 없습니다.
      </span>
    `;

    return;
  }


  searchPeople.innerHTML =
    names
      .map(
        name => `
          <div class="search-person">
            <strong>${name}</strong>
            <span>저자</span>
          </div>
        `
      )
      .join("");
}


// --------------------------------------------
// 이벤트
// --------------------------------------------

function renderEvents() {

  const start =
    currentEventPage * EVENTS_PER_PAGE;

  const events =
    demoEvents.slice(
      start,
      start + EVENTS_PER_PAGE
    );


  searchEvents.innerHTML =
    events
      .map(
        event => `
          <article class="search-event-card">
            <div class="search-event-visual">
              <span>${event.emoji}</span>
            </div>

            <div class="search-event-copy">
              <strong>${event.title}</strong>
              <span>${event.subtitle}</span>
            </div>
          </article>
        `
      )
      .join("");


  const labelStart = start + 1;

  const labelEnd =
    Math.min(
      start + EVENTS_PER_PAGE,
      demoEvents.length
    );


  searchEventsPage.textContent =
    `${String(labelStart).padStart(2, "0")} - ${String(labelEnd).padStart(2, "0")}`;
}


// --------------------------------------------
// 검색 실행
// --------------------------------------------

async function runLiveSearch() {

  const keyword =
    searchInput.value.trim();


  if (!keyword) {

    searchPreview.hidden = true;

    return;
  }


  try {

    const target =
      searchTarget.value;


    const options = {
      size: 12,
      sort: "accuracy"
    };


    if (target) {
      options.target = target;
    }


    const books =
      await searchBooks(
        keyword,
        options
      );


    currentSearchBooks = books;
    currentBookPage = 0;
    currentEventPage = 0;


    renderSearchList();

    renderRelatedPeople(
      books,
      keyword
    );

    renderEvents();


    searchPreview.hidden = false;

  }

  catch (error) {

    console.error(
      "실시간 검색 오류:",
      error
    );


    searchBookList.innerHTML = `
      <div class="search-empty">
        검색 중 오류가 발생했습니다.
      </div>
    `;


    searchPreview.hidden = false;

  }
}


// --------------------------------------------
// 도서 화살표
// --------------------------------------------

searchBooksPrev?.addEventListener(
  "click",
  () => {

    const maxPage =
      Math.max(
        0,
        Math.ceil(
          currentSearchBooks.length /
          BOOKS_PER_PAGE
        ) - 1
      );


    currentBookPage =
      currentBookPage <= 0
        ? maxPage
        : currentBookPage - 1;


    renderSearchList();
  }
);


searchBooksNext?.addEventListener(
  "click",
  () => {

    const maxPage =
      Math.max(
        0,
        Math.ceil(
          currentSearchBooks.length /
          BOOKS_PER_PAGE
        ) - 1
      );


    currentBookPage =
      currentBookPage >= maxPage
        ? 0
        : currentBookPage + 1;


    renderSearchList();
  }
);


// --------------------------------------------
// 이벤트 화살표
// --------------------------------------------

searchEventsPrev?.addEventListener(
  "click",
  () => {

    const maxPage =
      Math.max(
        0,
        Math.ceil(
          demoEvents.length /
          EVENTS_PER_PAGE
        ) - 1
      );


    currentEventPage =
      currentEventPage <= 0
        ? maxPage
        : currentEventPage - 1;


    renderEvents();
  }
);


searchEventsNext?.addEventListener(
  "click",
  () => {

    const maxPage =
      Math.max(
        0,
        Math.ceil(
          demoEvents.length /
          EVENTS_PER_PAGE
        ) - 1
      );


    currentEventPage =
      currentEventPage >= maxPage
        ? 0
        : currentEventPage + 1;


    renderEvents();
  }
);


// --------------------------------------------
// 입력 debounce
// --------------------------------------------

searchInput?.addEventListener(
  "input",
  () => {

    clearTimeout(searchTimer);

    searchTimer =
      setTimeout(
        runLiveSearch,
        250
      );
  }
);


searchTarget?.addEventListener(
  "change",
  runLiveSearch
);


searchInput?.addEventListener(
  "focus",
  () => {

    if (
      searchInput.value.trim() &&
      currentSearchBooks.length
    ) {
      searchPreview.hidden = false;
    }
  }
);


closeSearchPreview?.addEventListener(
  "click",
  () => {
    searchPreview.hidden = true;
  }
);


document.addEventListener(
  "click",
  event => {

    const searchArea =
      event.target.closest(".search-area");


    if (!searchArea) {
      searchPreview.hidden = true;
    }
  }
);


searchForm?.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    const keyword =
      searchInput.value.trim();


    if (!keyword) {
      return;
    }


    const currentBooks =
      getCurrentBookPageItems();


    if (currentBooks.length) {

      const isbn =
        getSearchIsbn(currentBooks[0]);


      if (isbn) {

        window.location.href =
          `sub.html?isbn=${encodeURIComponent(isbn)}`;

        return;
      }
    }


    runLiveSearch();
  }
);


// ============================================
// V30 - 포트폴리오 데모 장바구니 초기화
// ============================================

localStorage.removeItem(
  "kyobo-demo-cart"
);

localStorage.removeItem(
  "kyobo-demo-wishlist"
);

sessionStorage.removeItem(
  "kyobo-demo-cart"
);

sessionStorage.removeItem(
  "kyobo-demo-wishlist"
);


function updateMainCartBadge() {

  const badge =
    document.querySelector(
      "#mainCartBadge"
    );


  if (!badge) {
    return;
  }


  badge.textContent = "0";

  badge.hidden = true;

}


updateMainCartBadge();
