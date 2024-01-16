import { useTranslation } from 'react-i18next'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react'

import { useIsMobile } from '~hooks/useIsMobile'
import { ModalCloseButton } from '~components/Modal'

export interface UnsavedChangesModalProps extends Omit<ModalProps, 'children'> {
  onConfirm: () => void
  onCancel: () => void
  /** Modal header title. Defaults to `"You have unsaved changes"` */
  title?: string
  /**
   * Modal body content.
   * Defaults to `"Are you sure you want to leave? Your changes will be lost."`
   */
  description?: string
  /** Text to display for the confirmation button. Defaults to `"Yes, discard changes"` */
  confirmButtonText?: string
  /** Text to display for the cancel button. Defaults to `"No, stay on page"` */
  cancelButtonText?: string
}

export const UnsavedChangesModal = ({
  onConfirm,
  onCancel,
  isOpen,
  onClose,
  returnFocusOnClose = false,
  title,
  description,
  confirmButtonText,
  cancelButtonText,
  ...modalProps
}: UnsavedChangesModalProps): JSX.Element => {
  const { t } = useTranslation()
  const modalSize = useBreakpointValue({
    base: 'mobile',
    xs: 'mobile',
    md: 'md',
  })
  const isMobile = useIsMobile()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      returnFocusOnClose={returnFocusOnClose}
      size={modalSize}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader color="secondary.700" pr="4rem">
          {title ?? t('features.modal.unsavedChanges.title')}
        </ModalHeader>
        <ModalBody color="secondary.500" textStyle="body-2">
          {description ?? t('features.modal.unsavedChanges.description')}
        </ModalBody>
        <ModalFooter>
          <Stack
            spacing="1rem"
            w="100%"
            direction={{ base: 'column', md: 'row-reverse' }}
          >
            <Button
              isFullWidth={isMobile}
              colorScheme="danger"
              onClick={onConfirm}
              autoFocus
            >
              {confirmButtonText ??
                t('features.modal.unsavedChanges.confirmButton')}
            </Button>
            <Button
              colorScheme="secondary"
              variant="clear"
              isFullWidth={isMobile}
              onClick={onCancel}
            >
              {cancelButtonText ??
                t('features.modal.unsavedChanges.cancelButton')}
            </Button>
          </Stack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
