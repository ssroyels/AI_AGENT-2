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
      .catch(() => setError("Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  /* -------------------------------------------------------------------------- */
  /* SEARCH FILTER */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const filtered = projects.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [search, projects]);

  /* -------------------------------------------------------------------------- */
  /* AUTO FOCUS MODAL INPUT */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
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

      // Optimistic UI
      setProjects((prev) => [res.data.project, ...prev]);
      setFilteredProjects((prev) => [res.data.project, ...prev]);

      setProjectName("");
      setIsModalOpen(false);
    } catch {
      setError("Failed to create project");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}
      <div className="bg-white shadow-md py-6 px-4 md:px-10 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            DevBoard
            <span className="ml-2 text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">
              {projects.length} Projects
            </span>
          </h1>
          <p className="text-sm text-gray-500">
            Manage your collaborative coding projects
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <i className="ri-add-line"></i>
          New Project
        </button>
      </div>

      {/* ILLUSTRATION */}
      <div className="flex justify-center my-6 px-4">
        <img
          src={image}
          alt="Collaboration"
          className="w-full max-w-xl rounded-md shadow-md"
        />
      </div>

      {/* SEARCH */}
      <div className="px-4 md:px-10 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full md:w-1/3 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* PROJECT GRID */}
      <section className="px-4 md:px-10 pb-10">
        {loading ? (
          <p className="text-center text-gray-500">Loading projects...</p>
        ) : filteredProjects.length === 0 ? (
          <p className="text-center text-gray-500">
            No projects found 🚀
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((proj) => (
              <div
                key={proj._id}
                onClick={() =>
                  navigate("/project", { state: { project: proj } })
                }
                className="bg-white p-4 rounded-lg shadow hover:shadow-xl transition cursor-pointer hover:-translate-y-1"
              >
                <h3 className="text-lg font-bold text-slate-800 truncate">
                  {proj.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  <i className="ri-user-3-line mr-1"></i>
                  {proj.users.length} Collaborator
                  {proj.users.length !== 1 && "s"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div
          onKeyDown={(e) => e.key === "Escape" && setIsModalOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-md w-11/12 max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Create New Project
            </h2>

            <form onSubmit={createProject}>
              <input
                ref={inputRef}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  {createLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <p className="text-center text-red-500 pb-4">{error}</p>
      )}
    </main>
  );
};

export default Home;
