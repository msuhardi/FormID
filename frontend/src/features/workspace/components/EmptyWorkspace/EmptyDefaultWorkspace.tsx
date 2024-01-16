import { EmptyWorkspace, EmptyWorkspacePage } from './EmptyWorkspace'

export const EmptyDefaultWorkspace = ({
  isLoading,
  handleOpenCreateFormModal,
}: EmptyWorkspacePage) => (
  <EmptyWorkspace
    isLoading={isLoading}
    handleOpenCreateFormModal={handleOpenCreateFormModal}
    title="Anda belum mempunyai formulir"
    subText={'Untuk memulai, klik tombol "Buat Formulir"'}
  />
)
