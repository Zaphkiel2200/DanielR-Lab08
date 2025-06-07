import { auth, storage } from '../firebase/firebase-config';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

class UploadForm extends HTMLElement {
  private files: File[] = [];

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  private render() {
    this.innerHTML = `
      <section class="upload-container">
        <h2>Upload your memes</h2>
        <div class="drop-zone">
          <input type="file" accept="image/*,video/*" multiple />
          <p>Drag & drop files here or click to browse</p>
        </div>
        <div class="preview-zone"></div>
        <button class="upload-btn" disabled>Upload</button>
        <div class="upload-status"></div>
      </section>
    `;
  }

  private setupEventListeners() {
    const input = this.querySelector("input[type=file]") as HTMLInputElement;
    const uploadBtn = this.querySelector(".upload-btn") as HTMLButtonElement;

    input.addEventListener("change", () => {
      this.files = input.files ? Array.from(input.files) : [];
      this.updatePreview();
      uploadBtn.disabled = this.files.length === 0;
    });

    uploadBtn.addEventListener("click", () => this.handleUpload());
  }

  private updatePreview() {
    const preview = this.querySelector(".preview-zone")!;
    preview.innerHTML = this.files.map(file => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith("video");
      return `
        <div class="thumb">
          ${isVideo
            ? `<video src="${url}" autoplay muted loop playsinline></video>`
            : `<img src="${url}" />`}
          <span>${file.name}</span>
        </div>
      `;
    }).join("");
  }

  private async handleUpload() {
    if (!auth.currentUser) {
      alert("Please log in to upload files");
      return;
    }

    const statusElement = this.querySelector(".upload-status")!;
    statusElement.innerHTML = "";

    for (const file of this.files) {
      try {
        const filePath = `memes/${auth.currentUser.uid}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, file);
        
        statusElement.innerHTML += `
          <div class="status-item success">
            ${file.name}: ✅ Uploaded
          </div>
        `;
      } catch (error) {
        console.error("Upload error:", error);
        statusElement.innerHTML += `
          <div class="status-item error">
            ${file.name}: ❌ Upload failed
          </div>
        `;
      }
    }

    this.dispatchEvent(new CustomEvent("upload-complete"));
    this.files = [];
    this.updatePreview();
    (this.querySelector(".upload-btn") as HTMLButtonElement).disabled = true;
  }
}

customElements.define("upload-form", UploadForm);
