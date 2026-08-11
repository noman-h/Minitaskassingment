import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const userid = localStorage.getItem("userid");

  // Server state
  const [tasks, settasks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  // Filter, Search, Sort & Pagination states
  const [currenttab, setcurrenttab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dueDateAsc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6); // Default 6 tasks per page

 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    duedate: "",
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [sheetLink, setSheetLink] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const [debouncedsearch,setdebouncedsearch]=useState("")
  function debouncedsearchcall(search){
    const handler=setTimeout(()=>{
        setdebouncedsearch(searchQuery)
    },1000)
  }

    const token = localStorage.getItem("token");
  async function gettasks() {
    try {
    

      // Construct query string
      const query = new URLSearchParams({
        page,
        limit,
        status: currenttab,
        search: searchQuery,
        sortBy,
      }).toString();

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/task/gettask/${userid}?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Support for paginated payload response or fallback array
      if (response.data.tasks) {
        settasks(response.data.tasks);
        setTotalPages(response.data.totalPages || 1);
        setTotalTasks(response.data.totalTasks || 0);
      } else if (Array.isArray(response.data)) {
        settasks(response.data);
        setTotalPages(1);
        setTotalTasks(response.data.length);
      }
    } catch (err) {
         if(err.status===403){
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     navigate('/login')
    }
      console.error("Error fetching tasks:", err);
    }
  }

  // Refetch data when filter, search, sort, page or limit changes
  useEffect(() => {
    if (userid) {
      gettasks();
    }
  }, [userid, currenttab, debouncedsearch, sortBy, page, limit]);

  const handleTabChange = (tab) => {
    setcurrenttab(tab);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    debouncedsearchcall(searchQuery)
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Modal for Editing a Task
  const handleOpenEditModal = (task) => {
    setEditingTaskId(task._id);
    const formattedDate = task.duedate
      ? new Date(task.duedate).toISOString().split("T")[0]
      : "";

    setTaskData({
      ...task,
      duedate: formattedDate,
    });
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTaskId(null);
    setTaskData({ title: "", description: "", duedate: "" });
  };

  // Import Sheet Handlers
  const handleOpenImportModal = () => {
    setSheetLink("");
    setIsImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setSheetLink("");
  };

  const handleImportSheetSubmit = async (e) => {
    e.preventDefault();
    if (!sheetLink.trim()) return;

    setIsImporting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/task/addtasksheet`,
        { url: sheetLink, userid },
         {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Spreadsheet imported successfully!");
        gettasks();
        handleCloseImportModal();
      }
    } catch (err) {   
        console.log(err.status);
        
    if(err.status===403){
     handleCloseImportModal();
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     navigate('/login')
    }
   
      alert(`Failed to import spreadsheet.${err?.response?.data?.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Create or Update Task Submit Handler
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (editingTaskId) {
        const result = await axios.put(
          `${import.meta.env.VITE_API_URL}/task/taskupdate`,
          taskData,
           {
          headers: { Authorization: `Bearer ${token}` },
        }
        );

        if (result.status === 200 || result.status === 201) {
          alert("Task updated successfully!");
          gettasks();
          handleCloseModal();
        }
      } else {
        const result = await axios.post(
          `${import.meta.env.VITE_API_URL}/task/addtask`,
          { ...taskData, userid },
           {
          headers: { Authorization: `Bearer ${token}` },
        }
        );

        if (result.status === 201) {
          alert("Task added successfully!");
          gettasks();
          handleCloseModal();
        }
      }
    } catch (err) {
         if(err.status===403){
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     navigate('/login')
    }
      console.error("Error saving task:", err);
    }
  };

  // Update Task Status
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/task/taskstatus?id=${taskId}&status=${newStatus}`,{},
         {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      gettasks();
    } catch (err) {
         if(err.status===403){
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     navigate('/login')
    }
      console.error("Error updating status:", err);
    }
  };

  // Delete Task Function
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/task/taskdelete/${taskId}`,
           {
          headers: { Authorization: `Bearer ${token}` },
        }
        );
        gettasks();
      } catch (err) {
         if(err.status===403){
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     navigate('/login')
    }
        console.error("Error deleting task:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        
        {/* Action Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Task Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage and organize your daily tasks.
            </p>
          </div>

          {/* Header Controls: Filter Tabs & Primary Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {["All", "Pending", "Uncompleted", "Completed"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    currenttab === tab
                      ? "bg-white text-teal-600 shadow-sm dark:bg-slate-700 dark:text-teal-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {/* Action Buttons */}
            <button
              type="button"
              onClick={handleOpenImportModal}
              className="rounded-lg border border-slate-300 bg-transparent px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Import Sheet
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingTaskId(null);
                setTaskData({ title: "", description: "", duedate: "" });
                setIsModalOpen(true);
              }}
              className="rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              + Add Task
            </button>
          </div>
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Per Page Items Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Show:
              </label>
              <select
                value={limit}
                onChange={handleLimitChange}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-teal-400"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-teal-400"
              >
                <option value="dueDateAsc">Due Date (Earliest First)</option>
                <option value="dueDateDesc">Due Date (Latest First)</option>
                <option value="titleAsc">Title (A – Z)</option>
                <option value="titleDesc">Title (Z – A)</option>
                <option value="createdNewest">Recently Added</option>
                <option value="createdOldest">Oldest Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Cards Grid */}
        {tasks.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white capitalize">
                      {task.title}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        task.status === "completed"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : task.status === "uncompleted"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {task.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Due:</span>{" "}
                    {new Date(task.duedate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  {/* Task Action Buttons */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(task._id, "completed")}
                        disabled={task.status === "completed"}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
                      >
                        ✓ Complete
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(task._id, "pending")}
                        disabled={task.status === "pending"}
                        className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
                      >
                        ↺ Pending
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(task._id, "uncompleted")}
                        disabled={task.status === "uncompleted"}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        ✕ Uncompleted
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(task)}
                        className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task._id)}
                        className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-sm text-slate-400 dark:text-slate-500">
              No tasks found matching your criteria.
            </p>
          </div>
        )}

        {/* Backend Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-white">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-medium text-slate-900 dark:text-white">{Math.min(page * limit, totalTasks)}</span> of{" "}
              <span className="font-medium text-slate-900 dark:text-white">{totalTasks}</span> tasks
            </div>

            <div className="flex items-center gap-1.5">
              {/* Previous Page Button */}
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Previous
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                    page === p
                      ? "bg-teal-600 text-white dark:bg-teal-500"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {p}
                </button>
              ))}

              {/* Next Page Button */}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTaskId ? "Edit Task" : "Add New Task"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-bold text-teal-700 dark:text-teal-400">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={taskData.title}
                  onChange={handleChange}
                  required
                  placeholder="Task title"
                  className="rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-teal-400"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-bold text-teal-700 dark:text-teal-400">
                  Description
                </label>
                <textarea
                  name="description"
                  value={taskData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Task description"
                  className="rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-teal-400"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-bold text-teal-700 dark:text-teal-400">
                  Due Date
                </label>
                <input
                  type="date"
                  name="duedate"
                  value={taskData.duedate}
                  onChange={handleChange}
                  required
                  className="rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-teal-400"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:bg-teal-500 dark:hover:bg-teal-600"
                >
                  {editingTaskId ? "Update Task" : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Sheet Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Import Sheet
              </h2>
              <button
                type="button"
                onClick={handleCloseImportModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSheetSubmit} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-bold text-teal-700 dark:text-teal-400">
                  Spreadsheet Link
                </label>
                <input
                  type="url"
                  name="sheetLink"
                  value={sheetLink}
                  onChange={(e) => setSheetLink(e.target.value)}
                  required
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-teal-400"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Provide a public or shared Google Sheets URL.
                </p>
              </div>

              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseImportModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-600"
                >
                  {isImporting ? "Importing..." : "Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;