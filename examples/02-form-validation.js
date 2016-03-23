(function (jQuery, _, Rx) {
  document.addEventListener('DOMContentLoaded', function() {
    var Observable = Rx.Observable

    function getObservable(element) {
      return Observable
        .fromEvent(element, 'keyup')
        .map((event) => {
          return event.target.value
        })
        .map((input) => {
          return input.length > 2
        })
    }

    function getSources(inputs) {
      return Array.from(inputs).map(getObservable)
    }

    function isTruthy(current, next) {
      return current && next
    }

    var form = document.querySelector('[name="reactive"]')

    var combiner = [...getSources(form.querySelectorAll('input[name]')), (...values) => {
      return values.reduce(isTruthy)
    }]

    Observable.combineLatest(...combiner)
      .map((value) => {
        console.log('map', value)
        return value
      })
      .subscribe((isFormValid) => {
        form.classList[isFormValid ? 'add' : 'remove']('form-valid')
      })
  })

}(jQuery, _, Rx))
