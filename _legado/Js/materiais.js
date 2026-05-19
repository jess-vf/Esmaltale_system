/**
 * materials.js
 * Renderização das páginas de materiais e operações de CRUD.
 */

/* Estado da edição atual */
let currentCategory = null;
let editingItemId   = null;

/* Mapeamento de nomes singulares por categoria */
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

/* ==============================================
   NAVEGAÇÃO
   ============================================== */
function navigateTo(pageId, btnEl) {
  /* Oculta todas as páginas */
  document.querySelectorAll('.page').forEach(p => p.classList.remove('is-active'));
  /* Ativa a página correta */
  document.getElementById(`pg-${pageId}`).classList.add('is-active');

  /* Atualiza estado ativo da sidebar */
  document.querySelectorAll('.sidebar__btn').forEach(b => b.classList.remove('is-active'));
  btnEl.classList.add('is-active');

  currentCategory = pageId;
}

/* ==============================================
   RENDERIZAÇÃO DA PÁGINA DE MATERIAL
   ============================================== */
function buildMaterialPage(pageEl) {
  const key    = pageEl.dataset.key;
  const items  = AppData[key];
  if (!items) return;

  const label  = pageEl.dataset.label;
  const prefix = pageEl.dataset.prefix;
  const icon   = pageEl.dataset.icon;

  const totalInUse = items.filter(i => i.status === 'Em uso').length;
  const totalRepair= items.filter(i => i.status === 'Manutenção').length;

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
      <button class="btn-primary gradient-animated" onclick="openNewModal('${prefix}','${key}')">
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
        <div><div class="stat-card__number">${total}</div><div class="stat-card__label">Registrados</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--uso"><i class="ti ti-check"></i></div>
        <div><div class="stat-card__number">${uso}</div><div class="stat-card__label">Em uso</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--man"><i class="ti ti-tool"></i></div>
        <div><div class="stat-card__number">${man}</div><div class="stat-card__label">Em manutenção</div></div>
      </div>
    </div>
  `;
}

function _buildToolbar(key, label) {
  return `
    <div class="toolbar">
      <div class="search-field">
        <i class="ti ti-search search-field__icon"></i>
        <input class="search-field__input" placeholder="Buscar em ${label.toLowerCase()}..."
          oninput="filterTable('${key}', this.value)"/>
      </div>
      <select class="filter-select" onchange="filterTable('${key}')">
        <option value="">Todos os status</option>
        <option>Em uso</option>
        <option>Disponível</option>
        <option>Manutenção</option>
      </select>
      <select class="filter-select" onchange="filterTable('${key}')">
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
          <button class="action-btn action-btn--view" onclick="openDetailModal('${item.id}','${key}')" title="Detalhes">
            <i class="ti ti-eye"></i>
          </button>
          <button class="action-btn action-btn--edit" onclick="openEditModal('${item.id}','${key}')" title="Editar">
            <i class="ti ti-edit"></i>
          </button>
          <button class="action-btn action-btn--delete" onclick="openDeleteModal('${item.id}','${key}')" title="Excluir">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

/* ==============================================
   FILTRO DE TABELA
   ============================================== */
function filterTable(key, searchValue) {
  const page = document.getElementById(`pg-${key}`);
  if (!page) return;

  const selects = page.querySelectorAll('select.filter-select');
  const statusFilter = selects[0]?.value ?? '';
  const unitFilter   = selects[1]?.value ?? '';
  const search = searchValue !== undefined
    ? searchValue
    : (page.querySelector('.search-field__input')?.value ?? '');

  const rows = document.querySelectorAll(`#tbody-${key} tr`);

  rows.forEach(row => {
    const cells    = row.querySelectorAll('td');
    const code     = cells[0]?.textContent ?? '';
    const shop     = cells[1]?.textContent ?? '';
    const func     = cells[2]?.textContent ?? '';
    const status   = cells[4]?.textContent.trim() ?? '';

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
   MODAL DE CRIAÇÃO / EDIÇÃO
   ============================================== */
function openNewModal(prefix, key) {
  currentCategory = key;
  editingItemId   = null;

  _setFormTitle(NEW_LABEL[key] || 'Novo item');
  _clearForm(prefix, AppData[key].length + 1);
  Modal.open('modal-form');
}

function openEditModal(id, key) {
  currentCategory = key;
  editingItemId   = id;

  const item = AppData[key].find(x => x.id === id);
  if (!item) return;

  _setFormTitle(`Editar ${SINGULAR[key] || 'item'} — ${id}`);
  _fillForm(item);
  Modal.open('modal-form');
}

function _setFormTitle(title) {
  document.getElementById('modal-form-title').textContent = title;
}

function _clearForm(prefix, nextIndex) {
  document.getElementById('form-code').value    = '';
  document.getElementById('form-code').placeholder = `${prefix}-00${nextIndex}`;
  document.getElementById('form-brand').value   = '';
  document.getElementById('form-date').value    = '';
  document.getElementById('form-shop').selectedIndex   = 0;
  document.getElementById('form-person').selectedIndex = 0;
  document.getElementById('form-status').selectedIndex = 0;
  document.getElementById('form-notes').value   = '';
}

function _fillForm(item) {
  document.getElementById('form-code').value  = item.id;
  document.getElementById('form-brand').value = item.marca;
  document.getElementById('form-date').value  = '';

  _selectByText('form-shop',   item.shop);
  _selectByText('form-person', item.func);
  _selectByText('form-status', item.status);

  document.getElementById('form-notes').value = item.obs === '—' ? '' : item.obs;
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
   MODAL DE DETALHES
   ============================================== */
function openDetailModal(id, key) {
  const item = AppData[key].find(x => x.id === id);
  if (!item) return;

  document.getElementById('modal-detail-title').textContent = `Detalhes — ${id}`;
  document.getElementById('modal-detail-body').innerHTML = _buildDetailHtml(item, key);
  Modal.open('modal-detail');
}

function _buildDetailHtml(item, key) {
  return `
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-barcode"></i> Código</span>
      <span class="detail-row__value"><span class="code-tag">${item.id}</span></span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-tag"></i> Marca / modelo</span>
      <span class="detail-row__value">${item.marca}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-building-store"></i> Unidade atual</span>
      <span class="detail-row__value">${item.shop}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-user"></i> Funcionária</span>
      <span class="detail-row__value">${item.func}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-calendar"></i> Aquisição</span>
      <span class="detail-row__value">${item.data}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-circle-check"></i> Status</span>
      <span class="detail-row__value">${statusPillHtml(item.status)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ti-notes"></i> Observações</span>
      <span class="detail-row__value" style="color:var(--color-text-muted)">${item.obs}</span>
    </div>
    <div style="margin-top:14px;padding-top:12px;border-top:0.5px solid var(--color-border)">
      <div style="font-size:11px;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.5px;font-weight:600;margin-bottom:10px">
        Histórico recente
      </div>
      <div class="history-item"><div class="history-item__dot"></div>Transferido para unidade atual em 20/03/2025</div>
      <div class="history-item"><div class="history-item__dot"></div>Troca de responsável em 05/02/2025</div>
    </div>
    <div class="modal__footer">
      <button class="btn-cancel" onclick="Modal.close('modal-detail')">Fechar</button>
      <button class="btn-save" onclick="Modal.close('modal-detail'); openEditModal('${item.id}','${key}')">
        <i class="ti ti-edit"></i> Editar
      </button>
    </div>
  `;
}

/* ==============================================
   MODAL DE EXCLUSÃO
   ============================================== */
let deleteTarget = null;

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
