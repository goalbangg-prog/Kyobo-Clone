import {
  searchBooks,
  getHighResThumbnail
} from "./api.js";

let currentBook = null;
let currentProfile = null;

const params = new URLSearchParams(location.search);
const isbn = params.get("isbn") || "9791189327156";

const $ = selector => document.querySelector(selector);
const won = value => value > 0 ? `${Number(value).toLocaleString()}원` : "가격 정보 없음";
const dateText = value => {
  if (!value) return "-";
  const date = value.slice(0, 10).split("-");
  if (date.length !== 3) return value;
  return `${date[0]}년 ${Number(date[1])}월 ${Number(date[2])}일`;
};

function cleanIsbn(value = "") {
  const parts = value.trim().split(/\s+/);
  return parts.at(-1) || value || "-";
}


function makeShortBookSummary(book) {
  const title = (book.title || "").trim();
  const author = book.authors?.[0] || "저자";

  const presets = [
    {
      test: value => value.includes("모순"),
      text: "양귀자의 대표 장편소설로, 삶의 모순과 선택을 섬세하게 그려낸 작품입니다."
    },
    {
      test: value => value.includes("소년이 온다"),
      text: "1980년 광주의 기억과 상처를 여러 인물의 목소리로 그려낸 한강의 장편소설입니다."
    },
    {
      test: value => value.includes("사피엔스"),
      text: "인류의 기원부터 현대 문명까지, 인간의 역사를 큰 흐름으로 살펴보는 책입니다."
    },
    {
      test: value => value.includes("물고기는 존재하지 않는다"),
      text: "과학자의 삶을 따라가며 질서와 혼돈, 상실과 회복을 탐색하는 논픽션입니다."
    },
    {
      test: value => value.includes("도둑맞은 집중력"),
      text: "현대인의 집중력이 무너지는 원인을 개인과 사회의 환경 속에서 추적하는 책입니다."
    },
    {
      test: value => value.includes("구름관찰자를 위한 그림책"),
      text: "매일 다른 구름의 모습과 하늘을 관찰하는 즐거움을 알려주는 그림책입니다."
    }
  ];

  const preset =
    presets.find(item => item.test(title));

  if (preset) {
    return preset.text;
  }

  let text =
    String(book.contents || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\.{3,}/g, "")
      .trim();

  // API 설명에 완결된 첫 문장이 있으면 그것만 사용한다.
  const sentence =
    text.match(/^(.{12,110}?(?:다\.|요\.|니다\.|한다\.|했다\.|이다\.|였다\.|[.!?]))(?:\s|$)/);

  if (sentence) {
    return sentence[1].trim();
  }

  // Kakao contents가 중간에서 잘린 경우에는 억지로 조각을 보여주지 않는다.
  return `『${title}』의 이야기와 핵심 주제를 소개하는 ${author}의 도서입니다.`;
}

