import React, { useState } from 'react';
import Login from './components/Login.jsx';
import Navbar from './components/Navbar.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';
import NewOrderModal from './components/NewOrderModal.jsx';
import OrderDrawer from './components/OrderDrawer.jsx';
import Reports from './components/Reports.jsx';
import ManualApi from './components/ManualApi.jsx';
import Settings from './components/Settings.jsx';
import { createSeedOrders } from './data/seedOrders.js';
import { CURRENT_USER, STATUS_LABEL, TODAY_LABEL, nowTime, nextOsNumber, whenLabelFor } from './utils/deadline.js';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [view, setView] = useState('kanban');
  const [role, setRole] = useState('Gestor');
  const [orders, setOrders] = useState(createSeedOrders());
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOrderId, setDrawerOrderId] = useState(null);

  const canManage = role !== 'Usuário padrão';

  function handleSetRole(newRole) {
    setRole(newRole);
    // Se o perfil selecionado perder acesso a Configurações, volta para o Kanban.
    if (newRole !== 'Administrador' && view === 'config') {
      setView('kanban');
    }
  }

  function handleReorder(draggedId, targetStatus, overId, overPosition) {
    setOrders((prev) => reorderOrders(prev, draggedId, targetStatus, overId, overPosition));
  }

  function handleCreateOrder({ title, desc, priority, responsavel, prazo }) {
    setOrders((prev) => {
      const id = nextOsNumber(prev);
      const newOrder = {
        id,
        title,
        desc: desc || 'Sem descrição adicional.',
        priority,
        responsavel,
        solicitante: CURRENT_USER,
        abertura: TODAY_LABEL,
        status: 'aberta',
        prazo,
        concluidaEm: null,
        whenLabel: 'Aberta agora',
        history: [{ text: `${CURRENT_USER} abriu esta ordem de serviço`, time: nowTime() }],
      };
      return [...prev, newOrder];
    });
    setModalOpen(false);
  }

  function handleDrawerSave(orderId, { status, responsavel }) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updated = { ...o };
        const history = [...o.history];

        if (responsavel !== o.responsavel) {
          history.push({ text: `${CURRENT_USER} atribuiu esta ordem a ${responsavel}`, time: nowTime() });
          updated.responsavel = responsavel;
        }
        if (status !== o.status) {
          history.push({ text: `${CURRENT_USER} moveu esta ordem para ${STATUS_LABEL[status]}`, time: nowTime() });
          updated.status = status;
          updated.whenLabel = whenLabelFor(status);
          if (status === 'concluida' && !updated.concluidaEm) updated.concluidaEm = TODAY_LABEL;
        }

        updated.history = history;
        return updated;
      })
    );
    setDrawerOrderId(null);
  }

  if (!loggedIn) {
    return <Login onSuccess={() => setLoggedIn(true)} />;
  }

  const drawerOrder = orders.find((o) => o.id === drawerOrderId) || null;

  return (
    <div className="app-shell">
      <Navbar view={view} setView={setView} role={role} setRole={handleSetRole} />

      <main className="app-main">
        {view === 'kanban' && (
          <KanbanBoard
            orders={orders}
            onReorder={handleReorder}
            onOpenOrder={setDrawerOrderId}
            onOpenModal={() => setModalOpen(true)}
            canManage={canManage}
          />
        )}
        {view === 'relatorios' && <Reports orders={orders} />}
        {view === 'manual' && <ManualApi />}
        {view === 'config' && role === 'Administrador' && <Settings />}
      </main>

      <NewOrderModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreateOrder} />
      <OrderDrawer order={drawerOrder} onClose={() => setDrawerOrderId(null)} onSave={handleDrawerSave} canManage={canManage} />
    </div>
  );
}

/**
 * Remove a ordem arrastada e a reinsere na posição de destino (mesma coluna
 * ou coluna diferente). Quando a coluna muda, registra o evento no histórico
 * e atualiza o rótulo exibido no card ("Concluída agora", etc.).
 */
function reorderOrders(orders, draggedId, targetStatus, overId, overPosition) {
  const list = [...orders];
  const fromIndex = list.findIndex((o) => o.id === draggedId);
  if (fromIndex === -1) return orders;
  const [dragged] = list.splice(fromIndex, 1);

  let insertIndex;
  if (overId && overId !== draggedId) {
    const overIndex = list.findIndex((o) => o.id === overId);
    insertIndex = overIndex === -1 ? list.length : overPosition === 'before' ? overIndex : overIndex + 1;
  } else {
    let lastIdx = -1;
    list.forEach((o, i) => {
      if (o.status === targetStatus) lastIdx = i;
    });
    insertIndex = lastIdx + 1;
  }

  const statusChanged = dragged.status !== targetStatus;
  const updatedDragged = { ...dragged, status: targetStatus };

  if (statusChanged) {
    updatedDragged.history = [
      ...dragged.history,
      { text: `${CURRENT_USER} moveu esta ordem para ${STATUS_LABEL[targetStatus]}`, time: nowTime() },
    ];
    updatedDragged.whenLabel = whenLabelFor(targetStatus);
    if (targetStatus === 'concluida' && !updatedDragged.concluidaEm) {
      updatedDragged.concluidaEm = TODAY_LABEL;
    }
  }

  list.splice(insertIndex, 0, updatedDragged);
  return list;
}
