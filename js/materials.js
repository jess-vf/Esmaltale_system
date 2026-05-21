/**
 * materials.js
 * Renderização das páginas de materiais e operações de CRUD.
 * Usa data-action / data-key nos elementos gerados — sem onclick inline.
 */

let currentCategory = null;
let editingItemId   = null;

const SINGULAR = {
  alicates:  'alicate',
  canetas:   'caneta',
  motores:   'motor',
  cabines:   'cabine',
  sugadores: 'sugador',
};

const NEW_LABEL = {
  alicates:  'Novo alicate',
  canetas:   'Nova caneta',
  motores:   'Novo motor',
  cabines:   'Nova cabine',
  sugadores: 'Novo sugador',
};

const PROFESSIONAL_COLORS = {
  'Carol Santos':  { primary: '#1E90FF', primaryLabel: 'Azul',   secondary: '#FFFFFF', secondaryLabel: 'Branco'  },
  'Juliana Melo':  { primary: '#2E8B1A', primaryLabel: 'Verde',  secondary: '#FF8C00', secondaryLabel: 'Laranja' },
  'Patrícia Lima': { primary: '#FF69B4', primaryLabel: 'Rosa',   secondary: '#4169E1', secondaryLabel: 'Azul'    },
};

function onPersonChange(selectEl) {
  const colors  = PROFESSIONAL_COLORS[selectEl.value];
  const display = document.getElementById('form-color-display');
  if (!display) return;
  if (colors) {
    display.innerHTML = _colorChipHtml(colors.primary, colors.primaryLabel)
      + '<span style="color:var(--color-text-muted);font-size:12px;padding:0 2px"> / </span>'
      + _colorChipHtml(colors.secondary, colors.secondaryLabel);
  } else {
    display.innerHTML = '<span style="font-size:12px;color:var(--color-text-muted)">— selecione um profissional —</span>';
  }
}

function _colorChipHtml(hex, name) {
  const border = hex.toLowerCase() === '#ffffff'
    ? ';border:0.5px solid var(--color-border-strong)' : '';
  return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:6px;border:0.5px solid var(--color-border);background:var(--color-surface2);font-size:12px">`
    + `<span style="width:14px;height:14px;border-radius:3px;background:${hex}${border};flex-shrink:0"></span>`
    + name
    + `</span>`;
}

/* ==============================================
   NAVEGAÇÃO
   ============================================== */
/**
 * Ativa a página e o botão da sidebar correspondentes.
 * @param {string} pageId
 * @param {HTMLElement} btnEl
 */
function navigateTo(pageId, btnEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('is-active'));
  document.getElementById(`pg-${pageId}`).classList.add('is-active');
  document.querySelectorAll('.sidebar__btn').forEach(b => b.classList.remove('is-active'));
  btnEl.classList.add('is-active');
  currentCategory = pageId;
}

/* ==============================================
   RENDERIZAÇÃO DA PÁGINA DE MATERIAL
   ============================================== */
/**
 * Reconstrói o HTML interno de uma página de categoria de material.
 * @param {HTMLElement} pageEl
 */
function buildMaterialPage(pageEl) {
  const key   = pageEl.dataset.key;
  const items = AppData[key];
  if (!items) return;

  const label  = pageEl.dataset.label;
  const prefix = pageEl.dataset.prefix;
  const icon   = pageEl.dataset.icon;

  const totalInUse  = items.filter(i => i.status === 'Em uso').length;
  const totalRepair = items.filter(i => i.status === 'Manutenção').length;

  pageEl.innerHTML = `
    ${_buildPageHeader(key, label, icon, prefix)}
    ${_buildStatsGrid(items.length, totalInUse, totalRepair, icon)}
    ${_buildToolbar(key, label)}
    ${_buildTable(key, items)}
  `;
}

function _buildPageHeader(key, label, icon, prefix) {
  return `
    <div class="page-header">
      <div class="page-header__left">
        <div class="page-header__icon"><i class="ti ${icon}"></i></div>
        <div>
          <div class="page-header__title">${label}</div>
          <div class="page-header__subtitle">Controle por unidade e funcionária</div>
        </div>
      </div>
      <button class="btn-primary gradient-animated"
              data-action="new-item" data-key="${key}" data-prefix="${prefix}">
        <i class="ti ti-plus"></i> Cadastrar
      </button>
    </div>
  `;
}

