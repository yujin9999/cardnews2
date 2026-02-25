(function () {
  const DATA_URL = "./issues.json";

  function qs(name) {
    const p = new URLSearchParams(location.search);
    return p.get(name);
  }

  async function loadData() {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("issues.json을 불러오지 못했습니다.");
    return await res.json();
  }

  function formatDate(iso) {
    if (!iso) return "";
    return iso;
  }

  async function initList() {
    const listEl = document.getElementById("issueList");
    if (!listEl) return;

    try {
      const data = await loadData();
      const issues = (data.issues || []).slice();

      // 최신순 정렬(날짜 문자열 기준)
      issues.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

      if (issues.length === 0) {
        listEl.innerHTML = `<li class="empty">등록된 카드뉴스가 아직 없습니다.</li>`;
        return;
      }

      listEl.innerHTML = issues.map(issue => {
        const meta = [issue.id, formatDate(issue.date), issue.type === "pdf" ? "PDF" : "이미지"].filter(Boolean).join(" · ");
        return `
          <li class="issue">
            <a class="issue-link" href="./viewer.html?issue=${encodeURIComponent(issue.id)}">
              <div class="issue-title">${escapeHtml(issue.title || issue.id)}</div>
              <div class="issue-meta">${escapeHtml(meta)}</div>
            </a>
          </li>
        `;
      }).join("");
    } catch (e) {
      listEl.innerHTML = `<li class="empty">목록을 불러오는 중 오류가 발생했습니다. (issues.json 확인)</li>`;
      console.error(e);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function initViewer() {
    const issueId = qs("issue");
    const titleEl = document.getElementById("issueTitle");
    const metaEl = document.getElementById("issueMeta");

    const imgEl = document.getElementById("imageViewer");
    const pdfBox = document.getElementById("pdfViewer");
    const pdfFrame = document.getElementById("pdfFrame");
    const pdfLink = document.getElementById("pdfLink");

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const indicatorEl = document.getElementById("pageIndicator");

    function setIndicator(cur, total) {
      indicatorEl.textContent = `${cur} / ${total}`;
    }

    if (!issueId) {
      if (titleEl) titleEl.textContent = "호 정보가 없습니다";
      if (metaEl) metaEl.textContent = "목록에서 다시 선택해주세요.";
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    try {
      const data = await loadData();
      const issues = data.issues || [];
      const issue = issues.find(x => x.id === issueId);

      if (!issue) {
        if (titleEl) titleEl.textContent = "해당 호를 찾을 수 없습니다";
        if (metaEl) metaEl.textContent = "issues.json에 등록되어 있는지 확인해주세요.";
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
      }

      const meta = [issue.id, formatDate(issue.date), issue.type === "pdf" ? "PDF" : "이미지"].filter(Boolean).join(" · ");
      if (titleEl) titleEl.textContent = issue.title || issue.id;
      if (metaEl) metaEl.textContent = meta;

      // PDF형
      if (issue.type === "pdf") {
        imgEl.hidden = true;
        pdfBox.hidden = false;

        const pdfUrl = issue.pdf;
        pdfFrame.src = pdfUrl;
        pdfLink.href = pdfUrl;

        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        setIndicator("-", "-");
        return;
      }

      // 이미지형
      const pages = Array.isArray(issue.pages) ? issue.pages : [];
      const basePath = issue.basePath || "";
      if (!pages.length) {
        if (titleEl) titleEl.textContent = "페이지가 비어있습니다";
        if (metaEl) metaEl.textContent = "issues.json의 pages를 확인해주세요.";
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
      }

      pdfBox.hidden = true;
      imgEl.hidden = false;

      let idx = 0;

      function render() {
        const total = pages.length;
        const cur = idx + 1;

        imgEl.src = basePath + pages[idx];
        imgEl.alt = `${issue.title || issue.id} ${cur}페이지`;
        setIndicator(cur, total);

        prevBtn.disabled = idx === 0;
        nextBtn.disabled = idx === total - 1;
      }

      prevBtn.addEventListener("click", () => {
        if (idx > 0) { idx--; render(); }
      });
      nextBtn.addEventListener("click", () => {
        if (idx < pages.length - 1) { idx++; render(); }
      });

      // 키보드 ← →
      window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" && idx > 0) { idx--; render(); }
        if (e.key === "ArrowRight" && idx < pages.length - 1) { idx++; render(); }
      });

      // 모바일 스와이프
      let startX = null;
      imgEl.addEventListener("touchstart", (e) => {
        startX = e.touches?.[0]?.clientX ?? null;
      }, { passive: true });
      imgEl.addEventListener("touchend", (e) => {
        if (startX == null) return;
        const endX = e.changedTouches?.[0]?.clientX ?? startX;
        const diff = endX - startX;
        if (Math.abs(diff) > 40) {
          if (diff > 0 && idx > 0) idx--;
          if (diff < 0 && idx < pages.length - 1) idx++;
          render();
        }
        startX = null;
      }, { passive: true });

      render();

    } catch (e) {
      console.error(e);
      if (titleEl) titleEl.textContent = "불러오기 오류";
      if (metaEl) metaEl.textContent = "issues.json 또는 파일 경로를 확인해주세요.";
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
    }
  }

  window.CardNews = { initList, initViewer };
})();