import './styles/style.css';
import './components/login-form';
import './components/upload-form';
import './components/meme-gallery';
import { auth } from './firebase/firebase-config';
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app') || document.body;
  app.innerHTML = `
    <header>
      <login-form></login-form>
    </header>
    <main>
      <upload-form></upload-form>
      <meme-gallery></meme-gallery>
    </main>
  `;

  document.querySelector('upload-form')?.addEventListener('upload-complete', () => {
    const gallery = document.querySelector('meme-gallery') as any;
    gallery?.loadMemes('date');
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const gallery = document.querySelector('meme-gallery') as any;
      gallery?.loadMemes('date');
    }
  });
});
