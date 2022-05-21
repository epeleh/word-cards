# Word Cards

The application allows you to create cards to memorize new words.

## Launch:
```
docker-compose up
```

---
#### TODO:
* Optimize the `filteredCards` function - do cards ordering elsewhere
* Add a popup with an explanation of the search commands (`#active` etc..) when clicking on the search icon
* Optimize speed of `api/cards` endpoint loading - add pagination or caching
* Show some message when the backend isn't responding - make the app work without connection
* Check how the app works (in particular `/storage.zip`) when there are a lot of cards
* Add animations for the `nextCard` function
