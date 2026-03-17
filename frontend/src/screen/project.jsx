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
    }
  }, [props.children]);

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

  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const messageBoxRef = useRef(null);

  /* ---------------- Init ---------------- */
  useEffect(() => {
    if (!project?._id) return;

    initializeSocket(project._id);
    getWebContainer().then(setWebContainer);

    receiveMessage("project-message", (data) => {
      if (data?.sender?._id === "ai") setAiTyping(false);
      setMessages((p) => [...p, data]);
    });

    axios
      .get(`/projects/${project._id}`)
      .then((res) => {
        setProject(res.data.project);
        setFileTree(res.data.project.fileTree || {});
      })
      .catch(console.error);

    return () => {
      receiveMessage("project-message", null);
    };
  }, [project?._id]);

  /* ---------------- Auto Scroll ---------------- */
  useEffect(() => {
    messageBoxRef.current?.scrollTo({
      top: messageBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  /* ---------------- Fetch Users ---------------- */
  useEffect(() => {
    if (!showCollaboratorModal) return;

    axios
      .get("/users/all")
      .then((res) => setAllUsers(res.data.users || []))
      .catch(console.error);
  }, [showCollaboratorModal]);

  /* ---------------- Send Message ---------------- */
  const send = () => {
    if (!message.trim()) return;

    const payload = {
      message: message.trim(),
      sender: user,
    };

    sendMessage("project-message", payload);
    setMessages((p) => [...p, payload]);

    if (message.trim().startsWith("@ai")) {
      setAiTyping(true);
    }

    setMessage("");
  };

  /* ---------------- AI Message Render ---------------- */
  const renderAiMessage = (msg) => {
    try {
      const parsed = JSON.parse(msg);

      return (
        <div className="bg-purple-900 text-white p-3 rounded-xl">
          <Markdown options={{ overrides: { code: SyntaxHighlightedCode } }}>
            {parsed.text}
          </Markdown>
        </div>
      );
    } catch {
      return (
        <div className="bg-purple-900 text-white p-3 rounded-xl">
          {msg}
        </div>
      );
    }
  };

  /* ---------------- Run Project ---------------- */
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

  /* ---------------- Add Collaborator ---------------- */
  const addCollaborator = async () => {
    if (!selectedUser) return;

    await axios.put("/projects/add-user", {
      projectId: project._id,
      users: [selectedUser._id],
    });

    alert("Collaborator added");
    setShowCollaboratorModal(false);
  };

  return (
    <main className="h-screen flex bg-slate-100">

      {/* CHAT */}
      <aside className="w-96 bg-white border-r flex flex-col">
        <div ref={messageBoxRef} className="flex-grow overflow-auto p-3 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`p-3 rounded-xl ${
              msg?.sender?._id === user?._id
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200"
            }`}>
              <small>{msg?.sender?.email}</small>

              {msg?.sender?._id === "ai"
                ? renderAiMessage(msg.message)
                : msg.message}
            </div>
          ))}

          {aiTyping && <p className="text-xs italic">AI is thinking...</p>}
        </div>

        <div className="flex border-t">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-grow p-3"
          />
          <button onClick={send} className="px-4 bg-black text-white">
            Send
          </button>
        </div>
      </aside>

      {/* EDITOR */}
      <section className="flex-grow flex flex-col">

        <div className="flex border-b">
          {openFiles.map((f) => (
            <button key={f} onClick={() => setCurrentFile(f)}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex-grow p-4">
          {currentFile && fileTree[currentFile] && (
            <pre>
              <code
                contentEditable
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
                    fileTree[currentFile].file.contents,
                    { language: "javascript" }
                  ).value,
                }}
              />
            </pre>
          )}
        </div>
      </section>

      {/* PREVIEW */}
      {iframeUrl && <iframe src={iframeUrl} className="w-96" />}
    </main>
  );
};

export default Project;