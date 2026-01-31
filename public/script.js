


document.addEventListener('DOMContentLoaded', () => {

    // --- CHATBOT LOGIC ---

    const chatForm = document.getElementById('chat-form');

    const userInput = document.getElementById('user-input'); // This will be a textarea

    const chatBox = document.getElementById('chat-box');

    const sendButton = document.getElementById('send-button');



    let conversationHistory = [];



    function markdownToHtml(text) {

        text = text.replace(/\*\*(.*?)\*\*/g, '<strong></strong>');

        text = text.replace(/\*(.*?)\*/g, '<em></em>');

        text = text.replace(/~(.*?)~/g, '<del></del>');

        text = text.replace(/\n/g, '<br>');

        return text;

    }



    function addMessageToChatBox(role, text) {

        const messageElement = document.createElement('div');

        messageElement.classList.add('chat-message', `${role}-message`);

        messageElement.innerHTML = markdownToHtml(text);

        chatBox.appendChild(messageElement);

        chatBox.scrollTop = chatBox.scrollHeight;

        return messageElement;

    }



    // Auto-growing textarea logic

    if (userInput) {

        userInput.addEventListener('input', () => {

            userInput.style.height = 'auto';

            userInput.style.height = (userInput.scrollHeight) + 'px';

        });



        // Submit on Enter, new line on Shift+Enter

        userInput.addEventListener('keydown', (e) => {

            if (e.key === 'Enter' && !e.shiftKey) {

                e.preventDefault();

                chatForm.requestSubmit(); // Modern way to trigger form submit

            }

        });

    }

    

    // Reset textarea height after submission

    function resetInputHeight() {

        if(userInput) {

            userInput.style.height = 'auto';

        }

    }



    if (chatForm) {

        chatForm.addEventListener('submit', async (e) => {

            e.preventDefault();

            const userMessage = userInput.value.trim();

            if (!userMessage) return;



            addMessageToChatBox('user', userMessage);

            conversationHistory.push({ role: 'user', text: userMessage });

            userInput.value = '';

            resetInputHeight(); // Reset height



            const thinkingMessageElement = addMessageToChatBox('model', '...');



            try {

                const response = await fetch('/api/chat', {

                    method: 'POST',

                    headers: { 'Content-Type': 'application/json' },

                    body: JSON.stringify({ conversation: conversationHistory }),

                });



                if (!response.ok) {

                    thinkingMessageElement.innerHTML = markdownToHtml('Failed to get response from server.');

                    return;

                }



                const data = await response.json();



                if (data && data.result) {

                    thinkingMessageElement.innerHTML = markdownToHtml(data.result);

                    conversationHistory.push({ role: 'model', text: data.result });

                } else {

                    thinkingMessageElement.innerHTML = markdownToHtml('Sorry, no response received.');

                }

            } catch (error) {

                console.error('Error:', error);

                thinkingMessageElement.innerHTML = markdownToHtml('Failed to get response from server.');

            }

        });

    }

});
