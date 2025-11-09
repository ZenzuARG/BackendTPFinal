const socket = io();

const listEl = document.getElementById('list');
const formCreate = document.getElementById('formCreate');
const formDelete = document.getElementById('formDelete');

function render(list){
  listEl.innerHTML = '';
  if (!list || !list.length){
    listEl.innerHTML = '<li>Sin productos</li>';
    return;
  }
  list.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${p.title}</strong> – $${p.price} – stock: ${p.stock} – id: <code>${p._id}</code>`;
    listEl.appendChild(li);
  });
}

socket.on('products:update', render);

// Crear vía WS
formCreate.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(formCreate).entries());
  if (data.thumbnails) data.thumbnails = data.thumbnails.split(',').map(s=>s.trim()).filter(Boolean);
  data.price = Number(data.price);
  data.stock = Number(data.stock);
  data.status = Boolean(data.status);
  socket.emit('product:create', data, (resp)=>{
    if(!resp?.ok) alert(resp?.error || 'Error creando producto');
    else formCreate.reset();
  });
});

// Eliminar vía WS
formDelete.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = new FormData(formDelete).get('id');
  socket.emit('product:delete', id, (resp)=>{
    if(!resp?.ok) alert(resp?.error || 'Error eliminando producto');
    else formDelete.reset();
  });
});
