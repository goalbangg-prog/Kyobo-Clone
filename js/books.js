import {
  searchBooks,
  searchBookByTitle,
  getHighResThumbnail
} from "./api.js";



function makeFeaturedSummary(book) {
  const title = (book.title || "").trim();
  const author = book.authors?.[0] || "저자";

  const presets = [
    {
      test: value => value.includes("모순"),
      text: "양귀자의 대표 장편소설로, 삶의 모순과 선택을 섬세하게 그려낸 작품입니다. 서로 다른 삶의 방향 앞에서 흔들리는 인물들을 통해 우리가 당연하게 받아들이던 행복과 불행, 사랑과 선택의 의미를 다시 생각하게 합니다."
    },
    {
      test: value => value.includes("소년이 온다"),
      text: "1980년 광주의 기억과 상처를 여러 인물의 목소리로 그려낸 한강의 장편소설입니다. 한 사람의 죽음과 남겨진 사람들의 시간을 따라가며 폭력 이후에도 계속되는 기억과 인간의 존엄을 깊이 있게 바라봅니다."
    },
    {
      test: value => value.includes("사피엔스"),
      text: "인류의 기원부터 현대 문명까지, 인간의 역사를 큰 흐름으로 살펴보는 책입니다. 인지혁명과 농업혁명, 과학혁명을 거치며 호모 사피엔스가 어떻게 세계의 질서를 바꾸었는지 쉽고 넓은 시선으로 설명합니다."
    },
    {
      test: value => value.includes("물고기는 존재하지 않는다"),
      text: "과학자의 삶을 따라가며 질서와 혼돈, 상실과 회복을 탐색하는 논픽션입니다. 생명을 분류하려는 인간의 집착을 따라가다 보면 우리가 믿어 온 세계의 질서와 자기 삶을 바라보는 방식까지 다시 질문하게 됩니다."
    },
    {
      test: value => value.includes("도둑맞은 집중력"),
      text: "현대인의 집중력이 무너지는 원인을 개인과 사회의 환경 속에서 추적하는 책입니다. 스마트폰이나 의지 부족만을 탓하지 않고 수면, 노동, 기술 기업, 사회 구조까지 살펴보며 다시 몰입할 수 있는 조건을 이야기합니다."
    }
  ];

  const preset = presets.find(item => item.test(title));

  if (preset) {
    return preset.text;
  }

  const text =
    String(book.contents || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\.{3,}/g, "")
      .trim();

  if (text) {
    const sentences =
      text.match(/[^.!?]*(?:다\.|요\.|니다\.|한다\.|했다\.|이다\.|였다\.|[.!?])/g) || [];

    const complete =
      sentences
        .map(sentence => sentence.trim())
        .filter(Boolean);

    let summary = "";

    for (const sentence of complete) {
      if ((summary + " " + sentence).trim().length > 230) {
        break;
      }

      summary =
        (summary + " " + sentence).trim();

      if (summary.length >= 120) {
        break;
      }
    }

    if (summary) {
      return summary;
    }
  }

  return `『${title}』의 이야기와 핵심 주제를 소개하는 ${author}의 도서입니다. 작품의 주요 배경과 인물, 주제를 따라가며 책이 전하고자 하는 메시지를 부담 없이 만나볼 수 있습니다.`;
}


// ============================================
// 공통 도서 카드
// ============================================

function getPrice(book) {

  if (
    typeof book.sale_price === "number" &&
    book.sale_price > 0
  ) {
    return book.sale_price;
  }

  if (
    typeof book.price === "number" &&
    book.price > 0
  ) {
    return book.price;
  }

  return null;
}


function getIsbn(book) {

  if (!book.isbn) {
    return "";
  }

  const values =
    book.isbn.trim().split(" ");

  return values[values.length - 1];
}


