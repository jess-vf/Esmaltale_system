/**
 * login.js
 * Gerencia a tela de login, logout e a animação de transição.
 */

const Login = {
  MIN_PASS_LENGTH: 3,

  init() {
    if (Session.isLogged()) {
      this._hideLoginScreen();
    }

    document
      .getElementById('login-pass')
      .addEventListener('keydown', e => {
        if (e.key === 'Enter') this.submit();
      });
  },

  submit() {
    const user  = document.getElementById('login-user').value.trim();
    const pass  = document.getElementById('login-pass').value;

    if (!user || !pass) {
      this._showError('Preencha usuário e senha.');
      shakeField('login-pass');
      return;
    }

    if (pass.length < this.MIN_PASS_LENGTH) {
      this._showError('Usuário ou senha incorretos. Tente novamente.');
      shakeField('login-pass');
      return;
    }

    document.getElementById('login-error').classList.remove('is-visible');
    Session.save();
    this._playEnterAnimation();
  },

  logout() {
    Session.clear();
    this._resetForm();
    this._showLoginWithFade();
  },

  /* ---- privados ---- */

  _hideLoginScreen() {
    document.getElementById('login-screen').classList.remove('is-visible');
  },

  _showError(message) {
    const el = document.getElementById('login-error');
    el.textContent = message;
    el.classList.add('is-visible');
  },

  _resetForm() {
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-error').classList.remove('is-visible');
  },

  _showLoginWithFade() {
    const screen = document.getElementById('login-screen');
    screen.style.opacity    = '0';
    screen.style.transition = 'opacity .4s ease';
    screen.classList.add('is-visible');
    setTimeout(() => { screen.style.opacity = '1'; },  10);
    setTimeout(() => { screen.style.transition = ''; }, 420);
  },

  _playEnterAnimation() {
    const transition  = document.getElementById('login-transition');
    const curtain     = document.getElementById('login-curtain');
    const logo        = document.getElementById('login-curtain-logo');
    const loginScreen = document.getElementById('login-screen');

    transition.classList.add('is-active');
    curtain.className = 'login-curtain gradient-animated sweep';

    setTimeout(() => {
      loginScreen.classList.remove('is-visible');
      logo.className = 'login-curtain__logo pop';
    }, 500);

    setTimeout(() => {
      logo.className = 'login-curtain__logo hide';
    }, 1200);

    setTimeout(() => {
      curtain.className = 'login-curtain gradient-animated drop';
    }, 1350);

    setTimeout(() => {
      transition.classList.remove('is-active');
      curtain.className = 'login-curtain gradient-animated';
      logo.className    = 'login-curtain__logo';
    }, 1800);
  },
};