function getBookProfile(book) {
  const title = book.title || "";

  if (title.includes("물고기는 존재하지 않는다")) {
    return {
      subtitle: makeShortBookSummary(book),
      categoryPath: ["국내도서", "과학", "교양과학", "과학이야기"],
      rank: "국내도서 분야 베스트",
      rating: "9.5",
      reviewCount: "1,386",
      point: 850,
      pages: "299쪽",
      recommend: "『물고기는 존재하지 않는다』 읽은 사람?",
      introLead: "“저의 바람은 당신이 이 책을 읽고 난 뒤 이전과는 조금 다르게 세상을 바라보는 것이에요.”",
      introBody: book.contents || "룰루 밀러의 사랑과 혼돈, 과학적 집착에 관한 논픽션. 생명의 질서와 인간이 세계를 분류하려는 욕망을 따라가며 우리가 믿어 온 질서에 질문을 던진다.",
      authorDescription: "룰루 밀러는 과학 저널리스트이자 작가로, 과학과 인간의 삶이 맞닿는 지점을 이야기로 풀어낸다. 이 책에서는 한 과학자의 집착과 삶을 추적하며 질서와 혼돈, 상실과 회복에 대해 질문한다.",
      toc: "프롤로그\n혼돈에 이름을 붙이는 사람들\n질서에 대한 집착\n무너지는 세계\n다시 바라보는 생명\n에필로그",
      excerpt: "우리가 세계를 분류하고 이름 붙이는 방식은 실제 세계의 질서와 완전히 같지 않을 수 있다. 이 책은 과학자의 삶을 따라가면서 인간이 질서를 찾으려는 욕망과 그 틈에서 발견되는 예상 밖의 이야기를 보여준다.",
      publisherReview: "과학사와 개인의 서사를 교차시키며 삶의 질서에 대해 생각하게 하는 논픽션이다. 한 사람의 집착을 따라가지만 끝내 독자 자신의 세계관을 되묻게 만든다.",
      sideBooks: ["이기적 유전자", "코스모스", "도파민네이션", "침묵의 봄", "사피엔스"],
      relatedQueries: ["도파민네이션", "코스모스", "이기적 유전자", "침묵의 봄", "사피엔스"],
      cloudAssets: false,
      highlight: "우리가 믿어 온 질서가 정말 존재하는 것인지 다시 질문하게 만드는 책."
    };
  }

  if (title.includes("도둑맞은 집중력")) {
    return {
      subtitle: makeShortBookSummary(book),
      categoryPath: ["국내도서", "인문", "인문교양", "현대사회"],
      rank: "인문 분야 베스트",
      rating: "9.4",
      reviewCount: "1,472",
      point: 940,
      pages: "464쪽",
      recommend: "집중력을 되찾기 위한 오늘의 추천 도서",
      introLead: "왜 우리는 갈수록 집중하기 어려워지는가.",
      introBody: book.contents || "집중력이 무너지는 여러 원인을 추적하고, 개인의 의지뿐 아니라 사회와 기술 환경까지 함께 살펴보는 책이다.",
      authorDescription: "요한 하리는 현대 사회의 문제를 개인의 의지 문제로만 보지 않고, 구조와 환경을 함께 추적하는 논픽션 작가다.",
      toc: "너무 빠른 속도와 멀티태스킹\n몰입의 손상\n수면과 집중력\n테크 기업과 주의력\n아이들의 집중력\n집중력을 되찾기 위한 변화",
      excerpt: "집중력의 위기는 단지 개인이 스마트폰을 오래 써서 생긴 문제가 아니라 우리의 생활 환경과 기술, 노동 방식이 함께 만든 결과일 수 있다.",
      publisherReview: "자제력만 탓하는 대신 우리의 주의를 빼앗는 구조를 살피고, 다시 몰입할 수 있는 조건을 찾도록 이끄는 책이다.",
      sideBooks: ["도파민네이션", "불안 세대", "몰입", "생각 중독", "아주 작은 습관의 힘"],
      relatedQueries: ["도파민네이션", "불안 세대", "몰입", "생각 중독", "아주 작은 습관의 힘"],
      cloudAssets: false,
      highlight: "집중력 문제를 개인의 실패가 아니라 환경과 구조의 문제까지 확장해 바라본다."
    };
  }

  if (title.includes("구름관찰자")) {
    return {
      subtitle: makeShortBookSummary(book),
      categoryPath: ["국내도서", "과학", "교양과학", "과학이야기"],
      rank: "과학 438위",
      rating: "10.0",
      reviewCount: "48",
      point: null,
      pages: "128쪽",
      recommend: "한국천문연구원의 단계별 추천 도서",
      introLead: "구름이 태어나는 순간부터 다양한 모습까지, 하늘을 바라보는 재미를 알려주는 그림책.",
      introBody: book.contents || "구름을 관찰하고 감상하는 방법을 소개하는 책이다.",
      authorDescription: "구름과 하늘을 관찰하는 즐거움을 소개하는 저자 정보 영역입니다.",
      toc: "구름을 바라보는 법\n구름의 종류\n하늘에서 발견하는 변화\n구름 감상 기록",
      excerpt: "구름을 관찰하는 순간, 익숙했던 하늘은 매일 다른 장면으로 바뀐다.",
      publisherReview: "구름을 사랑하는 독자를 위한 관찰과 감상의 안내서입니다.",
      sideBooks: ["구름과 날씨 이야기", "우주를 읽는 시간", "하늘을 관찰하는 법", "과학자의 그림책", "오늘의 과학"],
      relatedQueries: ["날씨", "우주", "하늘", "과학 그림책", "기상"],
      cloudAssets: true,
      highlight: "매일 다른 하늘을 조금 더 오래 바라보게 만드는 책."
    };
  }

  return {
    subtitle: makeShortBookSummary(book),
    categoryPath: ["국내도서", "도서", "교양"],
    rank: "국내도서 분야 베스트",
    rating: "10.0",
    reviewCount: "48",
    point: null,
    pages: "-",
    recommend: "이 책을 읽은 독자들이 함께 찾는 콘텐츠",
    introLead: book.contents || "책 소개",
    introBody: book.contents || "Kakao Book API에서 제공되는 도서 소개를 표시합니다.",
    authorDescription: "저자와 도서에 대한 상세 정보를 보여주는 영역입니다.",
    toc: "목차 정보는 도서별 큐레이션 데이터로 확장할 수 있습니다.",
    excerpt: book.contents || "책 속으로 정보는 도서별 상세 데이터로 추가할 수 있습니다.",
    publisherReview: "출판사 서평 정보는 도서별 상세 데이터로 추가할 수 있습니다.",
    sideBooks: ["함께 읽기 좋은 책", "이 분야의 추천 도서", "독자들이 찾는 책", "새로 나온 책", "MD 추천"],
    relatedQueries: [],
    cloudAssets: false,
    highlight: "책의 핵심 메시지를 소개하는 영역입니다."
  };
}