export function createBookCard(
  book,
  {
    showMeta = false,
    rank = null
  } = {}
) {

  const isbn =
    getIsbn(book);

  const price =
    getPrice(book);

  const author =
    book.authors?.join(", ") || "";

  const image =
    getHighResThumbnail(
      book.thumbnail || "",
      420
    );

  const className =
    rank
      ? "book-card best-card"
      : "book-card";


  return `
    <a
      href="sub.html?isbn=${encodeURIComponent(isbn)}"
      class="${className}"
    >

      <div class="book-cover">

        ${
          image
            ? `
              <img
                src="${image}"
                alt="${book.title}"
              >
            `
            : `
              <div class="book-empty">
                이미지 없음
              </div>
            `
        }

        ${
          rank
            ? `
              <span class="rank-badge">
                ${rank}
              </span>
            `
            : ""
        }

      </div>

      <h3 class="book-title">
        ${book.title}
      </h3>

      ${
        showMeta
          ? `
            <p class="book-meta">
              ${author}
            </p>

            ${
              price
                ? `
                  <p class="book-price">
                    ${price.toLocaleString()}원
                  </p>
                `
                : ""
            }
          `
          : ""
      }

    </a>
  `;
}


// ============================================
// 공통 도서 섹션 로딩
// ============================================

export async function loadBookSection(
  targetSelector,
  query,
  options = {}
) {

  const target =
    document.querySelector(
      targetSelector
    );


  if (!target) {
    return;
  }


  target.innerHTML =
    `
      <div class="book-empty">
        도서 정보를 불러오는 중...
      </div>
    `;


  try {

    const books =
      await searchBooks(
        query,
        {
          size:
            options.size || 6,

          sort:
            options.sort || "accuracy"
        }
      );


    if (!books.length) {

      target.innerHTML =
        `
          <div class="book-empty">
            검색 결과가 없습니다.
          </div>
        `;

      return;
    }


    target.innerHTML =
      books
        .map(
          book =>
            createBookCard(
              book,
              {
                showMeta:
                  options.showMeta || false
              }
            )
        )
        .join("");


  }

  catch (error) {

    console.error(
      `${targetSelector} 로딩 오류:`,
      error
    );


    target.innerHTML =
      `
        <div class="book-empty">
          ${error.message}
        </div>
      `;

  }
}


// ============================================
// 오늘의 선택
// ============================================

export async function loadTodayBooks(
  query = "소설"
) {

  const featured =
    document.querySelector(
      "#todayFeatured"
    );

  const thumbs =
    document.querySelector(
      "#todayThumbs"
    );


  if (!featured || !thumbs) {
    return;
  }


  try {

    const books =
      await searchBooks(
        query,
        {
          size: 4
        }
      );


    if (!books.length) {
      return;
    }


    const first =
      books[0];


    const author =
      first.authors?.join(", ") || "";


    const featuredIsbn =
      getIsbn(first);

    const featuredImage =
      getHighResThumbnail(
        first.thumbnail || "",
        620
      );

    featured.innerHTML =
      `
        <a
          class="today-featured-link"
          href="sub.html?isbn=${encodeURIComponent(featuredIsbn)}"
          aria-label="${first.title} 상세페이지로 이동"
        >
          <div class="featured-cover">
            ${
              featuredImage
                ? `
                  <img
                    src="${featuredImage}"
                    alt="${first.title}"
                  >
                `
                : ""
            }
          </div>

          <div class="featured-info">

            <h3>
              ${first.title}
            </h3>

            <strong>
              ${author}
            </strong>

            <p class="featured-description">
              ${makeFeaturedSummary(first)}
            </p>

          </div>
        </a>
      `;


    thumbs.innerHTML =
      books
        .slice(1)
        .map(
          book =>
            `
              <a
                class="today-thumb"
                href="sub.html?isbn=${encodeURIComponent(getIsbn(book))}"
              >
                ${
                  book.thumbnail
                    ? `
                      <img
                        src="${getHighResThumbnail(book.thumbnail, 360)}"
                        alt="${book.title}"
                      >
                    `
                    : ""
                }
              </a>
            `
        )
        .join("");


  }

  catch (error) {

    console.error(
      "오늘의 선택 오류:",
      error
    );

    featured.innerHTML =
      `
        <div class="book-empty">
          ${error.message}
        </div>
      `;

  }
}


// ============================================
// 베스트 섹션
// ============================================
//
// Kakao API에는 '교보문고 실제 베스트 순위' 필드가 없습니다.
// 아래는 포트폴리오용 검색 결과를 순위 UI로 표현합니다.
//

