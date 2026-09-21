import React from 'react';
import { CalendarIcon } from './Icons.jsx';
import { deadlineInfo, initials, avatarColor, PRIORITY_TAG_CLASS, PRIORITY_TAG_TEXT } from '../utils/deadline.js';

export default function OrderCard({
  order,
  onOpen,
  draggable,
  isDragging,
  dragIndicator, // 'before' | 'after' | null
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}) {
  const info = deadlineInfo(order.prazo, order.status);

  const classNames = [
    'card',
    isDragging ? 'dragging' : '',
    dragIndicator === 'before' ? 'dragover-before' : '',
    dragIndicator === 'after' ? 'dragover-after' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      draggable={draggable}
      onClick={onOpen}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="card-top">
        <span className="card-id">{order.id}</span>
        <span className={'tag ' + PRIORITY_TAG_CLASS[order.priority]}>{PRIORITY_TAG_TEXT[order.priority]}</span>
      </div>
      <div className="card-title">{order.title}</div>
      {info && (
        <div className={'card-deadline ' + info.cls}>
          <CalendarIcon />
          <span>{(info.diffDays < 0 ? 'Vencida em ' : 'Prazo: ') + info.label}</span>
        </div>
      )}
      <div className="card-bottom">
        <span className="card-when">{order.whenLabel}</span>
        <div className="mini-avatar" style={{ background: avatarColor(order.responsavel) }}>
          {initials(order.responsavel)}
        </div>
      </div>
    </div>
  );
}
