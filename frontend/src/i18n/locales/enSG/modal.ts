export const modal = {
  delete: {
    title: 'Delete form',
    description:
      'You will lose all responses and feedback for the following form permanently. Are you sure you want to delete the form?',
    yes: 'Yes, delete form',
  },
  deleteField: {
    title: 'Delete field',
    description:
      'Are you sure you want to delete this field? This action cannot be undone.',
    logicDescription:
      'This field is used in your form logic, so deleting it may cause your logic to stop working correctly. Are you sure you want to delete this field?',
  },
  unsavedChanges: {
    title: 'You have unsaved changes',
    description: 'Are you sure you want to leave? Your changes will be lost.',
    confirmButton: 'Yes, discard changes',
    cancelButton: 'No, stay on page',
  },
  dirty: {
    cancelButton: 'No, return to editing',
  },
}
