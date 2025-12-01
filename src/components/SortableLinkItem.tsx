// src/components/SortableLinkItem.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripVertical, FaChartBar } from 'react-icons/fa';
import { LinkData } from '@/lib/pageService';

interface Props {
  link: LinkData;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  editingIndex: number | null;
}

export function SortableLinkItem({ link, index, onEdit, onDelete, editingIndex }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.url + index }); // Usando URL+Index como ID único para garantir unicidade

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  // Se estiver editando este item, renderizamos apenas o container visual
  // O formulário de edição em si é controlado pelo pai (Dashboard)
  const isEditing = editingIndex === index;

  if (isEditing) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="p-3 bg-blue-50 rounded-md border-2 border-blue-500 mb-4 relative transition-all"
      >
         <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded">Editando</span>
            <span className="text-xs text-blue-400">(Você não pode arrastar enquanto edita)</span>
         </div>
         {/* O conteúdo do formulário será injetado pelo pai no local onde este componente seria renderizado */}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group p-4 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md mb-3 flex items-center gap-3 select-none transition-all duration-200"
    >
      {/* Handle de arrastar (o "agarrador") */}
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab text-gray-300 hover:text-gray-600 active:cursor-grabbing p-2 rounded hover:bg-gray-100 transition-colors touch-none"
        title="Arrastar para reordenar"
      >
        <FaGripVertical size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-800 truncate text-base">{link.title}</p>
            {link.icon && (
                <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                    {link.icon}
                </span>
            )}
        </div>
        
        <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[90%] block mt-0.5"
        >
            {link.url}
        </a>
        
        <div className="flex items-center text-xs text-gray-400 mt-2 gap-1.5">
            <FaChartBar className={link.clicks && link.clicks > 0 ? "text-green-500" : "text-gray-300"} /> 
            <span className="font-medium">{link.clicks || 0} cliques</span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
        <button 
          onClick={onEdit}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
        >
          Editar
        </button>
        <button 
          onClick={onDelete}
          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}