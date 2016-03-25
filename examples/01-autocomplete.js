(function (jQuery, _, Rx) {
  /**
   * Autocomplete par programmation évènementiel
   * @param {DOMNode} $element
   * @param {Function} callback
   */
  function callbackAutocomplete(element, callback) {
    var previous = ''
    // 1. Temporisation des évènements
    element.addEventListener('keyup', _.debounce(function (event) {
      // 2. Extracttion de la value de l'élèment
      var value = event.target.value
      // 3. Filtrage de la valeur uniquement si elle a changé
      if (previous !== value) {
        previous = value
        // 4. Filtrage de la saisie à 2 charactères
        if (value.length > 2) {
          // 5. Requête à l'API wikipedia
          $.ajax({
            url: 'http://en.wikipedia.org/w/api.php',
            dataType: 'jsonp',
            data: {
              action: 'opensearch',
              format: 'json',
              search: value
            }
          })
          // 6. Execution de la callback
          .then(callback)
        }
      }
    }, 250))
  }

  /**
   * Autocomplete par programmation fonctionnelle réactive
   * @param {DOMNode} element
   * @param {Function} callback
   */
  function reactiveAutocomplete(element, callback) {
    Rx.Observable.fromEvent(element, 'keyup')
      // 2. Extraction de la value de l'élèment
      .map(function (event) {
        return event.target.value
      })
      // 4. Filtrage de la saisie à 2 charactères
      .filter(function (value) {
        return value.length > 2
      })
      // 1. Temporisation des évènements
      .debounce(250)
      // 3. Filtrage de la valeur uniquement si elle a changé
      .distinctUntilChanged()
      // 5. Requête à l'API wikipedia
      .flatMapLatest(function(query) {
        return Rx.DOM.jsonpRequest({
          url: `http://en.wikipedia.org/w/api.php?callback=JSONPCallback&action=opensearch&format=json&search=${query}`
        }).map(function(result) {
          return result.response
        })
      })
      // 6. Execution de la callback
      .subscribe(callback)
  }

  function getNode(type) {
    return document.querySelector(`[name="${type}"] [type="search"]`)
  }

  const onGetList = ([query, list]) => {
    document.querySelector('ol').innerHTML = list.map((item) => `<li>${item}</li>`).join('')
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Event Programming test
    callbackAutocomplete(getNode('callback'), (value) => {
      console.log('callback', 'autocomplete', value)
      onGetList(value)
    })
    // Functional Reactive Programming test
    reactiveAutocomplete(getNode('reactive'), (value) => {
      console.log('reactive', 'autocomplete', value)
      onGetList(value)
    })
  })
}(jQuery, _, Rx))
