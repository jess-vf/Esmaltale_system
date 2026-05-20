/**
 * app.js
 * Ponto de entrada — inicializa todos os módulos e registra event listeners.
 * Nenhum onclick inline no HTML: toda interação é gerenciada aqui via
 * delegação de eventos ou listeners diretos.
 */

document.addEventListener('DOMContentLoaded', () => {
  Tooltip.init();
  Login.init();

  document.querySelectorAll('.page[data-key]').forEach(buildMaterialPage);
  currentCategory = 'alicates';

  _bindSidebar();
  _bindTopbar();
  _bindModals();
  _bindFilters();
  _bindActions();
});

/* ==============================================
   SIDEBAR
   ============================================== */
function _bindSidebar() {
  document.querySelectorAll('.sidebar__btn[data-page]').forEach(btn => {
    btn.addEventListener('click',      () => navigateTo(btn.dataset.page, btn));
    btn.addEventListener('mouseenter', () => Tooltip.show(btn));
    btn.addEventListener('mouseleave', () => Tooltip.hide());
  });
}

/* ==============================================
   TOPBAR E TELA DE LOGIN
   (Enter no campo de senha é tratado em login.js)
   ============================================== */
function _bindTopbar() {
  document.getElementById('btn-theme').addEventListener('click',        () => Theme.toggle());
  document.getElementById('btn-logout').addEventListener('click',       () => Login.logout());
  document.getElementById('btn-login-submit').addEventListener('click', () => Login.submit());
}

/* ==============================================
   MODAIS
   ============================================== */
function _bindModals() {
  /* Fecha ao clicar no fundo do overlay */
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) Modal.close(overlay.id);
    });
  });

  document.getElementById('btn-save-form').addEventListener('click',     saveForm);
  document.getElementById('btn-confirm-delete').addEventListener('click', confirmDelete);
  document.getElementById('btn-save-form').addEventListener('click',     saveForm);
  document.getElementById('btn-confirm-delete').addEventListener('click', confirmDelete);
  document.getElementById('form-person').addEventListener('change', e => onPersonChange(e.target));
}

/* ==============================================
   FILTROS DE BUSCA
   ============================================== */
function _bindFilters() {
  const main = document.querySelector('.main');

  main.addEventListener('input', e => {
    const key = e.target.dataset.key;
    if (key) {
      filterTable(key);
    } else if (e.target.dataset.action === 'filter-mov') {
      filterMovements();
    }
  });

  main.addEventListener('change', e => {
    const key = e.target.dataset.key;
    if (key) {
      filterTable(key);
    } else if (e.target.dataset.action === 'filter-mov') {
      filterMovements();
    }
  });
}

/* ==============================================
   AÇÕES (delegação global via data-action / data-close)
   ============================================== */
function _bindActions() {
  document.addEventListener('click', e => {
    /* Fecha modais via data-close */
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) Modal.close(closeBtn.dataset.close);

    /* Executa ações via data-action */
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;

    const { action, id, key, prefix } = actionBtn.dataset;

    switch (action) {
      case 'new-item':
        openNewModal(prefix, key);
        break;
      case 'view-item':
        openDetailModal(id, key);
        break;
      case 'edit-item':
        openEditModal(id, key);
        break;
      case 'delete-item':
        openDeleteModal(id, key);
        break;
      case 'edit-from-detail':
        Modal.close('modal-detail');
        openEditModal(id, key);
        break;
      case 'export':
        Exporter.exportAll().catch(() =>
          EsmalSwal.fire({ icon: 'error', title: 'Erro ao exportar', text: 'Não foi possível gerar a planilha.' })
        );
        break;
    }
  });
}
