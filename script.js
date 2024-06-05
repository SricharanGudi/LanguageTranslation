

  const translatedKeywords = {
  'language': 'send',
  'idioma': 'send', // Spanish
  'Sprache': 'send', // German
  'langue': 'send', // French
  'linguaggio': 'send', // Italian
  'لغة': 'send', // Arabic
  'լեզվաբառ': 'send', // Armenian
  'dil': 'send', // Azerbaijani
  'hizkuntza': 'send', // Basque
  'мова': 'send', // Belarusian
  'език': 'send', // Bulgarian
  'llengua': 'send', // Catalan
  '语言': 'send', // Chinese (Simplified)
  '語言': 'send', // Chinese (Traditional)
  'jezik': 'send', // Croatian
  'jazyk': 'send', // Czech
  'sprog': 'send', // Danish
  'taal': 'send', // Dutch
  'keel': 'send', // Estonian
  'wika': 'send', // Filipino
  'kieli': 'send', // Finnish
  'langue': 'send', // French
  'hizkuntza': 'send', // Galician
  'ენა': 'send', // Georgian
  'Sprache': 'send', // German
  'γλώσσα': 'send', // Greek
  'lang': 'send', // Haitian Creole
  'שפה': 'send', // Hebrew
  'भाषा': 'send', // Hindi
  'nyelv': 'send', // Hungarian
  'tungumál': 'send', // Icelandic
  'bahasa': 'send', // Indonesian
  'teanga': 'send', // Irish
  'lingua': 'send', // Italian
  '言語': 'send', // Japanese
  '언어': 'send', // Korean
  'valoda': 'send', // Latvian
  'kalba': 'send', // Lithuanian
  'јазик': 'send', // Macedonian
  'bahasa': 'send', // Malay
  'ilsien': 'send', // Maltese
  'språk': 'send', // Norwegian
  'زبان': 'send', // Persian
  'język': 'send', // Polish
  'idioma': 'send', // Portuguese
  'limba': 'send', // Romanian
  'язык': 'send', // Russian
  'језик': 'send', // Serbian
  'jazyk': 'send', // Slovak
  'jezik': 'send', // Slovenian
  'idioma': 'send', // Spanish
  'lugha': 'send', // Swahili
  'språk': 'send', // Swedish
  'ภาษา': 'send', // Thai
  'dil': 'send', // Turkish
  'мова': 'send', // Ukrainian
  'زبان': 'send', // Urdu
  'ngôn ngữ': 'send', // Vietnamese
  'iaith': 'send', // Welsh
  'שפראך': 'send', // Yiddish
  'மொழி': 'send', // Tamil
  'భాష': 'send', // Telugu
  'ഭാഷ': 'send', // Malayalam
  'ಭಾಷೆ': 'send' ,// Kannada
  'upload file and change to':'send',
};



  if (annyang) {

    annyang.debug(true);

    // Function to set language dynamically
    function setAnnyangLanguage(languageCode) {
        annyang.setLanguage(languageCode);
    }

    annyang.addCallback('result', function(phrases) {
        // Get the last recognized phrase
        const recognizedText = phrases[0];
        
        // Display the recognized text in the HTML element
        document.getElementById('input').innerText = recognizedText;
    });

    const initialLanguageCode = 'en-us'; // Default language code
    setAnnyangLanguage(initialLanguageCode);

    // Add commands to annyang
    var pendingText = '';
    var latelanguage='';
    var commands = {};

    Object.keys(translatedKeywords).forEach(translatedKeyword => {
      
            commands['*text ' + translatedKeyword + ' *language'] = function(text, language) {
                if (pendingText) {
                    text = pendingText + ' ' + text; // Combine pending text and new text
                    pendingText = ''; // Clear pending text
                }
                var targetLanguage = language;
                console.log('Sending text:', text);
                console.log('Sending language:', targetLanguage);
                sendData(text, targetLanguage);
            };
    commands[translatedKeyword + ' *language']= function(language){
    document.getElementById('fileInput').click();
    console.log('sending language :', language);
    latelanguage=language;
    //pdf(language);
  };
  });



    annyang.addCommands(commands);
    SpeechKITT.annyang();

    // Define a stylesheet for KITT to use
    SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat-midnight-blue.css');

    // Render KITT's interface
    SpeechKITT.vroom();
  } else {
      console.error("Annyang not available. Speech recognition will not work.");
  }

  document.getElementById('fileInput').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append("file", file); // Append the file to form data

        // Determine the type of file selected (PDF or image)
        const fileType = file.type;
        const isPDF = fileType === 'application/pdf';
        if (isPDF) {
        pdfdata(formData,latelanguage); // Send PDF data to server
        } else {
          imagedata(formData, latelanguage); // Send image data to server
        }
      console.log('Selected file:', formData);
      console.log('Selected latelanguage:', latelanguage);
      latelanguage='';
      
      // You can perform additional actions like uploading the file and changing the language
    } else {
      console.log('No file selected.');
    }
  });
  
var selectedLanguage = document.getElementById('languageSelect2');

// Add onchange event listener
selectedLanguage.addEventListener("change", function() {
    // Code to execute when the dropdown selection changes
    var languageValue = selectedLanguage.value;
});
// Get the button element
var translate = document.getElementById("inputButton");
var speechs = document.getElementById("speech");
// Add onclick event listener
translate.addEventListener("click", function() {
    // Code to execute when the button is clicked
    var recognizedText = document.getElementById('input').value;
    var selectedLanguage = document.getElementById('languageSelect2');
    var languageValue = selectedLanguage.value;
    console.log(languageValue);
    console.log(recognizedText);
    sendData_n(recognizedText, languageValue);
});

speechs.addEventListener("click", function() {
    // Code to execute when the button is clicked
    var recognizedText = document.getElementById('output').value;
    var selectedLanguage = document.getElementById('languageSelect2');
    var languageValue = selectedLanguage.value;
    console.log(recognizedText);
    console.log(languageValue);
    speech(recognizedText, languageValue);
});

function speech(text,language) {
    fetch("/speech", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text , language: language })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();
        // Check if the response content type is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json(); // Parse JSON response
        } else {
            return response.text(); // Return text response as is
        }
    })
    .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();
        
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        // Handle error appropriately, e.g., display an error message to the user
    });
  }
function sendData_n(text, language) {
    fetch("/usetext_n", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text , language: language })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Check if the response content type is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json(); // Parse JSON response
        } else {
            return response.text(); // Return text response as is
        }
    })
    .then(data => {
        console.log('Server response:', data);
        document.getElementById('output').value = data;
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        // Handle error appropriately, e.g., display an error message to the user
    });
  }

  function sendData(text, language) {
    fetch("/usetext", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text , language: language })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Check if the response content type is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json(); // Parse JSON response
        } else {
            return response.text(); // Return text response as is
        }
    })
    .then(data => {
        console.log('Server response:', data);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        // Handle error appropriately, e.g., display an error message to the user
    });
  }

  function pdfdata(formData, language) {
    // Fetch operation to send FormData and language to the server
    fetch('/usepdf', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
            'Language': language // Optionally, include language as a custom header
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('File and language data sent successfully.');
            // Handle response from server if needed
        } else {
            console.error('Failed to send file and language data.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function imagedata(formData, language) {
    fetch('/useimg', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
            'Language': language
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('Image file and language data sent successfully.');
        } else {
            console.error('Failed to send image file and language data.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
  }

  const languageSelect = document.getElementById('languageSelect1');
  languageSelect.addEventListener('change', function() {
      const selectedLanguageCode = languageSelect.value;
      setAnnyangLanguage(selectedLanguageCode);
  });