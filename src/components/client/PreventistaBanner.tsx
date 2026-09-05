import React from 'react';
import { useStore } from '../../context/StoreContext';
import { MessageCircle } from 'lucide-react';

/**
 * PreventistaBanner - Aviso mínimo de una línea indicando a quién van los pedidos.
 * Solo se muestra cuando el cliente entró por el link de un preventista.
 */
export const PreventistaBanner: React.FC = () => {
  const { activePreventista } = useStore();

  if (!activePreventista) {
    return null;
  }

  return (
    <div className="bg-sky-50 border-b border-sky-100 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-sky-900">
        <MessageCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
        <span>
          Tus pedidos van a <strong>{activePreventista.name}</strong> por WhatsApp.
        </span>
      </div>
    </div>
  );
};
