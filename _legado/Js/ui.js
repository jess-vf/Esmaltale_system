/**
 * ui.js
 * Utilitários de interface: tema, sessão, tooltip e helpers.
 */

/* ==============================================
   TEMA (claro / escuro)
   ============================================== */
const Theme = {
  isDark: false,

  toggle() {
    this.isDark = !this.isDark;
    document.getElementById('app').classList.toggle('dark-mode', this.isDark);
    document.getElementById('theme-icon').className = this.isDark ? 'ti ti-sun' : 'ti ti-moon';
  },
};

/* ==============================================
   SESSÃO
   ============================================== */
const Session = {
  KEY: 'esmal_logged',

  save()   { try { sessionStorage.setItem(this.KEY, '1'); }    catch (e) {} },
  clear()  { try { sessionStorage.removeItem(this.KEY); }       catch (e) {} },
  isLogged(){ try { return sessionStorage.getItem(this.KEY) === '1'; } catch (e) { return false; } },
};

/* ==============================================
   TOOLTIP DA SIDEBAR
   ============================================== */
const Tooltip = {
  el: null,

  init() {
    this.el = document.getElementById('sidebar-tooltip');
  },

  show(btn) {
    if (!this.el) return;
    const rect = btn.getBoundingClientRect();
    this.el.textContent      = btn.title;
    this.el.style.top        = `${rect.top + rect.height / 2}px`;
    this.el.style.left       = `${rect.right + 10}px`;
    this.el.style.opacity    = '1';
  },

  hide() {
    if (this.el) this.el.style.opacity = '0';
  },
};

/* ==============================================
   ANIMAÇÃO DE CAMPO (erro / shake)
   ============================================== */
function shakeField(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const offsets = [6, -6, 5, -5, 3, -3, 0];
  let i = 0;

  el.style.transition = 'transform .08s ease';

  const interval = setInterval(() => {
    el.style.transform = `translateX(${offsets[i]}px)`;
    i++;
    if (i >= offsets.length) {
      clearInterval(interval);
      el.style.transform = '';
    }
  }, 55);
}

/* ==============================================
   HELPERS DE HTML
   ============================================== */

/**
 * Retorna o HTML da pill de status.
 * @param {string} status - 'Em uso' | 'Manutenção' | 'Disponível'
 */
function statusPillHtml(status) {
  const classMap = {
    'Em uso':      'status-pill--uso',
    'Manutenção':  'status-pill--man',
    'Disponível':  'status-pill--disp',
  };
  const cls = classMap[status] || 'status-pill--disp';
  return `<span class="status-pill ${cls}">${status}</span>`;
}
