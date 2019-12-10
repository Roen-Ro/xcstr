// https://googleapis.dev/nodejs/translate/latest/v3beta1.TranslationServiceClient.html#translateText 

//https://translation.googleapis.com/language/translate/v2/?q=%E6%88%91%E6%98%AF%E4%B8%AD%E6%96%87&source=zh&target=en&key=YOUR_API_KEY_HERE

    // [START translate_translate_text]
    // Imports the Google Cloud client library
    const {Translate} = require('@google-cloud/translate').v2;

    /**
    * TODO(developer): Uncomment the following line before running the sample.
    */
     const projectId = '';
  
    // Creates a client
    const translate = new Translate(projectId);
  
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const text = 'The text to translate, e.g. Hello, world!';
    // const target = 'The target language, e.g. ru';
  
    async function translateText() {
      // Translates the text into the target language. "text" can be a string for
      // translating a single piece of text, or an array of strings for translating
      // multiple texts.
      let [translations] = await translate.translate(text, target);
      translations = Array.isArray(translations) ? translations : [translations];
      console.log('Translations:');
      translations.forEach((translation, i) => {
        console.log(`${text[i]} => (${target}) ${translation}`);
      });
    }
  
    translateText();
    // [END translate_translate_text]
  }

  function startTrans()  {

    translateTextSample("我的中国心","en");
  }

module.exports.startTrans = startTrans; 