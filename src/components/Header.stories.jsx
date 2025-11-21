import Header from './Header';

export default {
  title: 'Components/Header',
  component: Header,
  args: {
    title: 'Create New',
    showSearch: true,
  },
};

export const Default = {};

export const NoButton = {
  args: {
    title: null,
    onClick: null,
  },
};