export async function loadBestBooks(
  query = "베스트셀러"
) {

  const target =
    document.querySelector(
      "#bestBooks"
    );


  if (!target) {
    return;
  }


  try {

    const books =
      await searchBooks(
        query,
        {
          size: 10
        }
      );


    target.innerHTML =
      books
        .map(
          (book, index) =>
            createBookCard(
              book,
              {
                rank: index + 1
              }
            )
        )
        .join("");


  }

  catch (error) {

    console.error(
      "베스트 오류:",
      error
    );


    target.innerHTML =
      `
        <div class="book-empty">
          ${error.message}
        </div>
      `;

  }
}



// ============================================
// 큐레이션 도서 공통 로딩
// ============================================

async function fetchCuratedBooks(
  items = []
) {

  const results =
    await Promise.all(
      items.map(
        async item => {

          // ----------------------------------
          // 1. 문자열 방식
          // ----------------------------------

          if (typeof item === "string") {

            const book =
              await searchBookByTitle(item);

            if (!book) {

              console.warn(
                `[큐레이션 검색 실패] ${item}`
              );

              // 검색이 실패해도 슬롯 자체는 유지
              return {
                title: item,
                authors: [],
                publisher: "",
                thumbnail: "",
                isbn: "",
                price: 0,
                sale_price: 0,
                contents: ""
              };

            }

            return book;
          }


          // ----------------------------------
          // 2. 객체 방식
          //
          // query: Kakao API 검색어
          // title: 화면 표시용 제목
          // thumbnail: API 실패 시 수동 이미지
          // ----------------------------------

          const query =
            item.query ||
            item.title ||
            "";


          const apiBook =
            query
              ? await searchBookByTitle(query)
              : null;


          if (!apiBook) {

            console.warn(
              `[큐레이션 검색 실패 → 수동 데이터 사용] ${query}`
            );

            return {
              title:
                item.title || query,

              authors:
                item.authors || [],

              publisher:
                item.publisher || "",

              thumbnail:
                item.thumbnail || "",

              isbn:
                item.isbn || "",

              price:
                item.price || 0,

              sale_price:
                item.sale_price || 0,

              contents:
                item.contents || ""
            };

          }


          // API 결과가 있으면 API 데이터를 기본으로 사용하되
          // 사용자가 직접 적은 값이 있으면 그것을 우선 적용
          return {
            ...apiBook,
            ...item,

            title:
              item.title ||
              apiBook.title,

            authors:
              item.authors ||
              apiBook.authors,

            publisher:
              item.publisher ||
              apiBook.publisher,

            thumbnail:
              item.thumbnail ||
              apiBook.thumbnail
          };

        }
      )
    );


  // 중요:
  // 더 이상 filter(Boolean)으로 실패 책을 제거하지 않습니다.
  // 따라서 배열에 5권을 넣으면 반드시 카드 5개가 유지됩니다.
  return results;
}


export async function loadCuratedBookSection(
  targetSelector,
  titles,
  options = {}
) {

  const target =
    document.querySelector(
      targetSelector
    );


  if (!target) {
    return;
  }


  target.innerHTML =
    `
      <div class="book-empty">
        도서 정보를 불러오는 중...
      </div>
    `;


  try {

    const books =
      await fetchCuratedBooks(
        titles
      );


    if (!books.length) {

      target.innerHTML =
        `
          <div class="book-empty">
            큐레이션한 책을 찾지 못했습니다.
          </div>
        `;

      return;
    }


    target.innerHTML =
      books
        .map(
          book =>
            createBookCard(
              book,
              {
                showMeta:
                  options.showMeta || false
              }
            )
        )
        .join("");

  }

  catch (error) {

    console.error(
      `${targetSelector} 큐레이션 로딩 오류:`,
      error
    );

    target.innerHTML =
      `
        <div class="book-empty">
          ${error.message}
        </div>
      `;

  }
}




// ============================================
// V31 - MD들이 신중하게 골랐어요
// 탭 전환 + 좌우 순환
// ============================================

