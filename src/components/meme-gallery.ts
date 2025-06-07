import { supabase } from "../services/supabase";

class MemeGallery extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="gallery-controls">
        <label>Sort by:</label>
        <select>
          <option value="date">Date</option>
          <option value="random">Random</option>
        </select>
      </div>
      <div class="gallery-grid"></div>
    `;
    this.loadCombined("date");

    this.querySelector("select")?.addEventListener("change", (e) => {
      const mode = (e.target as HTMLSelectElement).value as "date" | "random";
      this.loadCombined(mode);
    });
  }

  async loadCombined(mode: "date" | "random" = "date") {
    const container = this.querySelector(".gallery-grid")!;
    container.innerHTML = "";

    const sources: { url: string; timestamp: string }[] = [];

    // ✅ 1. Obtener memes del JSON (memes_from_api.json)
    try {
      const res = await fetch("https://mxfwmdfwngyluhxsrtqq.supabase.co/storage/v1/object/public/memes/public/memes/memes_from_api.json");
      const jsonMemes: { url: string; timestamp: string }[] = await res.json();
      if (Array.isArray(jsonMemes)) {
        sources.push(...jsonMemes);
      }
    } catch (err) {
      console.warn("No se pudo cargar el memes_from_api.json", err);
    }

    // ✅ 2. Explorar recursivamente public/ y sus subcarpetas
    try {
      await this.exploreFolder("public", sources);
    } catch (err) {
      console.error("Error explorando archivos del bucket:", err);
    }

    // ✅ 3. Ordenar
    const finalList = mode === "random"
      ? sources.sort(() => Math.random() - 0.5)
      : sources.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // ✅ 4. Mostrar
    for (const meme of finalList) {
      const ext = meme.url.split(".").pop()?.toLowerCase();
      const card = document.createElement("div");
      card.className = "meme-card";
      card.innerHTML = (ext === "mp4" || ext === "webm")
        ? `<video src="${meme.url}" autoplay muted loop width="250"></video>`
        : `<img src="${meme.url}" width="250" />`;
      container.appendChild(card);
    }

    console.log("Total memes mostrados:", finalList.length);
  }

  // 🔁 Función recursiva para explorar carpetas
  async exploreFolder(path: string, sources: { url: string; timestamp: string }[]) {
    const list = await supabase.storage.from("memes").list(path, { limit: 100 });

    for (const item of list.data ?? []) {
      if (item.name.startsWith(".")) continue;

      if (item.metadata) {
        // Es archivo
        const fullPath = `${path}/${item.name}`;
        const { data: urlData } = supabase.storage.from("memes").getPublicUrl(fullPath);
        if (urlData?.publicUrl?.startsWith("http")) {
          sources.push({
            url: urlData.publicUrl,
            timestamp: item.updated_at ?? new Date().toISOString()
          });
        }
      } else {
        // Es carpeta
        await this.exploreFolder(`${path}/${item.name}`, sources);
      }
    }
  }
}

customElements.define("meme-gallery", MemeGallery);
