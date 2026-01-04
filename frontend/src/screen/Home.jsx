import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios";
import image from "../assets/chat.gif";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const searchRef = useRef(null);

  /* -------------------------------------------------------------------------- */
  /* FETCH PROJECTS */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    axiosInstance
      .get("/projects/all")
      .then((res) => {
        setProjects(res.data.projects);
        setFilteredProjects(res.data.projects);
      })
      .catch(() => setError("⚠️ Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  /* -------------------------------------------------------------------------- */
  /* SEARCH (DEBOUNCED) */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      const filtered = projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProjects(filtered);
    }, 200);

    return () => clearTimeout(t);
  }, [search, projects]);

  /* -------------------------------------------------------------------------- */
  /* KEYBOARD SHORTCUTS */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsModalOpen(true);
      }
      if (e.key === "Escape") setIsModalOpen(false);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* AUTO FOCUS */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isModalOpen]);

  /* -------------------------------------------------------------------------- */
  /* CREATE PROJECT */
  /* -------------------------------------------------------------------------- */
  const createProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      setCreateLoading(true);

      const res = await axiosInstance.post("/projects/create", {
        name: projectName.trim(),
      });

      setProjects((prev) => [res.data.project, ...prev]);
      setFilteredProjects((prev) => [res.data.project, ...prev]);

      setProjectName("");
      setIsModalOpen(false);
    } catch {
      setError("❌ Failed to create project");
    } finally {
      setCreateLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              DevBoard ⚡
            </h1>
            <p className="text-sm text-slate-400">
              Collaborative coding · realtime · AI-powered
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-3 items-center">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="px-4 py-2 rounded-md bg-white/10 border border-white/20 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition shadow-lg"
            >
              + New Project
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="flex justify-center my-10 px-4">
        <img
          src={image}
          alt="Collaboration"
          className="w-full max-w-2xl rounded-xl shadow-2xl border border-white/10"
        />
      </section>

      {/* PROJECT GRID */}
      <section className="px-6 pb-14">
        {loading ? (
          <p className="text-center text-slate-400">Loading projects…</p>
        ) : filteredProjects.length === 0 ? (
          <p className="text-center text-slate-400">
            🚀 No projects found. Create your first one!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((proj) => (
              <div
                key={proj._id}
                onClick={() =>
                  navigate("/project", { state: { project: proj } })
                }
                className="group relative bg-white/10 backdrop-blur-md border border-white/10
                rounded-xl p-5 cursor-pointer transition-all
                hover:-translate-y-2 hover:shadow-2xl hover:border-blue-500/40"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500
                flex items-center justify-center font-bold mb-3">
                  {proj.name[0]?.toUpperCase()}
                </div>

                <h3 className="text-lg font-bold truncate">
                  {proj.name}
                </h3>

                <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                  👥 {proj.users.length} collaborator
                  {proj.users.length !== 1 && "s"}
                </p>

                {/* Hover info */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                bg-gradient-to-br from-blue-500/10 to-indigo-500/10 transition" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-900 rounded-xl shadow-2xl w-11/12 max-w-md p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">
              🚀 Create New Project
            </h2>

            <form onSubmit={createProject}>
              <input
                ref={inputRef}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                className="w-full px-4 py-2 rounded-md bg-black/40 border border-white/20
                outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/10 rounded-md"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createLoading ? "Creating…" : "Create"}
                </button>
              </div>
            </form>

            <p className="text-xs text-slate-400 mt-4">
              Tip: Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to open this modal
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-center text-red-400 pb-6">
          {error}
        </p>
      )}
    </main>
  );
};

export default Home;