function _buildStatsGrid(total, uso, man, icon) {
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--total"><i class="ti ${icon}"></i></div>
        <div>
          <div class="stat-card__number">${total}</div>
          <div class="stat-card__label">Registrados</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--uso"><i class="ti ti-check"></i></div>
        <div>
          <div class="stat-card__number">${uso}</div>
          <div class="stat-card__label">Em uso</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--man"><i class="ti ti-tool"></i></div>
        <div>
          <div class="stat-card__number">${man}</div>
          <div class="stat-card__label">Em manutenção</div>
        </div>
      </div>
    </div>
  `;
}

function _buildToolbar(key, label) {
  return `
    <div class="toolbar">
      <div class="search-field">
        <i class="ti ti-search search-field__icon"></i>
        <input class="search-field__input" type="text" data-key="${key}"
          placeholder="Buscar em ${label.toLowerCase()}..." />
      </div>
      <select class="filter-select" data-key="${key}" data-filter="status">
        <option value="">Todos os status</option>
        <option>Em uso</option>
        <option>Disponível</option>
        <option>Manutenção</option>
      </select>
      <select class="filter-select" data-key="${key}" data-filter="unit">
        <option value="">Todas as unidades</option>
        <option>Bela Vista</option>
        <option>Barra</option>
        <option>Alameda</option>
      </select>
    </div>
  `;
}

function _buildTable(key, items) {
  const rows = items.map(item => _buildTableRow(item, key)).join('');
  return `
    <div class="table-card">
      <div class="table-wrapper">
        <table class="data-table" id="tbl-${key}">
          <colgroup>
            <col style="width:92px"><col style="width:165px"><col style="width:140px">
            <col style="width:98px"><col style="width:88px"><col style="width:96px">
          </colgroup>
          <thead>
            <tr>
              <th>Código</th><th>Shopping</th><th>Funcionária</th>
              <th>Aquisição</th><th>Status</th><th>Ações</th>
            </tr>
          </thead>
          <tbody id="tbody-${key}">${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function _buildTableRow(item, key) {
  return `
    <tr>
      <td><span class="code-tag">${item.id}</span></td>
      <td>${item.shop}</td>
      <td>${item.func}</td>
      <td style="color:var(--color-text-muted)">${item.data}</td>
      <td>${statusPillHtml(item.status)}</td>
      <td>
        <div class="action-group">
          <button class="action-btn action-btn--view"
                  data-action="view-item" data-id="${item.id}" data-key="${key}" title="Detalhes">
            <i class="ti ti-eye"></i>
          </button>
          <button class="action-btn action-btn--edit"
                  data-action="edit-item" data-id="${item.id}" data-key="${key}" title="Editar">
            <i class="ti ti-edit"></i>
          </button>
          <button class="action-btn action-btn--delete"
                  data-action="delete-item" data-id="${item.id}" data-key="${key}" title="Excluir">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

/* ==============================================
   FILTRO — TABELA DE MATERIAIS
   ============================================== */
/**
 * Filtra as linhas da tabela de uma categoria pelo texto de busca e selects.
 * @param {string} key - chave da categoria (ex: 'alicates')
 */
function filterTable(key) {
  const page = document.getElementById(`pg-${key}`);
  if (!page) return;

  const search       = page.querySelector('.search-field__input')?.value ?? '';
  const statusFilter = page.querySelector('.filter-select[data-filter="status"]')?.value ?? '';
  const unitFilter   = page.querySelector('.filter-select[data-filter="unit"]')?.value ?? '';

  document.querySelectorAll(`#tbody-${key} tr`).forEach(row => {
    const cells  = row.querySelectorAll('td');
    const code   = cells[0]?.textContent ?? '';
    const shop   = cells[1]?.textContent ?? '';
    const func   = cells[2]?.textContent ?? '';
    const status = cells[4]?.textContent.trim() ?? '';

    const matchSearch = !search
      || code.toLowerCase().includes(search.toLowerCase())
      || shop.toLowerCase().includes(search.toLowerCase())
      || func.toLowerCase().includes(search.toLowerCase());

    const matchStatus = !statusFilter || status.includes(statusFilter);
    const matchUnit   = !unitFilter   || shop.includes(unitFilter);

    row.style.display = (matchSearch && matchStatus && matchUnit) ? '' : 'none';
  });
}

/* ==============================================
   FILTRO — MOVIMENTAÇÕES
   ============================================== */
