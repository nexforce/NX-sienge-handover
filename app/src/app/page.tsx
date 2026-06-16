"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Status } from "@prisma/client";
import { MetricsBar } from "@/components/MetricsBar";
import { DocumentCard } from "@/components/DocumentCard";
import { FilterBar } from "@/components/FilterBar";

interface Document {
  id: string;
  nome: string;
  revisor: string;
  statusAtual: Status;
  ultimaAtualizacao: string;
}

interface Filters {
  status: string;
  search: string;
  sort: string;
  revisor: string;
}

const DEFAULT_FILTERS: Filters = { status: "Todos", search: "", sort: "recent", revisor: "" };

export default function Home() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [reviewers, setReviewers] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/documents/reviewers")
      .then((r) => r.json())
      .then((data: string[]) => setReviewers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "Todos") params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.revisor) params.set("revisor", filters.revisor);

      const response = await fetch(`/api/documents?${params.toString()}`);
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#9C9B9B] bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1
                className="text-2xl font-bold text-[#0C0E0E]"
                style={{ fontFamily: "'Lato', sans-serif", fontWeight: 900 }}
              >
                Controle de Revisão de Documentos
              </h1>
              <p
                className="text-[#777777] text-sm mt-1"
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                Sienge — HubSpot RaaS
              </p>
            </div>
            <div className="flex items-center gap-6 ml-4">
              {session?.user?.email === "hugo.zanni@nexforce.ai" && (
                <Link
                  href="/admin/logs"
                  className="text-sm font-semibold text-[#215A9F] hover:text-[#0C0E0E] transition-colors"
                >
                  Logs de Uso
                </Link>
              )}
              <img
                src="https://github.com/wteodosionx/nx-logo/raw/0ba05bc3bccba383d907e22aadd647514d03114d/NF%20-%20PRETO-01.png"
                alt="Nexforce"
                style={{ maxWidth: "200px", height: "auto", display: "block" }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="bg-[#F5F5F5] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <MetricsBar documents={documents} />

          <FilterBar reviewers={reviewers} onFilter={setFilters} />

          {loading ? (
            <div className="text-center py-12">
              <p className="text-[#515151]">Carregando documentos...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#515151]">Nenhum documento encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  id={doc.id}
                  nome={doc.nome}
                  revisor={doc.revisor}
                  statusAtual={doc.statusAtual}
                  ultimaAtualizacao={doc.ultimaAtualizacao}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
