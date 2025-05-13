import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "../config/axios";
import { useLocation } from "react-router-dom";
import {
  initializeSocket,
  recieveMessage,
  sendMessage,
} from "../config/socket";
import { UserContext } from "../context/user.context";

const Project = () => {
  const location = useLocation();
  const [project, setProject] = useState(location.state.project);
  const [users, setUsers] = useState([]);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { user } = useContext(UserContext);
  const messageBoxRef = useRef(null);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFile, setOpenFile] = useState([]);

  const handleUserClick = (id) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };
  // Dummy file setup



  const addCollaborators = () => {
    axios
      .put("/projects/add-user", {
        projectId: project._id,
        users: Array.from(selectedUserIds),
      })
      .then(() => setIsModalOpen(false))
      .catch(console.log);
  };

  const send = () => {
    const msgObj = { sender: user, message };
    sendMessage("project-message", msgObj);
    setMessages((prev) => [...prev, msgObj]);
    setMessage("");
  };

  const parseMessageContent = (msg) => {
    if (typeof msg === "string") return msg;
    return (
      msg?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(msg)
    );
  };

  useEffect(() => {
    if (!project?._id) return;

    initializeSocket(project._id);

    recieveMessage("project-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    axios
      .get(`/projects/get-project/${project._id}`)
      .then((res) => setProject(res.data.project))
      .catch(console.log);

    axios
      .get("/users/all")
      .then((res) => setUsers(res.data.users))
      .catch(console.log);
  }, [project._id]);

  useEffect(() => {
    setFileTree({
  "App.js": {
    content: `const express = require("express");
const app = express();
const projectRoutes = require("./routes/project.routes");

app.use(express.json()); // Middleware to parse JSON
app.use("/projects", projectRoutes); // Mount project routes

const PORT =  5000;
app.listen(PORT, () => console.log('Server running on port 5000'));
`,
  },
  "package.json": {
    content: `{
  "name": "dummy-project",
  "version": "1.0.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}`,
  },
});

// Auto open the files in tab
setOpenFile(["App.js", "package.json"]);
setCurrentFile("App.js");
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="h-screen w-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <section className="w-full md:min-w-96 md:w-96 bg-slate-300 flex flex-col">
        <header className="flex justify-between items-center p-4 bg-slate-100">
          <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
            <i className="ri-add-fill mr-1"></i>
            <span className="text-sm">Add collaborator</span>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2"
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>
<div className="flex flex-col h-[50vh] md:h-full relative">
  <div
    ref={messageBoxRef}
    className="flex-grow p-2 overflow-y-auto space-y-2 bg-white"
  >
    {messages.map((msg, index) => {
      const isSelf = msg.sender?._id === user._id;
      return (
        <div
          key={index}
          className={`p-2 rounded-md max-w-xs ${
            isSelf ? "ml-auto bg-blue-100" : "mr-auto bg-slate-100"
          }`}
        >
          <small className="text-xs text-gray-500">
            {msg.sender?.email || "AI"}
          </small>
          <p className="text-sm">{parseMessageContent(msg.message)}</p>
        </div>
      );
    })}
  </div>

  <div className="flex p-2 border-t bg-gray-50">
    <textarea
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      rows={3}
      className="flex-grow resize-none  rounded-lg border border-gray-300 bg-gray-100 text-sm focus:outline-none"
      placeholder="Type your message..."
    />
    <button
      onClick={send}
      className="ml-2 bg-slate-900 text-white px-8 rounded-lg hover:bg-slate-800"
    >
      <i className="ri-send-plane-fill text-xl"></i>
    </button>
  </div>
</div>


        {/* Slide-in Side Panel */}
        <div
          className={`absolute md:relative z-10 top-0 bg-slate-100 h-full transition-transform ${
            isSidePanelOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          } w-3/4 md:w-full shadow-md`}
        >
          <header className="flex justify-between items-center p-4 bg-slate-200">
            <h2 className="text-lg font-semibold">Collaborators</h2>
            <button
              onClick={() => setIsSidePanelOpen(false)}
              className="md:hidden p-1"
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="p-2 space-y-2">
            {project?.users?.map((u) => (
              <div key={u._id} className="flex items-center gap-2 p-2">
                <div className="bg-slate-600 text-white rounded-full p-2">
                  <i className="ri-user-fill"></i>
                </div>
                <span className="text-sm">{u.email}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Panel */}
      <section className="flex-grow flex flex-col md:flex-row h-full">
        {/* File Explorer */}
        <aside className="bg-slate-200 w-full md:w-64 p-2 overflow-auto">
          {messages.length > 0 &&
            messages[messages.length - 1].message?.fileTree &&
            Object.entries(messages[messages.length - 1].message.fileTree).map(
              ([filename, data]) => (
                <div key={filename} className="mb-4">
                  <strong>{filename}</strong>
                  <pre className="text-xs bg-slate-100 p-1 rounded">
                    {data.content}
                  </pre>
                </div>
              )
            )}
        </aside>

        {/* Code Editor */}
        <div className="flex-grow flex flex-col">
          <div className="flex gap-2 flex-wrap p-2 border-b bg-slate-100">
            {openFile.map((file, index) => (
              <button
                key={index}
                onClick={() => setCurrentFile(file)}
                className="bg-slate-300 p-2 rounded hover:bg-slate-400"
              >
                {file}
              </button>
            ))}
            <button
              className="ml-auto bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => {
                // Save file logic here
                console.log("Saving", fileTree);
              }}
            >
              Save
            </button>
          </div>
          <div className="flex-grow">
            {currentFile && fileTree[currentFile] && (
              <textarea
                value={fileTree[currentFile].content}
                onChange={(e) =>
                  setFileTree({
                    ...fileTree,
                    [currentFile]: { content: e.target.value },
                  })
                }
                className="w-full h-full p-4 outline-none bg-white"
              />
            )}
          </div>
        </div>
      </section>

      {/* Modal for adding users */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg w-11/12 md:w-96">
            <header className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Collaborators</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="space-y-2 max-h-60 overflow-auto">
              {users.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleUserClick(u._id)}
                  className={`cursor-pointer flex items-center gap-2 p-2 rounded ${
                    selectedUserIds.has(u._id) ? "bg-slate-200" : ""
                  } hover:bg-slate-100`}
                >
                  <div className="bg-slate-600 text-white rounded-full p-2">
                    <i className="ri-user-fill"></i>
                  </div>
                  <span>{u.name}</span>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
            >
              Add Selected
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