function filterMovements() {
  const page = document.getElementById('pg-movimentacoes');
  if (!page) return;

  const search     = page.querySelector('.search-field__input')?.value.toLowerCase() ?? '';
  const typeFilter = page.querySelector('.filter-select[data-filter="type"]')?.value ?? '';

  page.querySelectorAll('.mov-item').forEach(item => {
    const title = item.querySelector('.mov-item__title')?.textContent.toLowerCase() ?? '';
    const meta  = item.querySelector('.mov-item__meta')?.textContent.toLowerCase()  ?? '';
    const type  = item.dataset.type ?? '';

    const matchSearch = !search || title.includes(search) || meta.includes(search);
    const matchType   = !typeFilter || type === typeFilter;

    item.style.display = (matchSearch && matchType) ? '' : 'none';
  });
}

/* ==============================================
   MODAL — CRIAÇÃO / EDIÇÃO
   ============================================== */
/**
 * Abre o modal de formulário para cadastro de novo item.
 * @param {string} prefix - prefixo do código (ex: 'ALC')
 * @param {string} key    - categoria (ex: 'alicates')
 */
function openNewModal(prefix, key) {
  currentCategory = key;
  editingItemId   = null;
  document.getElementById('modal-form-title').textContent = NEW_LABEL[key] || 'Novo item';
  _clearForm(prefix, AppData[key].length + 1);
  Modal.open('modal-form');
}

/**
 * Abre o modal de formulário preenchido para edição de um item existente.
 * @param {string} id  - código do item
 * @param {string} key - categoria
 */
function openEditModal(id, key) {
  currentCategory = key;
  editingItemId   = id;
  const item = AppData[key].find(x => x.id === id);
  if (!item) return;
  document.getElementById('modal-form-title').textContent = `Editar ${SINGULAR[key] || 'item'} — ${id}`;
  _fillForm(item);
  Modal.open('modal-form');
}

function _clearForm(prefix, nextIndex) {
  document.getElementById('form-code').value            = '';
  document.getElementById('form-code').placeholder      = `${prefix}-00${nextIndex}`;
  document.getElementById('form-brand').value           = '';
  document.getElementById('form-date').value            = '';
  document.getElementById('form-shop').selectedIndex    = 0;
  document.getElementById('form-person').selectedIndex  = 0;
  document.getElementById('form-status').selectedIndex  = 0;
  document.getElementById('form-notes').value           = '';
  const disp = document.getElementById('form-color-display');
  if (disp) disp.innerHTML = '<span style="font-size:12px;color:var(--color-text-muted)">— selecione um profissional —</span>';
}

function _fillForm(item) {
  document.getElementById('form-code').value  = item.id;
  document.getElementById('form-brand').value = item.marca;
  document.getElementById('form-date').value  = '';
  _selectByText('form-shop',   item.shop);
  _selectByText('form-person', item.func);
  _selectByText('form-status', item.status);
  document.getElementById('form-notes').value = item.obs === '—' ? '' : item.obs;
  onPersonChange(document.getElementById('form-person'));
}

function _selectByText(selectId, text) {
  const sel = document.getElementById(selectId);
  for (let i = 0; i < sel.options.length; i++) {
    if (sel.options[i].text === text || sel.options[i].value === text) {
      sel.selectedIndex = i;
      break;
    }
  }
}

/* ==============================================
   SALVAR (criar ou editar)
   ============================================== */
function saveForm() {
  const code   = document.getElementById('form-code').value.trim();
  const brand  = document.getElementById('form-brand').value.trim();
  const date   = document.getElementById('form-date').value;
  const shop   = _getSelectText('form-shop');
  const person = _getSelectText('form-person');
  const status = _getSelectText('form-status');
  const notes  = document.getElementById('form-notes').value.trim() || '—';

  if (!code) {
    shakeField('form-code');
    return;
  }

  const isEditing = editingItemId !== null;
  const func = person === '— Nenhuma —' ? '—' : person;

  if (isEditing) {
    _updateItem(code, brand, date, shop, func, status, notes);
  } else {
    _createItem(code, brand, date, shop, func, status, notes);
  }

  buildMaterialPage(document.getElementById(`pg-${currentCategory}`));
  Modal.close('modal-form');
  editingItemId = null;
  _showSaveAlert(isEditing, code);
}

function _createItem(id, marca, data, shop, func, status, obs) {
  AppData[currentCategory].push({ id, marca, data, shop, func, status, obs });
}

