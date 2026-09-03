import React from 'react';
import { useStore } from '../../context/StoreContext';
import { UserCheck, Phone, ShieldCheck, MapPin, Building2 } from 'lucide-react';
import { generateWhatsAppLink } from '../../utils/whatsapp';

export const PreventistaBanner: React.FC = () => {
  const { activePreventista, settings } = useStore();

  if (!activePreventista) {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-100 py-2.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              <strong>Ventas Mayoristas Directas:</strong> Pedidos enviados a la Central de Distribución.
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Precios Mayoristas
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-sky-400" /> WhatsApp +{settings.defaultWhatsApp}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const directConsultLink = generateWhatsAppLink(
    activePreventista.whatsapp,
    `¡Hola ${activePreventista.name}! Estoy viendo el catálogo mayorista y tengo una consulta.`
  );

  return (
    <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 text-white py-3.5 px-4 shadow-sm border-b border-sky-800/80">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 border-2 border-white/40 flex items-center justify-center text-slate-950 font-black text-base shadow-md">
              {activePreventista.name.charAt(0)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-sky-500/25 text-sky-300 px-2 py-0.5 rounded-md border border-sky-400/30">
                Preventista Asignado
              </span>
              {activePreventista.zone && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-300">
                  <MapPin className="w-3 h-3 text-sky-400" />
                  {activePreventista.zone}
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
              {activePreventista.name}
            </h2>
            <p className="text-xs text-sky-200/80">
              Tus pedidos se enviarán de forma automática a este asesor por WhatsApp.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <a
            id="btn-direct-whatsapp-preventista"
            href={directConsultLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Consultar con {activePreventista.name.split(' ')[0]}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
