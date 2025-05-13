import React, { useContext, useEffect, useState } from 'react'
//import {UserContext} from "../context/user.context"
import axiosInstance from '../config/axios';
import {useNavigate} from "react-router-dom"
import image from "../assets/chat.gif";




const Home = () => {
  //const { user } = useContext(UserContext);
  const [isModalOpen,setIsModalOpen] = useState(false);
  const [projectName,setProjectName] = useState(null)
  const [project,setProject] = useState([]);

  const navigate = useNavigate();



  function createProject(e) {
    e.preventDefault();
    console.log({projectName})
    axiosInstance.post("/projects/create",{
      name:projectName,
    }).then((res) => {
      console.log(res);
  
      setIsModalOpen(false)

    }).catch((error) => {
      console.log(error);
    })
  }

  useEffect(() => {
    axiosInstance.get("/projects/all").then((res) => {
      console.log(res.data)
      setProject(res.data.projects)
    }).catch(err => {
      console.log(err);
    }) 
  },[])
  return (
  <main className="min-h-screen bg-slate-100">
  {/* Header */}
  <div className="bg-white shadow-md py-6 px-4 md:px-10 flex flex-col md:flex-row items-center justify-between">
    <div className="mb-4 md:mb-0">
      <h1 className="text-2xl font-bold text-slate-800">Welcome to DevBoard</h1>
      <p className="text-sm text-gray-500">Manage your collaborative coding projects</p>
    </div>
    <button
      onClick={() => setIsModalOpen(true)}
      className="bg-blue-600 text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
    >
      <i className="ri-add-line text-lg"></i>
      New Project
    </button>
  </div>

  {/* Illustration */}
  <div className="flex justify-center my-6 px-4">
    <img
      src={image}
      alt="Team collaboration illustration"
      className="w-full max-w-xl rounded-md shadow-md"
    />
  </div>

  {/* Project Grid */}
  <section className="px-4 md:px-10 pb-10">
    <h2 className="text-lg font-semibold mb-4 text-gray-700">Your Projects</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {project.map((proj) => (
        <div
          key={proj._id}
          onClick={() => navigate(`/project`, { state: { project: proj } })}
          className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">{proj.name}</h3>
          <p className="text-sm text-gray-500">
            <i className="ri-user-3-line mr-1"></i>
            {proj.users.length} Collaborator{proj.users.length !== 1 ? "s" : ""}
          </p>
        </div>
      ))}
    </div>
  </section>

  {/* Modal */}
  {isModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md w-11/12 max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <form onSubmit={createProject}>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</main>

  )
}

export default Home
