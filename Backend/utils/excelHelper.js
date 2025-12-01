const ExcelJS = require('exceljs');
const { formSections, mapValue, assetsLabels, nutritionQuestions, economicIncomeLabels, economicExpenseLabels } = require('./formMapping');

// safe getter that supports dot notation
function getValueByPath(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[p];
  }
  return cur;
}

function formatNumberAsCurrency(n) {
  if (n === null || n === undefined || n === '') return '';
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(num);
}

function humanizeKey(k) {
  if (!k) return '';
  return String(k)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

// Try different paths where the weekly totals might be stored
function findTotal(obj, possiblePaths = []) {
  for (const p of possiblePaths) {
    const v = getValueByPath(obj, p);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}



// Normalize and extract nutrition answer from different possible shapes
function getNutritionAnswer(data, key) {
  const ns = getValueByPath(data, 'nutritionalStatus') || getValueByPath(data, 'nutritional') || data;
  let v = getValueByPath(ns, key);
  if (v === undefined) v = getValueByPath(data, key);
  if (v === undefined) return '';

  if (typeof v === 'object' && v !== null) {
    if ('answer' in v) return mapValue(key, v.answer);
    if ('value' in v) return mapValue(key, v.value);
    return JSON.stringify(v);
  }

  return mapValue(key, v);
}

/* Styling helpers */
function styleHeaderRow(sheet) {
  try {
    const headerRow = sheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } }; // dark blue
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FF000000' } } };
    });
    headerRow.height = 20;
  } catch (e) {
    // ignore styling failures
  }
}

function styleSubHeaderRow(row) {
  row.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FF000000' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }; // light blue
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });
}

function styleSectionTitleRow(row) {
  row.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FF000000' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE9D9' } }; // light orange
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });
}

/* Field groups for family members (used to split sections) */
const memberBasicFields = ['first_name', 'first_surname', 'second_surname', 'gender', 'dob', 'entity_of_birth', 'idCard', 'civil_status', 'relationship_to_head'];
const memberEducationFields = ['schooling', 'grade_of_schooling', 'assists_school', 'occupation', 'type_of_employment', 'labor_benefits', 'retired_or_pensioner', 'eligible_for_social_programs', 'reason_for_eligibility'];
const memberHealthFields = ['has_disability', 'health_issues', 'adictions', 'weight', 'size', 'BMI', 'indigenous'];

