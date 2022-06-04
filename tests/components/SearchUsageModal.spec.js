import { shallowMount } from '@vue/test-utils';
import SearchUsageModal from '@/components/SearchUsageModal.vue';

describe('SearchUsageModal.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(SearchUsageModal, {
      global: {
        stubs: ['router-link', 'InfoIcon'],
      },
      props: {
        cardId: 123,
        closeModal: global.closeModal = jest.fn(),
        readUrlParams: global.readUrlParams = jest.fn(),
      },
    });
  });

  it('renders', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('displays correct text', () => {
    expect(wrapper.get('.usage h2').text()).toBe('Search usage');
    expect(wrapper.findAll('.usage p').map((x) => x.text()).join(' ')).toBe([
      '- find a card by id',
      '- show active cards',
      '- show inactive cards',
      '- show cards with an image',
      '- show cards without an image',
      '- show cards you remember',
      '- show cards you forget',
      'also, you can combine filters, like this:',
    ].join(' '));
  });
});
