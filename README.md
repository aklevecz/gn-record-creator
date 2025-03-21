![Infatuation](https://raw.githubusercontent.com/aklevecz/gn-record-creator/28f99536f22555b010a5ad513720aafa2c2c01f8/static/characters/infatuation-color.svg)
**GN Record Submission Form**  
[Code on Github](https://github.com/aklevecz/gn-record-creator)

The GN Record Submission Form is designed to improve the overall order process and tracking leads. Using modern web technology, the customer experience aims to be both inspiring and seamless– differentiating GN from other record producers. Interactive visual elements capture the attention of the customer that provide an immediate render of their physical product, and the automatic caching of their progress increases retention while they collect necessary information. Estimated pricing, Monday CRM integration, and email notifications will increase the efficiency of the entire process and improve the quality of life of GN team members who will spend less time trudging through monotonous data entry and more time building informed relationships.

Core Features

* Collect and manage information for initiating record pressing project  
* Fully integrated into [Monday](https://www.monday.com) for CRM purposes  
* Captivate users with interactive visual elements

Advanced Features

* Data persistence  
  * Information is [cached in the browser](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) and stored in a [database](https://developers.cloudflare.com/d1/) to retain progress for a given user session  
* Generating cover art using AI  
  * Text to image prompts are generated using the base [Flux Schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell) model hosted on [Replicate](https://replicate.com/home)  
* 3D animations and Augmented Reality (AR)  
  * The cover and record are visualized using [three.js](https://threejs.org/) on the website  
  * AR will allow the user to see the record in space to make it feel even more tangible

Diagram of web technology used
![Diagram](https://github.com/aklevecz/gn-record-creator/blob/main/static/documentation/diagram.png?raw=true)
Basic User Story

* A user named Groovy finished mastering their forthcoming album called *I hate PVC and you should too* and they are ready to press. An interesting man he sees run around the Rose Bowl gave him a fortuitous link to a sustainable record order form. Groovy has actually never pressed vinyl before as he usually just posts mixtapes about the horrors of dating apps on SoundCloud, but he is excited to solidify himself as an actual musician while staying true to his album’s title. He lands on the home page and begins scrolling through the form  
  * When Groovy lands on the page it checks to see if he has a past browser session. If one is found, then any projects he started in that browser will be fetched and loaded. If there is no session, a new session and project are created as the page loads  
      
* He begins filling out the basic information, but he realizes he is not sure how many records he needs, and wrapped up in the moment, he can’t decide on his favorite color either. Nonetheless, he uploads a few pictures of his dog to visualize as the cover art and wonders if that is a better direction than his original idea of Uncle Sam wearing a skin tight PET bodysuit  
  * Updates Groovy makes to the form are automatically sent to the cloud D1 database and Monday after a short interval, and also cached in the browser  
  * Images uploaded by Groovy are stored in the R2 bucket and also cached in the browser.  
      
* He decides to check out the other pages of the site and navigates to *projects*. He is pleasantly surprised to see a bunch of pictures of his dog that he uploaded. He notices there is also a nude of his ex gf that he accidentally uploaded, but is glad to see a delete button.  
  * The data model for projects is still not finished, but is currently malleable for user driven editing. There is already functionality for deleting projects, changing form values, and removing assets in the UI.  
      
* Next he goes to the *dream* page where he is once again confronted by one of the pictures of his dog. Next to his best friend is a UI element that looks like a simple version of some of the AI image generating tools he’s used. He types, “a plastic bottle melting into a vinyl record” and taps *Generate*.  
  * Image generations use the Replicate API, which allows you to call base models or your own models hosted on their platform. Generations are billed for the time they take to process or a flat fee. The current model being used charges $0.003 per generation. Like the uploaded images, generations are cached in the browser and stored in the R2 bucket.  
      
* Suddenly his dog lights his bed on fire, requiring Groovy’s immediate attention. Amidst the chaos Groovy’s computer is unplugged, and while subduing the fire he begins staring into the flames and hallucinates little habaneros dancing around. He remembers learning that habanero is a color while scrolling through the form and realizes that it must be the color of his album. He plugs his computer back in and navigates back to the site, and is pleasantly surprised to see that the form is magically still filled in. Everything feels ready to go, so he taps submit and starts dancing.  
  * Thanks to the data caching, as long as Groovy opens the same browser, his progress is saved. In the future we can have a simple authentication process that allows users to continue working on a form from any device.