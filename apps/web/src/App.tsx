import { FileText, Shield, Layers, FolderTree } from 'lucide-react';

export function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-slate-800">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">DocuPro V1</h1>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          Plateforme SaaS sécurisée de Gestion Documentaire et d'Archivage pour les entreprises.
        </p>

        <div className="grid grid-cols-3 gap-3 my-6 pt-4 border-t border-slate-100 text-left">
          <div className="p-3 bg-slate-50 rounded-lg">
            <Shield className="w-5 h-5 text-sky-600 mb-1" />
            <div className="font-semibold text-xs text-slate-700">Multi-tenant</div>
            <div className="text-[11px] text-slate-500">PostgreSQL RLS</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <Layers className="w-5 h-5 text-sky-600 mb-1" />
            <div className="font-semibold text-xs text-slate-700">Sécurité V1</div>
            <div className="text-[11px] text-slate-500">Quarantaine & Audit</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <FolderTree className="w-5 h-5 text-sky-600 mb-1" />
            <div className="font-semibold text-xs text-slate-700">Dossiers & GED</div>
            <div className="text-[11px] text-slate-500">Arborescence stricte</div>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Socle initial initialisé — Lot 1
        </div>
      </div>
    </div>
  );
}
