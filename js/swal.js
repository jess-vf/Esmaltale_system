/**
 * swal.js
 * Configuração do SweetAlert2 com o tema visual Esmaltale.
 * Deve ser carregado após o CDN do SweetAlert2.
 */

const EsmalSwal = Swal.mixin({
  customClass: {
    popup:            'esmal-swal__popup',
    title:            'esmal-swal__title',
    confirmButton:    'esmal-swal__confirm',
    timerProgressBar: 'esmal-swal__timer',
  },
  buttonsStyling: false,
  showClass: { popup: 'esmal-swal--enter' },
  hideClass: { popup: 'esmal-swal--leave' },
});
