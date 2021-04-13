/**
 * Menambahkan bubble chat ke layar
 * @param {int} side sisi mana, 0 = pengguna, 1 = reply
 * @param {string} content isi bubble chat
 */
const addChatBubble = (side, content) => {
  let clone = document.querySelector('.chat-bubble-template').content.cloneNode(true);
  clone.querySelector('.chat-bubble').classList.add(side === 0 ? 'chat-user' : 'chat-reply');
  clone.querySelector('.chat-content').textContent = content;
  document.querySelector('.chat-container').appendChild(clone);
}

/**
 * Handler untuk form submission
 * @param {Event} e
 */
const sendQueryHandle = (e) => {
  e.preventDefault();
  const queryDOM = document.querySelector('.query');
  const query = queryDOM.value;
  if(query == '') return;
  addChatBubble(0, query);
  /* Kirim query ke server */
  fetch('/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: query
  }).then( data => data.text() ) // parse reply
    .then( res => addChatBubble(1, res) ); // tambah chat bubble reply
  queryDOM.value = '';
};

/**
 * ADD ALL EVENT HANDLER ON DOCUMENT LOAD
 */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.query-container').addEventListener('submit', sendQueryHandle);
});