
document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    let conversationHistory = [];

    /**
     * Converts simple markdown syntax to HTML.
     * @param {string} text The text to convert.
     * @returns {string} The HTML-formatted text.
     */
    function markdownToHtml(text) {
        // Bold: **text**
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong></strong>');
        // Italic: *text*
        text = text.replace(/\*(.*?)\*/g, '<em></em>');
        // Strikethrough: ~text~
        text = text.replace(/~(.*?)~/g, '<del></del>');
        // New lines
        text = text.replace(/\n/g, '<br>');
        return text;
    }

    /**
     * Adds a message to the chat box with proper styling and formatting.
     * @param {string} role 'user' or 'model'.
     * @param {string} text The message content.
     * @returns {HTMLElement} The created message element.
     */
    function addMessageToChatBox(role, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${role}-message`);
        
        // Convert markdown to HTML and set as innerHTML
        messageElement.innerHTML = markdownToHtml(text);
        
        chatBox.appendChild(messageElement);
        // Scroll to the bottom of the chat box
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageElement;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userMessage = userInput.value.trim();
        if (!userMessage) {
            return;
        }

        // Add user message to chat box and history
        addMessageToChatBox('user', userMessage);
        conversationHistory.push({ role: 'user', text: userMessage });

        // Clear input field
        userInput.value = '';

        // Show a temporary "Thinking..." message
        const thinkingMessageElement = addMessageToChatBox('model', '...');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversation: conversationHistory }),
            });

            if (!response.ok) {
                thinkingMessageElement.innerHTML = markdownToHtml('Failed to get response from server.');
                return;
            }

            const data = await response.json();

            if (data && data.result) {
                // Replace "Thinking..." with the actual AI response
                thinkingMessageElement.innerHTML = markdownToHtml(data.result);
                // Add AI response to history
                conversationHistory.push({ role: 'model', text: data.result });
            } else {
                thinkingMessageElement.innerHTML = markdownToHtml('Sorry, no response received.');
            }
        } catch (error) {
            console.error('Error:', error);
            thinkingMessageElement.innerHTML = markdownToHtml('Failed to get response from server.');
        }
    });
});