export async function loadCuratedMdBooks(
  mdGroups
) {

  const target =
    document.querySelector(
      "#mdBooks"
    );

  const tabs =
    document.querySelector(
      "#mdTabs"
    );

  const prev =
    document.querySelector(
      "#mdPrev"
    );

  const next =
    document.querySelector(
      "#mdNext"
    );


  if (!target) {
    return;
  }


  const groups =
    Array.isArray(mdGroups)
      ? {
          domestic: mdGroups
        }
      : mdGroups;


  const cache =
    new Map();


  let currentKey =
    Object.keys(groups)[0] ||
    "domestic";


  let currentIndex = 0;


  async function getBooks(
    key
  ) {

    if (cache.has(key)) {
      return cache.get(key);
    }


    const items =
      groups[key] || [];


    const loaded =
      await fetchCuratedBooks(
        items
      );


    cache.set(
      key,
      loaded
    );


    return loaded;
  }


  function render(
    loadedBooks
  ) {

    if (!loadedBooks.length) {

      target.innerHTML =
        `
          <div class="book-empty">
            도서 정보를 불러오지 못했습니다.
          </div>
        `;

      return;
    }


    currentIndex =
      (
        currentIndex %
        loadedBooks.length +
        loadedBooks.length
      ) %
      loadedBooks.length;


    const visibleCount =
      Math.min(
        6,
        loadedBooks.length
      );


    const visibleBooks =
      [];


    for (
      let offset = 0;
      offset < visibleCount;
      offset++
    ) {

      visibleBooks.push(
        loadedBooks[
          (
            currentIndex +
            offset
          ) %
          loadedBooks.length
        ]
      );

    }


    target.innerHTML =
      visibleBooks
        .map(
          book =>
            createBookCard(
              book
            )
        )
        .join("");

  }


  async function switchGroup(
    key
  ) {

    if (!groups[key]) {
      return;
    }


    currentKey =
      key;

    currentIndex = 0;


    tabs
      ?.querySelectorAll(
        "[data-md-key]"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "active",
            button.dataset.mdKey ===
              key
          );

        }
      );


    target.classList.add(
      "is-loading"
    );


    try {

      const loadedBooks =
        await getBooks(
          key
        );


      render(
        loadedBooks
      );

    }

    catch (error) {

      console.error(
        "MD 추천 탭 로딩 오류:",
        error
      );


      target.innerHTML =
        `
          <div class="book-empty">
            ${error.message}
          </div>
        `;

    }

    finally {

      target.classList.remove(
        "is-loading"
      );

    }

  }


  tabs
    ?.querySelectorAll(
      "[data-md-key]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            switchGroup(
              button.dataset.mdKey
            );

          }
        );

      }
    );


  prev
    ?.addEventListener(
      "click",
      async () => {

        const loadedBooks =
          await getBooks(
            currentKey
          );


        if (!loadedBooks.length) {
          return;
        }


        currentIndex =
          (
            currentIndex -
            1 +
            loadedBooks.length
          ) %
          loadedBooks.length;


        render(
          loadedBooks
        );

      }
    );


  next
    ?.addEventListener(
      "click",
      async () => {

        const loadedBooks =
          await getBooks(
            currentKey
          );


        if (!loadedBooks.length) {
          return;
        }


        currentIndex =
          (
            currentIndex +
            1
          ) %
          loadedBooks.length;


        render(
          loadedBooks
        );

      }
    );


  await switchGroup(
    currentKey
  );

}


// ============================================
// 큐레이션 - 오늘의 선택
// ============================================

