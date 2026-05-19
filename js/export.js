/**
 * export.js
 * Exportação de todos os dados para planilha XLSX com estilo completo (ExcelJS).
 */

const Exporter = {
  CATEGORIES: [
    { key: 'alicates',  label: 'Alicates'  },
    { key: 'canetas',   label: 'Canetas'   },
    { key: 'motores',   label: 'Motores'   },
    { key: 'cabines',   label: 'Cabines'   },
    { key: 'sugadores', label: 'Sugadores' },
  ],

  MAT_COLS: [
    { header: 'Código',             key: 'id',     width: 12 },
    { header: 'Marca / Modelo',     key: 'marca',  width: 26 },
    { header: 'Shopping / Unidade', key: 'shop',   width: 28 },
    { header: 'Funcionária',        key: 'func',   width: 22 },
    { header: 'Data de Aquisição',  key: 'data',   width: 18 },
    { header: 'Status',             key: 'status', width: 16 },
    { header: 'Observações',        key: 'obs',    width: 34 },
  ],

  MOV_COLS: [
    { header: 'Material / Código', key: 'code', width: 18 },
    { header: 'Tipo',              key: 'type', width: 22 },
    { header: 'Descrição',         key: 'desc', width: 50 },
    { header: 'Data',              key: 'date', width: 16 },
  ],

  GRADIENT_FROM: '8B5CF6',
  GRADIENT_TO:   'F43F5E',
  EVEN_BG:    'FFFFF0F6',
  BORDER_CLR: 'FFD8A0BC',

  async exportAll() {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Esmaltale System';
    wb.created = new Date();

    this.CATEGORIES.forEach(({ key, label }) => {
      this._buildMaterialSheet(wb.addWorksheet(label), AppData[key]);
    });

    this._buildMovSheet(wb.addWorksheet('Movimentações'));

    const filename = this._buildFilename();
    const buffer   = await wb.xlsx.writeBuffer();
    const blob     = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const a   = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    EsmalSwal.fire({
      icon: 'success',
      title: 'Exportado!',
      html: `<span style="color:#8a4060;font-size:14px">Planilha <strong>${filename}</strong> baixada com sucesso.</span>`,
      confirmButtonText: 'OK',
      timer: 3500,
      timerProgressBar: true,
    });
  },

  _buildMaterialSheet(sheet, items) {
    sheet.columns = this.MAT_COLS;
    sheet.views   = [{ state: 'frozen', ySplit: 1 }];
    this._styleHeader(sheet, this.MAT_COLS.length);

    items.forEach((r, i) => {
      const row = sheet.addRow({
        id: r.id, marca: r.marca, shop: r.shop,
        func: r.func, data: r.data, status: r.status, obs: r.obs,
      });
      this._styleDataRow(row, i, this.MAT_COLS.length, true);
    });
  },

  _buildMovSheet(sheet) {
    sheet.columns = this.MOV_COLS;
    sheet.views   = [{ state: 'frozen', ySplit: 1 }];
    this._styleHeader(sheet, this.MOV_COLS.length);

    let i = 0;
    document.querySelectorAll('#pg-movimentacoes .mov-item').forEach(el => {
      const title = el.querySelector('.mov-item__title')?.textContent.trim() ?? '';
      const meta  = el.querySelector('.mov-item__meta')?.textContent.trim()  ?? '';
      const date  = el.querySelector('.mov-item__date')?.textContent.trim()  ?? '';
      const type  = el.dataset.type ?? '';
      const code  = title.split('—')[0].trim();
      const row   = sheet.addRow({ code, type, desc: meta, date });
      this._styleDataRow(row, i++, this.MOV_COLS.length, false);
    });
  },

  _styleHeader(sheet, colCount) {
    const colors = this._gradientARGB(this.GRADIENT_FROM, this.GRADIENT_TO, colCount);
    const row    = sheet.getRow(1);
    row.height   = 24;
    for (let c = 1; c <= colCount; c++) {
      const cell     = row.getCell(c);
      cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors[c - 1] } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border    = this._border();
    }
  },

  _gradientARGB(fromHex, toHex, count) {
    const parse = h => [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
    const [r1, g1, b1] = parse(fromHex);
    const [r2, g2, b2] = parse(toHex);
    const hex2 = n => n.toString(16).padStart(2, '0').toUpperCase();
    return Array.from({ length: count }, (_, i) => {
      const t = count === 1 ? 0 : i / (count - 1);
      return `FF${hex2(Math.round(r1 + (r2 - r1) * t))}${hex2(Math.round(g1 + (g2 - g1) * t))}${hex2(Math.round(b1 + (b2 - b1) * t))}`;
    });
  },

  _styleDataRow(row, index, colCount, wrapLast) {
    const bg = index % 2 === 1 ? this.EVEN_BG : 'FFFFFFFF';
    row.height = 18;
    for (let c = 1; c <= colCount; c++) {
      const cell     = row.getCell(c);
      cell.font      = { size: 10, name: 'Calibri' };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.alignment = { vertical: 'middle', wrapText: wrapLast && c === colCount };
      cell.border    = this._border();
    }
  },

  _border() {
    const s = { style: 'thin', color: { argb: this.BORDER_CLR } };
    return { top: s, left: s, bottom: s, right: s };
  },

  _buildFilename() {
    const d  = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `Esmaltale_Materiais_${dd}-${mm}-${d.getFullYear()}.xlsx`;
  },
};
