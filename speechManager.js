let speechSynthesis = window.speechSynthesis;

let speechWaitList = [];
let speaking = false;

async function handleSpeech()
{
    while(true)
    {
        let line = new SpeechSynthesisUtterance();

        if(!speaking && speechWaitList.length)
        {
            // console.log(speechSynthesis.getVoices());

            line.text = speechWaitList[0];
            line.voice = speechSynthesis.getVoices()[1];  //Microsoft Zira Desktop - English (United States)
            line.rate = 1.8;
            // line.pitch = 1;

            line.onend = (e) =>
            {
                // console.log('Finished in ' + event.elapsedTime + ' seconds.');
                speechWaitList.shift();
                speaking = false;
            };

            speaking = true;
            speechSynthesis.speak(line);
        }
        else
        {
            await delay(500);
        }
    }
};

handleSpeech();





function delay(t, val)
{
    return new Promise(
        function(resolve)
        {
            setTimeout( function(){resolve(val);}, t);
        }
    );
}


module.exports = {
    addSpeech(speech)
    {
        if(speechWaitList.indexOf(speech) == -1)    //push only if the speech is not alraeady waiting
            speechWaitList.push(speech);

        // console.log(speech);
    },
}