export async function loadCuratedTodayBooks(
  todayGroups
) {

  const featured =
    document.querySelector(
      "#todayFeatured"
    );

  const thumbs =
    document.querySelector(
      "#todayThumbs"
    );

  const tabs =
    document.querySelector(
      "#todayTabs"
    );

  const prev =
    document.querySelector(
      "#todayPrev"
    );

  const next =
    document.querySelector(
      "#todayNext"
    );


  if (!featured || !thumbs) {
    return;
  }


  const groups =
    Array.isArray(todayGroups)
      ? {
          domestic: todayGroups
        }
      : todayGroups;


  const cache =
    new Map();


  let currentKey =
    Object.keys(groups)[0] ||
    "domestic";


  let currentIndex = 0;


  async function getBooks(
    key
  ) {

    if (cache.has(key)) {
      return cache.get(key);
    }


    const titles =
      groups[key] || [];


    const books =
      await fetchCuratedBooks(
        titles
      );


    cache.set(
      key,
      books
    );


    return books;
  }


  function render(
    books
  ) {

    if (!books.length) {

      featured.innerHTML =
        `
          <div class="book-empty">
            도서 정보를 불러오지 못했습니다.
          </div>
        `;

      thumbs.innerHTML = "";

      return;
    }


    currentIndex =
      (
        currentIndex %
        books.length +
        books.length
      ) %
      books.length;


    const first =
      books[currentIndex];


    const author =
      first.authors?.join(", ") || "";


    const featuredIsbn =
      getIsbn(first);


    const featuredImage =
      getHighResThumbnail(
        first.thumbnail || "",
        620
      );


    featured.innerHTML =
      `
        <a
          class="today-featured-link"
          href="sub.html?isbn=${encodeURIComponent(featuredIsbn)}"
          aria-label="${first.title} 상세페이지로 이동"
        >
          <div class="featured-cover">
            ${
              featuredImage
                ? `
                  <img
                    src="${featuredImage}"
                    alt="${first.title}"
                  >
                `
                : ""
            }
          </div>

          <div class="featured-info">

            <h3>
              ${first.title}
            </h3>

            <strong>
              ${author}
            </strong>

            <p class="featured-description">
              ${makeFeaturedSummary(first)}
            </p>

          </div>
        </a>
      `;


    const visibleThumbs = [];


    for (
      let offset = 1;
      offset <= Math.min(
        3,
        books.length - 1
      );
      offset++
    ) {

      visibleThumbs.push(
        books[
          (
            currentIndex +
            offset
          ) %
          books.length
        ]
      );

    }


    thumbs.innerHTML =
      visibleThumbs
        .map(
          book =>
            `
              <a
                class="today-thumb"
                href="sub.html?isbn=${encodeURIComponent(getIsbn(book))}"
                aria-label="${book.title} 상세페이지로 이동"
              >
                ${
                  book.thumbnail
                    ? `
                      <img
                        src="${getHighResThumbnail(book.thumbnail, 360)}"
                        alt="${book.title}"
                      >
                    `
                    : ""
                }
              </a>
            `
        )
        .join("");

  }


  async function switchGroup(
    key
  ) {

    if (!groups[key]) {
      return;
    }


    currentKey =
      key;


    currentIndex = 0;


    tabs
      ?.querySelectorAll(
        "[data-today-key]"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "active",
            button.dataset.todayKey ===
              key
          );

        }
      );


    try {

      const books =
        await getBooks(
          key
        );


      render(
        books
      );

    }

    catch (error) {

      console.error(
        "오늘의 선택 탭 로딩 오류:",
        error
      );

    }

  }


  tabs
    ?.querySelectorAll(
      "[data-today-key]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            switchGroup(
              button.dataset.todayKey
            );

          }
        );

      }
    );


  prev
    ?.addEventListener(
      "click",
      async () => {

        const books =
          await getBooks(
            currentKey
          );


        if (!books.length) {
          return;
        }


        currentIndex =
          (
            currentIndex -
            1 +
            books.length
          ) %
          books.length;


        render(
          books
        );

      }
    );


  next
    ?.addEventListener(
      "click",
      async () => {

        const books =
          await getBooks(
            currentKey
          );


        if (!books.length) {
          return;
        }


        currentIndex =
          (
            currentIndex +
            1
          ) %
          books.length;


        render(
          books
        );

      }
    );


  await switchGroup(
    currentKey
  );

}


// ============================================
// 큐레이션 - 베스트
// ============================================

export async function loadCuratedBestBooks(
  titles
) {

  const target =
    document.querySelector(
      "#bestBooks"
    );


  if (!target) {
    return;
  }


  target.innerHTML =
    `
      <div class="book-empty">
        베스트 도서를 불러오는 중...
      </div>
    `;


  try {

    const books =
      await fetchCuratedBooks(
        titles
      );


    target.innerHTML =
      books
        .map(
          (book, index) =>
            createBookCard(
              book,
              {
                rank:
                  index + 1
              }
            )
        )
        .join("");

  }

  catch (error) {

    console.error(
      "베스트 큐레이션 오류:",
      error
    );

  }
}