function _updateItem(id, marca, data, shop, func, status, obs) {
  const idx = AppData[currentCategory].findIndex(x => x.id === editingItemId);
  if (idx === -1) return;
  const existing = AppData[currentCategory][idx];
  AppData[currentCategory][idx] = {
    ...existing,
    id, marca, shop, func, status, obs,
    data: data || existing.data,
  };
}

function _getSelectText(selectId) {
  const sel = document.getElementById(selectId);
  return sel.options[sel.selectedIndex].text;
}

function _showSaveAlert(isEditing, code) {
  const tipo  = SINGULAR[currentCategory] || 'item';
  const title = isEditing ? 'Atualizado!' : 'Cadastrado!';
  const msg   = isEditing
    ? `O ${tipo} <strong>${code}</strong> foi atualizado com sucesso.`
    : `O ${tipo} <strong>${code}</strong> foi cadastrado com sucesso.`;

  EsmalSwal.fire({
    icon: 'success',
    title,
    html: `<span style="color:#8a4060;font-size:14px">${msg}</span>`,
    confirmButtonText: 'OK',
    timer: 3500,
    timerProgressBar: true,
  });
}

/* ==============================================
   MODAL — DETALHES
   ============================================== */
/**
 * Abre o modal de detalhes de um item.
 * @param {string} id  - código do item
 * @param {string} key - categoria
 */
function openDetailModal(id, key) {
  const item = AppData[key].find(x => x.id === id);
  if (!item) return;
  document.getElementById('modal-detail-title').textContent = `Detalhes — ${id}`;
  document.getElementById('modal-detail-body').innerHTML = _buildDetailHtml(item, key);
  Modal.open('modal-detail');
}

function _buildDetailHtml(item, key) {
  const pColors = PROFESSIONAL_COLORS[item.func];
  const colorValue = pColors
    ? _colorChipHtml(pColors.primary, pColors.primaryLabel)
      + '<span style="color:var(--color-text-muted);font-size:12px;padding:0 2px"> / </span>'
      + _colorChipHtml(pColors.secondary, pColors.secondaryLabel)
    : '—';

  const custo = item.custo
    ? `R$ ${Number(item.custo).toFixed(2).replace('.', ',')}`
    : '—';

  return `
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-barcode"></i> Código</span>
      <span class="detail-row__value"><span class="code-tag">${item.id}</span></span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-calendar"></i> Data de aquisição</span>
      <span class="detail-row__value">${item.data || '—'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-tag"></i> Marca</span>
      <span class="detail-row__value">${item.marca || '—'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-adjustments-horizontal"></i> Tipo</span>
      <span class="detail-row__value">${item.tipo || '—'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-building-store"></i> Unidade</span>
      <span class="detail-row__value">${item.shop || '—'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-grid-dots"></i> Categoria</span>
      <span class="detail-row__value">${item.categoria || '—'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-star"></i> Clube do Alicate</span>
      <span class="detail-row__value">${item.clube || '—'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-truck-delivery"></i> Fornecedor</span>
      <span class="detail-row__value">${item.fornecedor || '—'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-coin"></i> Custo</span>
      <span class="detail-row__value">${custo}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-user"></i> Designado a profissional</span>
      <span class="detail-row__value">${item.func || '—'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-palette"></i> Cor do profissional</span>
      <span class="detail-row__value" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">${colorValue}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-notes"></i> Observações</span>
      <span class="detail-row__value" style="color:var(--color-text-muted)">${item.obs || '—'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-circle-check"></i> Status</span>
      <span class="detail-row__value">${statusPillHtml(item.status)}</span>
    </div>
    <div class="modal__footer">
      <button class="btn-cancel" data-close="modal-detail">Fechar</button>
      <button class="btn-save"
              data-action="edit-from-detail" data-id="${item.id}" data-key="${key}">
        <i class="ti ti-edit"></i> Editar
      </button>
    </div>
  `;
}

/* ==============================================
   MODAL — EXCLUSÃO
   ============================================== */
let deleteTarget = null;

/**
 * Abre o modal de confirmação de exclusão.
 * @param {string} id  - código do item
 * @param {string} key - categoria
 */
function openDeleteModal(id, key) {
  deleteTarget = { id, key };
  document.getElementById('delete-item-name').textContent = id;
  Modal.open('modal-delete');
}

function confirmDelete() {
  if (!deleteTarget) return;
  const { id, key } = deleteTarget;
  AppData[key] = AppData[key].filter(x => x.id !== id);
  buildMaterialPage(document.getElementById(`pg-${key}`));
  Modal.close('modal-delete');
  deleteTarget = null;
}