async function fetchRelatedBooks(book, profile) {
  const books = [];
  const currentIsbn = cleanIsbn(book.isbn);

  // 1) 도서별 큐레이션 검색어 우선
  const queries = [...(profile.relatedQueries || [])];

  // 2) 큐레이션이 없는 일반 도서는 저자/출판사를 이용해 자동 추천
  if (!queries.length) {
    const author = book.authors?.[0];
    if (author) queries.push(author);
    if (book.publisher) queries.push(book.publisher);
    if (book.title) queries.push(book.title.split(" ").slice(0, 2).join(" "));
  }

  for (const query of queries) {
    try {
      const result = await searchBooks(query, { size: 10 });

      for (const candidate of result) {
        const candidateIsbn = cleanIsbn(candidate.isbn);
        if (!candidate.thumbnail) continue;
        if (candidateIsbn === currentIsbn) continue;
        if (books.some(item => cleanIsbn(item.isbn) === candidateIsbn)) continue;

        books.push(candidate);
        if (books.length >= 5) return books;
      }
    } catch (error) {
      console.warn("연관도서 로드 실패:", query, error);
    }
  }

  return books;
}

function renderRelatedBooks(books, profile) {
  const target = $("#relatedBooks");

  if (books.length) {
    target.innerHTML = books.map(book => {
      const targetIsbn = cleanIsbn(book.isbn);
      const price = book.sale_price > 0 ? book.sale_price : book.price;

      return `
        <a class="related-book-card" href="sub.html?isbn=${encodeURIComponent(targetIsbn)}">
          <div class="related-cover">
            ${book.thumbnail ? `<img src="${getHighResThumbnail(book.thumbnail, 420)}" alt="${book.title}">` : `<span>BOOK</span>`}
          </div>
          <strong>${book.title}</strong>
          <span>${book.authors?.[0] || ""}</span>
          <b>${won(price)}</b>
        </a>
      `;
    }).join("");
    return;
  }

  // Kakao 검색 실패 시에도 실제 쇼핑몰처럼 섹션 자체는 유지한다.
  target.innerHTML = profile.sideBooks.slice(0, 5).map((title, index) => `
    <a class="related-book-card related-book-fallback" href="index.html?search=${encodeURIComponent(title)}">
      <div class="related-cover">
        <span class="fallback-book-mark">BOOK ${String(index + 1).padStart(2, "0")}</span>
      </div>
      <strong>${title}</strong>
      <span>추천 도서</span>
      <b>도서 보기 ›</b>
    </a>
  `).join("");
}

function renderSideBest(profile) {
  $("#sideBest").innerHTML = profile.sideBooks
    .map((title, index) => `<li><span>${index + 1}</span><a href="index.html?search=${encodeURIComponent(title)}">${title}</a></li>`)
    .join("");
}

