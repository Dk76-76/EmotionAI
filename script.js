const button = document.getElementById("predictBtn");

button.addEventListener("click", predictEmotion);

async function predictEmotion() {

    const text = document.getElementById("text").value.trim();

    if (text === "") {
        alert("Please enter some text.");
        return;
    }

    document.getElementById("loading").style.display = "block";
    document.getElementById("result").style.display = "none";

    try {

        const response = await fetch("/predict", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                text: text
            })

        });

        const data = await response.json();

        document.getElementById("loading").style.display = "none";
        document.getElementById("result").style.display = "block";

        document.getElementById("emotion").innerHTML = data.emotion;

        document.getElementById("confidence").innerHTML =
            "Confidence : " + data.confidence + "%";

        document.getElementById("progress-bar").style.width =
            data.confidence + "%";

        let emoji = "🙂";

        switch (data.emotion.toLowerCase()) {

            case "joy":
                emoji = "😁";
                break;

            case "sadness":
                emoji = "😢";
                break;

            case "anger":
                emoji = "😡";
                break;

            case "fear":
                emoji = "😨";
                break;

            case "love":
                emoji = "❤️";
                break;

            case "surprise":
                emoji = "😲";
                break;

            default:
                emoji = "🙂";

        }

        document.getElementById("emoji").innerHTML = emoji;

    }

    catch (error) {

        document.getElementById("loading").style.display = "none";

        alert("Error connecting to API.");

        console.log(error);

    }

}