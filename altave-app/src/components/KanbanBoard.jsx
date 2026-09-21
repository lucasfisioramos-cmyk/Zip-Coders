import React, { useMemo, useState } from 'react';
import OrderCard from './OrderCard.jsx';
import { PlusIcon, SearchIcon } from './Icons.jsx';
import { matchesPrazoFilter } from '../utils/deadline.js';

const COLUMNS = [
  { key: 'aberta', label: 'Aberta', dotVar: '--aberta' },
  { key: 'andamento', label: 'Em andamento', dotVar: '--andamento' },
  { key: 'concluida', label: 'Concluída', dotVar: '--concluida' },
];

export default function KanbanBoard({ orders, onReorder, onOpenOrder, onOpenModal, canManage }) {
  const [search, setSearch] = useState('');
  const [filterResp, setFilterResp] = useState('');
  const [filterPrio, setFilterPrio] = useState('');
  const [filterPrazo, setFilterPrazo] = useState('');

  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [dragOverPos, setDragOverPos] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders.filter((o) => {
      const matchesText = o.title.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
      const matchesResp = !filterResp || o.responsavel === filterResp;
      const matchesPrio = !filterPrio || o.priority === filterPrio;
      const matchesDeadline = matchesPrazoFilter(o, filterPrazo);
      return matchesText && matchesResp && matchesPrio && matchesDeadline;
    });
  }, [orders, search, filterResp, filterPrio, filterPrazo]);

  function ordersFor(status) {
    return filtered.filter((o) => o.status === status);
  }

  function resetDragState() {
    setDraggedId(null);
    setDragOverId(null);
    setDragOverPos(null);
    setDragOverColumn(null);
  }

  function handleDragStart(order) {
    if (!canManage) return;
    setDraggedId(order.id);
  }

  function handleCardDragOver(e, order) {
    if (!draggedId || draggedId === order.id) return;
    e.preventDefault();
    e.stopPropagation();
    const box = e.currentTarget.getBoundingClientRect();
    const pos = e.clientY - box.top - box.height / 2 < 0 ? 'before' : 'after';
    setDragOverId(order.id);
    setDragOverPos(pos);
    setDragOverColumn(order.status);
  }

  function handleColumnDragOver(e, status) {
    if (!draggedId) return;
    e.preventDefault();
    setDragOverColumn(status);
  }

  function handleDrop(e, status) {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedId) return;
    onReorder(draggedId, status, dragOverId, dragOverPos);
    resetDragState();
  }

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Quadro Kanban</h1>
          <div className="sub">
            Acompanhe o andamento de todas as ordens de serviço abertas. Arraste um card para mudar o status ou
            reordenar.
          </div>
        </div>
        <button className="btn btn-primary" onClick={onOpenModal}>
          <PlusIcon /> Nova ordem
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Buscar por título ou número da OS"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterResp} onChange={(e) => setFilterResp(e.target.value)}>
          <option value="">Responsável: todos</option>
          <option value="Ana Ferreira">Ana Ferreira</option>
          <option value="Carlos Dias">Carlos Dias</option>
          <option value="João Pedro">João Pedro</option>
        </select>
        <select className="filter-select" value={filterPrio} onChange={(e) => setFilterPrio(e.target.value)}>
          <option value="">Prioridade: todas</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
        <select className="filter-select" value={filterPrazo} onChange={(e) => setFilterPrazo(e.target.value)}>
          <option value="">Prazo: qualquer</option>
          <option value="vencidas">Vencidas</option>
          <option value="semana">Esta semana</option>
        </select>
      </div>

      <div className="board">
        {COLUMNS.map((col) => {
          const list = ordersFor(col.key);
          return (
            <div
              key={col.key}
              className={'col' + (dragOverColumn === col.key ? ' drag-over' : '')}
              onDragOver={(e) => handleColumnDragOver(e, col.key)}
              onDragLeave={() => setDragOverColumn((c) => (c === col.key ? null : c))}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="col-head">
                <span className="col-dot" style={{ background: `var(${col.dotVar})` }} />
                <span className="t">{col.label}</span>
                <span className="count">{list.length}</span>
              </div>
              <div className="cards">
                {list.length === 0 && <div className="empty-state">Nenhuma ordem encontrada</div>}
                {list.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onOpen={() => onOpenOrder(order.id)}
                    draggable={canManage}
                    isDragging={draggedId === order.id}
                    dragIndicator={dragOverId === order.id ? dragOverPos : null}
                    onDragStart={() => handleDragStart(order)}
                    onDragEnd={resetDragState}
                    onDragOver={(e) => handleCardDragOver(e, order)}
                    onDrop={(e) => handleDrop(e, order.status)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