function renderBook(book, profile) {
  const sale = book.sale_price > 0 ? book.sale_price : book.price;
  const discount = book.price > 0 && sale > 0
    ? Math.max(0, Math.round((1 - sale / book.price) * 100))
    : 10;
  const points = profile.point ?? Math.round(sale * 0.05);
  const author = book.authors?.join(", ") || "저자 정보 없음";
  const publisher = book.publisher || "출판사 정보 없음";
  const isbnText = cleanIsbn(book.isbn);

  document.title = `${book.title} | 교보문고 포트폴리오`;

  $("#breadcrumb").innerHTML =
    `⌂ ${profile.categoryPath.map(item => `<span>›</span> ${item}`).join(" ")}`;

  $("#bookTitle").textContent = book.title;
  $("#bookSubtitle").textContent = profile.subtitle;
  $("#tabBookPrice").textContent = won(sale);

  $("#bookAuthors").textContent = `${author} 저자(글)`;
  $("#bookPublisher").textContent = publisher;
  $("#bookDate").textContent = dateText(book.datetime);
  $("#bookRank").innerHTML = `<span class="rank-icon">♛</span><b>${profile.rank}</b>`;

  $("#bookRating").textContent = profile.rating;
  $("#bookReviewCount").textContent = `리뷰 ${profile.reviewCount} ›`;
  $("#recommendText").textContent = profile.recommend;

  const cover = $("#bookCover");
  cover.src =
    getHighResThumbnail(
      book.thumbnail || "",
      760
    );
  cover.alt = book.title;

  $("#discountRate").textContent = `${discount || 10}%`;
  $("#salePrice").textContent = won(sale);
  $("#originalPrice").textContent = book.price > sale ? won(book.price) : "";
  $("#pointValue").textContent = `${points.toLocaleString()}P`;

  $("#infoPages").textContent = profile.pages;
  $("#infoIsbn").textContent = isbnText;

  $("#introLead").textContent = profile.introLead;
  $("#introBody").textContent = profile.introBody;
  $("#highlightQuote").textContent = profile.highlight;

  $("#authorName").textContent = author;
  $("#authorDescription").textContent = profile.authorDescription;
  $("#tocText").textContent = profile.toc;
  $("#excerptText").textContent = profile.excerpt;
  $("#publisherReviewText").textContent = profile.publisherReview;

  $("#basicIsbn").textContent = isbnText;
  $("#basicPages").textContent = profile.pages;
  $("#basicAuthor").textContent = author;
  $("#basicPublisher").textContent = publisher;
  $("#basicDate").textContent = dateText(book.datetime);

  $("#reviewScore").textContent = profile.rating;
  $("#reviewBigScore").textContent = profile.rating;

  unitSalePrice = sale;
  updateTotalPrice();

  $("#cloudOnlyDetail").hidden = !profile.cloudAssets;
  $("#cloudOnlyReview").hidden = !profile.cloudAssets;

  renderSideBest(profile);
}

async function init() {
  try {
    let books = [];

    try {
      books =
        await searchBooks(
          isbn,
          {
            target: "isbn",
            size: 3
          }
        );
    } catch (error) {
      console.warn(
        "ISBN 전용 검색 실패, 일반 검색으로 재시도:",
        error
      );
    }

    if (!books.length) {
      books =
        await searchBooks(
          isbn,
          {
            size: 10
          }
        );
    }

    const normalizedIsbn =
      String(isbn)
        .replace(/[^0-9Xx]/g, "");

    const book =
      books.find(item => {
        const candidates =
          String(item.isbn || "")
            .split(/\s+/)
            .map(value =>
              value.replace(/[^0-9Xx]/g, "")
            );

        return candidates.includes(
          normalizedIsbn
        );
      }) || books[0];

    if (!book) {
      throw new Error(
        "도서 정보를 찾을 수 없습니다."
      );
    }

    const profile = getBookProfile(book);

    currentBook = book;
    currentProfile = profile;

    renderBook(book, profile);
    syncInteractiveState();

    const related = await fetchRelatedBooks(book, profile);
    renderRelatedBooks(related, profile);
  } catch (error) {
    console.error(error);

    $("#bookTitle").textContent = "도서 정보를 불러오지 못했습니다.";
    $("#bookSubtitle").textContent = error.message;
    // 상세 데이터가 실패하더라도 고정 레이아웃은 유지한다.
  }
}

