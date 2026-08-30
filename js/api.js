// ============================================
// Kakao Book API 전용 모듈
// ============================================
//
// 1) 아래 REST_API_KEY에 본인의 Kakao REST API 키를 입력
// 2) main.js / books.js는 이 파일의 함수를 사용
//
// 주의:
// 브라우저 JS에 REST API 키를 넣으면 개발자 도구에서 노출됩니다.
// 학습/포트폴리오 데모에서는 사용할 수 있지만,
// 실제 서비스에서는 백엔드 프록시 사용을 권장합니다.
//

const REST_API_KEY = "777a9b03e722069391c2f6618ba58d95";

const KAKAO_BOOK_URL =
  "https://dapi.kakao.com/v3/search/book";


export async function searchBooks(
  query,
  {
    sort = "accuracy",
    page = 1,
    size = 6,
    target = ""
  } = {}
) {

  if (
    !REST_API_KEY ||
    REST_API_KEY.includes("여기에_")
  ) {
    throw new Error(
      "api.js의 REST_API_KEY에 카카오 REST API 키를 입력하세요."
    );
  }


  const params =
    new URLSearchParams({
      query,
      sort,
      page,
      size
    });


  if (target) {
    params.set("target", target);
  }


  const response =
    await fetch(
      `${KAKAO_BOOK_URL}?${params.toString()}`,
      {
        headers: {
          Authorization:
            `KakaoAK ${REST_API_KEY}`
        }
      }
    );


  if (!response.ok) {
    throw new Error(
      `Kakao API 오류: ${response.status}`
    );
  }


  const data =
    await response.json();


  return data.documents;
}



// ============================================
// 제목 하나로 가장 적절한 책 1권 찾기
// ============================================
//
// 큐레이션 배열에 적은 책 제목을 Kakao API에서 검색한 뒤,
// 1) 표지가 있는 책
// 2) 제목이 가장 비슷한 책
// 순서로 우선 선택합니다.
//

function normalizeTitle(value = "") {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}


export async function searchBookByTitle(title) {

  // ------------------------------------------
  // 1차: 제목 필드 중심으로 정확 검색
  // ------------------------------------------

  let books =
    await searchBooks(
      title,
      {
        target: "title",
        size: 10,
        sort: "accuracy"
      }
    );


  // ------------------------------------------
  // 2차: 제목 검색 결과가 없으면 전체 필드 검색
  //
  // 독립출판 / POD / 소규모 출판사의 경우
  // Kakao API에서 target:"title" 검색에 잡히지 않는
  // 경우가 있어서 한 번 더 넓게 검색합니다.
  // ------------------------------------------

  if (!books.length) {

    books =
      await searchBooks(
        title,
        {
          size: 10,
          sort: "accuracy"
        }
      );

  }


  if (!books.length) {
    return null;
  }


  const wanted =
    normalizeTitle(title);


  const scored =
    books
      .map(book => {

        const current =
          normalizeTitle(book.title || "");

        const authors =
          normalizeTitle(
            (book.authors || []).join(" ")
          );

        let score = 0;


        // 표지가 있는 책을 최우선
        if (book.thumbnail) {
          score += 200;
        }


        // 제목 완전 일치
        if (current === wanted) {
          score += 1200;
        }


        // 제목 부분 일치
        else if (
          current.includes(wanted) ||
          wanted.includes(current)
        ) {
          score += 700;
        }


        // 사용자가 "책제목 저자명" 형태로 입력했을 때도
        // 해당 저자가 포함되어 있으면 가점
        if (
          authors &&
          wanted.includes(authors)
        ) {
          score += 250;
        }


        return {
          book,
          score
        };

      })
      .sort(
        (a, b) =>
          b.score - a.score
      );


  return scored[0]?.book || null;
}


// ============================================
// Kakao 도서 표지 고해상도 변환
// ============================================
//
// Kakao Book API의 thumbnail은 기본적으로
// R120x174.q85 크기의 작은 썸네일을 반환합니다.
//
// 같은 Kakao CDN의 원본 fname을 유지하면서
// 요청 크기만 R600x0.q90 등으로 변경하면
// 확대된 카드/상세페이지에서 훨씬 선명하게 표시됩니다.
//
// 로컬 이미지나 다른 외부 이미지는 그대로 반환합니다.
//

export function getHighResThumbnail(
  src = "",
  width = 600
) {
  if (!src) {
    return "";
  }

  if (
    src.startsWith("img/") ||
    src.startsWith("./") ||
    src.startsWith("../")
  ) {
    return src;
  }

  try {
    if (
      src.includes("kakaocdn.net/thumb/")
    ) {
      return src.replace(
        /\/thumb\/R\d+x\d+(?:\.q\d+)?\//,
        `/thumb/R${width}x0.q90/`
      );
    }
  } catch (error) {
    console.warn(
      "고해상도 표지 변환 실패:",
      error
    );
  }

  return src;
}
