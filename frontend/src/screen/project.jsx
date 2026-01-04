import { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../context/user.context";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import { getWebContainer } from "../config/webContainer";

/* ---------------- Syntax Highlight ---------------- */
function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && props.className?.includes("lang-")) {
      hljs.highlightElement(ref.current);
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.children, props.className]);

  return <code {...props} ref={ref} />;
}

const Project = () => {
  const { state } = useLocation();
  const { user } = useContext(UserContext);

  const [project, setProject] = useState(state?.project);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);

  const [aiTyping, setAiTyping] = useState(false);
  const [runLoading, setRunLoading] = useState(false);

  /* Collaborator */
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const messageBoxRef = useRef(null);

  /* Header animation */
  const words = ["LIVE", "CODING", "AI", "RUNNING"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setWordIndex((i) => (i + 1) % words.length),
      1200
    );
    return () => clearInterval(t);
  }, []);

  /* Init */
  useEffect(() => {
    if (!project?._id) return;

    initializeSocket(project._id);
    getWebContainer().then(setWebContainer);

    receiveMessage("project-message", (data) => {
      if (data?.sender?._id === "ai") setAiTyping(false);
      setMessages((p) => [...p, data]);
    });

    axios.get(`/projects/get-project/${project._id}`).then((res) => {
      setProject(res.data.project);
      setFileTree(res.data.project.fileTree || {});
    });
  }, [project?._id]);

  /* Fetch users */
  useEffect(() => {
    if (!showCollaboratorModal) return;
    setLoadingUsers(true);

    axios
      .get("/users/all")
      .then((res) => setAllUsers(res.data.users || []))
      .finally(() => setLoadingUsers(false));
  }, [showCollaboratorModal]);

  /* Auto scroll */
  useEffect(() => {
    messageBoxRef.current?.scrollTo({
      top: messageBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  /* Send message */
  const send = () => {
    if (!message.trim()) return;

    sendMessage("project-message", { message, sender: user });
    setMessages((p) => [...p, { sender: user, message }]);

    if (message.includes("@ai")) setAiTyping(true);
    setMessage("");
  };

  /* AI render */
  const renderAiMessage = (msg) => {
    const parsed = JSON.parse(msg);
    return (
      <div className="bg-gradient-to-br from-purple-900 to-slate-900 text-white p-3 rounded-xl">
        <Markdown options={{ overrides: { code: SyntaxHighlightedCode } }}>
          {parsed.text}
        </Markdown>
      </div>
    );
  };

  /* Run project */
  const runProject = async () => {
    if (!webContainer) return;

    setRunLoading(true);
    await webContainer.mount(fileTree);

    if (runProcess) runProcess.kill();

    const proc = await webContainer.spawn("npm", ["start"]);
    setRunProcess(proc);

    webContainer.on("server-ready", (_, url) => {
      setIframeUrl(url);
      setRunLoading(false);
    });
  };

  /* Add collaborator */
  const addCollaborator = async () => {
    if (!selectedUser) return;

    await axios.put("/projects/add-user", {
      projectId: project._id,
      users: [selectedUser._id],
    });

    setSelectedUser(null);
    setShowCollaboratorModal(false);
  };

  return (
    <main className="h-screen w-screen flex flex-col bg-slate-100">
      {/* HEADER */}
      <header className="px-6 py-3 flex justify-between items-center
        bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow">
        <div>
          <h1 className="font-bold text-lg">{project?.name}</h1>
          <p className="text-xs text-slate-300">
            Realtime Workspace · {words[wordIndex]}
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => setShowCollaboratorModal(true)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
          >
            + Collaborator
          </button>

          <button
            onClick={runProject}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded-md text-sm"
          >
            {runLoading ? "Running..." : "▶ Run"}
          </button>
        </div>
      </header>

      {/* BODY */}
      <section className="flex flex-grow overflow-hidden">
        {/* CHAT */}
        <aside className="w-96 bg-white border-r flex flex-col">
          <div
            ref={messageBoxRef}
            className="flex-grow overflow-auto p-3 space-y-3"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[75%] p-3 rounded-xl shadow text-sm
                ${
                  msg?.sender?._id === user?._id
                    ? "ml-auto bg-blue-500 text-white"
                    : "bg-slate-100"
                }`}
              >
                <small className="opacity-60 block">
                  {msg?.sender?.email}
                </small>

                {msg?.sender?._id === "ai"
                  ? renderAiMessage(msg.message)
                  : msg.message}
              </div>
            ))}

            {aiTyping && (
              <p className="text-xs text-gray-500 italic">
                AI is thinking...
              </p>
            )}
          </div>

          <div className="border-t flex">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type message… (@ai)"
              className="flex-grow p-3 outline-none text-sm"
            />
            <button
              onClick={send}
              className="px-4 bg-slate-900 text-white"
            >
              Send
            </button>
          </div>
        </aside>

        {/* EDITOR */}
        <section className="flex-grow flex flex-col bg-white">
          <div className="flex bg-slate-200 border-b">
            {openFiles.map((f) => (
              <button
                key={f}
                onClick={() => setCurrentFile(f)}
                className={`px-4 py-2 text-sm border-r
                ${
                  currentFile === f
                    ? "bg-slate-800 text-white"
                    : "hover:bg-slate-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-grow overflow-auto p-4">
            {currentFile && fileTree[currentFile] && (
              <pre className="rounded-lg overflow-auto shadow-inner">
                <code
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    setFileTree({
                      ...fileTree,
                      [currentFile]: {
                        file: { contents: e.target.innerText },
                      },
                    })
                  }
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(
                      "javascript",
                      fileTree[currentFile].file.contents
                    ).value,
                  }}
                />
              </pre>
            )}
          </div>
        </section>

        {iframeUrl && (
          <iframe src={iframeUrl} className="w-96 border-l" />
        )}
      </section>

      {/* COLLAB MODAL */}
      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-96 space-y-3">
            <h2 className="font-semibold">Add Collaborator</h2>

            {loadingUsers && <p className="text-sm">Loading...</p>}

            <ul className="space-y-2 max-h-60 overflow-auto">
              {allUsers.map((u) => (
                <li
                  key={u._id}
                  onClick={() => setSelectedUser(u)}
                  className={`p-2 border rounded cursor-pointer
                  ${
                    selectedUser?._id === u._id
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </li>
              ))}
            </ul>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCollaboratorModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={addCollaborator}
                disabled={!selectedUser}
                className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
