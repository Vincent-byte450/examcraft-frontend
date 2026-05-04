import React, { useState } from "react";
import { Download, FileText, FileJson, FileType, Loader2 } from "lucide-react";
import { API_BASE } from "./api";

const ExportButton = ({ data, defaultFormat = "pdf" }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState(defaultFormat);
  const [coverPage, setCoverPage] = useState({
    schoolName: "",
    teacherName: "",
    department: "",
    year: new Date().getFullYear(),
    motto: "",
  });
  const [message, setMessage] = useState("");

  const handleExport = async () => {
    if (!data) {
      setMessage("No data available to export.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/schemes/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          format: exportFormat,
          coverPage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Trigger file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Enhanced_Scheme_${coverPage.year}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMessage(`File exported successfully as ${exportFormat.toUpperCase()}`);
      setShowModal(false);
    } catch (error) {
      console.error("Export error:", error);
      setMessage("Failed to export file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {/* Cover Page Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-lg p-6 relative">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Export Scheme of Work
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Update cover page details before exporting your enhanced scheme.
            </p>

            {/* Cover Page Form */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  School Name
                </label>
                <input
                  type="text"
                  value={coverPage.schoolName}
                  onChange={(e) =>
                    setCoverPage({ ...coverPage, schoolName: e.target.value })
                  }
                  className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g. Greenfield High School"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teacher Name
                </label>
                <input
                  type="text"
                  value={coverPage.teacherName}
                  onChange={(e) =>
                    setCoverPage({ ...coverPage, teacherName: e.target.value })
                  }
                  className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g. Mr. John Mwangi"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Department
                </label>
                <input
                  type="text"
                  value={coverPage.department}
                  onChange={(e) =>
                    setCoverPage({ ...coverPage, department: e.target.value })
                  }
                  className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g. Mathematics Department"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Year
                </label>
                <input
                  type="number"
                  value={coverPage.year}
                  onChange={(e) =>
                    setCoverPage({ ...coverPage, year: e.target.value })
                  }
                  className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Motto / Notes
                </label>
                <textarea
                  value={coverPage.motto}
                  onChange={(e) =>
                    setCoverPage({ ...coverPage, motto: e.target.value })
                  }
                  rows={2}
                  className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="e.g. 'Education for All'"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Export Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="docx">Word Document (.docx)</option>
                  <option value="json">Raw JSON (.json)</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileType className="w-4 h-4" />
                    Export {exportFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ExportButton;