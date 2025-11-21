import ConfirmationModal from './ConfirmationModal';

export default {
  title: 'Components/ConfirmationModal',
  component: ConfirmationModal,
  args: {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Yes, delete it',
    cancelText: 'Cancel',
  },
};

export const Default = {};

export const Danger = {
  args: {
    isDanger: true,
    title: 'Delete Item',
    message: 'This action cannot be undone.',
  },
};