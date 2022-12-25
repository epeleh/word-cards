import _ from 'lodash';
import { shallowMount } from '@vue/test-utils';
import SearchUsageModal from '@/components/SearchUsageModal.vue';

describe('SearchUsageModal.vue', () => {
  let wrapper;
  afterEach(() => wrapper?.unmount());

  beforeEach(() => {
    wrapper = shallowMount(SearchUsageModal, {
      global: {
        stubs: ['router-link', 'InfoIcon'],
        config: { warnHandler: jest.fn() },
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

  it('displays the correct text', () => {
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

  describe('when pressing the Escape key', () => {
    it('closes the modal', () => {
      expect(global.closeModal).toHaveBeenCalledTimes(0);

      jest.useFakeTimers();
      _.times(5, () => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' })));
      jest.runAllTimers();

      expect(global.closeModal).toHaveBeenNthCalledWith(1);
    });
  });
});
