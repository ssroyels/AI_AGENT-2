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

/* -------------------------------------------------------------------------- */
/* SYNTAX HIGHLIGHTER */
/* -------------------------------------------------------------------------- */
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

  const [project, setProject] = useState(state.project);
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

  const messageBoxRef = useRef(null);

  /* -------------------------------------------------------------------------- */
  /* ROTATING STATUS WORD */
  /* -------------------------------------------------------------------------- */
  const words = ["LIVE", "CODING", "AI", "RUNNING"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* INIT SOCKET + DATA */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    initializeSocket(project._id);

    getWebContainer().then(setWebContainer);

    receiveMessage("project-message", (data) => {
      if (data.sender?._id === "ai") setAiTyping(false);
      setMessages((prev) => [...prev, data]);
    });

    axios.get(`/projects/get-project/${project._id}`).then((res) => {
      setProject(res.data.project);
      setFileTree(res.data.project.fileTree || {});
    });
  }, []);

  /* -------------------------------------------------------------------------- */
  /* AUTO SCROLL */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    messageBoxRef.current?.scrollTo({
      top: messageBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  /* -------------------------------------------------------------------------- */
  /* SEND MESSAGE */
  /* -------------------------------------------------------------------------- */
  const send = () => {
    if (!message.trim()) return;

    sendMessage("project-message", { message, sender: user });
    setMessages((prev) => [...prev, { sender: user, message }]);

    if (message.includes("@ai")) setAiTyping(true);
    setMessage("");
  };

  /* -------------------------------------------------------------------------- */
  /* AI MESSAGE RENDER */
  /* -------------------------------------------------------------------------- */
  const renderAiMessage = (msg) => {
    const parsed = JSON.parse(msg);
    return (
      <div className="bg-slate-900 text-white p-2 rounded">
        <Markdown options={{ overrides: { code: SyntaxHighlightedCode } }}>
          {parsed.text}
        </Markdown>
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /* RUN PROJECT */
  /* -------------------------------------------------------------------------- */
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

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="flex justify-between items-center px-4 py-2 bg-slate-900 text-white">
        <h1 className="font-bold">
          Project Dashboard —
          <span className="ml-2 text-green-400 animate-pulse">
            {words[wordIndex]}
          </span>
        </h1>
        <span className="text-sm text-green-400">● Online</span>
      </header>

      <section className="flex flex-grow overflow-hidden">
        {/* CHAT */}
        <aside className="w-96 bg-slate-200 flex flex-col">
          <div
            ref={messageBoxRef}
            className="flex-grow overflow-auto p-2 space-y-2"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded max-w-xs ${
                  msg.sender._id === user._id
                    ? "ml-auto bg-blue-100"
                    : "bg-white"
                }`}
              >
                <small className="text-xs text-gray-500">
                  {msg.sender.email}
                </small>
                {msg.sender._id === "ai"
                  ? renderAiMessage(msg.message)
                  : <p>{msg.message}</p>}
              </div>
            ))}

            {aiTyping && (
              <div className="text-xs text-gray-500 italic">
                AI is thinking...
              </div>
            )}
          </div>

          <div className="flex border-t">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type message (@ai to ask AI)"
              className="flex-grow p-2 outline-none"
            />
            <button
              disabled={!message.trim()}
              onClick={send}
              className="px-4 bg-slate-900 text-white disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </aside>

        {/* EDITOR */}
        <section className="flex-grow flex flex-col">
          <div className="flex bg-slate-300">
            {openFiles.map((f) => (
              <button
                key={f}
                onClick={() => setCurrentFile(f)}
                className={`px-4 py-2 ${
                  currentFile === f ? "bg-slate-400" : ""
                }`}
              >
                {f}
              </button>
            ))}

            <button
              onClick={runProject}
              className="ml-auto px-4 bg-green-600 text-white"
            >
              {runLoading ? "Running..." : "Run"}
            </button>
          </div>

          <div className="flex-grow overflow-auto bg-white p-4">
            {currentFile && fileTree[currentFile] && (
              <pre>
                <code
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    setFileTree({
                      ...fileTree,
                      [currentFile]: {
                        file: { contents: e.target.innerText },
                      },
                    });
                  }}
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
    </main>
  );
};

export default Project;
