import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import {
  PRIORITY_TAG_CLASS,
  PRIORITY_TAG_TEXT,
  STATUS_COLOR_VAR,
  STATUS_LABEL_CAP,
  TODAY_LABEL,
} from '../utils/deadline.js';

// Total fictício da base para a demonstração — a tabela mostra só uma amostra.
const TOTAL_ORDERS_FAKE = 63;

export default function Reports({ orders }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [respFilter, setRespFilter] = useState('');

  const filtered = useMemo(() => {
    return orders.filter(
      (o) => (!statusFilter || o.status === statusFilter) && (!respFilter || o.responsavel === respFilter)
    );
  }, [orders, statusFilter, respFilter]);

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Relatório de Ordens de Serviço — Altave', 14, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text('Gerado em ' + TODAY_LABEL, 14, 24);
    doc.setTextColor(20, 20, 20);

    const headers = ['OS', 'Título', 'Prioridade', 'Responsável', 'Status', 'Aberta', 'Concluída'];
    const colX = [14, 34, 102, 126, 154, 178, 197];
    let y = 34;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    headers.forEach((h, i) => doc.text(h, colX[i], y));
    doc.setFont('helvetica', 'normal');
    y += 4;
    doc.setDrawColor(210);
    doc.line(14, y, 206, y);
    y += 6;

    filtered.forEach((o) => {
      const row = [
        o.id,
        o.title,
        PRIORITY_TAG_TEXT[o.priority],
        o.responsavel,
        STATUS_LABEL_CAP[o.status],
        o.abertura,
        o.concluidaEm || '—',
      ];
      row.forEach((c, i) => {
        const text = i === 1 && c.length > 30 ? c.slice(0, 28) + '…' : c;
        doc.text(String(text), colX[i], y);
      });
      y += 7;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('relatorio-ordens-altave.pdf');
  }

  function exportExcel() {
    const rows = [['OS', 'Título', 'Prioridade', 'Responsável', 'Status', 'Aberta em', 'Concluída em']];
    filtered.forEach((o) => {
      rows.push([
        o.id,
        o.title,
        PRIORITY_TAG_TEXT[o.priority],
        o.responsavel,
        STATUS_LABEL_CAP[o.status],
        o.abertura,
        o.concluidaEm || '—',
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 42 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ordens');
    XLSX.writeFile(wb, 'relatorio-ordens-altave.xlsx');
  }

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Relatórios</h1>
          <div className="sub">Consulte e exporte o histórico de ordens de serviço.</div>
        </div>
      </div>

      <div className="toolbar">
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Status: todos</option>
          <option value="aberta">Aberta</option>
          <option value="andamento">Em andamento</option>
          <option value="concluida">Concluída</option>
        </select>
        <select className="filter-select" value={respFilter} onChange={(e) => setRespFilter(e.target.value)}>
          <option value="">Responsável: todos</option>
          <option value="Ana Ferreira">Ana Ferreira</option>
          <option value="Carlos Dias">Carlos Dias</option>
          <option value="João Pedro">João Pedro</option>
        </select>
        <select className="filter-select" title="Ainda não conectado a datas reais">
          <option>Período: últimos 30 dias</option>
          <option>Últimos 7 dias</option>
          <option>Este trimestre</option>
        </select>
        <div className="spacer" />
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>OS</th>
              <th>Título</th>
              <th>Prioridade</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Aberta em</th>
              <th>Concluída em</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.title}</td>
                <td>
                  <span className={'tag ' + PRIORITY_TAG_CLASS[o.priority]}>{PRIORITY_TAG_TEXT[o.priority]}</span>
                </td>
                <td>{o.responsavel}</td>
                <td>
                  <span className="status-pill">
                    <span className="d" style={{ background: STATUS_COLOR_VAR[o.status] }} />
                    {STATUS_LABEL_CAP[o.status]}
                  </span>
                </td>
                <td>{o.abertura}</td>
                <td>{o.concluidaEm || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-actions">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {filtered.length} de {TOTAL_ORDERS_FAKE} ordens
          </span>
          <div className="exports">
            <button className="btn btn-ghost btn-sm" onClick={exportPDF}>
              Exportar PDF
            </button>
            <button className="btn btn-ghost btn-sm" onClick={exportExcel}>
              Exportar Excel
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
