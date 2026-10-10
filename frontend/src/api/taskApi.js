import api from './axiosInstance.js';

export async function getTasks(params = {}) {
  const { data } = await api.get('/tasks', { params });
  return data;
}

export async function getTaskStats() {
  const { data } = await api.get('/tasks/stats');
  return data.data;
}

export async function createTask(task) {
  const { data } = await api.post('/tasks', task);
  return data.data.task;
}

export async function updateTask(id, task) {
  const { data } = await api.put(`/tasks/${id}`, task);
  return data.data.task;
}

export async function updateTaskStatus(id, status) {
  const { data } = await api.patch(`/tasks/${id}/status`, { status });
  return data.data.task;
}

export async function deleteTask(id) {
  const { data } = await api.delete(`/tasks/${id}`);
  return data.data.task;
}