// main builder
function buildWorkbookFromFamily(family) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'BAMX App';
  wb.created = new Date();

  const data = family.form_data || {};

  // Summary sheet
  const meta = wb.addWorksheet('Resumen');
  meta.columns = [{ header: 'Campo', key: 'field', width: 40 }, { header: 'Valor', key: 'value', width: 60 }];
  styleHeaderRow(meta);
  meta.addRow({ field: 'Exportado', value: new Date().toISOString() });
  if (data.date) meta.addRow({ field: 'Fecha del formulario', value: data.date });
  if (data.community_name) meta.addRow({ field: 'Comunidad', value: mapValue('community_name', data.community_name) });
  if (data.group) meta.addRow({ field: 'Grupo', value: mapValue('group', data.group) });

  // Desired order
  const desiredOrder = ['generalData', 'familyMembers', 'LivingConditions', 'economicConditions', 'nutritionalStatus'];

  for (const key of desiredOrder) {
    const section = formSections.find(s => s.key === key);
    if (!section) continue;

    // General data: simple label/value
    if (section.key === 'generalData') {
      const sheet = wb.addWorksheet(section.title || 'Datos Generales');
      sheet.columns = [{ header: 'Campo', key: 'field', width: 40 }, { header: 'Valor', key: 'value', width: 80 }];
      styleHeaderRow(sheet);
      for (const f of (section.fields || [])) {
        const raw = getValueByPath(data, f.name);
        sheet.addRow({ field: f.label, value: mapValue(f.name, raw) });
      }
      continue;
    }

    // Estructura Familiar: one sheet, grouped by member with sub-sections
    if (section.key === 'familyMembers') {
      const members = Array.isArray(data.familyMembers) ? data.familyMembers : (data.family_members || data.members || []);
      const sheet = wb.addWorksheet(section.title || 'Estructura Familiar', { views: [{ state: 'frozen', ySplit: 1 }] });
      sheet.columns = [{ header: 'Campo', key: 'field', width: 40 }, { header: 'Valor', key: 'value', width: 60 }];
      styleHeaderRow(sheet);

      if (!members || members.length === 0) {
        sheet.addRow({ field: 'No se registraron miembros', value: '' });
        continue;
      }

      members.forEach((m, idx) => {
        // Member title (merged)
        const memberFullName = `${mapValue('first_name', m.first_name)} ${mapValue('first_surname', m.first_surname)} ${mapValue('second_surname', m.second_surname)}`.trim() || `Miembro ${idx + 1}`;
        const titleRow = sheet.addRow([`Miembro ${idx + 1}: ${memberFullName}`, '']);
        sheet.mergeCells(`A${titleRow.number}:B${titleRow.number}`);
        styleSectionTitleRow(titleRow);

        // Basics subheader
        const basicsHeader = sheet.addRow(['Básicos', '']);
        sheet.mergeCells(`A${basicsHeader.number}:B${basicsHeader.number}`);
        styleSubHeaderRow(basicsHeader);

        for (const fname of memberBasicFields) {
          const raw = getValueByPath(m, fname);
          const label = (section.memberFields || []).find(f => f.name === fname)?.label || humanizeKey(fname);
          sheet.addRow({ field: label, value: mapValue(fname, raw) });
        }

        // Education / Work subheader
        const eduHeader = sheet.addRow(['Escolaridad y trabajo', '']);
        sheet.mergeCells(`A${eduHeader.number}:B${eduHeader.number}`);
        styleSubHeaderRow(eduHeader);

        for (const fname of memberEducationFields) {
          const raw = getValueByPath(m, fname);
          const label = (section.memberFields || []).find(f => f.name === fname)?.label || humanizeKey(fname);
          sheet.addRow({ field: label, value: mapValue(fname, raw) });
        }

        // Health subheader
        const healthHeader = sheet.addRow(['Salud', '']);
        sheet.mergeCells(`A${healthHeader.number}:B${healthHeader.number}`);
        styleSubHeaderRow(healthHeader);

        for (const fname of memberHealthFields) {
          const raw = getValueByPath(m, fname);
          const label = (section.memberFields || []).find(f => f.name === fname)?.label || humanizeKey(fname);
          sheet.addRow({ field: label, value: mapValue(fname, raw) });
        }

        // Add an empty spacer row after each member
        sheet.addRow(['', '']);
      });

      continue;
    }

    // Vivienda y Equipamiento — general fields + assets table in same sheet
    if (section.key === 'LivingConditions') {
      const sheet = wb.addWorksheet(section.title || 'Vivienda y Equipamiento');
      sheet.columns = [{ header: 'Campo', key: 'field', width: 40 }, { header: 'Valor', key: 'value', width: 80 }];
      styleHeaderRow(sheet);

      for (const f of (section.fields || [])) {
        if (f.name === 'assets') continue;
        const raw = getValueByPath(data, f.name);
        sheet.addRow({ field: f.label, value: mapValue(f.name, raw) });
      }

      // Assets sub-table appended on same sheet
      sheet.addRow({ field: '', value: '' });
      const assetsTitle = sheet.addRow(['--- Bienes y Electrodomésticos ---', '']);
      sheet.mergeCells(`A${assetsTitle.number}:B${assetsTitle.number}`);
      styleSubHeaderRow(assetsTitle);

      // header row for assets
      const assetsHeader = sheet.addRow(['Bien', 'Tiene | Funcional']);
      assetsHeader.getCell(1).font = { bold: true };
      assetsHeader.getCell(2).font = { bold: true };

      const assetsObj = getValueByPath(data, 'assets') || getValueByPath(data, 'LivingConditions.assets') || getValueByPath(data, 'livingConditions.assets') || {};
      const knownAssets = Object.keys(assetsLabels);

      knownAssets.forEach(assetKey => {
        const label = assetsLabels[assetKey] || humanizeKey(assetKey);
        const entry = assetsObj && typeof assetsObj === 'object' ? (assetsObj[assetKey] || {}) : {};
        const has = entry.has === undefined ? false : entry.has;
        const functional = entry.functional === undefined ? false : entry.functional;
        sheet.addRow({ field: label, value: `${mapValue('boolean', has)} | ${mapValue('boolean', functional)}` });
      });

      continue;
    }

    // Economic conditions: single sheet, include weekly/monthly totals if present
    if (section.key === 'economicConditions') {
      const sheet = wb.addWorksheet(section.title || 'Condiciones Económicas');
      sheet.columns = [{ header: 'Campo', key: 'field', width: 40 }, { header: 'Valor', key: 'value', width: 80 }];
      styleHeaderRow(sheet);

      for (const f of (section.fields || [])) {
        // Prefer the value under economicConditions.* but fall back to top-level if present
        const raw =
          getValueByPath(data, `economicConditions.${f.name}`) ??
          getValueByPath(data, f.name);
        let value;
        // If value looks numeric (and not an object), format as currency; else use mapValue
        if (raw !== undefined && raw !== null && raw !== '' && !Number.isNaN(Number(raw)) && typeof raw !== 'object') {
          value = formatNumberAsCurrency(raw);
        } else {
          value = mapValue(f.name, raw);
        }
        sheet.addRow({ field: f.label, value });
      }

      // Merge weekly income into same sheet
      const weeklyIncome = getValueByPath(data, 'economicConditions.weekly_income') || getValueByPath(data, 'weekly_income') || getValueByPath(data, 'income') || getValueByPath(data, 'economic.weekly_income');
      if (weeklyIncome && typeof weeklyIncome === 'object') {
        sheet.addRow({ field: '', value: '' });
        sheet.addRow({ field: '--- Ingresos Semanales ---', value: '' });
        Object.keys(weeklyIncome).forEach(k => {
          if (k.toLowerCase().includes('total')) return;
          const v = weeklyIncome[k];
          const label = economicIncomeLabels[k] || economicIncomeLabels[k.toLowerCase()] || humanizeKey(k);
          sheet.addRow({ field: label, value: (v === null || v === undefined || v === '') ? '' : formatNumberAsCurrency(v) });
        });

        const weeklyTotal = findTotal(weeklyIncome, ['weekly_total', 'weeklyTotal', 'total_weekly', 'weekly_total']);
        const monthlyTotal = findTotal(weeklyIncome, ['monthly_total', 'monthlyTotal', 'monthly_total']);
        if (weeklyTotal !== undefined) sheet.addRow({ field: 'Total ingresos — semanal', value: formatNumberAsCurrency(weeklyTotal) });
        if (monthlyTotal !== undefined) sheet.addRow({ field: 'Total ingresos — mensual', value: formatNumberAsCurrency(monthlyTotal) });
      }

      // Merge weekly expenses
        const weeklyExpenses = getValueByPath(data, 'economicConditions.weekly_expenses') || getValueByPath(data, 'weekly_expenses') || getValueByPath(data, 'expenses') || getValueByPath(data, 'economic.weekly_expenses');
        if (weeklyExpenses && typeof weeklyExpenses === 'object') {
        sheet.addRow({ field: '', value: '' });
        sheet.addRow({ field: '--- Gastos Semanales ---', value: '' });
        Object.keys(weeklyExpenses).forEach(k => {
          if (k.toLowerCase().includes('total')) return;
          const v = weeklyExpenses[k];
          const label = economicExpenseLabels[k] || economicExpenseLabels[k.toLowerCase()] || humanizeKey(k);
          sheet.addRow({ field: label, value: (v === null || v === undefined || v === '') ? '' : formatNumberAsCurrency(v) });
        });

        const weeklyExpTotal = findTotal(weeklyExpenses, ['weekly_total', 'weeklyTotal', 'total_weekly']);
        const monthlyExpTotal = findTotal(weeklyExpenses, ['monthly_total', 'monthlyTotal', 'monthly_total']);
        if (weeklyExpTotal !== undefined) sheet.addRow({ field: 'Total gastos — semanal', value: formatNumberAsCurrency(weeklyExpTotal) });
        if (monthlyExpTotal !== undefined) sheet.addRow({ field: 'Total gastos — mensual', value: formatNumberAsCurrency(monthlyExpTotal) });
      }

      // Look for totals under economicConditions top-level as fallback
      const econ = getValueByPath(data, 'economicConditions') || getValueByPath(data, 'economic') || {};
      const topWeeklyIncomeTotal = findTotal(econ, ['weekly_income.weekly_total', 'weekly_income.weeklyTotal', 'weekly_total', 'weeklyTotal']);
      const topMonthlyIncomeTotal = findTotal(econ, ['weekly_income.monthly_total', 'weekly_income.monthlyTotal', 'monthly_total', 'monthlyTotal']);
      if (topWeeklyIncomeTotal !== undefined) sheet.addRow({ field: 'Total ingresos — semanal', value: formatNumberAsCurrency(topWeeklyIncomeTotal) });
      if (topMonthlyIncomeTotal !== undefined) sheet.addRow({ field: 'Total ingresos — mensual', value: formatNumberAsCurrency(topMonthlyIncomeTotal) });

      const topWeeklyExpTotal = findTotal(econ, ['weekly_expenses.weekly_total', 'weekly_expenses.weeklyTotal', 'weekly_total']);
      const topMonthlyExpTotal = findTotal(econ, ['weekly_expenses.monthly_total', 'weekly_expenses.monthlyTotal', 'monthly_total', 'monthlyTotal']);
      if (topWeeklyExpTotal !== undefined) sheet.addRow({ field: 'Total gastos — semanal', value: formatNumberAsCurrency(topWeeklyExpTotal) });
      if (topMonthlyExpTotal !== undefined) sheet.addRow({ field: 'Total gastos — mensual', value: formatNumberAsCurrency(topMonthlyExpTotal) });

      continue;
    }

    // Nutritional status: use full questions from nutritionQuestions mapping and show answer
    if (section.key === 'nutritionalStatus') {
      const sheet = wb.addWorksheet(section.title || 'Estado Nutricional');
      sheet.columns = [{ header: 'Pregunta', key: 'q', width: 80 }, { header: 'Respuesta', key: 'a', width: 30 }];
      styleHeaderRow(sheet);

      for (const qKey of Object.keys(nutritionQuestions)) {
        const questionText = nutritionQuestions[qKey];
        const answer = getNutritionAnswer(data, qKey);
        sheet.addRow({ q: questionText, a: answer });
      }

      continue;
    }

    // Fallback generic sections
    const sheet = wb.addWorksheet(section.title || section.key);
    sheet.columns = [{ header: 'Campo', key: 'field', width: 60 }, { header: 'Valor', key: 'value', width: 60 }];
    styleHeaderRow(sheet);

    for (const f of (section.fields || [])) {
      const raw = getValueByPath(data, f.name);
      const value = mapValue(f.name, raw);
      sheet.addRow({ field: f.label, value });
    }
  }

  // Raw JSON as last sheet (form JSON only)
  const rawSheet = wb.addWorksheet('FormData JSON');
  rawSheet.columns = [{ header: 'JSON', key: 'j', width: 100 }];
  rawSheet.addRow({ j: JSON.stringify(data, null, 2) });

  return wb;
}

module.exports = { buildWorkbookFromFamily };