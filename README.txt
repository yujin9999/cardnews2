# 카드뉴스 전용 페이지 (GitHub Pages 무료 배포용)

이 폴더를 그대로 GitHub에 업로드하면:
- /cardnews/ 접속 시: '이전 호 목록'만 보입니다.
- 호를 클릭하면: 1페이지부터 다음/이전으로 넘겨볼 수 있습니다.
- JPG/PNG 이미지형, PDF형 둘 다 지원합니다.

---

## 1) GitHub Pages로 무료 배포 (가장 쉬운 방법)

### A. 저장소 만들기
1. github.com 로그인 → 오른쪽 위 + → New repository
2. Repository name: `cardnews`
3. Public 선택 → Create repository

### B. 파일 업로드
1. 저장소 화면에서 **Add file → Upload files**
2. 이 폴더 안의 파일/폴더를 전부 드래그&드롭
3. 화면 아래로 스크롤 → 초록 버튼 **Commit changes** 클릭

### C. Pages 켜기
1. Settings → Pages
2. Source: Branch = `main`, Folder = `/ (root)`
3. Save

### D. 주소 확인
- `https://아이디.github.io/cardnews/`

---

## 2) 카드뉴스 새 호 추가하기

- `issues.json` 파일의 issues 목록에 한 덩어리를 추가합니다.

### 이미지형(권장)
- `assets/vol26-02/` 폴더에 `01.jpg`, `02.jpg` ... 업로드
- issues.json에 pages 배열로 파일명 추가

### PDF형
- `assets/vol26-01/cardnews.pdf` 업로드
- issues.json에 type을 pdf로, pdf 경로만 지정

---

## 3) QR 코드 추천 링크
- 목록: `https://아이디.github.io/cardnews/`
- 특정 호 바로가기: `https://아이디.github.io/cardnews/viewer.html?issue=vol26-02`
