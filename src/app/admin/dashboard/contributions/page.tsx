"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileDown, Trash2, Eye, X } from "lucide-react";
import { CONTRIBUTION_TYPES, isContributionType } from "@/lib/contributions";

interface Contribution {
  id: string;
  type: string;
  name: string;
  address: string | null;
  description: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 50;

export default function ContributionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteProgress, setDeleteProgress] = useState<{ current: number; total: number } | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  const typeParam = searchParams.get("type");
  const fromParam = searchParams.get("from") ?? "";
  const toParam = searchParams.get("to") ?? "";

  const filtersKey = useMemo(() => {
    const safeType = isContributionType(typeParam) ? typeParam : "";
    return `${safeType}|${fromParam}|${toParam}`;
  }, [typeParam, fromParam, toParam]);

  const lastFiltersKeyRef = useRef(filtersKey);
  const skipNextFetchRef = useRef(false);

  const fetchContributions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      if (isContributionType(typeParam)) params.set("type", typeParam);
      if (fromParam) params.set("from", fromParam);
      if (toParam) params.set("to", toParam);
      params.set("tzOffset", String(new Date().getTimezoneOffset()));

      const response = await fetch(`/api/contributions?${params.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error ?? `Request failed (${response.status})`);
      }
      const data = await response.json();
      setContributions(Array.isArray(data.contributions) ? data.contributions : []);
      setPagination(data.pagination ?? null);
      if (typeof data.pagination?.page === "number" && data.pagination.page !== page) {
        skipNextFetchRef.current = true;
        setPage(data.pagination.page);
      }
    } catch (error) {
      console.error("Error fetching contributions:", error);
      setContributions([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    const filtersChanged = lastFiltersKeyRef.current !== filtersKey;
    if (filtersChanged) {
      lastFiltersKeyRef.current = filtersKey;
      setSelectedIds([]);
      setSelectedContribution(null);
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    fetchContributions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, page]);

  const updateQuery = (updates: { type?: string | null; from?: string | null; to?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.type !== undefined) {
      if (updates.type) params.set("type", updates.type);
      else params.delete("type");
    }
    if (updates.from !== undefined) {
      if (updates.from) params.set("from", updates.from);
      else params.delete("from");
    }
    if (updates.to !== undefined) {
      if (updates.to) params.set("to", updates.to);
      else params.delete("to");
    }

    const query = params.toString();
    router.push(`/admin/dashboard/contributions${query ? `?${query}` : ""}`);
  };

  const handleDownloadPdf = async () => {
    setPdfDownloading(true);
    try {
      const params = new URLSearchParams();
      if (isContributionType(typeParam)) params.set("type", typeParam);
      if (fromParam) params.set("from", fromParam);
      if (toParam) params.set("to", toParam);
      params.set("tzOffset", String(new Date().getTimezoneOffset()));

      const response = await fetch(`/api/contributions/report?${params.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error ?? `Failed to generate PDF (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
      const filename = match?.[1] ?? "public-contributions-report.pdf";

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      const message = error instanceof Error ? error.message : "Failed to download PDF report";
      alert(message);
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contribution?")) return;

    try {
      await fetch(`/api/contributions/${id}`, { method: "DELETE" });
      fetchContributions();
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error("Error deleting contribution:", error);
      alert("Failed to delete contribution");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("Please select contributions to delete");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} contribution(s)?`)) return;

    setDeleteProgress({ current: 0, total: selectedIds.length });

    try {
      for (let i = 0; i < selectedIds.length; i++) {
        await fetch(`/api/contributions/${selectedIds[i]}`, { method: "DELETE" });
        setDeleteProgress({ current: i + 1, total: selectedIds.length });
      }
      
      fetchContributions();
      setSelectedIds([]);
      setDeleteProgress(null);
    } catch (error) {
      console.error("Error deleting contributions:", error);
      alert("Failed to delete some contributions");
      setDeleteProgress(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === contributions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contributions.map(c => c.id));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Testimonials":
        return "bg-blue-100 text-blue-800";
      case "Prayer Requests":
        return "bg-purple-100 text-purple-800";
      case "Intentions":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const selectedTypeValue = isContributionType(typeParam) ? typeParam : "All";
  const total = pagination?.total ?? contributions.length;
  const limit = pagination?.limit ?? PAGE_SIZE;
  const totalPages = pagination?.totalPages ?? 1;
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = total === 0 ? 0 : Math.min(page * limit, total);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Public Interventions</h1>
          <p className="text-stone-600">Manage testimonials, prayer requests, and intentions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={pdfDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download PDF report"
          >
            <FileDown className="h-4 w-4" />
            {pdfDownloading ? "Preparing PDF..." : "Download PDF"}
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleteProgress !== null}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <button
            onClick={fetchContributions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Delete Progress Modal */}
      {deleteProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">Deleting Contributions</h3>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-stone-600 mb-2">
                <span>Progress</span>
                <span>{deleteProgress.current} of {deleteProgress.total}</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-red-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${(deleteProgress.current / deleteProgress.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-stone-600">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">Deleting contributions...</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-stone-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              value={selectedTypeValue}
              onChange={(e) => {
                setSelectedIds([]);
                setSelectedContribution(null);
                if (e.target.value === "All") updateQuery({ type: null });
                else updateQuery({ type: e.target.value });
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="All">All</option>
              {CONTRIBUTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              From
            </label>
            <input
              type="date"
              value={fromParam}
              onChange={(e) => {
                setSelectedIds([]);
                setSelectedContribution(null);
                updateQuery({ from: e.target.value || null });
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              To
            </label>
            <input
              type="date"
              value={toParam}
              onChange={(e) => {
                setSelectedIds([]);
                setSelectedContribution(null);
                updateQuery({ to: e.target.value || null });
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => updateQuery({ from: null, to: null })}
              className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              type="button"
            >
              Clear Dates
            </button>
            <button
              onClick={fetchContributions}
              disabled={loading}
              className="flex-1 px-3 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Contributions List */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-600">Loading...</div>
        ) : contributions.length === 0 ? (
          <div className="p-8 text-center text-stone-600">No contributions found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === contributions.length && contributions.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-accent focus:ring-accent rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {contributions.map((contribution) => (
                    <tr key={contribution.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(contribution.id)}
                          onChange={() => toggleSelect(contribution.id)}
                          className="w-4 h-4 text-accent focus:ring-accent rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(contribution.type)}`}>
                          {contribution.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">
                        {contribution.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600 max-w-xs truncate">
                        {contribution.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                        {new Date(contribution.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedContribution(contribution)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contribution.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-6 py-4 border-t border-stone-200 bg-white">
              <div className="text-sm text-stone-600">
                Showing <span className="font-medium text-stone-900">{startIndex}</span> to{" "}
                <span className="font-medium text-stone-900">{endIndex}</span> of{" "}
                <span className="font-medium text-stone-900">{total}</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => {
                    setSelectedIds([]);
                    setSelectedContribution(null);
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  disabled={loading || page <= 1}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="text-sm text-stone-600 px-2">
                  Page <span className="font-medium text-stone-900">{page}</span> of{" "}
                  <span className="font-medium text-stone-900">{totalPages}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedIds([]);
                    setSelectedContribution(null);
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  disabled={loading || page >= totalPages}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Modal */}
      {selectedContribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Contribution Details
                </h2>
                <button
                  onClick={() => setSelectedContribution(null)}
                  className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Type</label>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(selectedContribution.type)}`}>
                  {selectedContribution.type}
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Name</label>
                <p className="text-stone-900">{selectedContribution.name}</p>
              </div>

              {selectedContribution.address && (
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Address</label>
                  <p className="text-stone-900">{selectedContribution.address}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Description</label>
                <p className="text-stone-900 whitespace-pre-wrap">{selectedContribution.description}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Submitted On</label>
                <p className="text-stone-900">
                  {new Date(selectedContribution.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200">
                <button
                  onClick={() => {
                    handleDelete(selectedContribution.id);
                    setSelectedContribution(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Contribution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
