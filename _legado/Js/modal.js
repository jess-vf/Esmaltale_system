/**
 * modal.js
 * Gerenciamento genérico de modais.
 */

const Modal = {
  open(id) {
    document.getElementById(id)?.classList.add('is-open');
  },

  close(id) {
    document.getElementById(id)?.classList.remove('is-open');
  },

  closeOnOverlay(event, id) {
    if (event.target.id === id) this.close(id);
  },
};

/* ==============================================
   export.js
   Exportação da planilha XLSX.
   ============================================== */

const Exporter = {
  CATEGORIES: [
    { key: 'alicates',  label: 'Alicates'  },
    { key: 'canetas',   label: 'Canetas'   },
    { key: 'motores',   label: 'Motores'   },
    { key: 'cabines',   label: 'Cabines'   },
    { key: 'sugadores', label: 'Sugadores' },
  ],

  COLUMNS: ['Código', 'Marca / Modelo', 'Shopping / Unidade', 'Funcionária', 'Data de Aquisição', 'Status', 'Observações'],

  COLUMN_WIDTHS: [
    { wch: 12 }, { wch: 22 }, { wch: 24 },
    { wch: 20 }, { wch: 18 }, { wch: 14 }, { wch: 30 },
  ],

  exportAll() {
    const workbook = XLSX.utils.book_new();

    this.CATEGORIES.forEach(({ key, label }) => {
      const sheet = this._buildMaterialSheet(AppData[key]);
      XLSX.utils.book_append_sheet(workbook, sheet, label);
    });

    const movSheet = this._buildMovimentacoesSheet();
    XLSX.utils.book_append_sheet(workbook, movSheet, 'Movimentações');

    const filename = this._buildFilename();
    XLSX.writeFile(workbook, filename);

    this._showSuccessAlert(filename);
  },

  _buildMaterialSheet(items) {
    const rows = [
      this.COLUMNS,
      ...items.map(r => [r.id, r.marca, r.shop, r.func, r.data, r.status, r.obs]),
    ];
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols'] = this.COLUMN_WIDTHS;
    this._styleHeader(sheet, this.COLUMNS.length);
    return sheet;
  },

  _buildMovimentacoesSheet() {
    const headers = ['Material / Código', 'Tipo', 'Descrição', 'Data'];
    const rows    = [headers];

    document.querySelectorAll('#pg-movimentacoes .mov-item').forEach(el => {
      const title = el.querySelector('.mov-item__title')?.textContent.trim() ?? '';
      const meta  = el.querySelector('.mov-item__meta')?.textContent.trim()  ?? '';
      const date  = el.querySelector('.mov-item__date')?.textContent.trim()  ?? '';
      const type  = el.dataset.type ?? '';
      const code  = title.split('—')[0].trim();
      rows.push([code, type, meta, date]);
    });

    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols'] = [{ wch: 14 }, { wch: 20 }, { wch: 46 }, { wch: 16 }];
    this._styleHeader(sheet, headers.length);
    return sheet;
  },

  _styleHeader(sheet, colCount) {
    for (let c = 0; c < colCount; c++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c });
      if (!sheet[addr]) continue;
      sheet[addr].s = {
        font:      { bold: true, color: { rgb: 'FFFFFF' } },
        fill:      { fgColor: { rgb: 'E8197A' } },
        alignment: { horizontal: 'center' },
      };
    }
  },

  _buildFilename() {
    const today = new Date();
    const dd    = String(today.getDate()).padStart(2, '0');
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy  = today.getFullYear();
    return `Esmaltale_Materiais_${dd}-${mm}-${yyyy}.xlsx`;
  },

  _showSuccessAlert(filename) {
    EsmalSwal.fire({
      icon: 'success',
      title: 'Exportado!',
      html: `<span style="color:#8a4060;font-size:14px">Planilha <strong>${filename}</strong> baixada com sucesso.</span>`,
      confirmButtonText: 'OK',
      timer: 3500,
      timerProgressBar: true,
    });
  },
};
