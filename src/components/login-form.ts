import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "../firebase/firebase-config";

class LoginForm extends HTMLElement {
  private isSignUp = false;

  connectedCallback() {
    this.render();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.innerHTML = `
          <div class="login-box">
            <h2>Welcome, ${user.email}</h2>
            <button class="logout">Log Out</button>
          </div>
        `;
        this.querySelector(".logout")?.addEventListener("click", () => signOut(auth));
      } else {
        this.render();
      }
    });
  }

  render() {
    const title = this.isSignUp ? "Sign up" : "Login";
    const buttonText = this.isSignUp ? "Sign Up" : "Login";
    const toggleText = this.isSignUp
      ? 'Already have an account? <span class="switch-link">Sign in</span>'
      : 'Don’t have an account? <span class="switch-link">Sign up</span>';

    this.innerHTML = `
      <div class="login-box">
        <h2>${title}</h2>
        <input type="email" class="email" placeholder="Email" />
        <input type="password" class="password" placeholder="Password" />
        <button class="submit">${buttonText}</button>
        <p class="signup-text">${toggleText}</p>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.querySelector(".submit")?.addEventListener("click", async () => {
      const email = (this.querySelector(".email") as HTMLInputElement)?.value;
      const password = (this.querySelector(".password") as HTMLInputElement)?.value;
      if (this.isSignUp) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          alert("Account created!");
        } catch {
          alert("Sign up failed.");
        }
      } else {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch {
          alert("Login failed.");
        }
      }
    });

    this.querySelector(".switch-link")?.addEventListener("click", () => {
      this.isSignUp = !this.isSignUp;
      this.render();
    });
  }
}

customElements.define("login-form", LoginForm);
