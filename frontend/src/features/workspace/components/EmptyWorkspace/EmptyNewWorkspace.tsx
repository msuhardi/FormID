import { EmptyWorkspace, EmptyWorkspacePage } from './EmptyWorkspace'

export const EmptyNewWorkspace = ({ isLoading }: EmptyWorkspacePage) => (
  <EmptyWorkspace
    isLoading={isLoading}
    title="Anda belum mempunyai formulir di folder ini"
    subText="Kelola formulir Anda dengan mengkategorikan mereka ke dalam folder"
  />
)
