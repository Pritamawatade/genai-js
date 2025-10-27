document.getElementById('add-btn').addEventListener('click', addTodo);
document.getElementById('todo-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') addTodo();
});

function addTodo() {
  const input = document.getElementById('todo-input');
  const value = input.value.trim();
  if (!value) return;
  const li = document.createElement('li');
  li.textContent = value;
  const btn = document.createElement('button');
  btn.textContent = 'Delete';
  btn.className = 'delete-btn';
  btn.onclick = function() { li.remove(); };
  li.appendChild(btn);
  document.getElementById('todo-list').appendChild(li);
  input.value = '';
}
