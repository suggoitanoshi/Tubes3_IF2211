/**
 * Menambahkan bubble chat ke layar
 * @param {int} side sisi mana, 0 = pengguna, 1 = reply
 * @param {string} content isi bubble chat
 */
const addChatBubble = (side, content, reaction) => {
  let clone = document.querySelector('.chat-bubble-template').content.cloneNode(true);
  clone.querySelector('.chat-bubble').classList.add(side === 0 ? 'chat-user' : 'chat-reply');
  clone.querySelector('.chat-content').textContent = content;
  let container = document.querySelector('.chat-container');
  if(side == 1){
    if(reaction === 'confuse'){
      clone.querySelector('.image').src = 'bot_confuse.webm';
      let qm = document.createElement('div');
      qm.classList.add('reaction')
      clone.querySelector('.chat-content-outer').appendChild(qm);
    }
    else{
      clone.querySelector('.image').src = 'bot_talk.webm';
    }
  }
  container.appendChild(clone);
  container.scrollTop = container.scrollHeight;
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
  }).then( data => data.json() ) // parse reply
    .then( res => addChatBubble(1, res['body'], res['reaction']) ) // tambah chat bubble reply
    .catch( err => addChatBubble(1, `An error occured: ${err}`)); // handle errors, echo ke user
  queryDOM.value = '';
};

/**
 * ADD ALL EVENT HANDLER ON DOCUMENT LOAD
 */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.query-container').addEventListener('submit', sendQueryHandle);
});