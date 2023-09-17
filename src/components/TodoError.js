import React, { useEffect, useState } from 'react';
import {
  auth,
  db,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  collection,
} from '../firebase';

function TodoList({ user }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setAllUsers(usersData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'tasks'), orderBy('timestamp'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = [];
        snapshot.forEach((doc) => {
          tasksData.push({ id: doc.id, ...doc.data() });
        });
        setTasks(tasksData);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  const addTask = async () => {
    if (newTask && taskDescription) {
      try {
        const taskRef = await addDoc(collection(db, 'tasks'), {
          text: newTask,
          description: taskDescription,
          timestamp: new Date(),
          userId: user.uid,
          completed: false,
          taggedUsers: taggedUsers.map((user) => user.id),
        });

        setNewTask('');
        setTaskDescription('');
        setTaggedUsers([]);

        console.log('Task added with ID: ', taskRef.id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTask = async (taskId, completed) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        completed: !completed,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);

    const filteredUsers = allUsers.filter(
      (user) =>
        user.email.toLowerCase().includes(value.toLowerCase()) &&
        user.uid !== auth.currentUser.uid
    );
    setTaggedUsers(filteredUsers);
  };

  const handleTagUser = (selectedUser) => {
    setTaggedUsers([...taggedUsers, selectedUser]);

    setTagInput('');
  };

  const handleRemoveTaggedUser = (userId) => {
    setTaggedUsers(taggedUsers.filter((user) => user.id !== userId));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.email}!</h2>
      <h3 className="text-xl font-semibold mb-2">Your Tasks:</h3>
      <ul className="list-disc pl-6">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between py-2">
            <div>
              <span
                className={`text-lg ${task.completed ? 'line-through' : ''}`}
                onClick={() => toggleTask(task.id, task.completed)}
              >
                {task.text}
              </span>
              <p className="text-gray-600">{task.description}</p>
              <div className="mt-2 space-x-2">
                {task.taggedUsers.map((taggedUserId) => {
                  const taggedUser = allUsers.find(
                    (user) => user.id === taggedUserId
                  );
                  return (
                    <span
                      key={taggedUserId}
                      className="text-blue-500 cursor-pointer"
                      onClick={() => handleRemoveTaggedUser(taggedUserId)}
                    >
                      @{taggedUser.email}
                    </span>
                  );
                })}
              </div>
            </div>
            <button
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => deleteTask(task.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <input
          type="text"
          placeholder="New Task"
          className="border rounded px-2 py-1 w-full"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <textarea
          placeholder="Task Description"
          className="border rounded px-2 py-1 w-full mt-2"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        ></textarea>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Tag Users (@username)"
            className="border rounded px-2 py-1 w-full"
            value={tagInput}
            onChange={handleTagInputChange}
          />
          <div className="mt-2 space-y-2">
            {taggedUsers.map((taggedUser) => (
              <div key={taggedUser.id} className="flex items-center">
                <span className="text-blue-500">@{taggedUser.email}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 mt-2"
          onClick={addTask}
        >
          Add Task
        </button>
      </div>
    </div>
  );
}

export default TodoList;
