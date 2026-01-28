import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
import {
  DataGrid,
  Column,
  Paging,
  Pager,
  SearchPanel,
} from "devextreme-react/data-grid";
import {
  Download,
  RefreshCw,
  Database,
  AlertCircle,
  Calendar,
  HardDrive,
  FileArchive,
} from "lucide-react";

const Backup = () => {
  const { t } = useLanguage();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({});

  // Fetch backups data
  useEffect(() => {
    fetchBackups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/backups");
      const apiData = response.data?.data;

      if (apiData && apiData.backups && Array.isArray(apiData.backups)) {
        // Format backups data for display
        const formattedBackups = apiData.backups.map((backup, index) => ({
          id: index + 1, // For table display
          backupId: backup.id,
          name: backup.name,
          size: backup.size,
          createdAt: backup.created_at,
          downloadLink: backup.links?.download || "",
          formattedDate: new Date(backup.created_at).toLocaleString(),
        }));

        setBackups(formattedBackups);
      } else {
        setError(
          t("noBackupsData", "backup") ||
            "No backups data found or invalid format",
        );
        setBackups([]);
      }
    } catch (err) {
      console.error("Error fetching backups:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("loadBackupsFailed", "backup") ||
          "Failed to load backups",
      );
      setBackups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backup) => {
    if (!backup.downloadLink) {
      alert(t("noDownloadLink", "backup") || "No download link available");
      return;
    }

    try {
      // Set downloading state for this specific backup
      setDownloading((prev) => ({ ...prev, [backup.backupId]: true }));

      // Get token from localStorage
      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        alert(
          t("noAuthToken", "backup") ||
            "Authentication token not found. Please login again.",
        );
        setDownloading((prev) => ({ ...prev, [backup.backupId]: false }));
        return;
      }

      // Send GET request to download link WITH TOKEN
      const response = await api.get(backup.downloadLink, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`, // إضافة التوكن
          Accept: "application/zip, application/octet-stream, */*",
        },
      });

      if (response.data) {
        // Create blob from response
        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/zip",
        });

        // Check blob size
        if (blob.size === 0) {
          throw new Error("Downloaded file is empty");
        }

        // Create download URL
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = backup.name;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        // Show success message
        setTimeout(() => {
          alert(
            t("downloadSuccess", "backup", { name: backup.name }) ||
              `Backup "${backup.name}" downloaded successfully`,
          );
        }, 300);
      } else {
        throw new Error("No data received from server");
      }
    } catch (err) {
      console.error("Error downloading backup:", err);

      if (err.response?.status === 401) {
        // Unauthorized - token expired or invalid
        alert(
          t("sessionExpired", "backup") ||
            "Your session has expired. Please login again.",
        );
      } else if (err.response?.status === 404) {
        // File not found
        alert(
          t("backupNotFound", "backup") ||
            `Backup "${backup.name}" not found on server.`,
        );
      } else if (err.message === "Downloaded file is empty") {
        alert(
          t("emptyFile", "backup") ||
            "Downloaded file is empty. Please try again.",
        );
      } else {
        // Try alternative method with fetch if axios fails
        try {
          console.log("Trying fetch as fallback...");
          await downloadWithFetch(backup);
        } catch (fetchErr) {
          console.error("Fetch fallback also failed:", fetchErr);
          showErrorAlert(backup.name, err.message);
        }
      }
    } finally {
      // Reset downloading state
      setTimeout(() => {
        setDownloading((prev) => ({ ...prev, [backup.backupId]: false }));
      }, 1000);
    }
  };

  // Alternative download function using fetch
  const downloadWithFetch = async (backup) => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token");
    }

    const response = await fetch(backup.downloadLink, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/zip, application/octet-stream",
      },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed with status: ${response.status}`);
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error("Empty file received");
    }

    // Create and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = backup.name;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    // Success message
    setTimeout(() => {
      alert(
        t("downloadSuccess", "backup", { name: backup.name }) ||
          `Backup "${backup.name}" downloaded successfully (via fetch)`,
      );
    }, 300);
  };

  // Helper function for error alerts
  const showErrorAlert = (backupName, errorMessage = "") => {
    let message =
      t("downloadError", "backup") ||
      `Error downloading backup "${backupName}".`;

    if (errorMessage) {
      message += ` Error: ${errorMessage}`;
    }

    message += " Please try again or contact support.";

    alert(message);
  };

  // Render actions column
  const actionsCellRender = (data) => {
    const isDownloading = downloading[data.data.backupId];

    return (
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => handleDownloadBackup(data.data)}
          disabled={isDownloading || !data.data.downloadLink}
          className={`p-2 rounded-lg transition ${
            isDownloading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : data.data.downloadLink
                ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          title={
            isDownloading
              ? t("downloading", "backup") || "Downloading..."
              : t("downloadBackup", "backup") || "Download Backup"
          }
        >
          {isDownloading ? (
            <RefreshCw className="animate-spin" size={18} />
          ) : (
            <Download size={18} />
          )}
        </button>
      </div>
    );
  };

  // Render backup name cell
  const nameCellRender = (data) => {
    return (
      <div className="flex items-center space-x-3">
        <FileArchive className="text-gray-500" size={20} />
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{data.data.name}</span>
          <span className="text-xs text-gray-500">
            ID: {data.data.backupId}
          </span>
        </div>
      </div>
    );
  };

  // Render size cell
  const sizeCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <HardDrive className="text-gray-400" size={16} />
        <span className="font-medium text-gray-700">{data.data.size}</span>
      </div>
    );
  };

  // Render date cell
  const dateCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Calendar className="text-gray-400" size={16} />
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">
            {data.data.formattedDate}
          </span>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("databaseBackup", "backup") || "Database Backup"}
            </h1>
            <p className="text-gray-600">
              {t("manageDatabaseBackups", "backup") ||
                "Manage and download database backups"}
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto mb-4"></div>
            <p className="text-gray-600">
              {t("loadingBackups", "backup") || "Loading backups..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("databaseBackup", "backup") || "Database Backup"}
            </h1>
            <p className="text-gray-600">
              {t("manageDatabaseBackups", "backup") ||
                "Manage and download database backups"}
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoadingBackups", "backup") || "Error Loading Backups"}
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>

          <div className="flex space-x-3 mt-4">
            <button
              onClick={fetchBackups}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition flex items-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>{t("tryAgain", "common") || "Try Again"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("databaseBackup", "backup") || "Database Backup"}
          </h1>
          <p className="text-gray-600">
            {t("manageDatabaseBackups", "backup") ||
              "Manage and download database backups"}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={fetchBackups}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
            title={t("refresh", "common") || "Refresh"}
          >
            <RefreshCw size={18} />
            <span>{t("refresh", "common") || "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("totalBackups", "backup") || "Total Backups"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {backups.length}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Database className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("totalSize", "backup") || "Total Size"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {backups.length > 0
                  ? backups
                      .reduce((total, backup) => {
                        const size = parseFloat(backup.size) || 0;
                        return total + size;
                      }, 0)
                      .toFixed(2) + " KB"
                  : "0 KB"}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <HardDrive className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("latestBackup", "backup") || "Latest Backup"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {backups.length > 0
                  ? new Date(backups[0].createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Backups Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {backups.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {t("noBackupsFound", "backup") || "No Backups Found"}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("noBackupsMessage", "backup") ||
                "No database backups available yet."}
            </p>
            <button
              onClick={fetchBackups}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition inline-flex items-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>{t("refresh", "common") || "Refresh"}</span>
            </button>
          </div>
        ) : (
          <>
            {/* Table Header with Count */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database size={18} className="text-gray-500" />
                  <span className="font-medium text-gray-700">
                    {t("databaseBackups", "backup") || "Database Backups"}
                  </span>
                  <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                    {backups.length} {t("items", "backup") || "items"}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {t("sortedByDate", "backup") ||
                    "Sorted by date (newest first)"}
                </div>
              </div>
            </div>

            <DataGrid
              dataSource={backups}
              showBorders={true}
              columnAutoWidth={true}
              allowColumnResizing={true}
              columnMinWidth={50}
              height={500}
              allowColumnReordering={false}
              rowAlternationEnabled={true}
              showColumnLines={true}
              showRowLines={true}
            >
              <SearchPanel
                visible={true}
                placeholder={
                  t("searchBackups", "backup") || "Search backups..."
                }
              />
              <Paging defaultPageSize={10} />
              <Pager
                showPageSizeSelector={true}
                allowedPageSizes={[5, 10, 20]}
                showInfo={true}
                infoText={
                  t("pageInfoText", "backup") || "Page {0} of {1} ({2} items)"
                }
              />

              {/* ID Column */}
              <Column
                dataField="id"
                caption={t("id", "backup") || "ID"}
                width={80}
                alignment="center"
                allowGrouping={false}
                allowSorting={true}
              />

              {/* Backup Name Column */}
              <Column
                dataField="name"
                caption={t("backupName", "backup") || "Backup Name"}
                width="auto"
                alignment="left"
                allowGrouping={false}
                cellRender={nameCellRender}
              />

              {/* Size Column */}
              <Column
                dataField="size"
                caption={t("size", "backup") || "Size"}
                width={120}
                alignment="center"
                allowGrouping={false}
                cellRender={sizeCellRender}
              />

              {/* Created At Column */}
              <Column
                dataField="formattedDate"
                caption={t("createdAt", "backup") || "Created At"}
                width={200}
                alignment="left"
                allowGrouping={true}
                cellRender={dateCellRender}
              />

              {/* Download Column */}
              <Column
                caption={t("actions", "backup") || "Actions"}
                width={100}
                alignment="center"
                allowGrouping={false}
                cellRender={actionsCellRender}
              />
            </DataGrid>
          </>
        )}
      </div>

      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-blue-800">
            {t("backupInformation", "backup") || "Backup Information"}
          </h3>
        </div>
        <div className="space-y-2 text-sm text-blue-700">
          <p>
            •{" "}
            {t("backupInfo1", "backup") ||
              "Backups are automatically created on a regular basis"}
          </p>
          <p>
            •{" "}
            {t("backupInfo2", "backup") ||
              "Each backup contains a complete snapshot of the database"}
          </p>
          <p>
            •{" "}
            {t("backupInfo3", "backup") ||
              "Click the download button to save a backup locally"}
          </p>
          <p>
            •{" "}
            {t("backupInfo4", "backup") ||
              "Backups are compressed in ZIP format for efficient storage"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Backup;
