/**
 * modal.js
 * Gerenciamento genérico de modais.
 */

const Modal = {
  /**
   * Abre um modal pelo ID do overlay.
   * @param {string} id
   */
  open(id) {
    document.getElementById(id)?.classList.add('is-open');
  },

  /**
   * Fecha um modal pelo ID do overlay.
   * @param {string} id
   */
  close(id) {
    document.getElementById(id)?.classList.remove('is-open');
  },
};
