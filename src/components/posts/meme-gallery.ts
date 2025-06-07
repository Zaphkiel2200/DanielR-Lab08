import { auth, storage } from "../../firebase/firebase-config";
import { ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

class MemeGallery extends HTMLElement {
  private memes: { url: string; timestamp: number }[] = [];

  connectedCallback() {
    this.render();
    this.setupAuthListener();
  }

  private render() {
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
    this.setupEventListeners();
  }

  private setupAuthListener() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.loadMemes("date");
      }
    });
  }

  private setupEventListeners() {
    this.querySelector("select")?.addEventListener("change", (e) => {
      const mode = (e.target as HTMLSelectElement).value as "date" | "random";
      this.displayMemes(mode);
    });
  }

  private async loadMemes(mode: "date" | "random") {
    try {
      this.memes = [];
      const storageRef = ref(storage, 'memes');
      const files = await listAll(storageRef);
      
      await Promise.all(files.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);
        this.memes.push({
          url,
          timestamp: metadata.timeCreated ? new Date(metadata.timeCreated).getTime() : Date.now()
        });
      }));
      
      this.displayMemes(mode);
    } catch (error) {
      console.error("Error loading memes:", error);
    }
  }

  private displayMemes(mode: "date" | "random") {
    const container = this.querySelector(".gallery-grid")!;
    container.innerHTML = "";

    const sortedMemes = this.sortMemes(mode);
    
    sortedMemes.forEach(meme => {
      const isVideo = meme.url.split(".").pop()?.toLowerCase() === "mp4";
      container.appendChild(this.createMemeCard(meme.url, isVideo));
    });
  }

  private sortMemes(mode: "date" | "random") {
    return mode === "random"
      ? [...this.memes].sort(() => Math.random() - 0.5)
      : [...this.memes].sort((a, b) => b.timestamp - a.timestamp);
  }

  private createMemeCard(url: string, isVideo: boolean) {
    const card = document.createElement("div");
    card.className = "meme-card";
    card.innerHTML = isVideo
      ? `<video src="${url}" autoplay muted loop playsinline></video>`
      : `<img src="${url}" loading="lazy" />`;
    return card;
  }
}

customElements.define("meme-gallery", MemeGallery);