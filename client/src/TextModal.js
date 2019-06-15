import React from 'react'
import Modal from 'react-modal'
import PropTypes from 'prop-types'
import './TextModal.css'

const TextModal = ({
  isOpen,
  text,
  isValid,
  handleClose,
  handleUpdate,
  handleChange,
}) => {
  return (
    <Modal
      className='TextModal'
      overlayClassName='ModalOverlay'
      isOpen={isOpen}
      onRequestClose={handleClose}
      appElement={document.body}
    >
      <div className='TextModal-rowExpandable'>
        <textarea
          value={text}
          onChange={handleChange}
        />
      </div>
      <div className='TextModal-buttonRow TextModal-rowFixed'>
        <button onClick={handleClose}>
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          disabled={!isValid}
        >
          Update
        </button>
      </div>
    </Modal>
  )
}

TextModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  isValid: PropTypes.bool.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
}

export default TextModal
