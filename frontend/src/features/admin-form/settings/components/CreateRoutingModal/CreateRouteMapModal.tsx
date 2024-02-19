import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useBreakpointValue,
} from '@chakra-ui/react'

import { CreateStageContent } from './CreateStageContent'

interface CreateRouteMapModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateRouteMapModal = ({
  isOpen,
  onClose,
}: CreateRouteMapModalProps): JSX.Element => {
  const modalSize = useBreakpointValue({
    base: 'mobile',
    xs: 'mobile',
    md: 'md',
  })

  return (
    <Modal size={modalSize} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p={8}>
        <ModalCloseButton />
        <CreateStageContent onSubmit={onClose} onClose={onClose} />
      </ModalContent>
    </Modal>
  )
}
