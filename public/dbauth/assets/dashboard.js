document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const guidesList = document.getElementById("guidesList");
  const sourcesList = document.getElementById("sourcesList");
  const guidesSearch = document.getElementById("guidesSearch");
  const sourcesSearch = document.getElementById("sourcesSearch");
  let guidesData = [];
  let sourcesData = [];

  // === Убираем загрузчик после старта ===
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = "0";
      loader.style.transition = "opacity 0.8s ease";
      setTimeout(() => loader.remove(), 900);
    }, 1800);
  }

  // === Получаем посты ===
  function renderLists() {
    const guideQuery = (guidesSearch?.value || "").trim().toLowerCase();
    const sourceQuery = (sourcesSearch?.value || "").trim().toLowerCase();
    const guideFiltered = guidesData.filter(p =>
      (p.title || "").toLowerCase().includes(guideQuery)
    );
    const sourceFiltered = sourcesData.filter(p =>
      (p.title || "").toLowerCase().includes(sourceQuery)
    );
    guidesList.innerHTML = guideFiltered.map(renderCard).join("");
    sourcesList.innerHTML = sourceFiltered.map(renderCard).join("");
    bindEditButtons();
  }

  async function refreshPosts() {
    if (!guidesList || !sourcesList) return;
    try {
      const res = await fetch("/dbauth/pages/api/get_posts.php");
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "API error");

      guidesData = Array.isArray(data.guides) ? data.guides : [];
      sourcesData = Array.isArray(data.sources) ? data.sources : [];
      renderLists();
    } catch (err) {
      console.error("Fetch posts failed:", err);
      guidesList.innerHTML = `<p class="error">? ${err.message}</p>`;
      sourcesList.innerHTML = "";
    }
  }

  function renderCard(p) {
    const tags = (p.tags || "")
      .split(",")
      .map(t => `<span class="tag">#${t.trim()}</span>`)
      .join(" ");
    return `
      <div class="post-card">
        <h4>${p.title || "Без названия"}</h4>
        <div class="tags">${tags}</div>
        <p class="date">${new Date(p.created_at).toLocaleString("ru-RU")}</p>
        <div class="actions">
          <button class="edit-post" data-id="${p.id}">✏️ Редактировать</button>
          <button class="delete-post" data-id="${p.id}">🗑 Удалить</button>
        </div>
      </div>`;
  }

  // === Удаление поста ===
  function bindEditButtons() {
    document.querySelectorAll(".delete-post").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("Удалить пост?")) return;
        const id = btn.dataset.id;
        const res = await fetch(`/dbauth/pages/api/posts.php?action=delete&id=${id}`);
        const data = await res.json();
        if (data.ok) refreshPosts();
        else alert("Ошибка удаления");
      };
    });
  }

  // === Добавление нового ===
  document.getElementById("btnAddGuide")?.addEventListener("click", () => {
    ensureEditors();
    openPopup(document.getElementById("popup-guide"));
  });
  document.getElementById("btnAddSource")?.addEventListener("click", () => {
    ensureEditors();
    openPopup(document.getElementById("popup-source"));
  });

  guidesSearch?.addEventListener("input", () => renderLists());
  sourcesSearch?.addEventListener("input", () => renderLists());

  refreshPosts();
});
