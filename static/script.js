const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const chatContainer = document.getElementById("chatContainer");
const typing = document.getElementById("typing");

const clearBtn = document.getElementById("clearBtn");
const newChatBtn = document.getElementById("newChatBtn");
const welcome = document.getElementById("welcome");


// --------------------------------
// Add Message
// --------------------------------

function addMessage(message, sender) {

    const messageDiv = document.createElement("div");

    messageDiv.className =
        sender === "user"
            ? "message user"
            : "message";


    const avatar =
        sender === "user"
            ? "👤"
            : "✦";


    const name =
        sender === "user"
            ? "You"
            : "Nova AI";


    messageDiv.innerHTML = `

        <div class="message-avatar">
            ${avatar}
        </div>

        <div class="message-body">

            <div class="message-name">
                ${name}
            </div>

            <div class="message-text">
                ${escapeHtml(message)}
            </div>

        </div>
    `;


    chatContainer.appendChild(messageDiv);

    chatContainer.scrollTop =
        chatContainer.scrollHeight;
}


// --------------------------------
// Security
// --------------------------------

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// --------------------------------
// Send Message
// --------------------------------

async function sendMessage() {

    const question =
        userInput.value.trim();


    if (!question) {
        return;
    }


    // Hide welcome screen

    if (welcome) {
        welcome.style.display = "none";
    }


    // User message

    addMessage(question, "user");


    // Clear input

    userInput.value = "";

    userInput.style.height = "auto";


    // Disable button

    sendButton.disabled = true;


    // Show typing

    typing.style.display = "flex";


    chatContainer.scrollTop =
        chatContainer.scrollHeight;


    try {

        const response = await fetch(
            "/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    question: question
                })
            }
        );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const data =
            await response.json();


        // Hide typing

        typing.style.display = "none";


        if (data.answer) {

            addMessage(
                data.answer,
                "bot"
            );

        }

        else if (data.detail) {

            addMessage(
                "Error: " + data.detail,
                "bot"
            );

        }

        else {

            addMessage(
                "Sorry, I could not get an answer.",
                "bot"
            );
        }


    }

    catch (error) {

        console.error(error);


        typing.style.display = "none";


        addMessage(
            "❌ Unable to connect to the server. Please make sure FastAPI is running.",
            "bot"
        );

    }


    sendButton.disabled = false;

    userInput.focus();
}


// --------------------------------
// Send Button
// --------------------------------

sendButton.addEventListener(
    "click",
    sendMessage
);


// --------------------------------
// Enter Key
// --------------------------------

userInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }

    }
);


// --------------------------------
// Auto Resize Textarea
// --------------------------------

userInput.addEventListener(
    "input",
    function() {

        this.style.height = "auto";

        this.style.height =
            Math.min(
                this.scrollHeight,
                120
            ) + "px";

    }
);


// --------------------------------
// Suggestion Buttons
// --------------------------------

document.querySelectorAll(
    ".suggestion"
).forEach(button => {

    button.addEventListener(
        "click",
        function() {

            userInput.value =
                this.textContent.trim();

            userInput.focus();

            sendMessage();

        }
    );

});


// --------------------------------
// Clear Chat
// --------------------------------

function clearChat() {

    const messages =
        chatContainer.querySelectorAll(
            ".message"
        );


    messages.forEach(
        message => message.remove()
    );


    welcome.style.display = "block";

    userInput.value = "";

    userInput.focus();
}


clearBtn.addEventListener(
    "click",
    clearChat
);


newChatBtn.addEventListener(
    "click",
    clearChat
);