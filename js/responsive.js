/* eslint-env jquery */
const responsive = $(function () {
  'use strict'
  $('#mobile-menu-btn').on('click', function () {
    $('.header-menu').css({
      right: '0',
      transition: 'right 0.3s'
    })
    $('#mobile-menu-btn').hide()
    $('#mobile-menu-close-btn').show()
  })

  $('#mobile-menu-close-btn').on('click', function () {
    $('.header-menu').css({
      right: '-320px',
      transition: 'right 0.3s'
    })
    $('#mobile-menu-close-btn').hide()
    $('#mobile-menu-btn').show()
  })
})

module.exports = responsive
