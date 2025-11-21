import Modal from './Modal';

export default {
  title: 'Components/Modal',
  component: Modal,
  args: {
    onClose: () => alert('Closed'),
    children: <div style={{padding: '20px'}}><h3>Modal Content</h3><p>This is a generic modal.</p></div>
  },
};

export const Default = {
    render: (args) => <Modal {...args} />
};