const form = $("#subSearchForm");
const input = $("#subSearchInput");

form?.addEventListener("submit", event => {
  event.preventDefault();
  const query = input.value.trim();
  if (query) location.href = `index.html?search=${encodeURIComponent(query)}`;
});

let qty = 1;
let unitSalePrice = 0;

const qtyValue = $("#qtyValue");

function updateTotalPrice() {
  const total =
    unitSalePrice * qty;

  $("#dockPrice").textContent =
    won(total);
}

$("#qtyMinus")?.addEventListener("click", () => {
  qty = Math.max(1, qty - 1);
  qtyValue.textContent = qty;
  updateTotalPrice();
});

$("#qtyPlus")?.addEventListener("click", () => {
  qty += 1;
  qtyValue.textContent = qty;
  updateTotalPrice();
});

document.querySelectorAll(".detail-tabs a").forEach(link => {
  link.addEventListener("click", event => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 92;
    window.scrollTo({ top: y, behavior: "smooth" });
  });
});


// ============================================
// V27 - 실제 상세페이지 상호작용
// ============================================

const STORAGE_CART = "kyobo-demo-cart";
const STORAGE_WISH = "kyobo-demo-wishlist";

function readStorage(key) {
  try {
    return JSON.parse(
      sessionStorage.getItem(key) || "[]"
    );
  } catch {
    return [];
  }
}

function writeStorage(key, value) {
  sessionStorage.setItem(
    key,
    JSON.stringify(value)
  );
}

function currentBookData() {
  if (!currentBook) {
    return null;
  }

  const sale =
    currentBook.sale_price > 0
      ? currentBook.sale_price
      : currentBook.price;

  return {
    isbn: cleanIsbn(currentBook.isbn),
    title: currentBook.title,
    authors: currentBook.authors || [],
    thumbnail: getHighResThumbnail(
      currentBook.thumbnail || "",
      500
    ),
    price: sale,
    qty
  };
}

function showToast(message) {
  const toast =
    $("#subToast");

  if (!toast) return;

  toast.textContent =
    message;

  toast.hidden = false;

  clearTimeout(
    showToast.timer
  );

  showToast.timer =
    setTimeout(
      () => {
        toast.hidden = true;
      },
      1800
    );
}

function updateCartBadge() {
  const cart =
    readStorage(STORAGE_CART);

  const count =
    cart.reduce(
      (sum, item) =>
        sum + (item.qty || 1),
      0
    );

  const badge =
    $("#subCartBadge");

  if (badge) {
    badge.textContent =
      count > 99
        ? "99+"
        : String(count);

    badge.hidden =
      count === 0;
  }
}

function syncInteractiveState() {
  const wishButton =
    $("#wishButton");

  if (
    !wishButton ||
    !currentBook
  ) {
    updateCartBadge();
    return;
  }

  const wishes =
    readStorage(STORAGE_WISH);

  const selected =
    wishes.some(
      item =>
        item.isbn ===
        cleanIsbn(currentBook.isbn)
    );

  wishButton.classList.toggle(
    "is-active",
    selected
  );

  wishButton.textContent =
    selected
      ? "♥"
      : "♡";

  updateCartBadge();
}

$("#cartButton")?.addEventListener(
  "click",
  () => {
    const item =
      currentBookData();

    if (!item) return;

    const cart =
      readStorage(STORAGE_CART);

    const index =
      cart.findIndex(
        saved =>
          saved.isbn === item.isbn
      );

    if (index >= 0) {
      cart[index].qty =
        (cart[index].qty || 1) +
        qty;
    } else {
      cart.push(item);
    }

    writeStorage(
      STORAGE_CART,
      cart
    );

    updateCartBadge();

    showToast(
      "장바구니에 담았습니다."
    );
  }
);

