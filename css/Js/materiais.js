/**
 * materials.js
 * Renderização das páginas de materiais e operações de CRUD.
 */

let currentCategory = null;
let editingItemId   = null;

const SINGULAR = {
  alicates:  'alicate',
  canetas:   'caneta',
  motores:   'motor',
  cabines:   'cabine',
  fontes:    'fonte',
  sugadores: 'sugador',
};

const NEW_LABEL = {
  alicates:  'Novo alicate',
  canetas:   'Nova caneta',
  motores:   'Novo motor',
  cabines:   'Nova cabine',
  fontes:    'Nova fonte',
  sugadores: 'Novo sugador',
};

/* Cores por profissional */
const PROFESSIONAL_COLORS = {
  'Carol Santos':  { primary: '#1E90FF', primaryLabel: 'Azul',   secondary: '#FFFFFF', secondaryLabel: 'Branco'  },
  'Juliana Melo':  { primary: '#2E8B1A', primaryLabel: 'Verde',  secondary: '#FF8C00', secondaryLabel: 'Laranja' },
  'Patrícia Lima': { primary: '#FF69B4', primaryLabel: 'Rosa',   secondary: '#4169E1', secondaryLabel: 'Azul'    },
};

/* ==============================================
   NAVEGAÇÃO
   ============================================== */
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
function buildMaterialPage(pageEl) {
  const key    = pageEl.dataset.key;
  const items  = AppData[key];
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
        <option value="SBV">SBV</option>
        <option value="PAR">PAR</option>
        <option value="PSB">PSB</option>
        <option value="SSA">SSA</option>
        <option value="SDB">SDB</option>
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
            <col style="width:90px">
            <col style="width:80px">
            <col style="width:80px">
            <col style="width:70px">
            <col style="width:90px">
            <col style="width:30px">
            <col style="width:88px">
            <col style="width:90px">
          </colgroup>
          <thead>
            <tr>
              <th>Código</th>
              <th>Marca</th>
              <th>Tipo</th>
              <th>Unidade</th>
              <th>Profissional</th>
              <th>Cor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="tbody-${key}">${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function _buildTableRow(item, key) {
  const pColors  = PROFESSIONAL_COLORS[item.func];
  const colorDot = pColors
    ? `<span style="display:inline-flex;align-items:center;gap:3px;vertical-align:middle">`
      + `<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${pColors.primary};flex-shrink:0"></span>`
      + `<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${pColors.secondary};border:0.5px solid var(--color-border-strong);flex-shrink:0"></span>`
      + `</span>`
    : '—';

  return `
    <tr>
      <td><span class="code-tag">${item.id}</span></td>
      <td>${item.marca || '—'}</td>
      <td>${item.tipo || '—'}</td>
      <td>${item.shop || '—'}</td>
      <td>${item.func || '—'}</td>
      <td style="text-align:center">${colorDot}</td>
      <td>${statusPillHtml(item.status)}</td>
      <td>
        <div class="action-group">
          <button class="action-btn action-btn--view"
                  onclick="openDetailModal('${item.id}','${key}')" title="Detalhes">
            <i class="ti ti-eye"></i>
          </button>
          <button class="action-btn action-btn--edit"
                  onclick="openEditModal('${item.id}','${key}')" title="Editar">
            <i class="ti ti-edit"></i>
          </button>
          <button class="action-btn action-btn--delete"
                  onclick="openDeleteModal('${item.id}','${key}')" title="Excluir">
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

  const selects      = page.querySelectorAll('select.filter-select');
  const statusFilter = selects[0]?.value ?? '';
  const unitFilter   = selects[1]?.value ?? '';
  const search       = searchValue !== undefined
    ? searchValue
    : (page.querySelector('.search-field__input')?.value ?? '');

  document.querySelectorAll(`#tbody-${key} tr`).forEach(row => {
    const cells  = row.querySelectorAll('td');
    const code   = cells[0]?.textContent ?? '';
    const marca  = cells[1]?.textContent ?? '';
    const shop   = cells[3]?.textContent ?? '';
    const func   = cells[4]?.textContent ?? '';
    const status = cells[6]?.textContent.trim() ?? '';

    const matchSearch = !search
      || code.toLowerCase().includes(search.toLowerCase())
      || marca.toLowerCase().includes(search.toLowerCase())
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
  document.getElementById('form-code').value          = '';
  document.getElementById('form-code').placeholder    = `${prefix}-00${nextIndex}`;
  document.getElementById('form-date').value          = '';
  document.getElementById('form-brand').value         = '';
  document.getElementById('form-type').value          = '';
  document.getElementById('form-shop').value          = '';
  document.getElementById('form-category').value      = '';
  document.getElementById('form-clube').value         = '';
  document.getElementById('form-supplier').value      = '';
  document.getElementById('form-cost').value          = '';
  document.getElementById('form-person').value        = '';
  document.getElementById('form-notes').value         = '';
  document.getElementById('form-status').selectedIndex = 0;
  const disp = document.getElementById('form-color-display');
  if (disp) disp.innerHTML = '<span style="font-size:12px;color:var(--color-text-muted)">— selecione um profissional —</span>';
}

function _fillForm(item) {
  document.getElementById('form-code').value      = item.id        || '';
  document.getElementById('form-date').value      = item.data      || '';
  document.getElementById('form-brand').value     = item.marca     || '';
  document.getElementById('form-type').value      = item.tipo      || '';
  document.getElementById('form-shop').value      = item.shop      || '';
  document.getElementById('form-category').value  = item.categoria || '';
  document.getElementById('form-clube').value     = item.clube     || '';
  document.getElementById('form-supplier').value  = item.fornecedor|| '';
  document.getElementById('form-cost').value      = item.custo     || '';
  document.getElementById('form-person').value    = item.func      || '';
  document.getElementById('form-notes').value     = item.obs === '—' ? '' : (item.obs || '');
  document.getElementById('form-status').value    = item.status    || 'Em uso';
  onPersonChange(document.getElementById('form-person'));
}

/* ==============================================
   SALVAR (criar ou editar)
   ============================================== */
function saveForm() {
  const code       = document.getElementById('form-code').value.trim();
  const data       = document.getElementById('form-date').value;
  const marca      = document.getElementById('form-brand').value;
  const tipo       = document.getElementById('form-type').value;
  const shop       = document.getElementById('form-shop').value;
  const categoria  = document.getElementById('form-category').value;
  const clube      = document.getElementById('form-clube').value;
  const fornecedor = document.getElementById('form-supplier').value.trim();
  const custo      = document.getElementById('form-cost').value;
  const func       = document.getElementById('form-person').value;
  const obs        = document.getElementById('form-notes').value.trim() || '—';
  const status     = document.getElementById('form-status').value;

  if (!code) {
    shakeField('form-code');
    return;
  }

  const isEditing = editingItemId !== null;
  const newItem   = { id: code, marca, tipo, shop, categoria, clube, fornecedor, custo, func, obs, status, data };

  if (isEditing) {
    const idx = AppData[currentCategory].findIndex(x => x.id === editingItemId);
    if (idx !== -1) {
      AppData[currentCategory][idx] = {
        ...AppData[currentCategory][idx],
        ...newItem,
        data: data || AppData[currentCategory][idx].data,
      };
    }
  } else {
    AppData[currentCategory].push(newItem);
  }

  buildMaterialPage(document.getElementById(`pg-${currentCategory}`));
  Modal.close('modal-form');
  editingItemId = null;

  _showSaveAlert(isEditing, code);
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
  const pColors = PROFESSIONAL_COLORS[item.func];
  const colorDisplay = pColors
    ? `<span style="display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap">`
      + _colorChipHtml(pColors.primary, pColors.primaryLabel)
      + '<span style="color:var(--color-text-muted);font-size:12px;padding:0 2px"> / </span>'
      + _colorChipHtml(pColors.secondary, pColors.secondaryLabel)
      + `</span>`
    : '—';

  const fields = [
    { icon: 'ti-barcode',        label: 'Código',               value: `<span class="code-tag">${item.id}</span>` },
    { icon: 'ti-tag',            label: 'Marca',                value: item.marca      || '—' },
    { icon: 'ti-cut',            label: 'Tipo',                 value: item.tipo       || '—' },
    { icon: 'ti-building-store', label: 'Unidade',              value: item.shop       || '—' },
    { icon: 'ti-category',       label: 'Categoria',            value: item.categoria  || '—' },
    { icon: 'ti-star',           label: 'Clube do Alicate',     value: item.clube === 'sim' ? '✓ Sim' : item.clube === 'nao' ? '✗ Não' : '—' },
    { icon: 'ti-calendar',       label: 'Data de aquisição',    value: item.data       || '—' },
    { icon: 'ti-truck',          label: 'Fornecedor',           value: item.fornecedor || '—' },
    { icon: 'ti-coin',           label: 'Custo',                value: item.custo ? `R$ ${parseFloat(item.custo).toFixed(2)}` : '—' },
    { icon: 'ti-user',           label: 'Profissional',         value: item.func       || '—' },
    { icon: 'ti-palette',        label: 'Cor do profissional',  value: colorDisplay },
    { icon: 'ti-circle-check',   label: 'Status',               value: statusPillHtml(item.status) },
    { icon: 'ti-notes',          label: 'Observações',          value: item.obs        || '—' },
  ];

  const rows = fields.map(f => `
    <div class="detail-row">
      <span class="detail-row__label"><i class="ti ${f.icon}"></i> ${f.label}</span>
      <span class="detail-row__value">${f.value}</span>
    </div>
  `).join('');

  return `
    ${rows}
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