$("#wishButton")?.addEventListener(
  "click",
  () => {
    const item =
      currentBookData();

    if (!item) return;

    let wishes =
      readStorage(STORAGE_WISH);

    const selected =
      wishes.some(
        saved =>
          saved.isbn === item.isbn
      );

    if (selected) {
      wishes =
        wishes.filter(
          saved =>
            saved.isbn !== item.isbn
        );

      showToast(
        "찜 목록에서 삭제했습니다."
      );
    } else {
      wishes.push(item);

      showToast(
        "찜 목록에 추가했습니다."
      );
    }

    writeStorage(
      STORAGE_WISH,
      wishes
    );

    syncInteractiveState();
  }
);

$("#shareButton")?.addEventListener(
  "click",
  async () => {
    const data = {
      title:
        currentBook?.title ||
        document.title,

      text:
        currentBook
          ? `${currentBook.title} 도서 정보`
          : document.title,

      url: location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(
          location.href
        );

        showToast(
          "상세페이지 주소를 복사했습니다."
        );
      }
    } catch (error) {
      if (
        error?.name !== "AbortError"
      ) {
        console.warn(
          "공유 실패:",
          error
        );
      }
    }
  }
);

const modal =
  $("#bookModal");

function openCoverModal() {
  if (!currentBook) return;

  $("#modalCover").src =
    getHighResThumbnail(
      currentBook.thumbnail || "",
      1000
    );

  $("#modalCover").alt =
    currentBook.title;

  $("#modalTitle").textContent =
    currentBook.title;

  modal.hidden = false;

  document.body.classList.add(
    "modal-open"
  );
}

function closeCoverModal() {
  modal.hidden = true;

  document.body.classList.remove(
    "modal-open"
  );
}

$("#coverZoomButton")?.addEventListener(
  "click",
  openCoverModal
);

document.querySelectorAll(
  "[data-close-modal]"
).forEach(
  element =>
    element.addEventListener(
      "click",
      closeCoverModal
    )
);

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Escape" &&
      modal &&
      !modal.hidden
    ) {
      closeCoverModal();
    }
  }
);

$("#previewButton")?.addEventListener(
  "click",
  () => {
    if (
      currentBook?.url
    ) {
      window.open(
        currentBook.url,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      showToast(
        "미리보기 정보가 없습니다."
      );
    }
  }
);

$("#giftButton")?.addEventListener(
  "click",
  () => {
    showToast(
      "선물하기 화면을 포트폴리오용으로 구현한 버튼입니다."
    );
  }
);

$("#pickupButton")?.addEventListener(
  "click",
  () => {
    showToast(
      "바로드림 매장 선택 기능을 연결할 수 있습니다."
    );
  }
);

$("#orderButton")?.addEventListener(
  "click",
  () => {
    const item =
      currentBookData();

    if (!item) return;

    showToast(
      "주문 단계로 이동합니다."
    );
  }
);

$("#headerCartButton")?.addEventListener(
  "click",
  () => {
    const cart =
      readStorage(STORAGE_CART);

    if (!cart.length) {
      showToast(
        "장바구니가 비어 있습니다."
      );
      return;
    }

    const count =
      cart.reduce(
        (sum, item) =>
          sum + (item.qty || 1),
        0
      );

    showToast(
      `장바구니에 ${count}권이 있습니다.`
    );
  }
);

// 스크롤 위치에 따라 상세 탭 활성화
const tabLinks =
  [...document.querySelectorAll(
    ".detail-tabs a"
  )];

const tabSections =
  tabLinks
    .map(link => {
      const target =
        document.querySelector(
          link.getAttribute("href")
        );

      return {
        link,
        target
      };
    })
    .filter(
      item =>
        item.target
    );

function updateActiveTab() {
  const offset =
    window.scrollY + 150;

  let active =
    tabSections[0];

  for (
    const item of tabSections
  ) {
    if (
      item.target.offsetTop <=
      offset
    ) {
      active = item;
    }
  }

  tabLinks.forEach(
    link =>
      link.classList.remove(
        "is-active"
      )
  );

  active?.link.classList.add(
    "is-active"
  );
}

window.addEventListener(
  "scroll",
  updateActiveTab,
  {
    passive: true
  }
);

updateActiveTab();


// ============================================
// V28 - 모든 기능 초기화가 끝난 뒤 도서 데이터 로딩
// ============================================

await init();

syncInteractiveState();
updateTotalPrice();
